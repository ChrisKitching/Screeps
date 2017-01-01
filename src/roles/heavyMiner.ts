import {Role} from "./Role";
import {Miner} from "./miner";
import * as Blueprint from "../BlueprintUtils";

export const REQUIRED_FIELDS = [
    "toMine",    // ID of the thing to mine (Source or Mineral)
    "targetRoom" // Name of the room in which mining should be carried out.
];


/**
 * A miner that repairs (and possibly builds) a container it sits upon. For use in mining operations
 * outside of tower coverage.
 */
export let HeavyMiner: Role = {
    name: "heavyMiner",
    tick: Miner.tick,
    synthesiseNewJobs: Miner.synthesiseNewJobs,

    getBlueprint(budget: number) {
        // This is the only sane size for a miner, really.
        let miner = [
            WORK, WORK, MOVE,
            WORK, WORK, MOVE,
            WORK, WORK, MOVE,
            CARRY
        ];

        if (budget < Blueprint.cost(miner)) {
            return undefined;
        }

        return miner;
    }
};
