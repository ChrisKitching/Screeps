import {MoveTo, JobCompletionStatus} from "./Jobs";
import {JobDoer} from "./JobDoer";
export let DoMoveTo: JobDoer<MoveTo> = {
    start: function(job: MoveTo, subject: Creep) {
        let closeness = job.closeness;

        // Default is to move right to the destination.
        if (closeness == undefined) {
            closeness = 0;
        }

        // Desugar move-to-object orders to move-to-position ones.
        if (typeof job.target === "string") {
            let targetObject = Game.getObjectById<RoomObject>(job.target);

            if (!targetObject) {
                console.log("ERROR: Attempt to move to nonexistent object: " + job.target);
                return JobCompletionStatus.FAILED;
            }

            job.target = targetObject.pos;

            // If we're moving to an object, we should instead default to moving adjacent to it,
            // otherwise the pathfinder consumes tons of time searching for a route to the impossible
            // location (such as right on top of a source, which is inside a wall...).
            if (job.closeness == undefined) {
                closeness = 1;
            }
        }

        // TODO: Caching.
        if (job.useCaching) {
            // // Compute the path to take.
            // let path = PathFinder.search(subject.pos, {pos: job.target, range: closeness});
            // if (path.incomplete) {
            //     console.log("ERROR: Unable to find path to " + job.target);
            //
            //     // Proceed as if caching was turned off...
            // }
        }

        job.closeness = closeness;

        return JobCompletionStatus.NOT_DONE;
    },

    tick: function(job: MoveTo, subject: Creep) {
        // If we have a route provided (perhaps from caching, perhaps as input), follow it.
        if (job.route) {
            // TODO: something.
            console.log("Explicit routes not implemented yet...");
            return false;
        }

        let target = job.target as RoomPosition;

        let dst = new RoomPosition(target.x, target.y, target.roomName ? target.roomName : subject.room.name);

        // Use naive builtin pathfinding...
        subject.moveTo(dst);

        // Are we there yet?
        if (subject.pos.getRangeTo(dst) <= job.closeness) {
            return JobCompletionStatus.DONE;
        }

        return JobCompletionStatus.NOT_DONE;
    }
};
