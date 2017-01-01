import {Reserve, JobCompletionStatus} from "./Jobs";
import {JobDoer} from "./JobDoer";
import {DoControllerSubject} from "./DoControllerSubject";


export let DoReserve: JobDoer<Reserve> = {
    start: function(job: Reserve, creep: Creep) {
        return DoControllerSubject.start!(job, creep);

        // TODO: Calculate if we will actually live long enough to get there?
    },

    tick: function(job: Reserve, creep: Creep) {
        let result = creep.reserveController(creep.room.controller);
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
