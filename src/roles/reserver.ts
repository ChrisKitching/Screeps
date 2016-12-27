import {Role} from "./Role";
import {blueprintCost} from "../BlueprintUtils";
import {RelocateToRoom} from "../Orders";

export const REQUIRED_FIELDS = [
    "target"  // Room to reserve.
];

/**
 * Suicidal creep that goes to a room and reserves it as much as possible.
 */
export let Reserver: Role = {
    synthesiseNewJobs(creep: Creep) {
        if (creep.room.name == creep.memory.target) {
            creep.addJob(
                {
                    type: "RESERVE"
                });
        } else {
            creep.addJob(
                {
                    type: "RELOCATE_TO_ROOM",
                    targetRoom: creep.memory.target
                } as RelocateToRoom
            );
        }
    },

    getBlueprint(budget: number) {
        // Keep adding [CLAIM, MOVE] until you can't any more.
        let blueprint = [CLAIM, MOVE];
        let minCost = blueprintCost(blueprint);

        if (budget < minCost) {
            return undefined;
        }

        while (budget >= minCost && blueprint.length <= 48) {
            blueprint.push(CLAIM);
            blueprint.push(MOVE);

            budget -= minCost
        }

        return blueprint;
    }
};
