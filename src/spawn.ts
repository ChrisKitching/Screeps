import {Schedule} from "./schedule";
export function run(spawn: Spawn) {
    if(spawn.spawning) return;
    for(let creep of spawn.pos.findInRange<Creep>(FIND_MY_CREEPS, 1)) {
        if(creep.ticksToLive < 10) {
            spawn.renewCreep(creep);
            break;
        }
    }
    let schedule = spawn.getSchedule();
    spawn.memory.schedule = schedule.serialize();
    let job = schedule.getJobAt(Game.time);
    if(!job) return;
    switch(job.job.kind) {
        case "Renew":
            let target = Game.getObjectById<Creep>(job.job.id);
            if(!target) {
                schedule.removeJob(job);
                break;
            }
            spawn.renewCreep(target);
            break;
        case "Create":
            if(_.isString(spawn.createCreep(job.job.blueprint, job.job.name,
                {
                    home: spawn.room.name,
                    ...(job.job.memory || {})
                }))) {
                job.executed = true;
                schedule.removeJob(job);
            }
            else {
                schedule.push(job)
            }
    }
    spawn.memory.schedule = schedule.serialize();
}

Spawn.prototype.isBusy = function(this: Spawn): boolean {
    if(this.spawning) return true;
    let creep = Game.getObjectById(this.memory.renewing);
    return !!creep;
};

Spawn.prototype.getSchedule = function(this: Spawn): Schedule<SpawnJob> {
    return new Schedule<SpawnJob>(this.memory.schedule);
};

declare global {
    interface Spawn {
        isBusy(): boolean,
        getSchedule(): Schedule<SpawnJob>
    }
}
