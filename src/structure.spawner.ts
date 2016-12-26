let renewBehavior = require('behavior.renew');
let towerStructure = require('structure.tower');

interface CreepType {
    name: string;
    run: any;
    blueprint: string[];
    priority: number | undefined;
}

export function run(spawn: Spawn, creepTypes) {
    let missing: CreepType[] = [];
    for(let t in creepTypes) {
        if(!creepTypes.hasOwnProperty(t)) {
            return;
        }
        let {blueprint, count} = creepTypes[t];
        if(creepTypes[t].countFn) {
            count = creepTypes[t].countFn();
        }
        Memory.stats[t] = {count};
        let n = _.filter(Game.creeps, c => c.memory.role == t).length;
        Memory.stats[t] = Object.assign(Memory.stats[t], {missing: count - n, actual: n});
        if(n < count) {
            missing.push(creepTypes[t]);
        }
    }
    missing.sort((t1, t2) => t1.priority <= t2.priority ? 1 : -1);
    if(Game.time % 10 == 0 && missing.length) console.log("Next up:", missing[missing.length-1].name);
    let top = missing.pop();
    let renewing = 0;
    for(let creepName in Game.creeps) {
        let creep = Game.creeps[creepName];
        if(creep.room.name == spawn.room.name && creep.memory.refilling) {
            renewing++;
            if(creep.ticksToLive < 140
                || creep.memory.role == "distributor"
                || creep.memory.role == "upgraderDistributor"
            ) renewing++;
        }
    }
    if(top && !renewing || top && top.priority <= 7 && renewing < 3) {
        let newName = Game.spawns["Spawn3"].createCreep(top.blueprint, undefined, {
            role: top.name,
            home: spawn.room.name
        });
        if(_.isString(newName)) {
            console.log("Creating new", top.name, newName);
        }
    }
    let i = 0;
    for(let name in Game.creeps) {
        i++;
        let creep = Game.creeps[name];
        if(!creepTypes[creep.memory.role] && !creep.memory.task) {
            //console.log("No role or task for: ", name);
        }
        let role = creepTypes[creep.memory.role];
        if(!role) continue;
        if(!renewBehavior.renew(spawn, creep, role)) {
            role.run(creep, i, spawn);
        }
    }
}
