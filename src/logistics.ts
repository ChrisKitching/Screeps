export function isFull(target) {
    if(target.energy && target.energyCapacity && target.energy == target.energyCapacity) {
        return true;
    }
    else if(target.store && target.store.energy && target.storeCapacity && target.store.energy == target.storeCapacity) {
        return true;
    }
    return false;
}

export function isEmpty(target) {
    if(target.energy > 0) {
        return false;
    }
    else if(target.store && target.store.energy > 0) {
        return false;
    }
    else if(target.resourceType == RESOURCE_ENERGY && target.amount > 0) {
        return false;
    }
    return true;
}

export function creepsTargeting(target, role: string | false=false, fn?: (c: Creep) => boolean) {
    if(!target) return 0;
    let count = 0;
    for(let creep in Memory.creeps) {
        let c = Game.creeps[creep];
        if(_.isString(target) && c.memory.target && c.memory.target == target || (c.memory.target && c.memory.target == target.id)) {
            if(fn) {
                fn(c) ? count++ : 0;
                continue;
            }
            if(!role || role == c.memory.role) count++;
        }
        if(!c.memory.task || !_.isArray(c.memory.task)) continue;
        for(let t of c.memory.task) {
            if(t && t.target && t.target == target && !role) {
                if(fn) {
                    fn(c) ? count++ : 0;
                }
                else {
                    count++;
                }
            }
        }
    }
    return count;
}

export function getOrCreateFlag(creep) {
    let f = Game.flags[creep.name];
    if(!f) {
        creep.room.createFlag(creep.pos, creep.name);
        f = Game.flags[creep.name];
    }
    return f;
}

export let secondsToTimeString = (seconds: number, forceMinutes = false): string => {
    let hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    let minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    let result: string = seconds.toString();
    if (hours || minutes || forceMinutes) {
        result = minutes + ':' + (seconds < 10 ? '0' : '') + result;
    }
    if (hours) {
        result = hours + ':' + (minutes < 10 ? '0' : '') + result;
    }
    return result
};
