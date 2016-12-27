import {
    MoveTo, Recycle, Renew, Reserve, Claim, Build, Repair, Withdraw,
    RelocateToRoom, Harvest, Fill, Attack, UpgradeController
} from "../Jobs";


/**
 * Calculate the Manhattan distance between two points. Used to avoid making extra Screeps API calls
 * when we are out of range for various actions.
 */
function isAdjacent(pos1:RoomPosition, pos2:RoomPosition): boolean {
    let dx = Math.abs(pos1.x - pos2.x);
    let dy = Math.abs(pos1.y - pos2.y);
    let manhattan = dx + dy;
    if (manhattan <= 1) {
        return true;
    } else if (manhattan == 2) {
        // Manhattan distance would be two if diagonally adjacent, so if we get here we are adjacent
        // only if we are not vertically or horizontally aligned with the target.
        return dx != 0 && dy != 0;
    }

    return false;
}


function doMoveTo(creep:Creep, order:MoveTo) {
    if (typeof order.target === "string") {
        let structure = Game.getObjectById(<string> order.target);

        let closeness = order.closeness;
        if (closeness == undefined) {
            closeness = 2;
        }

        // Done!
        if (creep.pos.getRangeTo(structure) <= closeness) {
            creep.orderComplete();
            return;
        }

        if (order.options) {
            creep.moveTo(structure, order.options);
        } else {
            creep.moveTo(structure);
        }
    } else {
        let pos:RoomPosition = <RoomPosition> order.target;
        creep.moveTo(new RoomPosition(pos.x, pos.y, pos.roomName ? pos.roomName : creep.room.name));
        if (creep.pos.x == pos.x && creep.pos.y == pos.y && creep.room.name == pos.roomName) {
            creep.orderComplete();
        }
    }
}

function startRefreshOrRecycle(creep:Creep, order:Refresh | Recycle) {
    // Find the nearest spawner, and set it as our target.
    let spawners = creep.room.find(FIND_MY_SPAWNS);

    let destinationSpawner;

    // Get the nearest of the spawners, if more than one.
    if (spawners.length == 1) {
        destinationSpawner = spawners[0];
    } else {
        destinationSpawner = creep.pos.findClosestByPath(FIND_MY_SPAWNS)
    }

    order.target = destinationSpawner.id;
}

function doRenew(creep:Creep, order: Renew) {
    let spawner = Game.getObjectById(order.target);

    // Make sure we're in range (it's expensive to call creep-actions).
    if (!isAdjacent(creep.pos, spawner.pos)) {
        creep.moveTo(spawner);
        return;
    }

    if (creep.carry.energy > 0 && spawner.energy < spawner.energyCapacity) {
        creep.transfer(spawner, RESOURCE_ENERGY);
        return;
    }

    let result = spawner.renewCreep(creep);

    if (result == ERR_FULL || result == ERR_NOT_ENOUGH_ENERGY || result == ERR_BUSY) {
        creep.orderComplete();
        delete creep.room.memory.renewers[spawner.name];
    } else if (result == ERR_NOT_IN_RANGE) {
        console.log("ERROR: " + creep.name + " FAILED TO BECOME ADJACENT");
    }
}

function doRecycle(creep:Creep, order) {
    let spawner = Game.getObjectById(order.target);

    if (!spawner) {
        console.log("Invalid recycle order (not in a room with a spawner)");
        creep.orderComplete();
    }

    // Make sure we're in range (it's expensive to call creep-actions).
    if (!isAdjacent(creep.pos, spawner.pos)) {
        creep.moveTo(spawner);
        return;
    }

    let result = spawner.recycleCreep(creep);

    if (result == ERR_FULL) {
        creep.orderComplete();
    } else if (result == ERR_NOT_IN_RANGE) {
        console.log("ERROR: " + creep.name + " FAILED TO BECOME ADJACENT");
    }
}

function doAttack(creep:Creep, order:Attack) {
    let target = Game.getObjectById(order.target);

    if (!target || target.hits <= 0) {
        creep.orderComplete();
    }

    // Try a close-range attack.
    if (creep.getActiveBodyparts(ATTACK) > 0) {
        if (creep.attack(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }

    if (creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
        creep.rangedAttack(target);
        creep.moveTo(target);
    }
}

function doUpgradeController(creep:Creep, order:UpgradeController) {
    let structure = creep.room.controller;

    // TODO: Range-check here...

    let result = creep.upgradeController(structure);
    switch (result) {
        case OK:
            break;

        case ERR_NOT_ENOUGH_RESOURCES:
            // Done!
            creep.orderComplete();
            break;
        case ERR_NOT_IN_RANGE:
            creep.moveTo(structure);
            break;
    }
}

function doFill(creep:Creep, order:Fill) {
    let structure = Game.getObjectById(order.target);

    // If the structure is nonexistent, we're done.
    if (!structure) {
        creep.orderComplete();
        return;
    }

    // Amusing hack.
    if (structure.structureType == STRUCTURE_TOWER && (structure.energyCapacity - structure.energy) < 100) {
        creep.orderComplete();
    }

    // Make sure we're in range (it's expensive to call creep-actions).
    if (!isAdjacent(creep.pos, structure.pos)) {
        creep.moveTo(structure);
        return;
    }

    let result;
    for (let i in creep.carry) {
        result = creep.transfer(structure, i);
    }

    switch (result) {
        case ERR_NOT_ENOUGH_RESOURCES:
        case ERR_FULL:
            creep.orderComplete();
            break;

        case ERR_NOT_IN_RANGE:
            console.log("ERROR: " + creep.name + " FAILED TO BECOME ADJACENT");
            break;
    }
}

function doHarvest(creep:Creep, order:Harvest) {
    let source = Game.getObjectById(order.target);

    if (creep.carryCapacity > 0 && creep.carry.energy == creep.carryCapacity) {
        creep.orderComplete();
        return;
    }

    // Make sure we're in range (it's expensive to call creep-actions).
    if (!isAdjacent(creep.pos, source.pos)) {
        creep.moveTo(source);
        return;
    }

    let result;
    if (source instanceof Source || source instanceof Mineral) {
        result = creep.harvest(source);
    } else {
        result = creep.pickup(source);
        if (!source || source.energy < 30) {
            creep.orderComplete();
        }
    }

    switch (result) {
        case ERR_NOT_ENOUGH_ENERGY:
        case ERR_INVALID_TARGET:
        case ERR_FULL:
            creep.orderComplete();
            break;

        case ERR_NOT_IN_RANGE:
            console.log("ERROR: " + creep.name + " FAILED TO BECOME ADJACENT");
            break;
    }

    // If we've got no carry capacity, we define doneness as being 20 ticks.
    if (creep.carryCapacity == 0) {
        creep.memory.tickCounter++;
        if (creep.memory.tickCounter >= 20) {
            creep.memory.tickCounter = 0;
            creep.orderComplete();
        }
    }
}

function doRepair(creep:Creep, order:Repair) {
    let target = Game.getObjectById(order.target);

    if (target == undefined) {
        console.log("ERROR: Invalid repair target " + order.target);
        creep.orderComplete();
        return;
    }

    let result = creep.repair(target);
    switch (result) {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(target);
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            // Done!
            creep.orderComplete();
            break;
    }

    // We're finished if the target is fixed.
    if (target.hits == target.hitsMax) {
        creep.orderComplete();
    }
}

function doBuild(creep:Creep, order:Build) {
    let structure = Game.getObjectById(order.target);

    // We're finished if the structure is complete or cancelled.
    if (!structure || structure.progress == structure.progressTotal || creep.carry.energy == 0) {
        creep.orderComplete();
    }

    if (creep.build(structure) == ERR_NOT_IN_RANGE) {
        creep.moveTo(structure);
    }
}

/**
 * Reserve the room you are in.
 */
function doReserve(creep:Creep, order:Reserve) {
    let target = creep.room.controller;

    // Make sure we're in range (it's expensive to call creep-actions).
    if (!isAdjacent(creep.pos, target.pos)) {
        creep.moveTo(target);
        return;
    }

    creep.reserveController(target);
    if (order.message) {
        creep.signController(target, order.message);
    }
}

/**
 * Claim the room you are in.
 */
function doClaim(creep:Creep, order:Claim) {
    let target = creep.room.controller;

    // Make sure we're in range (it's expensive to call creep-actions).
    if (!isAdjacent(creep.pos, target.pos)) {
        creep.moveTo(target);
        return;
    }

    if (creep.claimController(target) == ERR_NOT_IN_RANGE) {
        console.log("ERROR: " + creep.name + " FAILED TO BECOME ADJACENT");
    }

    if (order.message) {
        creep.signController(target, order.message);
    }
}

function doWithdraw(creep:Creep, order:Withdraw) {
    let target = Game.getObjectById(order.target);
    if (!target) {
        console.log ("ERROR: Invalid withdraw target: " + order.target);
        creep.orderComplete();
        return;
    }

    // Make sure we're in range (it's expensive to call creep-actions).
    if (!isAdjacent(creep.pos, target.pos)) {
        creep.moveTo(target);
        return;
    }

    if (!order.persist && _.sum(target.store) < 30) {
        creep.orderComplete();
        return;
    }

    let result;
    if (order.resource) {
        result = creep.withdraw(target, order.resource);
    } else {
        for (let i in target.store) {
            result = creep.withdraw(target, i);
        }
    }

    switch(result) {
        case ERR_NOT_ENOUGH_RESOURCES:
            if (!order.persist) {
                creep.orderComplete();
            }
            break;

        case ERR_FULL:
            creep.orderComplete();
            break;

        case ERR_NOT_IN_RANGE:
            console.log("ERROR: " + creep.name + " FAILED TO BECOME ADJACENT");
            break;
    }
}

/**
 * A relocate-to-room order works by replacing itself with a move order to the
 * appropriate exit, followed by itself again. Eventually, it will find itself
 * alreay in the destination room, at which point it is completed and this is a
 * no-op.
 */
function startRelocateToRoom(creep:Creep, order:RelocateToRoom) {
    if (creep.room.name == order.targetRoom) {
        creep.orderComplete();
        return;
    }

    // If there's a hint-flag, just use it.
    if (Game.flags[order.targetRoom]) {
        creep.memory.orders.unshift({
            type: Jobs.MOVE_TO,
            position: Game.flags[order.targetRoom].pos
        });

        creep.orderComplete();
        return;
    }

    // The path is cached on the order.
    if (!order.route) {
        order.route = Game.map.findRoute(creep.room, order.targetRoom);
    }

    if (order.route == ERR_NO_PATH) {
        console.log(creep.name + " failed to pathfind to " + order.targetRoom);
        return;
    }

    let nextExit = creep.pos.findClosestByRange(order.route[0].exit);
    order.route.shift();

    // Put this order back on.
    creep.memory.orders.unshift(order);

    // And add the step that gets us to the next room.
    creep.memory.orders.unshift({
        type: Jobs.MOVE_TO,
        position: nextExit
    });

    // Trigger order consumption right away.
    creep.orderComplete();
}

function shouldRenew(creep:Creep) {
    // Too young.
    if (creep.ticksToLive > 250) {
        return false;
    }

    // Nowhere to go...
    if (!creep.room.hasFriendlySpawner()) {
        return false;
    }

    // Explicitly disabled...
    if (creep.memory.suicidal) {
        return false;
    }

    if (creep.getActiveBodyparts(CLAIM) > 0) {
        return false;
    }

    // Nothing to use!
    if (creep.room.energyAvailable < 200) {
        return false;
    }

    // All spawners are busy on it.
    if (!creep.room.getIdleSpawner() && creep.memory.role != "filler") {
        return false;
    }

    return true;
}

function maybeRenew(creep:Creep) {
    let renewers = creep.room.memory.renewers;
    if (Object.keys(renewers).length > 0) {
        let existingRenewer = renewers[Object.keys(renewers)[0]];
        if (existingRenewer != undefined && creep.memory.role == "filler") {
            // If there is an existing renewer, and we are a filler, evict the fucker.
            Game.creeps[existingRenewer].currentJob = undefined;
        }
    }

    let target = creep.room.getIdleSpawner();
    if (!target) {
        return;
    }

    creep.memory.orders.unshift({
        type: Jobs.REFRESH,
        target: target.id
    });

    creep.room.memory.renewers[target.name] = creep.name
}

function doMoveDirection(creep:Creep, order) {
    creep.move(order.direction);
    creep.orderComplete();
}

export function executeNextJob(creep:Creep) {
    // Synthesise a refresh order if you're dying.
    if (shouldRenew(creep)) {
        maybeRenew(creep);
    }

    if (creep.memory.orders.length == 0) {
        return;
    }

    while (creep.memory.currentJob == undefined && creep.memory.orders.length > 0) {
        let order = creep.memory.orders.shift();

        creep.memory.currentJob = order;
        switch (order.type) {
            case "MOVE_TO":
            case "MOVE_DIRECTION":
            case "REPAIR":
            case "FILL":
            case "REFRESH":
                break;
            case "RECYCLE":
                startRefreshOrRecycle(creep, order);
                break;
            case "ATTACK":
            case "RESERVE":
            case "BUILD":
            case "CLAIM":
            case "UPGRADE_CONTROLLER":
            case "WITHDRAW":
                break;
            case "RELOCATE_TO_ROOM":
                startRelocateToRoom(creep, order);
                break;
            case "HARVERST":
                if (creep.carryCapacity == 0) {
                    creep.memory.tickCounter = 0;
                }
                break;
        }
    }

    if (creep.memory.currentJob) {
        continueExecutingCurrentJob(creep);
    }
}

export function continueExecutingCurrentJob(creep:Creep) {
    let order:Job = creep.memory.currentJob as Job;

    switch (order.type) {
        case "MOVE_TO":
            doMoveTo(creep, order as MoveTo);
            break;
        case "REPAIR":
            doRepair(creep, order as Repair);
            break;
        case "FILL":
            doFill(creep, order as Fill);
            break;
        case "MOVE_DIRECTION":
            doMoveDirection(creep, order);
            break;
        case "RENEW":
            doRenew(creep, order as Renew);
            break;
        case "ATTACK":
            doAttack(creep, order as Attack);
            break;
        case "RECYCLE":
            doRecycle(creep, order as Recycle);
            break;
        case "HARVEST":
            doHarvest(creep, order as Harvest);
            break;
        case "BUILD":
            doBuild(creep, order as Build);
            break;
        case "UPGRADE_CONTROLLER":
            doUpgradeController(creep, order as UpgradeController);
            break;
        case "WITHDRAW":
            doWithdraw(creep, order as Withdraw);
            break;
        case "RESERVE":
            doReserve(creep, order as Reserve);
            break;
        case "CLAIM":
            doClaim(creep, order as Claim);
            break;
        case "RELOCATE_TO_ROOM":
            console.log("Warning: relocate order still on top? o.0");
            break;
        default:
            console.log("Unexpected order type: " + order.type);
    }
}
