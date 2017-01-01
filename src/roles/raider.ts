import {Role} from "./Role";

export const REQUIRED_FIELDS = [
    "targetRoom",  // The room to get shot at in.
    "homeRoom"     // The room to heal in.
];

export let Raider: Role = {
    name: "raider",

    tick(creep: Creep) {
        // If damaged, FLEE.
        if (creep.hits <= 2700 && creep.room.name != creep.memory.homeRoom) {
            if (creep.memory.currentJob && creep.memory.currentJob.type != "RELOCATE_TO_ROOM") {
                creep.stop();
            }

            creep.memory.orders = [
                {
                    type: "RELOCATE_TO_ROOM",
                    target: creep.memory.homeRoom
                }
            ];
        }

        return false;
    },

    synthesiseNewJobs(creep: Creep) {
        // If at home and healed, go back into the battle.
        if (creep.hits == creep.hitsMax && creep.room.name == creep.memory.homeRoom) {
            creep.memory.orders = [
                {
                    type: "RELOCATE_TO_ROOM",
                    target: creep.memory.targetRoom
                }
            ];

            return;
        }

        // If in the battle, find another target.
        if (creep.room.name == creep.memory.targetRoom) {
            let target = creep.pos.findClosestByPath(creep.room.getEnemies());

            if (target != undefined) {
                creep.say("KILL");

                creep.memory.orders = [
                    {
                        type: "ATTACK",
                        target: target.id
                    }
                ]
            }
        }
    },

    getBlueprint(budget: number) {
        return [
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
        ];
    }
};
