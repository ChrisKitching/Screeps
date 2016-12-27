import * as roleMixins from "./roleMixins";
import {Role} from "./Role";
import {Mover} from "./mover";
import {blueprintCost} from "../BlueprintUtils";


export const REQUIRED_FIELDS = [
    "scoopFlags",  // Places to visit and scoop from.
    "dst"          // Where to drop things off.
];

/**
 * A mover that repairs any roads it steps on. It has slightly reduced capacity because it has to
 * have a WORK part in order for this to function, but it means you don't neeed to worry about
 * maintaining roads in exploited rooms.
 */
export let RemoteMover: Role = {
    onSpawn: Mover.onSpawn,

    tick(creep: Creep) {
        roleMixins.repairWalkedRoads(creep);

        return Mover.tick!(creep);
    },

    synthesiseNewJobs: Mover.synthesiseNewJobs,

    getBlueprint(budget: number) {
        // The part which adds the special WORK part...
        let bp = [WORK, CARRY, MOVE];
        let prefixCost = blueprintCost(bp);
        if (budget < prefixCost) {
            return undefined;
        }

        // The best normal mover that can fit into the remaining budget...
        let suffix = Mover.getBlueprint(budget - prefixCost);
        if (suffix) {
            bp = bp.concat(suffix);
        }

        return bp;
    }
};
