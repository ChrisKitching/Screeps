import * as defaults from "./defaults";
import {RoomConfiguration} from "./RoomConfiguration"
import {RelocateToRoom} from "../jobs/Jobs";

export let W72N54: RoomConfiguration = {
    creeps: {
        utility: [
            {
                orders: [
                    {
                        type: "RELOCATE_TO_ROOM",
                        targetRoom: "W72N55"
                    } as RelocateToRoom
                ]
            },
            {
                orders: [
                    {
                        type: "RELOCATE_TO_ROOM",
                        targetRoom: "W71N53"
                    } as RelocateToRoom
                ]
            },
            {
                orders: [
                    {
                        type: "RELOCATE_TO_ROOM",
                        targetRoom: "W71N53"
                    } as RelocateToRoom
                ]
            },
            {
                orders: []
            },
            {
                orders: [
                    {
                        type: "RELOCATE_TO_ROOM",
                        targetRoom: "W72N55"
                    } as RelocateToRoom
                ]
            },
            {
                orders: []
            },
            {
                orders: [
                    {
                        type: "RELOCATE_TO_ROOM",
                        targetRoom: "W71N53"
                    } as RelocateToRoom
                ]
            }
        ],
        filler: [
            {
                src: "5845e4d9c60e2bd479dcf776"
            }
        ],
        updater: [
            {
                src: "5845e4d9c60e2bd479dcf776"
            }
        ],
        remoteBuilder: [],
        miner: [
            { // Mines the eastern dot in origin room.
                targetRoom: "W72N54",
                toMine: "5836b6e88b8b9619519ef8bf"
            },
            { // Mines the western dot in origin room.
                targetRoom: "W72N54",
                toMine: "5836b6e88b8b9619519ef8be"
            },
            { // Mines the mineral in the origin room.
                targetRoom: "W72N54",
                toMine: "5836baa7090e0ab576fdd109"
            }
        ],
        heavyMiner: [
            { // Mines the southern dot in right room.
                targetRoom: "W71N54",
                toMine: "5836b6fd8b8b9619519efabe"
            },
            { // Mines the northern dot in right room.
                targetRoom: "W71N54",
                toMine: "5836b6fd8b8b9619519efabd"
            },
            { // Mines the top dot in the below room.
                targetRoom: "W72N53",
                toMine: "5836b6e88b8b9619519ef8c2"
            },
            { // Mines the bottom dot in the below room.
                targetRoom: "W72N53",
                toMine: "5836b6e88b8b9619519ef8c4"
            },
            { // Mines the right in the bottom-left room.
                targetRoom: "W73N53",
                toMine: "5836b6d18b8b9619519ef6b8"
            },
            { // Mines the left in the bottom-left room.
                targetRoom: "W73N53",
                toMine: "5836b6d18b8b9619519ef6b7"
            },
            { // Mines the left in the bottom-left room.
                targetRoom: "W73N54",
                toMine: "5836b6d18b8b9619519ef6b4"
            }
        ],
        lightGuard: [
            {
                orders: [
                    {
                        type: "RELOCATE_TO_ROOM",
                        target: "W71N54"
                    }
                ]
            },
            {
                orders: [
                    {
                        type: "RELOCATE_TO_ROOM",
                        target: "W72N53"
                    }
                ]
            },
            {
                orders: [
                    {
                        type: "RELOCATE_TO_ROOM",
                        target: "W73N53"
                    }
                ]
            },
            {
                orders: [
                    {
                        type: "RELOCATE_TO_ROOM",
                        target: "W73N54"
                    }
                ]
            },
        ],
        guard: [],
        soldier: [],
        raider: [],
        towerdrain: [],
        mover: [],
        remoteMover: [
            { // Moves from the dots in the right room.
                scoopFlags: ["W71N54Dot0", "W71N54Dot1"],
                dst: "5844e828cbcb45fe4fce33da"
            },
            { // Moves from the dots in the right room.
                scoopFlags: ["W71N54Dot0", "W71N54Dot1"],
                dst: "5844e828cbcb45fe4fce33da"
            },
            { // Moves from the dots in the below room.
                scoopFlags: ["W72N53Dot0", "W72N53Dot1"],
                dst: "5845e4d9c60e2bd479dcf776"
            },
            { // Moves from the dots in the south-west room.
                scoopFlags: ["W73N53Dot1", "W73N53Dot0"],
                dst: "5845e4d9c60e2bd479dcf776"
            },
            { // Moves from the dots in the south-west room.
                scoopFlags: ["W73N53Dot1", "W73N53Dot0"],
                dst: "5845e4d9c60e2bd479dcf776"
            },
            { // Moves from the dot in the left room.
                scoopFlags: ["W73N54Dot0"],
                dst: "5845e4d9c60e2bd479dcf776"
            },
            { // Moves from the dots in the below room.
                scoopFlags: ["W72N53Dot0", "W72N53Dot1"],
                dst: "5845e4d9c60e2bd479dcf776"
            },
            { // Moves from the dots in the south-west room.
                scoopFlags: ["W73N53Dot0", "W73N53Dot1"],
                dst: "5845e4d9c60e2bd479dcf776"
            },
        ],
        leanRemoteMover: [
            { // Moves from both dots in the origin room to storage.
                scoopFlags: ["W72N54Dot0", "W72N54Dot1", "W72N54Min"],
                dst: "5845e4d9c60e2bd479dcf776"
            },
            { // Moves from both dots in the origin room to storage.
                scoopFlags: ["W72N54Dot0", "W72N54Dot1"],
                dst: "5845e4d9c60e2bd479dcf776"
            }
        ],
        reserver: [
            {
                target: "W71N54"
            },
            {
                target: "W72N53"
            },
            {
                target: "W73N53"
            },
            {
                target: "W73N54"
            },
        ]
    },

    creepPriority: defaults.creepPriority,
    shouldSpawn: defaults.shouldSpawn
};
