import {Claim, JobCompletionStatus} from "./Jobs";
import {JobDoer} from "./JobDoer";
import {DoControllerSubject} from "./DoControllerSubject";


export let DoClaim: JobDoer<Claim> = {
    start: function(job: Claim, creep: Creep) {
        return DoControllerSubject.start!(job, creep);

        // TODO: Calculate if we will actually live long enough to get there?
    },

    tick: function(job: Claim, creep: Creep) {
        let result = creep.claimController(creep.room.controller);
        if (result != OK) {
            creep.reportErrors(result);
            return JobCompletionStatus.NOT_DONE;
        }

        if (job.message) {
            creep.signController(creep.room.controller, job.message);
        }

        return JobCompletionStatus.DONE;
    }
};
