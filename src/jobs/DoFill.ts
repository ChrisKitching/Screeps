import {Fill, JobCompletionStatus} from "./Jobs";
import {JobDoer} from "./JobDoer";
import {DoSingleSubject} from "./DoSingleSubject";
import * as Store from "../StoreDefinition";

export let DoFill: JobDoer<Fill> = {
    start: function(job: Fill, creep: Creep) {
        // TODO
        // Prroooobably should be using inheritance now, since these things don't actually have to
        // survive serialisation.
        // Jobs do have to survive serialisation, but JobDoers do not, so these should just be
        // reframed as objects and this shit simplified?
        return DoSingleSubject.start!(job, creep);
    },

    tick: function(job: Fill, creep: Creep) {
        let target = Game.getObjectById<Structure>(job.target);

        // If the target stopped existing, we're done.
        if (!target) {
            return JobCompletionStatus.DONE;
        }

        // If we have nothing to give them, we're done.
        if (!Store.contains(creep.carry, job.resource)) {
            return JobCompletionStatus.DONE;
        }

        // If the target is full, we're done.
        if (Store.isFull(target, job.resource)) {
            return JobCompletionStatus.DONE;
        }

        let result: number = OK;
        if (job.resource) {
            result = creep.transfer(target, job.resource);
        } else {
            for (let i in creep.carry) {
                let newResult = creep.transfer(target, i);
                if (newResult != result) {
                    result = newResult;
                }
            }
        }

        if (result != OK) {
            creep.reportErrors(result);
        }

        return JobCompletionStatus.NOT_DONE;
    }
};
