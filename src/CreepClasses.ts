var roleUtility = require('role.utility');
var roleSoldier = require('role.soldier');
var roleGuard = require('role.guard');
var roleMiner = require('role.miner');
var roleMover = require('role.mover');
var roleBase = require('role.base');
var roleUpdater = require('role.updater');
var roleFiller = require('role.filler');
var roleRaider = require('role.raider');
var roleClaimer = require('role.claimer');
var roleReserver = require('role.reserver');
var roleTowerdrain = require('role.towerdrain');
var roleRemoteMover = require('role.remoteMover');
var roleRemoteBuilder = require('role.remoteBuilder');

if (!Memory.creepNum) {
  Memory.creepNum = 0;
}

let MAX_ENERGY = {
  "1": 300,
  "2": 550,
  "3": 800,
  "4": 1300,
  "5": 1800,
  "6": 2300,
  "7": 5600,
  "8": 12900
};


module.exports = {
  CREEP_DEFINITIONS: {
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
    filler: {
      "4": [ //
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, MOVE
      ],
      "5": [ //
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
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
      ],
      "6": [ //
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
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
      ],
      "7": [ //
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, MOVE
      ]
    },
    updater: {
      "6":[ // 2250
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
      "7":[ // 4500
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
    miner: {
      "3": [
        WORK, WORK, MOVE,
        WORK, WORK, MOVE,
        WORK, MOVE
      ]
    },
    heavyMiner: {
      "3": [
        WORK, WORK, MOVE,
        WORK, WORK, MOVE,
        WORK, WORK, MOVE,
        CARRY
      ]
    },
    towerdrain: {
      "6": [
        TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
        TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
        TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
        TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
        TOUGH, TOUGH, TOUGH,
        ATTACK,
        MOVE,
        MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE, MOVE, MOVE, MOVE,
      ],

      "7": [
        TOUGH, TOUGH, TOUGH, TOUGH,
        TOUGH, TOUGH, TOUGH, TOUGH,
        TOUGH, TOUGH,
        HEAL, HEAL, HEAL, HEAL,
        HEAL, HEAL, HEAL, HEAL,
        HEAL, HEAL, HEAL, HEAL,
        HEAL, HEAL, HEAL, HEAL,
        HEAL, HEAL, HEAL,
        MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE, MOVE
      ]
    },
    remoteMover: {
      "4": [
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, WORK, MOVE, MOVE
      ],

      "5": [
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        WORK, MOVE
      ],
      "6": [
        WORK, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
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
    leanRemoteMover: {
      "4": [ //
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, MOVE
      ],
      "5": [ //
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
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
      ],
      "6": [ //
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
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
      ],
      "6": [
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
        CARRY, CARRY, MOVE,
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
    remoteBuilder: {
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
    reserver: {
      "3": [
        CLAIM, MOVE
      ],
      "4": [
        CLAIM, CLAIM, MOVE, MOVE
      ],
      "6": [
        CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE
      ]
    },
    claimer: {
      "3": [
        CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE
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
  },

  roles: {
    "utility": roleUtility,
    "soldier": roleSoldier,
    "base": roleBase,
    "reserver": roleReserver,
    "miner": roleMiner,
    "heavyMiner": roleMiner,
    "mover": roleMover,
    "updater": roleUpdater,
    "remoteMover": roleRemoteMover,
    "leanRemoteMover": roleRemoteMover,
    "remoteBuilder": roleRemoteBuilder,
    "builder": roleRemoteBuilder,
    "towerdrain": roleTowerdrain,
    "guard": roleGuard,
    "filler": roleFiller,
    "raider": roleRaider,
    "claimer": roleClaimer,
    "lightGuard": roleGuard
  },

  /**
   * Get the blueprint that should be used to spawn a unit of a certain type
   * at a certain level.
   */
  getBlueprint: function(unit, level) {
    let blueprints = this.CREEP_DEFINITIONS[unit];

    // Get the highest one not larger than `level`.
    for (let i = level; i > 0; i--) {
      if (blueprints.hasOwnProperty(i.toString())) {
        return blueprints[i.toString()];
      }
    }
  },

  /**
   * Calculate the cost of building a given blueprint.
   */
  blueprintCost: function(bp) {
    let accumulator = 0;
    for (let i in bp) {
      if (!bp.hasOwnProperty(i)) {
        continue;
      }

      let part = bp[i];
      switch (part) {
        case MOVE:
        case CARRY:
          accumulator += 50;
          break;
        case WORK:
          accumulator += 100;
          break;
        case ATTACK:
          accumulator += 80;
          break;
        case RANGED_ATTACK:
          accumulator += 150;
          break;
        case HEAL:
          accumulator += 250;
          break;
        case CLAIM:
          accumulator += 600;
          break;
        case TOUGH:
          accumulator += 10;
          break;
        default:
          console.log("YOU CAN'T WRITE SOFTWARE");
          break;
      }
    }

    return accumulator;
  },

  unitCost: function(type, level) {
    return this.blueprintCost(this.getBlueprint(type, level));
  }
};
