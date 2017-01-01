import {Role} from "./Role";
import * as roleMixins from "./roleMixins";
import {Withdraw} from "../jobs/Jobs";
import * as Blueprint from "../BlueprintUtils";

export const REQUIRED_FIELDS = [
    "src"  // Where to get resources from
];

export let Updater: Role = {
    name: "updater",

    tick(creep: Creep) {
        roleMixins.scoopWalkedEnergy(creep);

        return false;
    },

    /**
     * Takes resources from the specified storage and uses them to upgrade the controller.
     */
    synthesiseNewJobs(creep: Creep) {
        creep.addJob({
            type: "WITHDRAW",
            target: creep.memory.src,
            resource: RESOURCE_ENERGY
        } as Withdraw);

        creep.addJob({
            type: "UPGRADE_CONTROLLER"
        });
    },

    getBlueprint(budget: number) {
        // 5:1 of WORK, WORK, MOVE to CARRY, CARRY, MOVE.

        // The smallest thing which can possibly work.
        let bp = [WORK, CARRY, MOVE];
        let bpCost = Blueprint.cost(bp);
        if (budget < bpCost) {
            return undefined;
        }

        budget -= bpCost;
        let parts = [
            [WORK, WORK, MOVE],
            [WORK, WORK, MOVE],
            [WORK, WORK, MOVE],
            [WORK, WORK, MOVE],
            [WORK, WORK, MOVE],
            [CARRY, CARRY, MOVE]
        ];

        bp.concat(Blueprint.fromRepeatedParts(budget, parts));

        return bp;
    }
};
