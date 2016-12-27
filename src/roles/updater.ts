import {Role} from "./Role";
import * as roleMixins from "./roleMixins";
import {Withdraw} from "../Orders";

export const REQUIRED_FIELDS = [
    "src"  // Where to get resources from
];

export let Updater: Role = {
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

    }
};
