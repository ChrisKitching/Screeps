var Orders = require('orders');

function doMoveTo(creep:Creep, order) {
    if (order.target) {
        var structure = Game.getObjectById(order.target);

        var closeness = order.closeness;
        if (closeness == undefined) {
            closeness = 2;
        }

        // Done!
        if (creep.pos.getRangeTo(structure) <= closeness) {
            creep.memory.currentOrder = undefined;
            return;
        }

        if (order.options) {
            creep.moveTo(structure, order.options);
        } else {
            creep.moveTo(structure);
        }
    } else {
        creep.moveTo(new RoomPosition(order.position.x, order.position.y, order.position.roomName ? order.position.roomName : creep.room.name));
        if (creep.pos.x == order.position.x && creep.pos.y == order.position.y && creep.room.name == order.position.roomName) {
            creep.memory.currentOrder = undefined;
        }
    }
}

function startRefreshOrRecycle(creep, order) {
    // Find the nearest spawner, and set it as our target.
    var spawners = creep.room.find(FIND_MY_SPAWNS);

    var destinationSpawner;

    // Get the nearest of the spawners, if more than one.
    if (spawners.length == 1) {
        destinationSpawner = spawners[0];
    } else {
        destinationSpawner = creep.pos.findClosestByPath(FIND_MY_SPAWNS)
    }

    order.target = destinationSpawner.id;
}

function doRefresh(creep, order) {
    var spawner = Game.getObjectById(order.target);
    if (creep.carry.energy > 0 && spawner.energy < spawner.energyCapacity) {
        if (creep.transfer(spawner, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(spawner);
            return;
        }
    }

    var result = spawner.renewCreep(creep);

    if (result == ERR_NOT_IN_RANGE) {
        creep.moveTo(spawner);
    } else if (result == ERR_FULL || result == ERR_NOT_ENOUGH_ENERGY || result == ERR_BUSY) {
        // Done!
        creep.memory.currentOrder = undefined;
        delete creep.room.memory.renewers[spawner.name];
    }
}

function doRecycle(creep, order) {
    var spawner = Game.getObjectById(order.target);

    if (!spawner) {
        console.log("Invalid recycle order (not in a room with a spawner)");
        creep.memory.currentOrder = undefined;
    }

    var result = spawner.recycleCreep(creep);

    if (result == ERR_NOT_IN_RANGE) {
        creep.moveTo(spawner);
    } else if (result == ERR_FULL) {
        // Done!
        creep.memory.currentOrder = undefined;
    }
}

function doAttack(creep, order) {
    var target = Game.getObjectById(order.target);

    if (!target || target.hits <= 0) {
        creep.memory.currentOrder = undefined;
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

function doUpgradeController(creep, order) {
    var structure = creep.room.controller;
    var result = creep.upgradeController(structure);
    switch (result) {
        case OK:
            creep.signController(structure, "I like trains");
            break;

        case ERR_NOT_ENOUGH_RESOURCES:
            // Done!
            creep.memory.currentOrder = undefined;
            break;
        case ERR_NOT_IN_RANGE:
            creep.moveTo(structure);
            break;
    }
}

function doFill(creep, order) {
    var structure = Game.getObjectById(order.target);

    // If the structure is nonexistent, we're done.
    if (!structure) {
        creep.memory.currentOrder = undefined;
        return;
    }

    // Amusing hack.
    if (structure.structureType == STRUCTURE_TOWER && (structure.energyCapacity - structure.energy) < 100) {
        creep.memory.currentOrder = undefined;
    }

    let result;
    for (let i in creep.carry) {
        result = creep.transfer(structure, i);
    }

    switch (result) {
        case ERR_NOT_ENOUGH_RESOURCES:
        case ERR_FULL:
            // Done!
            creep.memory.currentOrder = undefined;
            break;
        case ERR_NOT_IN_RANGE:
            creep.moveTo(structure);

            break;
    }
}

function doHarvest(creep, order) {
    var source = Game.getObjectById(order.target);

    if (creep.carryCapacity > 0 && creep.carry.energy == creep.carryCapacity) {
        creep.memory.currentOrder = undefined;
        return;
    }

    var result;
    if (source instanceof Source || source instanceof Mineral) {
        result = creep.harvest(source);
    } else {
        result = creep.pickup(source);
        if (!source || source.energy < 30) {
            creep.memory.currentOrder = undefined;
        }
    }

    switch (result) {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(source, {reusePath: 0});
            break;
        case ERR_NOT_ENOUGH_ENERGY:
        case ERR_INVALID_TARGET:
        case ERR_FULL:
            creep.memory.currentOrder = undefined;
            break;
    }

    // If we've got no carry capacity, we define doneness as being 20 ticks.
    if (creep.carryCapacity == 0) {
        creep.memory.tickCounter++;
        if (creep.memory.tickCounter >= 20) {
            creep.memory.tickCounter = 0;
            creep.memory.currentOrder = undefined;
        }
    }
}

function doRepair(creep, order) {
    var target = Game.getObjectById(order.target);

    var result = creep.repair(target);
    switch (result) {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(target);
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            // Done!
            creep.memory.currentOrder = undefined;
            break;
    }

    // We're finished if the target is fixed.
    if (target.hits == target.hitsMax) {
        creep.memory.currentOrder = undefined;
    }
}

function doBuild(creep, order) {
    var structure = Game.getObjectById(order.target);

    // We're finished if the structure is complete or cancelled.
    if (!structure || structure.progress == structure.progressTotal || creep.carry.energy == 0) {
        creep.memory.currentOrder = undefined;
    }

    if (creep.build(structure) == ERR_NOT_IN_RANGE) {
        creep.moveTo(structure);
    }
}

/**
 * Reserve the room you are in.
 */
function doReserve(creep, order) {
    var result = creep.reserveController(creep.room.controller);
    switch (result) {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(creep.room.controller);
            break;
        default:
            creep.signController(creep.room.controller, "I like trains");
    }
}

/**
 * Claim the room you are in.
 */
function doClaim(creep, order) {
    var result = creep.claimController(creep.room.controller);
    switch (result) {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(creep.room.controller);
            break;
        default:
            creep.signController(creep.room.controller, "I like trains");
    }
}

function doWithdraw(creep, order) {
    var target = Game.getObjectById(order.target);
    if (!target) {
        console.log ("ERROR: Invalid withdraw target: " + order.target);
        creep.memory.currentOrder = undefined;
        return;
    }

    if (!order.persist && _.sum(target.store) < 30) {
        creep.memory.currentOrder = undefined;
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
        case ERR_NOT_IN_RANGE:
            creep.moveTo(target);
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            if (!order.persist) {
                creep.memory.currentOrder = undefined;
            }
            break;
        case ERR_FULL:
            creep.memory.currentOrder = undefined;
            break;
    }
}

/**
 * A relocate-to-room order works by replacing itself with a move order to the
 * appropriate exit, followed by itself again. Eventually, it will find itself
 * alreay in the destination room, at which point it is completed and this is a
 * no-op.
 */
function startRelocateToRoom(creep, order) {
    if (creep.room.name == order.target) {
        console.log(creep.name + " has reached " + order.target);
        creep.memory.currentOrder = undefined;
        return;
    }

    // If there's a hint-flag, just use it.
    if (Game.flags[order.target]) {
        creep.memory.orders.unshift({
            type: Orders.MOVE_TO,
            position: Game.flags[order.target].pos
        });

        creep.memory.currentOrder = undefined;
        return;
    }

    // The path is cached on the order.
    if (!order.route) {
        order.route = Game.map.findRoute(creep.room, order.target);
    }

    if (order.route == ERR_NO_PATH) {
        console.log(creep.name + " failed to pathfind to " + order.target);
        return;
    }

    var nextExit = creep.pos.findClosestByRange(order.route[0].exit);
    order.route.shift();

    // Put this order back on.
    creep.memory.orders.unshift(order);

    // And add the step that gets us to the next room.
    creep.memory.orders.unshift({
        type: Orders.MOVE_TO,
        position: nextExit
    });

    // Trigger order consumption right away.
    creep.memory.currentOrder = undefined;
}

function shouldRenew(creep) {
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
    if (!creep.room.getIdleSpawner() && creep.role != "filler") {
        return false;
    }

    return true;
}

function maybeRenew(creep) {
    let renewers = creep.room.memory.renewers;
    if (Object.keys(renewers).length > 0) {
        let existingRenewer = renewers[Object.keys(renewers)[0]];
        if (existingRenewer != undefined && creep.memory.role == "filler") {
            // If there is an existing renewer, and we are a filler, evict the fucker.
            Game.creeps[existingRenewer].currentOrder = undefined;
        }
    }

    let target = creep.room.getIdleSpawner();
    if (!target) {
        return;
    }

    creep.memory.orders.unshift({
        type: Orders.REFRESH,
        target: target.id
    });

    creep.room.memory.renewers[target.name] = creep.name
}

function executeNextOrder(creep) {
    // Synthesise a refresh order if you're dying.
    if (shouldRenew(creep)) {
        maybeRenew(creep);
    }

    if (creep.memory.orders.length == 0) {
        return;
    }

    while (creep.memory.currentOrder == undefined && creep.memory.orders.length > 0) {
        let order = creep.memory.orders.shift();

        creep.memory.currentOrder = order;
        switch (order.type) {
            case Orders.MOVE_TO:
            case Orders.MOVE_DIRECTION:
            case Orders.REPAIR:
            case Orders.FILL:
            case Orders.REFRESH:
                break;
            case Orders.RECYCLE:
                startRefreshOrRecycle(creep, order);
                break;
            case Orders.ATTACK:
            case Orders.RESERVE:
            case Orders.BUILD:
            case Orders.CLAIM:
            case Orders.UPGRADE_CONTROLLER:
            case Orders.WITHDRAW:
                break;
            case Orders.RELOCATE_TO_ROOM:
                startRelocateToRoom(creep, order);
                break
            case Orders.HARVERST:
                if (creep.carryCapacity == 0) {
                    creep.memory.tickCounter = 0;
                }
                break;
        }
    }

    if (creep.memory.currentOrder) {
        continueExecutingCurrentOrder(creep);
    }
}

function doMoveDirection(creep, order) {
    creep.move(order.direction);
    creep.memory.currentOrder = undefined;
}

function continueExecutingCurrentOrder(creep:Creep) {
    var order = creep.memory.currentOrder;

    switch (order.type) {
        case Orders.MOVE_TO:
            doMoveTo(creep, order);
            break;
        case Orders.REPAIR:
            doRepair(creep, order);
            break;
        case Orders.FILL:
            doFill(creep, order);
            break;
        case Orders.MOVE_DIRECTION:
            doMoveDirection(creep, order);
            break;
        case Orders.REFRESH:
            doRefresh(creep, order);
            break;
        case Orders.ATTACK:
            doAttack(creep, order);
            break;
        case Orders.RECYCLE:
            doRecycle(creep, order);
            break;
        case Orders.HARVEST:
            doHarvest(creep, order);
            break;
        case Orders.BUILD:
            doBuild(creep, order);
            break;
        case Orders.UPGRADE_CONTROLLER:
            doUpgradeController(creep, order);
            break;
        case Orders.WITHDRAW:
            doWithdraw(creep, order);
            break;
        case Orders.RESERVE:
            doReserve(creep, order);
            break;
        case Orders.CLAIM:
            doClaim(creep, order);
            break;
        case Orders.RELOCATE_TO_ROOM:
            console.log("Warning: relocate order still on top? o.0");
            break;
        default:
            console.log("Unexpected order type: " + order.type);
    }
}

/**
 * Run the job queue...
 */
export function run(creep:Creep) {
    if (creep.memory.currentOrder) {
        continueExecutingCurrentOrder(creep);
    }

    if (!creep.memory.currentOrder) {
        executeNextOrder(creep);

        if (creep.memory.currentOrder) {
            continueExecutingCurrentOrder(creep);
        }
    }
}
