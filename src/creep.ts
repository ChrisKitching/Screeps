import {getCost} from './blueprint';
import {Task} from "./tasks";

export function timeToRenew(creep: Creep, val = 1400) {
    let delta = Math.floor(600/creep.body.length);
    let required = val-creep.ticksToLive;
    return required / delta;
}

Creep.prototype.timeToRebuild = function(this: Creep) {
    return 3*this.body.length;
};
Creep.prototype.getCost = function(this: Creep) {
    return getCost(this.body.map(p => p.type) as BODY_PART[])
};
Creep.prototype.getCurrentTask = function(this: Creep) {
    if(!this.memory.task) return undefined;
    return {
        toString: function(this: Task) {return this.kind},
        ...this.memory.task[0]
    };
};
declare global {
    interface Creep {
        timeToRebuild(): number;
        getCurrentTask(): Task;
        getCost(): number;
    }
}
