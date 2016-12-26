var util = require('util');
var roleBase = require('role.base');
var resources = require('resources');
var Orders = require('orders');

if (!Memory.allocatedWorkers) {
    Memory.allocatedWorkers = {}
}


/**
 * Make sure not too many creeps are doing each thing.
 */
function shouldDoJob(creep, order) {
    let MAX_WORKERS = {
        "HARVEST": 1,
        "REPAIR": 1,
        "BUILD": 3,
        "FILL": 1
    };

    switch(order.type) {
        case Orders.REFRESH:
        case Orders.UPGRADE_CONTROLLER:
        case Orders.WITHDRAW:
            return true;
        case Orders.HARVEST:
        case Orders.REPAIR:
        case Orders.BUILD:
        case Orders.FILL:
            if (!Memory.allocatedWorkers[order.type]) {
                Memory.allocatedWorkers[order.type] = [];
            }

            let orderClass = Memory.allocatedWorkers[order.type];

            if (!Memory.allocatedWorkers[order.type]) {
                Memory.allocatedWorkers[order.type] = [];
            }

            return Memory.allocatedWorkers[order.type].length < MAX_WORKERS[order.type];
            break;
        default:
            console.log("Unexpected item in bagging area: " + JSON.stringify(order));
            break;
    }

    return false;
}

/**
 * Called when the creep is between jobs, to purge it from allocatedWorkers.
 */
function purgeAllocatedJobs(creep) {
    for (let i in Memory.allocatedWorkers) {
        let jobClass = Memory.allocatedWorkers[i];
        let ind = jobClass.indexOf(creep.name);

        if (ind == -1) {
            continue;
        }

        jobClass.splice(ind, 1);
    }
}

/**
 * Find the nearest source of energy, of any type, for the creep.
 */
function getNearestEnergySource(creep) {
    let firstChoice = [];
    let secondChoice = [];


    // Dropped energy?
    var droppedEnergy = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY);
    if (droppedEnergy) {
        if (droppedEnergy.amount > 200) {
            firstChoice.push(droppedEnergy);
        }
    }

    // Containers or storage
    if (creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] > 0) {
        firstChoice.push(creep.room.storage)
    }

    var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}});
    if (container && container.store[RESOURCE_ENERGY] >= (creep.carryCapacity - creep.carry.energy)) {
        firstChoice.push(container);
    }

    // Sources.
    let bestSource = creep.pos.findClosestByRange(creep.room.find(FIND_SOURCES_ACTIVE));
    if (bestSource) {
        secondChoice.push(bestSource);
    }

    if (firstChoice.length > 0) {
        return creep.pos.findClosestByPath(firstChoice);
    }

    return creep.pos.findClosestByPath(secondChoice);
}

function injectFillOrder(creep) {
    // If you're already full-ish, don't bother.
    if (creep.carry.energy > 100) {
        return;
    }

    let src = getNearestEnergySource(creep);

    if (!src) {
        return;
    }

    // Generate an appropriate order to fill from that source.
    if (src.structureType == STRUCTURE_CONTAINER || src.structureType == STRUCTURE_STORAGE) {
        creep.giveOrder({
            type: Orders.WITHDRAW,
            target: src.id,
            resource: RESOURCE_ENERGY
        });

        return;
    }

    creep.giveOrder({
        type: Orders.HARVEST,
        target: src.id
    })
}

function synthesiseOrders(creep) {
    if (!creep.needNewOrders()) {
        return;
    }

    // We finished a job, time to get a new one.
    purgeAllocatedJobs(creep);

    if (creep.room.controller.ticksToDowngrade < 2000) {
        console.log(creep.name + " is going to upgrade the controller, because doing so has become urgent.");

        injectFillOrder(creep);
        creep.giveOrder({
            type: Orders.UPGRADE_CONTROLLER
        });

        return;
    }

    // Anything to fill, and no filler present?
    if (!creep.room.hasCreep("filler")) {
        let target = creep.room.getThingsToFill();
        if (target.length > 0) {
            let job = {
                type: Orders.FILL,
                target: target[0].id
            };

            if (shouldDoJob(creep, job)) {
                injectFillOrder(creep);
                creep.giveOrder(job);
                return;
            }
        }
    }

    // Anything to repair? (and no towers to do it for us)
    if (creep.room.getTowers().length == 0) {
        let target = creep.room.getDamagedStructure();
        if (target) {
            let job = {
                type: Orders.REPAIR,
                target: target.id
            };

            if (shouldDoJob(creep, job)) {
                injectFillOrder(creep);
                creep.giveOrder(job);
                return;
            }
        }
    }

    // Anything to build?
    let constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
    while (constructionSites.length > 0) {
        // TODO: fix the bug where the construction site is physically unreachable
        let closestConstructionSite = creep.pos.findClosestByPath(constructionSites);

        let job = {
            type: Orders.BUILD,
            target: closestConstructionSite.id
        };

        if (shouldDoJob(creep, job)) {
            injectFillOrder(creep);
            creep.giveOrder(job);
            return;
        } else {
            // Remove the one we "shouldn't" do, and try again.
            constructionSites.splice(constructionSites.indexOf(closestConstructionSite), 1);
        }
    }

    // Sod it, upgrade the controller, or possibly repair a wall.
    injectFillOrder(creep);

    let targetWall = creep.room.getShittiestWall();
    if (targetWall && (creep.room.hasCreep("updater") || Math.random() > 1.0)) {
        creep.giveOrder({
            type: Orders.REPAIR,
            target: targetWall.id
        });
    } else {
        creep.giveOrder({
            type: Orders.UPGRADE_CONTROLLER
        });
    }
}

/**
 * General utility creep that gets given jobs to do, and does them.
 */
module.exports = {
    run: function(creep) {
        synthesiseOrders(creep);
        roleBase.run(creep);
        synthesiseOrders(creep);
        roleBase.run(creep);
    }
};
