import {Recycle, JobCompletionStatus} from "./Jobs";
import {JobDoer} from "./JobDoer";
import {DoSingleSubject} from "./DoSingleSubject";

export let DoRecycle: JobDoer<Recycle> = {
    start: function(job: Recycle, creep: Creep) {
        // TODO
        // Prroooobably should be using inheritance now, since these things don't actually have to
        // survive serialisation.
        // Jobs do have to survive serialisation, but JobDoers do not, so these should just be
        // reframed as objects and this shit simplified?
        return DoSingleSubject.start!(job, creep);
    },

    tick: function(job: Recycle, creep: Creep) {
        let spawner = Game.getObjectById<Spawn>(job.target);

        let result = spawner.recycleCreep(creep);
        if (result != OK) {
            creep.reportErrors(result);
            return JobCompletionStatus.NOT_DONE;
        }

        return JobCompletionStatus.DONE;
    }
};
