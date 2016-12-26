type BODY_PART = "move" | "work" | "carry" | "attack" | "ranged_attack" | "heal" | "claim" | "tough";


declare function require(path: string): any;

type SerializedJob = string;

type CreateCreepJob = {
    kind: "Create";
    blueprint: BODY_PART[];
    name?: string;
    memory?: any;
}

type SpawnJob = {
    kind: "Renew";
    id: string;
} | CreateCreepJob;

interface RoomJob {

}

interface SpawnMemory {
    queue: SpawnJob[];
}

interface ScheduledJob<T> {
    job: T;
    start: number;
    length: number;
    once: boolean;
    executed?: boolean;
}

interface SerializedSchedule<T> {
    nextId: number;
    length: number;
    jobs: ScheduledJob<T>[];
}

type RoomMemory = {
    kind: "Owned";
    lastProgressDate: number;
    lastProgress: number;
    schedule: SerializedSchedule<RoomJob>;
    extensions: string[];
} | {
    kind: "Extension";
}

interface Memory {
    forageAlloc: {[forageSite: string]: string};
    forageSites: number;
    jobs: SerializedJob[];
    lastProgress: number;
    spawns: {[spawnName: string]: SpawnMemory};
    defenders: {[roomName: string]: string};
    rooms: {[roomName: string]: RoomMemory};
}

declare let module: any;
