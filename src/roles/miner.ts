import {Role} from "./Role";
import {blueprintCost} from "../BlueprintUtils";

export const REQUIRED_FIELDS = [
    "toMine",    // ID of the thing to mine (Source or Mineral)
    "targetRoom" // Name of the room in which mining should be carried out.
];


export let Miner: Role = {
    tick(creep: Creep) {
        // If we have storage capacity, dump resources into the container we're
        // standing on, or maybe repair it.
        if (creep.carry.energy < 10) {
            return false;
        }

        // If you're sitting on a construction site, construct it!
        let constructions = creep.room.lookForAt<ConstructionSite>(LOOK_CONSTRUCTION_SITES, creep.pos);
        if (constructions.length > 0) {
            let construction = constructions[0];
            creep.build(construction);
            return true;
        }

        let containers = creep.room.lookForAt<Structure>(LOOK_STRUCTURES, creep.pos).filter(function (c: Structure) {
            return c.structureType == STRUCTURE_CONTAINER
        });

        if (containers.length > 0) {
            let container = containers[0];

            // If appropriate, repair the container.
            if ((container.hitsMax - container.hits) >= creep.getRepairPower()) {
                creep.repair(container);
                return true;
            }
        }

        creep.drop(RESOURCE_ENERGY);

        // We did something, but we can still do more!
        return false;
    },

    synthesiseNewJobs(creep: Creep) {
        if (creep.room.name != creep.memory.targetRoom) {
            creep.memory.orders = [{
                type: "RELOCATE_TO_ROOM",
                target: creep.memory.targetRoom
            }];
        } else {

            creep.memory.orders = [{
                type: "HARVEST",
                target: creep.memory.toMine
            }];

            // If there's a flag adjacent to the source, move there first.
            let src = Game.getObjectById(creep.memory.toMine);
            if (src == undefined) {
                console.log(creep.name + " is on fire");
                return;
            }

            let flags = src.pos.findInRange(FIND_FLAGS, 2);
            if (flags.length == 1) {
                creep.memory.orders.unshift({
                    type: "MOVE_TO",
                    position: flags[0].pos
                })
            }
        }
    },

    getBlueprint(budget: number) {
        // This is the only sane size for a miner, really.
        let miner = [
            WORK, WORK, MOVE,
            WORK, WORK, MOVE,
            WORK, MOVE
        ];

        if (budget < blueprintCost(miner)) {
            return undefined;
        }

        return miner;
    }
};
