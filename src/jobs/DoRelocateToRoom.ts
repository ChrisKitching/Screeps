import {RelocateToRoom, JobCompletionStatus, MoveTo} from "./Jobs";
import {JobDoer} from "./JobDoer";

export let DoRelocateToRoom: JobDoer<RelocateToRoom> = {
    start: function(job: RelocateToRoom, creep: Creep) {
        // That was easy...
        if (creep.room.name == job.targetRoom) {
            return JobCompletionStatus.DONE;
        }

        // If there's a hint-flag, just use it.
        if (Game.flags[job.targetRoom]) {
            creep.preempt({
                type: "MOVE_TO",
                target: Game.flags[job.targetRoom].pos
            } as MoveTo);

            return JobCompletionStatus.PREEMPT;
        }

        // Do it the awful, step-wise way.
        let route = Game.map.findRoute(creep.room, job.targetRoom);
        if (typeof route == "number") {
            if (route == ERR_NO_PATH) {
                console.error("NO ROUTE TO " + job.targetRoom);
                creep.say("ERROR");
                return JobCompletionStatus.FAILED;
            }

            return JobCompletionStatus.FAILED;
        }

        if (route.length == 0) {
            // Uhhh...
            return JobCompletionStatus.DONE;
        }

        let nextStep = route[0];
        let nextExit = creep.pos.findClosestByRange<RoomObject>(nextStep.exit);
        creep.preempt({
            type: "MOVE_TO",
            target: nextExit.pos
        } as MoveTo);

        return JobCompletionStatus.PREEMPT;
    },

    tick: function(job: RelocateToRoom, creep: Creep) {
        return JobCompletionStatus.DONE;
    }
};
