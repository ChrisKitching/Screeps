import {MoveDirection, JobCompletionStatus} from "./Jobs";
import {JobDoer} from "./JobDoer";

export let DoMoveDirection: JobDoer<MoveDirection> = {
    tick: function(job: MoveDirection, creep: Creep) {
        creep.move(job.direction);

        return JobCompletionStatus.DONE;
    }
};
