import {Schedule} from "./schedule";
export function run(room: Room) {
    // noop
}

class CachedRoom {
    controller: Controller|any;
    energyAvailable: number;
    energyCapacityAvailable: number;
    memory: RoomMemory;
    mode: string;
    storage: StructureStorage|any;
    survivalInfo: SurvivalGameInfo|any;
    terminal: Terminal|any;
    name: string;

    constructor(name: string) {
        this.name = name;
        this.memory = Memory.rooms[name];
    }

    getSchedule() {
        return new Schedule(this.memory.schedule);
    }

    toString() {
        return `[cached room ${this.name}]`;
    }
}

declare global {
    interface Room {
        getSchedule(): Schedule<RoomJob>;
    }
    namespace Room {
        let getRoom: (name: String) => Room | CachedRoom | undefined;
    }
}

Room.getRoom = function(name: string): Room | CachedRoom | undefined {
    let r: Room | CachedRoom | undefined;
    r = Game.rooms[name];
    if(!r && name in Memory.rooms) {
        r = new CachedRoom(name);
    }
    return r;
};

Room.prototype.getSchedule = function(this: Room) {
    return new Schedule(this.memory.schedule);
};
