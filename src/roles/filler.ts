import {Role} from "./Role";
import {Mover} from "./mover";

/**
 * Memory fields that are mandatory for a creep of this type, to tell it what to do.
 */
export const REQUIRED_FIELDS = [
    "src"  // Where to get resources from.
];

/**
 * Fills the spawners, extensions, tower, etc.
 */
export let Filler: Role = {
    synthesiseNewJobs(creep:Creep) {
        // If we're empty, fill up.
        if (creep.carry.energy < 100) {
            creep.memory.addJob(
                {
                    type: "WITHDRAW",
                    target: creep.memory.src,
                    resource: RESOURCE_ENERGY
                }
            );
        } else {
            // Find the nearest thing to fill.
            let target = creep.pos.findClosestByPath(creep.room.getThingsToFill());
            if (target) {
                creep.memory.addJob(
                    {
                        type: "FILL",
                        target: target.id
                    }
                );
            }
        }
    },

    getBlueprint: Mover.getBlueprint
};
