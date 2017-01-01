import {Build, JobCompletionStatus} from "./Jobs";
import {JobDoer} from "./JobDoer";
import {DoSingleSubject} from "./DoSingleSubject";

export let DoBuild: JobDoer<Build> = {
    start: function(job: Build, creep: Creep) {
        return DoSingleSubject.start!(job, creep);
    },

    tick: function(job: Build, creep: Creep) {
        let site = Game.getObjectById<ConstructionSite>(job.target);

        // If the site stopped existing, it was either cancelled or finished, and we're done.
        // If the site is explicitly finished but hasn't been deleted yet, we're also done.
        // If we are carrying no energy, we're done.
        if (!site || site.progress == site.progressTotal || creep.carry.energy == 0) {
            return JobCompletionStatus.DONE;
        }

        let result = creep.build(site);

        if (result != OK) {
            creep.reportErrors(result);
        }

        return JobCompletionStatus.NOT_DONE;
    }
};
