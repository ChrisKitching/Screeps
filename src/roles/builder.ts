import * as roleMixins from "./roleMixins";
import {Role} from "./Role";

export const REQUIRED_FIELDS = [
    "src",       // Where to get resources from.
    "targetRoom" // Name of the room in which building should be carried out.
];


export let Builder: Role = {
    tick(creep: Creep) {
        roleMixins.repairWalkedRoads(creep);

        return false;
    },

    synthesiseNewJobs(creep: Creep) {
        // If you're out of resources, go get more.
        if (creep.carry.energy == 0) {
            creep.addJob({
                type: Jobs.WITHDRAW,
                target: creep.memory.src,
                resource: RESOURCE_ENERGY,
                persist: true
            });

            return;
        }

        // If you have resources, but aren't in the room where stuff should be built, go there.
        if (creep.room.name != creep.memory.targetRoom) {
            creep.addJob({
                type: Jobs.RELOCATE_TO_ROOM,
                target: creep.memory.targetRoom
            });

            return;
        }

        // Build something!
        let selection = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
        if (selection) {
            creep.addJob({
                type: Jobs.BUILD,
                target: selection.id
            });

            return;
        }
    },

    getBlueprint(maxCost: number) {

    }
};
