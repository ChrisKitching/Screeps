import {MoveTo, JobCompletionStatus, ControllerSubjectJob} from "./Jobs";
import {JobDoer} from "./JobDoer";
import * as Position from "../RoomPosition";

/**
 * Behaviour common to controller-subject jobs. (mostly the desugaring to MOVE_TO
 */
export let DoControllerSubject: JobDoer<ControllerSubjectJob> = {
    start: function(job: ControllerSubjectJob, creep: Creep) {
        let target = creep.room.controller;

        if (!target) {
            console.log("[" + creep.name + "] ERROR: Room " + creep.room.name + " does not have a controller!");
            creep.say("ERROR");
            return JobCompletionStatus.FAILED;
        }

        // If we're out of range, inject a MoveTo order in front of this one.
        if (Position.distanceBetween(creep.pos, target.pos) > job.range) {
            creep.preempt({
                type: "MOVE_TO",
                target: target.id,
                closeness: job.range
            } as MoveTo);

            return JobCompletionStatus.PREEMPT;
        }

        return JobCompletionStatus.NOT_DONE;
    },

    tick: function(_: ControllerSubjectJob, __: Creep) {
        return JobCompletionStatus.NOT_DONE;
    }
};
