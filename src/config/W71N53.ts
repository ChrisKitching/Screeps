import * as defaults from "defaults";

export let initialState = {
    filler: [
        {
            src: "585a7f74fc256fec432a7e95"
        }
    ],
    updater: [],
    remoteBuilder: [],
    miner: [
        { // Mines the eastern dot in origin room.
            targetRoom: "W71N53",
            toMine: "5836b6fd8b8b9619519efac3"
        },
        { // Mines the eastern dot in origin room.
            targetRoom: "W71N53",
            toMine: "5836b6fd8b8b9619519efac1"
        }
    ],
    heavyMiner: [
        { // Mines the north dot in the south room.
            targetRoom: "W71N52",
            toMine: "5836b6fd8b8b9619519efac5"
        },
        { // Mines the other dot in the south room.
            targetRoom: "W71N52",
            toMine: "5836b6fd8b8b9619519efac6"
        },
        { // Mines the dot in the south west room.
            targetRoom: "W72N52",
            toMine: "5836b6e88b8b9619519ef8c7"
        }
    ],
    lightGuard: [
        {
            orders: [
                {
                    type: "RELOCATE_TO_ROOM",
                    target: "W71N52"
                }
            ]
        },
        {
            orders: [
                {
                    type: "RELOCATE_TO_ROOM",
                    target: "W72N52"
                }
            ]
        }
    ],
    guard: [],
    soldier: [],
    raider: [],
    towerdrain: [],
    mover: [],
    remoteMover: [
        { // Moves from both dots in the south room to storage.
            scoopFlags: ["W71N52Dot0", "W71N52Dot1"],
            dst: "585a7f74fc256fec432a7e95"
        },
        { // Moves from both dots in the south room to storage.
            scoopFlags: ["W71N52Dot1", "W71N52Dot0"],
            dst: "585a7f74fc256fec432a7e95"
        },
        { // Moves from both dots in the south west room to storage.
            scoopFlags: ["W72N52Dot0"],
            dst: "585a7f74fc256fec432a7e95"
        },
        { // Moves from both dots in the south room to storage.
            scoopFlags: ["W71N52Dot0", "W71N52Dot1"],
            dst: "585a7f74fc256fec432a7e95"
        },
        { // Moves from both dots in the south room to storage.
            scoopFlags: ["W71N52Dot1", "W71N52Dot0"],
            dst: "585a7f74fc256fec432a7e95"
        }
    ],
    leanRemoteMover: [
        { // Moves from both dots in the origin room to storage.
            scoopFlags: ["W71N53Dot0", "W71N53Dot1"],
            dst: "585a7f74fc256fec432a7e95"
        },
        { // Moves from both dots in the origin room to storage.
            scoopFlags: ["W71N53Dot0", "W71N53Dot1"],
            dst: "585a7f74fc256fec432a7e95"
        },
    ],
    reserver: [
        {
            target: "W71N52"
        },
        {
            target: "W72N52"
        }
    ]
};

export let creepPriority = defaults.creepPriority;
export let shouldSpawn = defaults.shouldSpawn;
