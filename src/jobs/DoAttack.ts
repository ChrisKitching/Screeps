import {Attack, JobCompletionStatus} from "./Jobs";
import {JobDoer} from "./JobDoer";
import {DoSingleSubject} from "./DoSingleSubject";

export let DoAttack: JobDoer<Attack> = {
    start: function(job: Attack, creep: Creep) {
        return DoSingleSubject.start!(job, creep);
    },

    tick: function(job: Attack, creep: Creep) {
        let target = Game.getObjectById<Creep | Structure>(job.target);

        // If the target is nonexistent or dead and not gc'd, or left the room, we're done
        if (!target || target.hits == 0 || target.room.name != creep.room.name) {
            return JobCompletionStatus.DONE;
        }

        let hasRangedAttack = creep.getActiveBodyparts(RANGED_ATTACK) > 0;
        // Since the target can move, we need to keep chasing it (murdering is more
        // effective the closer you are, after all).
        let distance = creep.pos.distanceTo(target.pos);
        if (distance > 1) {
            let result = creep.moveTo(target);
            if (result != OK) {
                creep.reportErrors(result);
            }
        } else {
            let result = creep.attack(target);
            if (result != OK) {
                creep.reportErrors(result);
            }
        }

        if (distance <= 3 && hasRangedAttack) {
            let result = creep.rangedAttack(target);
            if (result != OK) {
                creep.reportErrors(result);
            }
        }

        return JobCompletionStatus.NOT_DONE;
    }
};
