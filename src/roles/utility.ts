import {Role} from "./Role";
import {Job, Build, Repair, Harvest, Withdraw} from "../jobs/Jobs";
import * as Blueprint from "../BlueprintUtils";

if (!Memory.allocatedWorkers) {
    Memory.allocatedWorkers = {}
}


/**
 * Make sure not too many creeps are doing each thing.
 */
function shouldDoJob(creep: Creep, order: Job) {
    let MAX_WORKERS = {
        "HARVEST": 1,
        "REPAIR": 1,
        "BUILD": 3,
        "FILL": 1
    };

    switch(order.type) {
        case "RENEW":
        case "UPGRADE_CONTROLLER":
        case "WITHDRAW":
            return true;
        case "HARVEST":
        case "REPAIR":
        case "BUILD":
        case "FILL":
            if (!Memory.allocatedWorkers[order.type]) {
                Memory.allocatedWorkers[order.type] = [];
            }

            let orderClass = Memory.allocatedWorkers[order.type];

            if (!Memory.allocatedWorkers[order.type]) {
                Memory.allocatedWorkers[order.type] = [];
            }

            return Memory.allocatedWorkers[order.type].length < MAX_WORKERS[order.type];
        default:
            console.log("Unexpected item in bagging area: " + JSON.stringify(order));
            break;
    }

    return false;
}

/**
 * Called when the creep is between jobs, to purge it from allocatedWorkers.
 */
function purgeAllocatedJobs(creep: Creep) {
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
function getNearestEnergySource(creep: Creep): Source | Structure | Resource {
    let firstChoice: (Resource | Structure)[] = [];
    let secondChoice: Source[] = [];

    // Dropped energy?
    let droppedEnergy = creep.pos.findClosestByRange<Resource>(FIND_DROPPED_ENERGY);
    if (droppedEnergy) {
        if (droppedEnergy.amount > 200) {
            firstChoice.push(droppedEnergy);
        }
    }

    // Containers or storage
    if (creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] > 0) {
        firstChoice.push(creep.room.storage)
    }

    // The nearest container with enough stuff in it.
    let container = creep.pos.findClosestByRange<StructureContainer>(FIND_STRUCTURES, {filter: function(c: StructureContainer) {
        if (c.structureType != STRUCTURE_CONTAINER) {
            return false;
        }

        return c.store[RESOURCE_ENERGY] >= (creep.carryCapacity - creep.carry.energy)
    }});
    if (container) {
        firstChoice.push(container);
    }

    // Sources.
    let bestSource = creep.pos.findClosestByRange<Source>(creep.room.find<Source>(FIND_SOURCES_ACTIVE));
    if (bestSource) {
        secondChoice.push(bestSource);
    }

    if (firstChoice.length > 0) {
        return creep.pos.findClosestByPath(firstChoice);
    }

    return creep.pos.findClosestByPath(secondChoice);
}

function injectFillJob(creep: Creep) {
    // If you're already full-ish, don't bother.
    if (creep.carry.energy > 100) {
        return;
    }

    let src = getNearestEnergySource(creep);

    if (!src) {
        return;
    }

    // Generate an appropriate order to fill from that source.
    if (src instanceof Structure) {
        creep.addJob({
            type: "WITHDRAW",
            target: src.id,
            resource: RESOURCE_ENERGY
        } as Withdraw);

        return;
    }

    creep.addJob({
        type: "HARVEST",
        target: src.id
    } as Harvest)
}


/**
 * General utility creep that gets given jobs to do, and does them.
 */
export let Utility: Role = {
    name: "utility",

    synthesiseNewJobs(creep: Creep) {
        // We finished a job, time to get a new one.
        purgeAllocatedJobs(creep);

        if (creep.room.controller && creep.room.controller.ticksToDowngrade < 2000) {
            console.log(creep.name + " is going to upgrade the controller, because doing so has become urgent.");

            injectFillJob(creep);
            creep.addJob({
                type: "UPGRADE_CONTROLLER"
            });

            return;
        }

        // Anything to fill, and no filler present?
        if (!creep.room.hasCreep("filler")) {
            let target = creep.room.getThingsToFill();
            if (target.length > 0) {
                let job = {
                    type: "FILL",
                    target: target[0].id
                };

                if (shouldDoJob(creep, job)) {
                    injectFillJob(creep);
                    creep.addJob(job);
                    return;
                }
            }
        }

        // Anything to repair? (and no towers to do it for us)
        if (creep.room.getTowers().length == 0) {
            let target = creep.room.getDamagedStructure();
            if (target) {
                let job: Repair = {
                    type: "REPAIR",
                    target: target.id
                };

                if (shouldDoJob(creep, job)) {
                    injectFillJob(creep);
                    creep.addJob(job);
                    return;
                }
            }
        }

        // Anything to build?
        let constructionSites = creep.room.find<ConstructionSite>(FIND_CONSTRUCTION_SITES);
        while (constructionSites.length > 0) {
            // TODO: fix the bug where the construction site is physically unreachable
            let closestConstructionSite = creep.pos.findClosestByPath<ConstructionSite>(constructionSites);

            let job: Build = {
                type: "BUILD",
                target: closestConstructionSite.id
            };

            if (shouldDoJob(creep, job)) {
                injectFillJob(creep);
                creep.addJob(job);
                return;
            } else {
                // Remove the one we "shouldn't" do, and try again.
                constructionSites.splice(constructionSites.indexOf(closestConstructionSite), 1);
            }
        }

        // Sod it, upgrade the controller, or possibly repair a wall.
        injectFillJob(creep);

        let targetWall = creep.room.getShittiestWall();
        if (targetWall && (creep.room.hasCreep("updater") || Math.random() > 1.0)) {
            creep.addJob({
                type: "REPAIR",
                target: targetWall.id
            } as Repair);
        } else {
            creep.addJob({
                type: "UPGRADE_CONTROLLER"
            });
        }
    },

    getBlueprint(budget: number) {
        // Four sets of [WORK, CARRY, MOVE], then a [WORK, WORK, MOVE].
        let bp = [WORK, CARRY, MOVE];
        let bpCost = Blueprint.cost(bp);
        if (budget < bpCost) {
            return undefined;
        }

        budget -= bpCost;
        let parts = [
            bp, bp, bp,
            [WORK, WORK, MOVE]
        ];

        bp.concat(Blueprint.fromRepeatedParts(budget, parts));

        return bp;
    }
};
