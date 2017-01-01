import {Role} from "./Role";
import * as roleMixins from "./roleMixins";
import * as Blueprint from "../BlueprintUtils";
import {MoveTo} from "../jobs/Jobs";


export const REQUIRED_FIELDS = [
    "scoopFlags",  // Places to visit and scoop from.
    "dst"          // Where to drop things off.
];

export let Mover: Role = {
    name: "mover",

    onSpawn(creep: Creep) {
        creep.memory.scoopIndex = 0;
    },

    tick(creep: Creep) {
        roleMixins.scoopWalkedEnergy(creep);
        roleMixins.repairWalkedRoads(creep);

        return false;
    },

    synthesiseNewJobs(creep: Creep) {
        if (_.sum(creep.carry) == creep.carryCapacity) {
            creep.memory.orders = [
                {
                    type: "FILL",
                    target: creep.memory.dst
                }
            ]
        } else {
            let flagToUse = Game.flags[creep.memory.scoopFlags[creep.memory.scoopIndex]];
            if (flagToUse.room) {
                creep.memory.scoopIndex = (creep.memory.scoopIndex + 1) % creep.memory.scoopFlags.length;

                // Find dropped energy at the endpoint.
                let energyfound = flagToUse.room.lookForAt<Resource>(LOOK_ENERGY, flagToUse);

                if (energyfound[0] && energyfound[0].amount > 100) {
                    creep.addJob(
                        {
                            type: "HARVEST",
                            target: energyfound[0].id
                        }
                    )
                }

                let targetContainers = flagToUse.room.lookForAt<Container>(LOOK_STRUCTURES, flagToUse).filter(function (structure: Structure) {
                    return structure.structureType == STRUCTURE_CONTAINER
                });
                if (targetContainers.length > 0) {
                    creep.addJob(
                        {
                            type: "WITHDRAW",
                            target: targetContainers[0].id,
                            persist: false
                        }
                    );
                }
            } else {
                creep.addJob(
                    {
                        type: "MOVE_TO",
                        target: flagToUse.pos,
                        closeness: 1
                    } as MoveTo
                );
            }
        }
    },

    getBlueprint(budget: number) {
        // As many copies of [CARRY, CARRY, MOVE] as can fit.
        let copyCost = Blueprint.cost([CARRY, CARRY, MOVE]);
        let numCopies = Math.floor(budget / copyCost);
        numCopies = Math.max(numCopies, 16);

        let blueprint: string[] = [];
        for (let i = 0; i < numCopies; i++) {
            blueprint = blueprint.concat([CARRY, CARRY, MOVE]);
        }

        // We may have space for a final [CARRY, MOVE] before we hit 50 parts.
        budget -= copyCost * numCopies;
        if (budget >= Blueprint.cost([CARRY, MOVE])) {
            blueprint = blueprint.concat([CARRY, MOVE]);
        }

        return blueprint;
    }
};
