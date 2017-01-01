import {Miner} from "./miner";
import {Reserver} from "./reserver";
import {Utility} from "./utility";
import {Updater} from "./updater";
import {Mover} from "./mover";
import {Guard} from "./guard";
import {Claimer} from "./claimer";
import {Raider} from "./raider";
import {Filler} from "./filler";
import {TowerDrain} from "./towerdrain";
import {Builder} from "./builder";
import {HeavyMiner} from "./heavyMiner";
import {RemoteMover} from "./remoteMover";
import {Role} from "./Role";

// All valid role names.
export type RoleName =
    // Tower roles...
    "defensive" |
    "general" |

    // Creep roles...
    "miner" |
    "reserver" |
    "utility" |
    "updater" |
    "guard" |
    "claimer" |
    "raider" |
    "filler" |
    "towerdrain" |
    "builder" |
    "heavyMiner" |
    "remoteMover" |
    "mover" |
    "remoteBuilder";

export let roles: {[name: string] : Role} = {
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

export function get(name: string): Role {
    return roles[name];
}
