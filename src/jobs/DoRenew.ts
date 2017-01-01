import {Renew, JobCompletionStatus} from "./Jobs";
import {JobDoer} from "./JobDoer";
import {DoSingleSubject} from "./DoSingleSubject";

export let DoRenew: JobDoer<Renew> = {
    start: function(job: Renew, creep: Creep) {
        // TODO
        // Prroooobably should be using inheritance now, since these things don't actually have to
        // survive serialisation.
        // Jobs do have to survive serialisation, but JobDoers do not, so these should just be
        // reframed as objects and this shit simplified?
        return DoSingleSubject.start!(job, creep);
    },

    tick: function(job: Renew, creep: Creep) {
        let spawner = Game.getObjectById<Spawn>(job.target);

        // Donate anything you're carrying to the cause.
        if (creep.carry.energy > 0 && spawner.energy < spawner.energyCapacity) {
            creep.transfer(spawner, RESOURCE_ENERGY);
        }

        // If the money runs out, call it a day...
        if (creep.room.energyAvailable < 100) {
            return JobCompletionStatus.DONE;
        }

        let result = spawner.renewCreep(creep);
        if (result != OK) {
            creep.reportErrors(result);
            return JobCompletionStatus.NOT_DONE;
        }

        return JobCompletionStatus.DONE;
    }
};
