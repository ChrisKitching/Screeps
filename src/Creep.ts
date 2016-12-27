import {continueExecutingCurrentJob, executeNextJob} from "./roles/base";
import {Job} from "./Orders";

Creep.prototype.recycle = function(this:Creep) {
    this.memory.role = "base";
    this.memory.currentJob = undefined;
    this.memory.orders = [{
        type: Jobs.RECYCLE
    }];
};

/**
 * Give a new order to the creep, adding it to the queue.
 */
Creep.prototype.addJob = function (this:Creep, order:Job) {
    if (this.memory.orders == undefined) {
        this.memory.orders = []
    }

    this.memory.orders.push(order);
};

/**
 * Mark the currently-executing order as finished.
 */
Creep.prototype.orderComplete = function(this:Creep) {
    this.memory.currentJob = undefined;
};

Creep.prototype.stop = function(this:Creep) {
    this.memory.orders = [];
    this.memory.currentJob = undefined;
};

Creep.prototype.needNewJobs = function(this:Creep) {
    return !this.memory.orders || this.memory.orders.length == 0 && this.memory.currentJob == undefined;
};

// TODO: Questionable placement?
Creep.prototype.getRepairPower = function(this:Creep) {
    return this.getActiveBodyparts(WORK) * 100;
};


/**
 * Run the job queue...
 */
Creep.prototype.tick = function(this:Creep) {
    if (this.memory.currentJob) {
        continueExecutingCurrentJob(this);
    }

    if (!this.memory.currentJob) {
        executeNextJob(this);

        if (this.memory.currentJob) {
            continueExecutingCurrentJob(this);
        }
    }
};

declare global {
    interface Creep {
        recycle(): void;

        /**
         * Append an order to the order queue.
         */
        addJob(order: Job): void;

        /**
         * Stops the current order and deletes all queued orders.
         */
        stop(): void;

        /**
         * Returns true if the creep has nothing to do.
         */
        needNewJobs(): boolean;

        /**
         * Calculate the repair power (per tick) of the creep.
         * ... Slightly odd thing to have here?
         */
        getRepairPower(): number;

        /**
         * Called to mark the currently-executing order as complete.
         */
        orderComplete(): void;

        /**
         * Called every simulation timestep.
         */
        tick(): void;
    }
}
