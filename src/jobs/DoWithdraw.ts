import {Withdraw, JobCompletionStatus} from "./Jobs";
import {JobDoer} from "./JobDoer";
import {DoSingleSubject} from "./DoSingleSubject";
import * as Store from "../StoreDefinition";

export let DoWithdraw: JobDoer<Withdraw> = {
    start: function(job: Withdraw, creep: Creep) {
        // TODO
        // Prroooobably should be using inheritance now, since these things don't actually have to
        // survive serialisation.
        // Jobs do have to survive serialisation, but JobDoers do not, so these should just be
        // reframed as objects and this shit simplified?
        return DoSingleSubject.start!(job, creep);
    },

    tick: function(job: Withdraw, creep: Creep) {
        let target = Game.getObjectById<Structure>(job.target);

        // If the target stopped existing, we're done.
        if (!target) {
            return JobCompletionStatus.DONE;
        }

        // If we are full, we're done.
        if (Store.totalStored(creep.carry) == creep.carryCapacity) {
            return JobCompletionStatus.DONE;
        }

        // If they don't have what we want, give up.
        if (!Store.structureContains(target, job.resource)) {
            return JobCompletionStatus.DONE;
        }

        let result: number = OK;
        if (job.resource) {
            result = creep.withdraw(target, job.resource);
        } else {
            for (let i in creep.carry) {
                let newResult = creep.withdraw(target, i);
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
