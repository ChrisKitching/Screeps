import * as roleMixins from "./roleMixins";
import {Role} from "./Role";
import {Build, RelocateToRoom, Withdraw} from "../jobs/Jobs";
import * as Blueprint from "../BlueprintUtils";

export const REQUIRED_FIELDS = [
    "src",       // Where to get resources from.
    "targetRoom" // Name of the room in which building should be carried out.
];


export let Builder: Role = {
    name: "builder",

    tick(creep: Creep) {
        roleMixins.repairWalkedRoads(creep);

        return false;
    },

    synthesiseNewJobs(creep: Creep) {
        // If you're out of resources, go get more.
        if (creep.carry.energy == 0) {
            creep.addJob({
                type: "WITHDRAW",
                target: creep.memory.src,
                resource: RESOURCE_ENERGY,
                persist: true
            } as Withdraw);

            return;
        }

        // If you have resources, but aren't in the room where stuff should be built, go there.
        if (creep.room.name != creep.memory.targetRoom) {
            creep.addJob({
                type: "RELOCATE_TO_ROOM",
                targetRoom: creep.memory.targetRoom
            } as RelocateToRoom);

            return;
        }

        // Build something!
        let selection = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
        if (selection) {
            creep.addJob({
                type: "BUILD",
                target: selection.id
            } as Build);

            return;
        }
    },

    getBlueprint(budget: number) {
        // The minimum thing that makes sense.
        let bp = [WORK, CARRY, MOVE];
        let minCost = Blueprint.cost(bp);

        if (budget < minCost) {
            return undefined;
        }

        budget -= minCost;

        let parts = [
            [WORK, WORK, MOVE],
            [CARRY, CARRY, MOVE],
            [CARRY, CARRY, MOVE],
        ];

        bp.concat(Blueprint.fromRepeatedParts(budget, parts));

        return bp;
    },

    shouldSpawn(state: CreepMemory) {
        for (let i in Game.constructionSites) {
            let cs = Game.constructionSites[i];

            if (cs.pos.roomName == state.targetRoom) {
                return true;
            }
        }

        return false;
    }
};
