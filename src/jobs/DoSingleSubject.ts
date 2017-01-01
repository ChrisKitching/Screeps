import {SingleSubjectJob, MoveTo, JobCompletionStatus} from "./Jobs";
import {JobDoer} from "./JobDoer";
import * as Position from "../RoomPosition";

/**
 * Behaviour common to single-subject jobs (mostly the desugaring to MOVE_TO
 */
export let DoSingleSubject: JobDoer<SingleSubjectJob> = {
    start: function(job: SingleSubjectJob, creep: Creep) {
        let target = Game.getObjectById<RoomObject>(job.target);

        if (!target) {
            console.log("[" + creep.name + "] ERROR: Invalid order subject " + target);
            creep.say("ERROR");
            return JobCompletionStatus.FAILED;
        }

        // If we're out of range, inject a MoveTo order in front of this one.
        if (Position.distanceTo(creep.pos, target.pos) > job.range) {
            creep.preempt({
                type: "MOVE_TO",
                target: job.target,
                closeness: job.range
            } as MoveTo);

            return JobCompletionStatus.PREEMPT;
        }

        return JobCompletionStatus.NOT_DONE;
    },

    tick: function(_: SingleSubjectJob, __: Creep) {
        return JobCompletionStatus.NOT_DONE;
    }
};
