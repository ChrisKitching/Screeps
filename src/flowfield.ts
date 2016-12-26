const profiler = require('./profiler');

enum Direction {
    TOP = 1,
    TOP_RIGHT = 2,
    RIGHT = 3,
    BOTTOM_RIGHT = 4,
    BOTTOM = 5,
    BOTTOM_LEFT = 6,
    LEFT = 7,
    TOP_LEFT = 8,
}

export type CostField = number[][];
export type IntegrationField = number[][];
export type FlowField = Direction[][];

type ObjectType = {
    type: "terrain",
    terrain: "swamp" | "plain" | "wall"
} |
{
    type: "structure",
    structure: Structure
};

function setCells(field: number[][], value: number) {
    for(let i = 0; i<50;i++) {
        field[i] = [];
        for(let j = 0; j<50; j++) {
            field[i][j] = value;
        }
    }
}

export function CalculateCostField(room: Room): number[][] {
    let pre = Game.cpu.getUsed();
    function getCost(obj: ObjectType) {
        switch(obj.type) {
            case "terrain":
                switch(obj.terrain) {
                    case "swamp":
                        return 5;
                    case "plain":
                        return 2;
                    case "wall":
                        return 255;
                    default:
                        console.log("Unknown terrain type:", obj.terrain);
                        return 255;
                }
            case "structure":
                let s = obj.structure;
                if(!s) return 0;
                switch (s.structureType) {
                    case STRUCTURE_ROAD:
                        return -1;
                    case STRUCTURE_EXTENSION:
                    case STRUCTURE_SPAWN:
                    case STRUCTURE_WALL:
                        return 255;
                }
                console.log("Unknown structure", s);
                return 255;
        }
        return 2;
    }
    let roomObjects = room.lookAtArea(0,0,49,49, true) as LookAtResultWithPos[];
    let costField: number[][] = [];
    setCells(costField, 0);
    for(let obj of roomObjects) {
        costField[obj.x][obj.y] += getCost(obj as any);
    }
    console.log("Cost-matrix computation cost", Game.cpu.getUsed()-pre);
    room.memory.costField = costField;
    delete room.memory.costFieldInvalid;
    return costField;
}

export function neighbours(cell: [number, number]): [number, number][] {
    let [x,y] = cell;
    let neighbours: [number, number][] = [];
    for(let i = -1;i<2;i++) {
        for(let j = -1;j<2;j++) {
            if(i == 0 && j == 0) continue;
            let [dx, dy] = [x+i, y+j];
            if(0 < dx && dx < 50 && 0 < dy && dy < 50) neighbours.push([dx, dy]);
        }
    }
    return neighbours;
}

export function CalculateIntegrationField(room: Room, goals: [number, number][]): number[][] {
    if(!room.memory.costField || room.memory.costFieldInvalid) {
        CalculateCostField(room);
    }
    let pre = Game.cpu.getUsed();
    let costField = room.memory.costField;

    let integrationField: number[][] = [];
    let openList: [number, number][] = [];
    setCells(integrationField, 65535);
    if(!goals) return false;
    for(let [i,j] of goals) {
        openList.push([i,j]);
        integrationField[i][j] = 0;
    }
    let currentNode: [number, number] | undefined = undefined;
    do {
        currentNode = openList.pop();
        if(!currentNode) continue;
        let currentCost = integrationField[currentNode[0]][currentNode[1]];
        for(let [i,j] of neighbours(currentNode!)) {
            let oldCost = integrationField[i][j];
            let newCost = costField[i][j] + currentCost;
            if(newCost < oldCost && newCost < 255) {
                integrationField[i][j] = newCost;
                openList.push([i,j]);
            }
        }
    }
    while(currentNode);
    console.log("Integration-matrix computation cost", Game.cpu.getUsed()-pre);
    return integrationField;
}

export function CalculateFlowField(room: Room, goalName: string, goals: [number, number][]) {
    let pre = Game.cpu.getUsed();
    let integrationField = CalculateIntegrationField(room, goals);
    let flowField: number[][] = [];
    setCells(flowField, 0);
    for(let x = 0; x<50; x++) {
        for(let y = 0; y<50; y++) {
            if(integrationField[x][y] == 0) {
                flowField[x][y] = 0;
                continue;
            }
            let min = 65535;
            let bestNeighbour: [number, number] | undefined = undefined;
            for(let [i,j] of neighbours([x,y])) {
                let cost = integrationField[i][j];
                if(cost < min) {
                    min = cost;
                    bestNeighbour = [i,j];
                }
            }
            if(!bestNeighbour) continue;
            let [i,j] = bestNeighbour;
            let dir = room.getPositionAt(x,y)!.getDirectionTo(room.getPositionAt(i,j)!);//direction([x,y], [i,j]);
            flowField[x][y] = dir;
        }
    }
    if(!room.memory.flowFields) room.memory.flowFields = {};
    room.memory.flowFields[goalName] = flowField;
    console.log("Flowfield compute cost:", Game.cpu.getUsed()-pre);
    return flowField;
}

export function DrawCostField(room: Room, start: number, stop: number, integrationField?: [number, number]) {
    function getColorFor(cost) {
        if(cost == 2) return COLOR_WHITE;
        if(cost == 5) return COLOR_BROWN;
        if(cost > 200) return COLOR_RED;
        return COLOR_GREEN;
    }
    let costField = integrationField ? CalculateIntegrationField(room, [integrationField]) : CalculateCostField(room);
    for(let i = start; i<stop;i++) {
        for(let j = 0; j<50;j++) {
            if(!costField[i] || !costField[i][j]) continue;
            let color = getColorFor(costField[i][j]);
            if(integrationField) {
                room.createFlag(i,j, "_"+i.toString()+costField[i][j]+j.toString()+"_", color);
            }
            else {
                room.createFlag(i,j, "_"+i+j+"_", color);
            }
        }
    }
}

export function RemoveCostFlags(room: Room) {
    for(let i = 0; i<50;i++) {
        for(let j = 0; j<50;j++) {
            let flag = room.lookForAt<Flag>(LOOK_FLAGS, new RoomPosition(i, j, room.name));
            for(let f of flag) {
                if(f.name.indexOf("_") != -1) f.remove();
            }
        }
    }
}

export function Serialize(field: number[][]): string {
    let result = "";
    let pre = Game.cpu.getUsed();
    for(let i = 0; i<50; i++) {
        for(let j = 0; j<50; j++) {
            result += String.fromCharCode(field[i][j]);
        }
    }
    console.log("Serialize cost", Game.cpu.getUsed()-pre);
    return result;
}

export function Deserialize(field: string): number[][] | undefined {
    if(!field || !_.isString(field)) return undefined;
    let result: number[][] = [];
    let pre = Game.cpu.getUsed();
    setCells(result, 0);
    for(let i=0; i<50; i++) {
        for(let j=0; j<50; j++) {
            result[i][j] = field.charCodeAt(i*j);
        }
    }
    console.log("Deserialize cost", Game.cpu.getUsed()-pre);
    return result;
}

