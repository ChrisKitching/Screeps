import {creepsTargeting} from "./logistics";
import {hasTower} from "./role.carrier";

export interface MoveTo {
    kind: "MoveTo";
    destination: [number, number, string];
    popWhenInRoom?: boolean;
    dontRepair?: true,
    popIfEmpty?: true,
    heal?: true,
    rangedAttack?: true,
    popAt?: number,
    range: number;
    moveOpts?: MoveToOpts;
}

export interface MoveToRoom {
    kind: "MoveToRoom";
    destination: string;
}

export interface DrainTowers {
    kind: "DrainTowers";
    healRoom: string;
    drainRoom: string;
}

export interface Build {
    kind: "Build";
    target: string;
}

export interface Repair {
    kind: "Repair";
    target: string;
}

export interface AttackMove {
    kind: "AttackMove";
    destination: [number, number, string];
    flee?: true;
}

export interface AttackCreep {
    kind: "AttackCreep";
    target: string;
}

export interface MoveEnergy {
    kind: "MoveEnergy";
    source: [number, number, string];
    destination: [number, number, string];
    continously: boolean;
    requireFull: boolean;
}

export interface Pickup {
    kind: "Pickup";
    target: string;
}

export interface WithdrawFrom {
    kind: "WithdrawFrom";
    source: [number, number, string];
}

export interface DepositTo {
    kind: "DepositTo";
    destination: [number, number, string];
    resourceType?: string;
    noFallback?: true;
}

export interface DefendRoom {
    kind: "DefendRoom";
    destination: string;
}

export interface ReserveRoom {
    kind: "ReserveRoom";
    destination: string;
}

export interface ClaimRoom {
    kind: "ClaimRoom";
    destination: string;
}

export interface Dismantle {
    kind: "Dismantle";
    target: string;
}

export interface UpgradeController {
    kind: "UpgradeController";
}

export interface Distribute {
    kind: "Distribute";
    popWhenEmpty?: true;
}

export interface Renew {
    kind: "Renew";
    target: string;
    until: number;
}

export interface Recycle {
    kind: "Recycle";
}

export interface Harvest {
    kind: "Harvest";
    target: string;
    popWhenFull?: true;
}

export interface Forage {
    kind: "Forage";
    target: string | string[];
    targetPos: {x: number, y: number};
    targetRoom: string;
    resourceType: string;
    deposit?: [number, number, string];
}

export interface HealTank {
    kind: "HealTank";
}

export type HelpConstruct = {kind: "HelpConstruct"};

export type Task = (
    MoveTo
    | AttackCreep
    | AttackMove
    | Build
    | ClaimRoom
    | DefendRoom
    | DepositTo
    | Dismantle
    | Distribute
    | DrainTowers
    | Harvest
    | Forage
    | HelpConstruct
    | HealTank
    | MoveEnergy
    | MoveToRoom
    | Pickup
    | Recycle
    | Renew
    | Repair
    | ReserveRoom
    | UpgradeController
    | WithdrawFrom
    ) & {duration?: number};

export function MoveTo(creep: Creep, task: MoveTo) {
    if(!task.destination) return true;
    if(Game.time >= task.popAt) return true;
    if(task.popIfEmpty && creep.carry.energy == 0) {
        return true;
    }
    if(task.heal) {
        if(creep.hits < creep.hitsMax) creep.heal(creep);
        else {
            let friends = creep.pos.findInRange<Creep>(FIND_MY_CREEPS, 3);
            friends.sort(f => f.hitsMax - f.hits);
            if(friends.length) {
                creep.heal(friends.pop()!);
            }
        }
    }
    if(task.rangedAttack) {
        creep.rangedMassAttack();
    }
    if (!task.dontRepair && creep.getActiveBodyparts(WORK) > 0 && creep.carry.energy > 0 && !hasTower(creep.room)) {
        let stuff = creep.pos.findClosestByRange<StructureRoad>(FIND_STRUCTURES, {
            filter: s => s.structureType == STRUCTURE_ROAD
                && creep.pos.getRangeTo(s.pos) < 3
            || s.structureType == STRUCTURE_CONTAINER
            && (s.hitsMax - s.hits) >= 100
        });
        let csite = creep.pos.findClosestByRange<ConstructionSite>(FIND_CONSTRUCTION_SITES, {filter: s => s.structureType == STRUCTURE_ROAD});
        if(csite) creep.build(csite);
        else if(stuff) creep.repair(stuff);
    }
    let [x, y, room] = task.destination;
    let dest = new RoomPosition(x, y, room);
    if(task.popWhenInRoom && creep.room.name == room) {
        return true;
    }
    let [cx, cy] = [creep.pos.x, creep.pos.y];
    if(creep.pos.inRangeTo(dest, task.range || 1)) {
        creep.moveTo(dest, task.moveOpts);
        return true;
    }
    let ff = creep.room.memory.flowFields;
    if(ff) {
        let field = ff[`(${x},${y})`];
        if(field && field[cx] && field[cy]) {
            let dir = field[cx][cy];
            creep.say("BOO:"+dir);
            return false;
        }
    }
    creep.moveTo(dest, task.moveOpts);
    return false;
}

export function MoveToRoom(creep: Creep, task): Task | boolean {
    if(creep.room.name == task.destination) {
        creep.move(creep.pos.getDirectionTo(creep.room.controller || new RoomPosition(25, 25, creep.room.name)));
        return true;
    }
    let room = Game.rooms[task.destination];
    let pos = new RoomPosition(35, 37, task.destination);
    if(room && room.controller) {
        pos = room.controller.pos;
    }
    return {
        kind: "MoveTo",
        destination: [pos.x, pos.y, pos.roomName],
        popWhenInRoom: true,
        range: 3
    }
}

export function Build(creep: Creep, task: Build): Task | boolean {
    if(creep.carry.energy) {
        let target = Game.getObjectById<ConstructionSite>(task.target);
        if(!target) return true;
        let result = creep.build(target);
        if(result == ERR_NOT_IN_RANGE) {
            return {
                kind: "MoveTo",
                destination: [target.pos.x, target.pos.y, target.room.name],
                popIfEmpty: true,
                range: 3
            }
        }
    }
    else {
        return true;
    }
    return false;
}

export function Repair(creep: Creep, task: Repair): Task | boolean {
    if(creep.carry.energy) {
        let target = Game.getObjectById<Structure>(task.target);
        if(!target) return true;
        let result = creep.repair(target);
        if(result == ERR_NOT_IN_RANGE) {
            return {
                kind: "MoveTo",
                destination: [target.pos.x, target.pos.y, target.room.name],
                popIfEmpty: true,
                range: 3
            }
        }
        if(result == OK) {
            return true;
        }
    }
    return true;
}

export function AttackCreep(creep: Creep, task: AttackCreep) {
    let target = Game.getObjectById<Creep>(task.target);
    if(!target) return true;
    let result = creep.attack(target);
    if(result == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, {ignoreDestructibleStructures: true});
    }
    return false;
}

export function AttackMove(creep: Creep, task) {
    if(creep.hits < creep.hitsMax && task.flee) {
        creep.moveTo(new RoomPosition(47, 21, "W73N57"));
        return false;
    }
    let [x, y, room] = task.destination;
    let dest = new RoomPosition(x, y, room);
    try {
        let destStruc = dest.findInRange(FIND_HOSTILE_STRUCTURES, 1);
        console.log(creep.name, "is attacking", destStruc);
        if(!destStruc.length) {
            destStruc = dest.lookFor(LOOK_CREEPS);
            if(destStruc[0].my) {
                destStruc = undefined;
            }
        }
        console.log(creep.name, "is attacking", destStruc[0]);
        let target = destStruc[0];
        let result = creep.attack(target);
        switch(result) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(dest, {ignoreCreeps: true, ignoreDestructibleStructures: true});
                return false;
            default:
                return false;
        }
    }
    catch(e) {
        return MoveTo(creep, task);
    }
}

export function Pickup(creep: Creep, task: Pickup): Task | boolean {
    if(creep.carry.energy >= creep.carryCapacity) return true;
    let target = Game.getObjectById<Resource>(task.target);
    if(!target) return true;
    let result = creep.pickup(target);
    if(result == ERR_NOT_IN_RANGE) {
        return {
            kind: "MoveTo",
            destination: [target.pos.x, target.pos.y, target.pos.roomName],
            range: 1
        }
    }
    return false;
}

export function WithdrawFrom(creep: Creep, task: WithdrawFrom): Task | boolean {
    let [x, y, room] = task.source;
    let sourcePos = new RoomPosition(x, y, room);
    try {
        let containers = sourcePos.lookFor<Structure>(LOOK_STRUCTURES);
        containers = containers.filter(s => s.structureType == STRUCTURE_CONTAINER
        || s.structureType == STRUCTURE_STORAGE);
        if(!containers.length) {
            console.log("No valid source at", x, y, room);
            return true;
        }
        let source = containers[0];
        let result = creep.withdraw(source, RESOURCE_ENERGY);
        if(result == ERR_NOT_IN_RANGE) {
            return {
                kind: "MoveTo",
                destination: [x, y, room],
                range: 1
            }
        }
        return true;
    }
    catch(e) {
        return {kind: "MoveToRoom", destination: task.source[2]}
    }
}

export function DepositTo(creep: Creep, task: DepositTo): Task | boolean {
    if(creep.carry.energy == 0) return true;
    let [x, y, room] = task.destination;
    if(!x || !y || ! room) return true;
    let pos = new RoomPosition(x, y, room);
    let containers = _.filter(pos.lookFor<Structure>(LOOK_STRUCTURES),
        s => s.structureType == STRUCTURE_CONTAINER
        || s.structureType == STRUCTURE_STORAGE
        || s.structureType == STRUCTURE_EXTENSION
        || s.structureType == STRUCTURE_TOWER
        || s.structureType == STRUCTURE_SPAWN
    );
    let target = containers[0];
    if(!creep.pos.inRangeTo(pos, 1)) {
        return {
            kind: "MoveTo",
            destination: [x, y, room],
            range: 1,
            popIfEmpty: true
        }
    }
    if(!containers.length) {
        creep.drop(task.resourceType || RESOURCE_ENERGY);
    }
    else {
        let result = creep.transfer(target, task.resourceType || RESOURCE_ENERGY);
        if(result == ERR_FULL && !task.noFallback) {
            let storage: RoomPosition = creep.room.storage;
            if(!storage) return true;
            storage = storage.pos;
            return {
                kind: "DepositTo",
                destination: [storage.x, storage.y, storage.roomName]
            }
        }
    }
    return true;
}

/** Continous tasks **/

export function MoveEnergy(creep: Creep, task: MoveEnergy): Task | boolean {
    if(creep.carry.energy == 0 || (task.requireFull && creep.carry.energy < creep.carryCapacity)) {
        return {
            kind: "WithdrawFrom",
            source: task.source
        }
    }
    else {
        return {
            kind: "DepositTo",
            destination: task.destination
        }
    }
}

export function DrainTowers(creep: Creep, task: DrainTowers): Task | boolean {
    if(creep.hits < creep.hitsMax) {
        return {
            kind: "MoveToRoom",
            destination: task.healRoom
        }
    }
    return {
        kind: "MoveToRoom",
        destination: task.drainRoom
    }
}

export function DefendRoom(creep: Creep, task: DefendRoom): Task | boolean {
    if(creep.pos.roomName != task.destination) {
        return {
            kind: "MoveToRoom",
            destination: task.destination
        }
    }
    let closestHostile: Creep | Structure = creep.pos.findClosestByPath<Creep>(FIND_HOSTILE_CREEPS);
    if(!closestHostile) {
        closestHostile = creep.pos.findClosestByPath<Structure>(FIND_HOSTILE_STRUCTURES, {
            filter: s => s.structureType != STRUCTURE_STORAGE
        });
    }
    if(!closestHostile) return true;
    return {
        kind: "AttackCreep",
        target: closestHostile.id
    }
}

export function ReserveRoom(creep: Creep, task: ReserveRoom): Task | boolean {
    if(creep.room.name != task.destination) {
        return {
            kind: "MoveToRoom",
            destination: task.destination
        }
    }
    let ctrl = creep.room.controller;
    if(!ctrl) return true;
    let result = creep.reserveController(ctrl);
    if(result == ERR_NOT_IN_RANGE) {
        return {
            kind: "MoveTo",
            destination: [ctrl.pos.x, ctrl.pos.y, ctrl.pos.roomName],
            range: 1
        }
    }
    return false;
}

export function ClaimRoom(creep: Creep, task: ClaimRoom): Task | boolean {
    if(creep.room.name != task.destination) {
        return {
            kind: "MoveToRoom",
            destination: task.destination
        }
    }
    let ctrl = creep.room.controller;
    if(!ctrl) return true;
    let result = creep.claimController(ctrl);
    if(result == ERR_NOT_IN_RANGE) {
        return {
            kind: "MoveTo",
            destination: [ctrl.pos.x, ctrl.pos.y, ctrl.pos.roomName],
            range: 1
        }
    }
    else {
        console.log("claimController result", result);
    }
    return false;
}

export function Dismantle(creep: Creep, task: Dismantle): Task | boolean {
    let target = Game.getObjectById<Structure>(task.target);
    if(!target) return true;
    let result = creep.dismantle(target);
    if(result == ERR_NOT_IN_RANGE) {
        return {
            kind: "MoveTo",
            destination: [target.pos.x, target.pos.y, target.pos.roomName],
            range: 1
        }
    }
    return false;
}

export function UpgradeController(creep: Creep, task: UpgradeController): Task | boolean {
    if(!creep.carry.energy) return true;
    let target = creep.room.controller;
    if(!target) return true;
    let result = creep.upgradeController(target);
    if(result == ERR_NOT_IN_RANGE) {
        return {
            kind: "MoveTo",
            destination: [target.pos.x, target.pos.y, target.pos.roomName],
            popIfEmpty: true,
            range: 3
        }
    }
    return false;
}

export function Renew(creep: Creep, task: Renew): Task | boolean {
    let target = Game.getObjectById(creep.memory.renewingAt);
    if(!target) return true;
    if(creep.carry.energy) creep.transfer(target, RESOURCE_ENERGY);
    if(Game.time % 1500 >= task.until && creep.ticksToLive >= 150) {
        return true;
    }
    for(let c of creep.room.find<Creep>(FIND_MY_CREEPS)) {
        if(c.name != creep.name && c.ticksToLive < 10) {
            return false;
        }
    }
    if(target.renewCreep(creep) == ERR_NOT_IN_RANGE) {
        return {
            kind: "MoveTo",
            destination: [target.pos.x, target.pos.y, target.pos.roomName],
            range: 1
        }
    }
    return false;
}

export function Recycle(creep: Creep, task: Recycle): Task | boolean {
    let target = Game.spawns["Spawn2"];
    if(creep.carry.energy) creep.transfer(target, RESOURCE_ENERGY);
    if(target.recycleCreep(creep) == ERR_NOT_IN_RANGE) {
        return {
            kind: "MoveTo",
            destination: [target.pos.x, target.pos.y, target.pos.roomName],
            range: 1
        }
    }
    return true;
}

export function Harvest(creep: Creep, task: Harvest): Task | boolean {
    if(task.popWhenFull && _.sum(creep.carry) >= creep.carryCapacity && creep.carryCapacity != 0) {
        return true;
    }
    let target = Game.getObjectById<Source>(task.target);
    if(!target) {
        target = creep.pos.findClosestByPath<Source>(FIND_SOURCES,
            {
                filter: s => !creepsTargeting(s.id)
            });
        if(!target || !target.id) return true;
        return {
            kind: "Harvest",
            target: target.id,
            popWhenFull: task.popWhenFull
        }
    }
    if(!target) return true;
    let result = creep.harvest(target);
    if(result == ERR_NOT_IN_RANGE) {
        let pos: [number, number, string] = [target.pos.x, target.pos.y, target.pos.roomName];
        let conts = target.pos.findInRange<Container>(FIND_STRUCTURES, 1,
            {filter: s => s.structureType == STRUCTURE_CONTAINER});
        if(conts.length) {
            let contPos = conts.pop()!.pos;
            pos = [contPos.x, contPos.y, contPos.roomName];
        }
        return {
            kind: "MoveTo",
            destination: pos,
            range: conts.length? 0 : 1
        }
    }
    else if(result == ERR_NOT_ENOUGH_RESOURCES && task.popWhenFull) {
        return true;
    }
    return false;
}

export function Forage(creep: Creep, task: Forage): Task | boolean {
    if(_.sum(creep.carry) >= creep.carryCapacity) {
        let deposit = task.deposit;
        if(!deposit) return true;
        return {
            kind: "DepositTo",
            destination: deposit,
            resourceType: task.resourceType || RESOURCE_ENERGY
        }
    }
    else {
        let target: Source | null = null;
        if(_.isString(task.target)) {
            target = Game.getObjectById<Source>(task.target);
        }
        else if(_.isArray(task.target)) {
            let candidates = task.target.map(Game.getObjectById) as Source[];
            target = creep.pos.findClosestByPath<Source>(candidates.filter(v => v != null && v.energy));
        }
        if(!task.targetPos) return true;
        if(!target) target = {
            pos: {x: task.targetPos.x, y: task.targetPos.y, roomName: task.targetRoom}
        };
        let result = creep.harvest(target);
        if(result != OK) {
            return {
                kind: "MoveTo",
                destination: [target.pos.x, target.pos.y, target.pos.roomName],
                range: 1
            }
        }
        return false;
    }
}

export function HelpConstruct(creep: Creep, task: HelpConstruct): Task | boolean {
    if(creep.carry.energy > 0) {
        if(creep.room.energyAvailable < creep.room.energyCapacityAvailable
            && (!creep.room.storage || creep.room.storage.store.energy < 5000)) {
            return {
                kind: "Distribute",
                popWhenEmpty: true
            }
        }
        let csites = creep.pos.findClosestByPath<ConstructionSite>(FIND_MY_CONSTRUCTION_SITES);
        if(!csites || creep.carry.energy && creep.room.controller && creep.room.controller.ticksToDowngrade < 4000) {
            return {kind: "UpgradeController"};
        }
        return {
            kind: "Build",
            target: csites.id
        }
    }
    else {
        let container = creep.pos.findClosestByPath<StructureContainer>(FIND_STRUCTURES,
            {
                filter: s => s.structureType == STRUCTURE_CONTAINER
                && s.store.energy >= creep.carryCapacity
            });
        if(!container) container = creep.room.storage;
        if(!container && creep.body.find(b => b.type == WORK)) {
            return {
                kind: "Harvest",
                popWhenFull: true,
                target: ""
            }
        }
        if(creep.room.energyAvailable < creep.room.energyCapacityAvailable
            && (!creep.room.storage || creep.room.storage.store.energy < 5000)) {
            return false;
        }
        if(container) {
            return {
                kind: "WithdrawFrom",
                source: [container.pos.x, container.pos.y, container.pos.roomName]
            }
        }
    }
}

export function Distribute(creep: Creep, task: Distribute): Task | boolean {
    if(creep.carry.energy > 0) {
        let candidates = creep.room.find<Structure>(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION
                    || structure.structureType == STRUCTURE_SPAWN
                    || structure.structureType == STRUCTURE_TOWER) &&
                    (structure.energy < structure.energyCapacity);
            }
        });
        candidates.sort((a: Structure, b: Structure) => {
            if(creepsTargeting(a) < creepsTargeting(b)) return 1;
            if(a.structureType == STRUCTURE_TOWER) return -1;
            return creep.pos.getRangeTo(a) < creep.pos.getRangeTo(b) ? 1 : -1
        });
        let target = candidates.pop();
        while(creepsTargeting(target, false, c => c.carry.energy > 0) > 0) {
            target = candidates.pop();
        }
        if(!target) {
            target = creep.room.storage;
        }
        if(!target) {
            target = creep.pos.findClosestByPath<Container>(FIND_STRUCTURES,
                {filter: s => s.structureType == STRUCTURE_CONTAINER});
        }
        if(!target) return true;
        return {
            kind: "DepositTo",
            destination: [target.pos.x, target.pos.y, target.room.name],
            noFallback: true
        }
    }
    else if (task.popWhenEmpty) {
        return true;
    }
    else {
        let dropped = creep.pos.findClosestByPath<Resource>(FIND_DROPPED_ENERGY,
            {
                filter: r => creepsTargeting(r.id) < 2 && r.resourceType == RESOURCE_ENERGY
            }
        );
        if(dropped) {
            return {
                kind: "Pickup",
                target: dropped.id
            }
        }
        else {
            let container = creep.pos.findClosestByPath<StructureContainer>(FIND_STRUCTURES,
                {
                    filter: s => s.structureType == STRUCTURE_CONTAINER
                    && s.store.energy >= creep.carryCapacity
                    && s.pos.x != 31 && s.pos.y != 41
                });
            if(!container) container = creep.room.storage;
            if(!container) return true;
            return {
                kind: "WithdrawFrom",
                source: [container.pos.x, container.pos.y, container.pos.roomName]
            }
        }
    }
}

export function HealTank(creep: Creep, task: Task): Task | boolean {
    creep.heal(creep);
    if(creep.body.find(b => b.type == WORK)) {
        let structs = creep.pos.findInRange<Structure>(FIND_STRUCTURES, 1);
        if(structs.length) {
            creep.dismantle(structs[0]);
        }
    }
    if(creep.body.find(b => b.type == RANGED_ATTACK)) {
        creep.rangedMassAttack();
    }
    if(creep.hits < creep.hitsMax) {
        creep.heal(creep);
        if(creep.hits < 3000) {
            creep.memory.retreat = true;
        }
    }
    else {
        let friend = creep.pos.findInRange<Creep>(FIND_MY_CREEPS, 3, {
            filter: c=>c.hits < c.hitsMax
        });
        if(friend.length) {
            creep.moveTo(friend[0]);
            creep.heal(friend[0]);
        }
        creep.memory.retreat = false;
    }
    delete creep.memory._move;
    if(creep.memory.retreat) {
        let dest = Game.flags['Fallback'].pos;
        return {
            kind: "MoveTo",
            destination: [dest.x, dest.y, dest.roomName],
            range: 1,
            rangedAttack: true,
            popAt: Game.time + 2,
            heal: true
        }
    }
    else {
        let dest = Game.flags['Tank'].pos;
        return {
            kind: "MoveTo",
            destination: [dest.x, dest.y, dest.roomName],
            range: 1,
            heal: true,
            popAt: Game.time + 2,
            rangedAttack: true,
        }
    }
}

export function executeTask(creep: Creep, task: Task): Task | boolean {
    switch(task.kind) {
        case "AttackCreep": return AttackCreep(creep, task);
        case "AttackMove": return AttackMove(creep, task);
        case "Build": return Build(creep, task);
        case "ClaimRoom": return ClaimRoom(creep, task);
        case "DefendRoom": return DefendRoom(creep, task);
        case "DepositTo": return DepositTo(creep, task);
        case "Dismantle": return Dismantle(creep, task);
        case "Distribute": return Distribute(creep, task);
        case "DrainTowers": return DrainTowers(creep, task);
        case "Harvest": return Harvest(creep, task);
        case "Forage": return Forage(creep, task);
        case "HelpConstruct": return HelpConstruct(creep, task);
        case "HealTank": return HealTank(creep, task);
        case "MoveEnergy": return MoveEnergy(creep, task);
        case "MoveTo": return MoveTo(creep, task);
        case "MoveToRoom": return MoveToRoom(creep, task);
        case "Pickup": return Pickup(creep, task);
        case "Recycle": return Recycle(creep, task);
        case "Renew": return Renew(creep, task);
        case "Repair": return Repair(creep, task);
        case "ReserveRoom": return ReserveRoom(creep, task);
        case "UpgradeController": return UpgradeController(creep, task);
        case "WithdrawFrom": return WithdrawFrom(creep, task);
    }
}

export function creepIsDoing(creep: Creep, task: Task["kind"]) {
    if(!creep.memory.task) return false;
    for(let t of creep.memory.task) {
        if(!t) continue;
        if(t.kind == task) {
            return true;
        }
    }
    return false;
}
