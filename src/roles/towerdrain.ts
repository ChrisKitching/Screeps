import {Role} from "./Role";
import {Blueprint.cost} from "../BlueprintUtils";

export const REQUIRED_FIELDS = [
    "targetRoom",  // The room to get shot at in.
    "homeRoom"     // The room to heal in.
];

/**
 * Walk into room, get shot for a while, leave room, heal.
 */
export let TowerDrain: Role = {
    name: "towerdrain",

    synthesiseNewJobs(creep: Creep) {
        // If damaged and not in the home room, go to the home room.
        if (creep.hits <= 1500 && creep.room.name != creep.memory.homeRoom) {
            creep.stop();
            creep.addJob({
                type: "RELOCATE_TO_ROOM",
                target: creep.memory.homeRoom
            });

            return;
        }

        // If not damaged and not in the target room, go to the target room.
        if (creep.hits == creep.hitsMax && creep.room.name != creep.memory.targetRoom) {
            creep.stop();
            creep.addJob({
                type: "RELOCATE_TO_ROOM",
                target: creep.memory.targetRoom
            });

            return;
        }
    },

    tick(creep: Creep) {
        creep.heal(creep);

        return false;
    },

    getBlueprint(budget: number) {
        // As many copies of (MOVE, HEAL) as we can fit, but with all the HEALs at the end.
        let copies = Math.floor(budget / Blueprint.cost([MOVE, HEAL]));
        copies = Math.max(copies, 25);

        let blueprint:string[] = [];
        for (let i = 0; i < copies; i++) {
            blueprint.push(MOVE);
        }
        for (let i = 0; i < copies; i++) {
            blueprint.push(HEAL);
        }

        return blueprint;
    }
};
