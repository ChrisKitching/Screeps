import {Role} from "./Role";
import {Blueprint.cost} from "../BlueprintUtils";
import {RelocateToRoom} from "../jobs/Jobs";

export const REQUIRED_FIELDS = [
    "target"  // Room to reserve.
];

/**
 * Suicidal creep that goes to a room and reserves it as much as possible.
 */
export let Reserver: Role = {
    name: "reserver",

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
        let minCost = Blueprint.cost(blueprint);

        if (budget < minCost) {
            return undefined;
        }

        while (budget >= minCost && blueprint.length <= 48) {
            blueprint.push(CLAIM);
            blueprint.push(MOVE);

            budget -= minCost
        }

        return blueprint;
    },

    shouldSpawn(state: CreepMemory) {
        let room = Game.rooms[state.target];

        // If we have no units in the room, assume it needs more reserving.
        if (!room) {
            return true;
        }

        if (!room.controller.reservation) {
            return true;
        }

        // If the room isn't ours, we want it.
        if (room.controller.reservation.username != "ckitching") {
            return true;
        }

        // Don't let the reservation counter get unreasonably high.
        return room.controller.reservation.ticksToEnd < 3500;
    }
};
