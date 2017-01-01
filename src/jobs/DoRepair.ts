import {Repair, JobCompletionStatus} from "./Jobs";
import {JobDoer} from "./JobDoer";
import {DoSingleSubject} from "./DoSingleSubject";

export let DoRepair: JobDoer<Repair> = {
    start: function(job: Repair, creep: Creep) {
        return DoSingleSubject.start!(job, creep);
    },

    tick: function(job: Repair, creep: Creep) {
        let target = Game.getObjectById<Structure>(job.target);

        // If the site stopped existing or is fully repaired, we're done.
        if (!target || target.hits == target.hitsMax) {
            return JobCompletionStatus.DONE;
        }

        let result = creep.repair(target);

        if (result != OK) {
            creep.reportErrors(result);
        }

        return JobCompletionStatus.NOT_DONE;
    }
};
