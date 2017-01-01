import {UpgradeController, JobCompletionStatus} from "./Jobs";
import {JobDoer} from "./JobDoer";
import {DoControllerSubject} from "./DoControllerSubject";

export let DoUpgradeController: JobDoer<UpgradeController> = {
    start: function(job: UpgradeController, creep: Creep) {
        return DoControllerSubject.start!(job, creep);
    },

    tick: function(job: UpgradeController, creep: Creep) {
        if (creep.carry.energy == 0) {
            return JobCompletionStatus.DONE;
        }

        // To get here, we should have completed a move_to order which put us within 3 squares of the controller.
        // This should therefore always return OK...
        let result = creep.upgradeController(creep.room.controller);

        if (result != OK) {
            creep.reportErrors(result);
        }

        return JobCompletionStatus.NOT_DONE;
    }
};
