
interface RoomMemory {
    [role: string]: {
        [slot:string] : string;
    }
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

declare global {
    interface Room {
        memory: RoomMemory;

        gc(): void;

        spawnCreep(type: string, initialMemory: any): void;
        maybeSpawnShit(): void;
        getEffectiveLevel(): number;

        getInjuredFriendly(): Creep;
        getThingsToFill(): Structure[];
        getDamagedStructure(): Structure;
        getAnEnemy(): Creep | Structure;
        getEnemies(): Creep[];
        getShittiestWall(): StructureWall | StructureRampart;

        hasCreep(): boolean;
        hasTower(): boolean;
        hasFriendlySpawner(): boolean;

    }
}

declare let module: any;

