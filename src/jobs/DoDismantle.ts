import {Dismantle, JobCompletionStatus} from "./Jobs";
import {JobDoer} from "./JobDoer";
import {DoSingleSubject} from "./DoSingleSubject";

export let DoDismantle: JobDoer<Dismantle> = {
    start: function(job: Dismantle, creep: Creep) {
        return DoSingleSubject.start!(job, creep);
    },

    tick: function(job: Dismantle, creep: Creep) {
        let target = Game.getObjectById<Structure>(job.target);

        // If the site stopped existing, we're done.
        if (!target || target.hits == 0) {
            return JobCompletionStatus.DONE;
        }

        if (creep.carryCapacity > 0) {
            // If we're full, we're done.
            if (creep.getCarriedResources() == creep.carryCapacity) {
                return JobCompletionStatus.DONE;
            }
        } else {
            // If we have no carry capacity, we conclude doneness after 20 ticks.
            // This mostly exists for things like miners to be able to handle interrupts.
            if (Game.time % 20 == 0) {
                return JobCompletionStatus.DONE;
            }
        }

        let result = creep.dismantle(target);

        if (result != OK) {
            creep.reportErrors(result);
        }

        return JobCompletionStatus.NOT_DONE;
    }
};
