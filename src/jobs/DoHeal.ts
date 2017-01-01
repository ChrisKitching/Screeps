import {Heal, JobCompletionStatus} from "./Jobs";
import {JobDoer} from "./JobDoer";
import {DoSingleSubject} from "./DoSingleSubject";

export let DoHeal: JobDoer<Heal> = {
    start: function(job: Heal, creep: Creep) {
        return DoSingleSubject.start!(job, creep);
    },

    tick: function(job: Heal, creep: Creep) {
        let target = Game.getObjectById<Creep>(job.target);

        // If the target is fully healed, we're done.
        if (target.hits == target.hitsMax) {
            return JobCompletionStatus.DONE;
        }

        // If we're healing ourselves, we can take a shortcut.
        if (target == creep) {
            creep.heal(creep);
            return JobCompletionStatus.NOT_DONE;
        }

        // Otherwise, since the target can move, we need to keep chasing it (healing is more
        // effective the close you are, after all).
        let distance = creep.pos.distanceTo(target.pos);
        if (distance > 1) {
            let result = creep.moveTo(target);
            if (result != OK) {
                creep.reportErrors(result);
            }
        }

        if (distance <= 3) {
            let result = creep.heal(target);
            if (result != OK) {
                creep.reportErrors(result);
            }
        }

        return JobCompletionStatus.NOT_DONE;
    }
};
