import {Harvest, JobCompletionStatus} from "./Jobs";
import {JobDoer} from "./JobDoer";
import {DoSingleSubject} from "./DoSingleSubject";

export let DoHarvest: JobDoer<Harvest> = {
    start: function(job: Harvest, creep: Creep) {
        // TODO
        // Prroooobably should be using inheritance now, since these things don't actually have to
        // survive serialisation.
        // Jobs do have to survive serialisation, but JobDoers do not, so these should just be
        // reframed as objects and this shit simplified?
        return DoSingleSubject.start!(job, creep);
    },

    tick: function(job: Harvest, creep: Creep) {
        let source = Game.getObjectById<Source | Resource | Mineral>(job.target);
        if (!source) {
            // The thing to harvest went away (someone else picked it up, probably).
            return JobCompletionStatus.DONE;
        }

        // If the thing to harvest is depleted, we're done.
        if (source instanceof Source) {
            if (source.energy == 0) {
                return JobCompletionStatus.DONE;
            }
        } else if (source instanceof Mineral) {
            if (source.mineralAmount == 0) {
                return JobCompletionStatus.DONE;
            }
        }
        // Dropped resources stop existing when their value reaches zero.

        if (creep.carryCapacity > 0) {
            // If we're full, we're done.
            if (creep.getCarriedResources() == creep.carryCapacity) {
                return JobCompletionStatus.DONE;
            }
        } else {
            // If we have no carry capacity, we conclude doneness after 20 ticks.
            // This mostly exists for things like miners to be able to handle interrupts.
            if (Game.time % 20 == 0) {
                return JobCompletionStatus.DONE;
            }
        }

        // So, this definitely should return OK now...
        let result: number;
        if (source instanceof Source || source instanceof Mineral) {
            result = creep.harvest(source);
        } else {
            result = creep.pickup(source);
        }

        if (result != OK) {
            creep.reportErrors(result);
        }

        return JobCompletionStatus.NOT_DONE;
    }
};
