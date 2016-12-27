import {Miner} from "./roles/miner";
import {Reserver} from "./roles/reserver";
import {Utility} from "./roles/utility";
import {Updater} from "./roles/updater";
import {Mover} from "./roles/mover";
import {Guard} from "./roles/guard";
import {Claimer} from "./roles/claimer";
import {Raider} from "./roles/raider";
import {Filler} from "./roles/filler";
import {TowerDrain} from "./roles/towerdrain";
import {Builder} from "./roles/builder";
import {HeavyMiner} from "./roles/heavyMiner";
import {RemoteMover} from "./roles/remoteMover";

if (!Memory.creepNum) {
    Memory.creepNum = 0;
}



export let CREEP_DEFINITIONS = {
    utility: {
        "6": [
            WORK, CARRY, MOVE,
            WORK, CARRY, MOVE,
            WORK, CARRY, MOVE,
            WORK, CARRY, MOVE,
            WORK, CARRY, MOVE,
            WORK, CARRY, MOVE,
            WORK, CARRY, MOVE,
            WORK, CARRY, MOVE,
            WORK, CARRY, MOVE,
            WORK, WORK, MOVE,
            WORK, WORK, MOVE
        ]
    },
    raider: {
        "6": [
            TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
            TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
            TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
            TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
            TOUGH,
            ATTACK, ATTACK,
            ATTACK, MOVE,
            MOVE, MOVE, MOVE, MOVE, MOVE,
            MOVE, MOVE, MOVE, MOVE, MOVE,
            MOVE, MOVE, MOVE, MOVE, MOVE,
            MOVE, MOVE, MOVE, MOVE, MOVE,
            MOVE, MOVE, MOVE, MOVE, MOVE,
        ]
    },
    updater: {
        "6": [ // 2250
            WORK, WORK, MOVE,
            WORK, WORK, MOVE,
            WORK, WORK, MOVE,
            WORK, WORK, MOVE,
            WORK, WORK, MOVE,
            WORK, WORK, MOVE,
            WORK, WORK, MOVE,
            WORK, CARRY, MOVE,
            CARRY, CARRY, MOVE,
            CARRY, CARRY, MOVE
        ],
        "7": [ // 4500
            WORK, WORK, MOVE,
            WORK, WORK, MOVE,
            WORK, WORK, MOVE,
            WORK, WORK, MOVE,
            WORK, WORK, MOVE,
            WORK, WORK, MOVE,
            WORK, WORK, MOVE,
            WORK, WORK, MOVE,
            CARRY, CARRY, MOVE,
            CARRY, CARRY, MOVE,
            CARRY, CARRY, MOVE,
            CARRY, MOVE,
            WORK, WORK, MOVE,
            WORK, WORK, MOVE,
            WORK, WORK, MOVE,
            WORK, WORK, MOVE,
            WORK, WORK, MOVE,
        ]
    },
    builder: {
        "4": [
            WORK, WORK, MOVE,
            CARRY, CARRY, MOVE,
            CARRY, CARRY, MOVE,
            CARRY, CARRY, MOVE,
            CARRY, CARRY, MOVE,
            CARRY, CARRY, MOVE,
            CARRY, CARRY, MOVE,
            CARRY, CARRY, MOVE
        ],
        "6": [
            WORK, WORK, MOVE,
            WORK, WORK, MOVE,
            WORK, WORK, MOVE,
            CARRY, CARRY, MOVE,
            CARRY, CARRY, MOVE,
            CARRY, CARRY, MOVE,
            CARRY, CARRY, MOVE,
            CARRY, CARRY, MOVE,
            CARRY, CARRY, MOVE,
            CARRY, CARRY, MOVE,
            CARRY, CARRY, MOVE,
            CARRY, CARRY, MOVE,
            CARRY, CARRY, MOVE
        ]
    },
    lightGuard: {
        "3": [
            TOUGH,
            TOUGH,
            TOUGH,
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            ATTACK,
            ATTACK,
            ATTACK,
            ATTACK
        ]
    },
    guard: {
        "6": [
            TOUGH,
            TOUGH,
            TOUGH,
            TOUGH,
            TOUGH,
            TOUGH,
            TOUGH,
            TOUGH,
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            ATTACK,
            ATTACK,
            ATTACK,
            ATTACK,
            ATTACK,
            ATTACK,
            ATTACK,
            ATTACK,
            ATTACK,
            ATTACK,
            ATTACK,
            HEAL
        ]
    },
    soldier: {
        "6": [
            ATTACK, MOVE,
            ATTACK, MOVE,
            ATTACK, MOVE,
            ATTACK, MOVE
        ]
    }
};

export let roles = {
    "utility": Utility,
    "reserver": Reserver,
    "miner": Miner,
    "heavyMiner": HeavyMiner,
    "updater": Updater,
    "mover": Mover,
    "remoteMover": RemoteMover,
    "remoteBuilder": Builder,
    "towerdrain": TowerDrain,
    "guard": Guard,
    "filler": Filler,
    "raider": Raider,
    "claimer": Claimer,
    "lightGuard": Guard
};
