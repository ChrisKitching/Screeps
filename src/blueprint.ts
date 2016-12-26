const costs: {[bodyPart: string]: number} = {
    "move": 50,
    "work": 100,
    "carry": 50,
    "attack": 80,
    "ranged_attack": 150,
    "heal": 250,
    "claim": 600,
    "tough": 10
};
function repeat(buildingPower: number, parts: BODY_PART[]) {
    let repCost = getCost(parts);
    let repCount = Math.min(
        Math.floor(buildingPower / repCost), // Max reps we can build
        Math.floor(50 / parts.length) // 50 part count limit :(
    );
    let r: BODY_PART[] = [];
    for(let i = 0; i<repCount;i++) {
        r = r.concat(parts);
    }
    return r;
}

export function CreepKind(creep: Creep): "harvester" | "carrier" | "worker" | "upgrader" {
    if(creep.memory.kind) return creep.memory.kind;
    let workCount = _.filter(creep.body, t => t.type == WORK).length;
    let carryCount = _.filter(creep.body, t => t.type == CARRY).length;
    if(workCount > 7 && carryCount == 1) {
        return "upgrader";
    }
    if(workCount >= 2 && carryCount == 0) {
        return "harvester";
    }
    else if(carryCount > 0 && workCount == 0) {
        return "carrier";
    }
    return "worker";
}

export function Harvester(buildingPower: number): string[] {
    if(buildingPower >= 700) return [WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, WORK, MOVE];
    else return repeat(buildingPower,[WORK, WORK, MOVE]);
}

export function Distributor(buildingPower: number) {
    return repeat(buildingPower, [CARRY, CARRY, MOVE]);
}

export function WorkerCreep(buildingPower: number) {
    return repeat(buildingPower, [WORK, CARRY, MOVE]);
}

export function Reserver(buildingPower: number) {
    if(buildingPower>=2600) {
        return [CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE]
    }
    else {
        return [CLAIM, CLAIM, MOVE, MOVE];
    }
}

export function HealTanker(buildingPower: number) {
    let toughPart = repeat(140, [TOUGH]);
    let remaining = buildingPower - 140;
    let moveParts = repeat(50*18, [MOVE]);
    let healParts = repeat(250*18, [HEAL]);
    return [...toughPart, ...moveParts, ...healParts];
}

export function Archer(buildingPower: number) {
    let weapons = repeat(150*10, [RANGED_ATTACK]);
    let moveParts = repeat(50*12, [MOVE]);
    let healParts = repeat(250*10, [HEAL]);
    return [TOUGH, TOUGH, ...weapons, ...moveParts, ...healParts];
}

export function getCost(blueprint: BODY_PART[]) {
    return _.sum(_.map(blueprint, (b) => costs[b]));
}

export function maxSpeed(creep: Creep) {
    let movePartCount = _.filter(creep.body, b => b.type=="move").length;
    return movePartCount / (creep.body.length-movePartCount);
}

export function fitness(spec: BODY_PART[], creep: Creep) {
    let value = 0;
    for(let specPart of spec) {
        let found = false;
        for(let bodyPart of creep.body) {
            if(bodyPart.type == specPart) {
                value++;
                found = true;
            }
        }
        if(!found) value -= 100;
    }
    return value;
}

export function getBuildingPower(room: Room, available = false) {
    if(!room) {
        room = Game.rooms['W73N59'];
    }
    let sum = 0;
    for(let ext of room.find<StructureSpawn | StructureExtension>(FIND_STRUCTURES, {
        filter: s => s.structureType == STRUCTURE_EXTENSION && s.isActive()
        || s.structureType == STRUCTURE_SPAWN
    })) {
        available ? sum += ext.energy : sum += ext.energyCapacity;
    }
    return sum;
}
