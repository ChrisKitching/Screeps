import {Role} from "./Role";
import {RelocateToRoom} from "../Orders";
import {blueprintCost} from "../BlueprintUtils";

/**
 * Memory fields that are mandatory for a creep of this type, to tell it what to do.
 */
export const REQUIRED_FIELDS = [
    "target"  // Where to get resources from.
];

/**
 * Suicidal creep that goes to a room and claims it. And then does nothing else...
 */
export let Claimer: Role = {
    synthesiseNewJobs(creep: Creep) {
        if (creep.room.name == creep.memory.target) {
            creep.addJob(
                {
                    type: "CLAIM"
                }
            );
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
        // It's gotta have one CLAIM and one MOVE. After that, we just add up to 5
        // extra MOVEs, after which there's no point doing anything else.
        let blueprint = [CLAIM, MOVE];
        let minimumCost = blueprintCost(blueprint);

        if (budget < minimumCost) {
            return undefined;
        }

        budget -= minimumCost;

        let moveCost = blueprintCost([MOVE]);
        while (moveCost > 0 && blueprint.length < 6) {
            blueprint.push(MOVE);
            budget -= moveCost;
        }

        return blueprint;
    }
};
