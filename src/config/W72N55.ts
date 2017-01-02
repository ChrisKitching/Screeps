import * as defaults from "./defaults";
import {RoomConfiguration} from "./RoomConfiguration"

export let W72N55: RoomConfiguration = {
    creeps: {
        filler: [
            {
                src: "5858850bbf610905418244e3"
            }
        ],
        updater: [
        ],
        remoteBuilder: [
        ],
        lightGuard: [
            {
                orders: [
                    {
                        type: "RELOCATE_TO_ROOM",
                        target: "W71N55"
                    }
                ]
            },
        ],
        miner: [
            { // Mines the eastern dot in origin room.
                targetRoom: "W72N55",
                toMine: "5836b6e78b8b9619519ef8ba"
            },
            { // Mines the eastern dot in origin room.
                targetRoom: "W72N55",
                toMine: "5836b6e78b8b9619519ef8bb"
            },
            { // Mines the mineral in the origin room.
                targetRoom: "W72N55",
                toMine: "5836baa7090e0ab576fdd108"
            }
        ],
        heavyMiner: [
            { // Mines the north dot in the right room
                targetRoom: "W71N55",
                toMine: "5836b6fd8b8b9619519efab9"
            },
            { // Mines the south dot in right room.
                targetRoom: "W71N55",
                toMine: "5836b6fd8b8b9619519efabb"
            }
        ],
        guard: [
        ],
        soldier: [
        ],
        raider: [
        ],
        towerdrain: [
        ],
        mover: [
        ],
        remoteMover: [
            { // Moves from the north dot in the east room
                scoopFlags: ["W71N55Dot0", "W71N55Dot1"],
                dst: "5858850bbf610905418244e3"
            },
            { // Moves from the south dot in the east room
                scoopFlags: ["W71N55Dot1", "W71N55Dot0"],
                dst: "5858850bbf610905418244e3"
            },
            { // Moves from the south dot in the east room
                scoopFlags: ["W71N55Dot1", "W71N55Dot0"],
                dst: "5858850bbf610905418244e3"
            }
        ],
        leanRemoteMover: [
            { // Moves from both dots in the origin room to storage.
                scoopFlags: ["W72N55Dot0", "W72N55Dot1", "W72N55Min"],
                dst: "5858850bbf610905418244e3"
            },
        ],
        reserver: [
            {
                target: "W71N55"
            }
        ]
    },

    creepPriority: defaults.creepPriority
};

