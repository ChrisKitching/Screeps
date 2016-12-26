import {secondsToTimeString} from "./logistics";
import {MoveTo, AttackMove, Task, executeTask, creepIsDoing} from "./tasks";
import {
    Harvester, Distributor, CreepKind, getBuildingPower, WorkerCreep,
    maxSpeed
} from "./blueprint";
import {Schedule} from "./schedule";
import {timeToRenew} from "./creep";
import * as Spawn from './spawn';
import * as towerStructure from './structure.tower';

if(!Memory.forageAlloc) {
    Memory.forageAlloc = {};
}
if(!Memory.forageSites) {
    Memory.forageSites = 4;
}
if(!Memory.jobs) {
    Memory.jobs = [];
}
if(!Memory.lastProgress) {
    Memory.lastProgress = 0;
}

if(!Memory.defenders) {
    Memory.defenders = {};
}

const creepTypes = {
    "upgrader": require('role.upgrader'),
    "upgraderDistributor": require('role.upgraderDistributor'),
    "builder":  require('role.builder'),
    "carrier":  require('role.carrier'),
    "distributor":  require('role.distributor'),
    "forager":  require('role.forager'),
    "reserver":  require('role.reserver'),
};

let spawn = require('structure.spawner');

export function ComputeTripTimes() {
    let count = 0;
    for(let flag in Game.flags) {
        if(flag.indexOf("Forage") == -1) {
            continue;
        }
        let path = PathFinder.search(Game.spawns["Spawn1"].pos, Game.flags[flag].pos);
        let rtCost = path.cost*2;
        console.log("Cost to go to", flag, ": ", rtCost);
        count += Math.ceil(rtCost/150);
        if(rtCost >= 150) {
            console.log("Need more than 1x 1500 carrier in rt")
        }
    }
    console.log("Need", count, "total carriers");
}

export function MoveCreeps(creepNames, destination) {
    let target;
    if(_.isString(destination)) {
        target = Game.flags[destination].pos;
    }
    else {
        target = destination;
    }
    let {x, y, roomName} = target;
    for(let name of creepNames) {
        Game.creeps[name].memory.task = {
            kind: "MoveTo",
            destination: [x, y, roomName]
        }
    }
}

export function Attack(creepNames, destination) {
    let target;
    if(_.isString(destination)) {
        if(!Game.flags[destination]) {
            target = {x: 15, y: 15, roomName: destination}
        }
        else {
            target = Game.flags[destination].pos;
        }
    }
    else {
        target = destination;
    }
    let {x, y, roomName} = target;
    for(let name of creepNames) {
        Game.creeps[name].memory.task = {
            kind: "AttackMove",
            destination: [x, y, roomName]
        }
    }
}

// Primary control rooms from which orders are being issued
const Rooms = [
    "W73N59",
    "W73N57",
    "W75N58",
    "W71N56"
];

// Each extension farmed by a main room
const Extensions = {
    "W73N59": ["W74N59", "W72N59", "W73N58"],
    "W73N57": ["W74N57", "W74N58", "W72N57"]
};

for(let r of Rooms) {
    if(!Memory.rooms[r] || !Memory.rooms[r].kind) {
        Memory.rooms[r] = {
            kind: "Owned",
            lastProgressDate: 0,
            lastProgress: 0,
            schedule: {nextId: 0, length: 1500, jobs: []},
            extensions: Extensions[r],
            ...(Memory.rooms[r] || {})
        };
    }
}

for(let owner in Extensions) {
    for(let e of Extensions[owner]) {
        if(!Memory.rooms[e]) {
            Memory.rooms[e] = {
                kind: "Extension"
            }
        }
    }
}

export class Brain {
    // A rather unreliable means of knowing how long this
    // brain instance has been running
    private startTick: number;
    constructor() {
        this.startTick = Game.time;
    }
    tick() {
        // Old-ish deprecated tick loop
        spawn.run(Game.spawns["Spawn1"], creepTypes);

        // Defender creation
        let defenders = Memory.defenders;
        for(let roomName in Extensions) {
            if(Game.time % 3 != 0) continue;
            let exts = Extensions[roomName];
            for(let extName of exts) {
                if(!Game.rooms[extName]) continue;
                let hostiles = Game.rooms[extName].find<Creep>(FIND_HOSTILE_CREEPS);
                let nCreeps = hostiles.length;
                for(let h of hostiles) {
                    if(h.body.length > 10) nCreeps++;
                }
                if(nCreeps || extName == "W72N57") {
                    if(!defenders[extName] || !Game.creeps[defenders[extName]] || !Game.creeps[defenders[extName]].body.find(b => b.type == ATTACK) || nCreeps > 1) {
                        console.log("Missing defender for", extName);
                        let spawn = extName == "W72N57" ? Game.spawns['Spawn2'] : Game.spawns["Spawn1"];
                        let name = spawn.createCreep(
                            [TOUGH, TOUGH, TOUGH,
                            MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK],
                            undefined,
                            {task: [{kind: "DefendRoom", destination: extName}]}
                        );
                        if(_.isString(name)) {
                            Memory.defenders[extName] = name;
                        }
                    }
                }
            }
        }
        // "Controlled room" stuff
        for(let controlledRoom of Rooms) {
            let room = Game.rooms[controlledRoom];
            if(!room) console.log("Room not found!", controlledRoom);
            this.reportRoomProgress(room);

            let missingCreeps = this.missingCreepsFor(room);
            for(let creep of missingCreeps) {
                let booked = false;
                for(let spawner of room.find<Spawn>(FIND_MY_SPAWNS)) {
                    if(booked) continue;
                    // Spawning/renewal queue
                    let schedule = new Schedule<SpawnJob>(spawner.memory.schedule);
                    if(schedule.hasJob(creep)) {
                        booked = true;
                        continue;
                    }
                    booked = !!schedule.schedule(Game.time+5, creep, creep.blueprint.length*3, true);
                }
            }
            for(let spawner of room.find<Spawn>(FIND_MY_SPAWNS)) {
                // Spawning/renewal queue
                this.respawnTick(spawner);
                Spawn.run(spawner);
            }
            let i = 0;
            for(let tower of room.find(FIND_MY_STRUCTURES, {filter: s => s.structureType == STRUCTURE_TOWER})) {
                towerStructure.run(tower, spawn, i++);
            }
        }

        // Task-running loop
        for(let creepName in Game.creeps) {
            let creep = Game.creeps[creepName];
            if(creep.spawning) continue;
            if(!creep.memory.noRenew && creep.memory.home && creep.memory.home != "W73N59") {
                let home = Game.rooms[creep.memory.home];
                if(!home) continue;
                let found = false;
                for(let spawner of home.find<Spawn>(FIND_MY_SPAWNS)) {
                    if(!spawner.memory.schedule) continue;
                    let schedule = new Schedule<SpawnJob>(spawner.memory.schedule);
                    for(let job of schedule.getJobs()) {
                        if(job.job.kind == "Renew" && job.job.id == creep.id) {
                            found = true;
                            creep.memory.renewingAt = spawner.id;
                        }
                    }
                }
                if(!found) {
                    for(let spawner of home.find<Spawn>(FIND_MY_SPAWNS)) {
                        if(!spawner.memory.schedule) continue;
                        let schedule = new Schedule<SpawnJob>(spawner.memory.schedule);
                        let job = schedule.schedule(Game.time+creep.ticksToLive-50, {
                                kind: "Renew",
                                id: creep.id
                            }, timeToRenew(creep));
                        if(job) {
                            console.log("Booked", creep.name, "with", spawner.name, "at", job.start);
                            creep.memory.renewingAt = spawner.id;
                        }
                    }
                }
            }
            if(creep.memory.role) continue;
            if(!creep.memory.manual && creep.memory.task && !creep.memory.task.length || !_.isArray(creep.memory.task)) {
                creep.memory.task = [this.assignNewTaskTo(creep)];
            }
            let task;
            let stepcount = 0;
            do {
                task = creep.memory.task.pop();
                if(!task) continue;
                creep.memory.task.push(task);
                let result = executeTask(creep, task);
                if(result == true) {
                    creep.memory.task.pop();
                    if(creep.memory.task.length) {
                        task = creep.memory.task[creep.memory.task.length-1];
                    }
                }
                else if(result == false) {
                    task = false;
                }
                else {
                    creep.memory.task.push(result);
                    task = result;
                }
                stepcount++;
            }
            while(task && stepcount < 5);
        }
    }
    missingCreepsFor(room: Room): CreateCreepJob[] {
        if(Game.cpu.getUsed() >= 30) return [];
        if(room.name == "W73N59") return [];
        let roomCreeps = _.filter(Game.creeps, c => c.memory.home == room.name);

        let buildingPower = room.energyCapacityAvailable;
        let missing: SpawnJob[] = [];
        let requiredHarvesters = room.memory.requiredHarvesters || 2;
        let currentHarvesters = _.filter(roomCreeps, c => CreepKind(c) == "harvester").length;
        if(currentHarvesters < requiredHarvesters) {
            missing.push({
                kind: "Create",
                blueprint: Harvester(buildingPower) as BODY_PART[]
            });
        }
        let c = _.filter(roomCreeps,
            c => c.memory.home == room.name
            && CreepKind(c) == "carrier"
            && c.body.length >= Distributor(buildingPower).length
        );
        let carriers = room.name == "W75N58" ? 2 - c.length : 4 - c.length;
        for(let i = 0; i<carriers;i++) {
            missing.push({
                kind: "Create",
                blueprint: Distributor(buildingPower) as BODY_PART[]
            });
        }
        let workers = 5 - _.filter(roomCreeps,
            c => c.memory.home == room.name
            && CreepKind(c) == "worker"
            && c.body.length >= WorkerCreep(buildingPower).length
        ).length;
        for(let i = 0; i<workers;i++) {
            missing.push({
                kind: "Create",
                blueprint: WorkerCreep(buildingPower)
            })
        }
        return missing;
    }
    assignNewTaskTo(creep: Creep): Task | false {
        if(!creep.memory.home) return false;
        if(creep.pos.roomName != creep.memory.home) {
            return {
                kind: "MoveToRoom",
                destination: creep.memory.home
            };
        }
        switch(CreepKind(creep)) {
            case "harvester":
                return {kind: "Harvest", target: ""};
            case "carrier":
                return {kind: "Distribute"};
            default:
                if(creep.body.find(p => p.type == WORK)) {
                    return {kind: "HelpConstruct"};
                }
        }
        return false;
    }
    reportRoomProgress(room: Room) {
        if(Game.time % 100 == 0) {
            let [lastProgress, p] = [room.memory.lastProgress, room.controller.progress];
            if(room.memory.lastProgress) {
                let [delta, remaining] = [p-lastProgress, room.controller.progressTotal-p];
                let deltaS = (Date.now() - room.memory.lastProgressDate) / 1000;
                console.log("Room, DeltaT, DeltaS remaining:", room.name, delta, deltaS, remaining);
                console.log("Estimated time remaining:", secondsToTimeString(remaining * (deltaS / delta)));
                console.log("CPU", Game.cpu.bucket);
            }
            room.memory.lastProgress = room.controller.progress;
            room.memory.lastProgressDate = Date.now();
        }
    }
    respawnTick(spawn: Spawn) {
        if(spawn.name in {"Spawn1": true, "Spawn3": true}) return;
        if(Game.time % 3 != 0) return;
        let schedule = new Schedule<SpawnJob>(spawn.memory.schedule);
        // Every once in a while, rejig things to make sure creeps can survive
        for(let job of schedule.getJobs()) {
            switch(job.job.kind) {
                case "Renew":
                    let creep = Game.getObjectById<Creep>(job.job.id);
                    if(!creep || !creep.body.length || !creep.ticksToLive) continue;
                    let tt = schedule.timeTo(Game.time, job);
                    if(creep.ticksToLive <= tt) {
                        console.log("Creep won't make it!", creep.name, creep.ticksToLive, tt);
                        let scheduled = schedule.rush(Game.time, creep.ticksToLive, job);
                        if(!scheduled) {
                            console.log("No space in schedule for renewal!");
                        }
                        console.log("Rescheduled to:", job.start, "current time", Game.time%1500);
                    }
                    let ttr = Math.ceil(timeToRenew(creep, creep.ticksToLive+1500));
                    if(job.length != ttr) {
                        console.log("Reset job length to", job.job.id, ttr);
                        job.length = ttr;
                    }
            }

        }
        // Schedule any creeps that are missing renewal appointments
        let nextJob = schedule.getJobAfter(Game.time);
        if(!nextJob) return;
        let task = nextJob.job;
        switch(task.kind) {
            case "Renew":
                let creep = Game.getObjectById<Creep>(task.id);
                if(!creep) return;
                if(!creep.memory.task || !_.isArray(creep.memory.task)) return;
                let timeTo = schedule.timeTo(Game.time, nextJob);
                if(creepIsDoing(creep, "Renew")) break;
                let path = PathFinder.search(creep.pos, spawn.pos);
                let travelTime = (path.cost+10)/maxSpeed(creep);
                if(path.incomplete || travelTime >= timeTo) {
                    console.log("Sending",creep.name,"to renewal because", timeTo, travelTime);
                    creep.memory.task.push({kind: "Renew",
                        from: nextJob.start,
                        to: nextJob.start + nextJob.length,
                        until: nextJob.start + nextJob.length
                    });
                    creep.memory.task.push({
                        kind: "MoveTo",
                        destination: [spawn.pos.x, spawn.pos.y, spawn.room.name],
                        dontRepair: true,
                        range: 1
                    })
                }
                break;
            case "Create":
                break;
        }
    }
}
