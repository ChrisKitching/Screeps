import {roles} from "./roles/Roles";
import {JOB_ACTUATORS} from "./jobs/JobDoer";
import {JobCompletionStatus, Job} from "./jobs/Jobs";

Creep.prototype.recycle = function(this:Creep) {
    this.stop();
    this.addJob({
        type: "RECYCLE"
    });
};

// TODO: Questionable placement?
Creep.prototype.getRepairPower = function(this:Creep) {
    return this.getActiveBodyparts(WORK) * 100;
};


function startNextJob(creep: Creep) {
    if (creep.memory.jobs.length == 0) {
        return; // Nothing to do.
    }

    let nextJob = creep.memory.jobs.shift();
    creep.memory.currentJob = nextJob;

    let actuator = JOB_ACTUATORS[nextJob.type];

    if (actuator.start) {
        let startResult = actuator.start(nextJob, creep);
        switch (startResult) {
            case JobCompletionStatus.DONE:
            case JobCompletionStatus.PREEMPT:
                // This job finished at start-time, so let's try again.
                startNextJob(creep);
                return;

            case JobCompletionStatus.FAILED:
                // Well, shit.
                console.log("JOB START FAILURE!");
                return;

            case JobCompletionStatus.NOT_DONE:
                // Normal startup, then...
        }
    }
}

function continueCurrentJob(creep: Creep) {
    let job = creep.memory.currentJob;
    let actuator = JOB_ACTUATORS[job.type];

    let result = actuator.tick(job, creep);
    switch (result) {
        case JobCompletionStatus.DONE:
        case JobCompletionStatus.PREEMPT:
            startNextJob(creep);
            break;

        case JobCompletionStatus.FAILED:
            // Well, shit.
            console.log("JOB TICK FAILURE!");
            return;

        case JobCompletionStatus.NOT_DONE:
            return;
    }
}

/**
 * Run the job queue...
 */
Creep.prototype.tick = function(this:Creep) {
    let role = roles[this.memory.role];

    if (role.tick) {
        role.tick(this);
    }

    // Make sure there is a job to do...
    if (this.needNewJobs()) {
        role.synthesiseNewJobs(this);
    }

    if (!this.memory.currentJob) {
        startNextJob(this);
    }

    if (this.memory.currentJob) {
        continueCurrentJob(this);
    }
};

Creep.prototype.getCarriedResources = function(this:Creep, type: string = "ALL"): number {
    if (type == "ALL") {
        // Sum everything.
        let acc = 0;
        for (let i in this.carry) {
            acc += this.carry[i];
        }

        return acc;
    }

    let ret = this.carry[type];
    if (ret != undefined) {
        return ret;
    }

    return 0;
};

Creep.prototype.reportErrors = function(this: Creep, errorCode: number) {
    switch (errorCode) {
        case ERR_NOT_IN_RANGE:
            console.log("ERROR: " + this.name + " failed to become adjacent");
        case ERR_NOT_OWNER:
            console.log("ERROR: " + this.name + " is not owned by you (WTF?!)");
        case ERR_NOT_ENOUGH_RESOURCES:
        case ERR_NOT_ENOUGH_ENERGY:
            console.log("ERROR: " + this.name + " ran out of resources and wasted CPU!");
        case ERR_FULL:
            console.log("ERROR: " + this.name + " got full and wasted CPU!");
        case ERR_TIRED:
            console.log("ERROR: " + this.name + " got tired and wasted CPU!");
        case ERR_INVALID_TARGET:
            console.log("ERROR: " + this.name + " has invalid target...");
        case ERR_NO_BODYPART:
            console.log("ERROR: " + this.name + " lacks needed bodyparts...");
        case ERR_INVALID_ARGS:
            console.log("ERROR: " + this.name + " has invalid args...");
        case ERR_NO_PATH:
            console.log("ERROR: " + this.name + " has an unsolvable pathfinding problem...");
            this.say("ERROR");
        case ERR_BUSY:
            console.log("ERROR: " + this.name + " is still spawning!");
            return;
    }
};


// Job running stuff.

Creep.prototype.preempt = function(this: Creep, job: Job) {
    if (this.memory.currentJob) {
        this.memory.jobs.unshift(this.memory.currentJob);
        this.memory.currentJob = undefined;
    }

    this.memory.jobs.unshift(job);
};

Creep.prototype.addJob = function(this: Creep, job: Job) {
    this.memory.jobs.push(job);
};

Creep.prototype.stop = function(this: Creep) {
    this.memory.jobs = [];
    this.memory.currentJob = undefined;
};

Creep.prototype.needNewJobs = function(this: Creep) {
    return this.memory.jobs.length == 0 && this.memory.currentJob == undefined;
};

Creep.prototype.jobComplete = function(this: Creep) {
    this.memory.currentJob = undefined;
};


interface CreepMemory {}

declare global {
    interface Creep {
        memory: CreepMemory;

        recycle(): void;

        /**
         * Calculate the repair power (per tick) of the creep.
         * ... Slightly odd thing to have here?
         */
        getRepairPower(): number;

        /**
         * Returns true iff the creep is carrying any amount of resources
         */
        isCarrying(type?: string): boolean;

        /**
         * Get the amount of resources carried by the creep of a specific type.
         * If the type is omitted, the total amount of resources carried is returned.
         * @param type
         */
        getCarriedResources(type?: string): number;

        /**
         * Helpfully-ish report unexpected creep-action return codes.
         * Pass your not-OK error codes here and we'll shout at you about them.
         */
        reportErrors(errorCode: number): void;

        /**
         * Called every simulation timestep.
         */
        tick(): void;

        // Job-runner stuff.

        /**
         * Add a job to the start of the queue, and make it the current job.
         * The currently-executing job goes back into the queue and is retried after this new job.
         */
        preempt(job: Job): void;

        /**
         * Append an order to the job queue.
         */
        addJob(job: Job): void;

        /**
         * Stops the current job and deletes all queued orders.
         */
        stop(): void;

        /**
         * Returns true if the creep has nothing to do.
         */
        needNewJobs(): boolean;

        /**
         * Called to mark the currently-executing job as complete.
         */
        jobComplete(): void;
    }
}
