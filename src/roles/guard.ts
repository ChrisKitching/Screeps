import {Role} from "./Role";
import "../Room"

export const REQUIRED_FIELDS = [];

/**
 * Very basic combat unit that sits in a room and hunts down anything that appears.
 */
export let Guard: Role = {
    name: "guard",

    synthesiseNewJobs(creep:Creep) {
        let target = creep.room.getAnEnemy();

        if (target == undefined) {
            creep.heal(creep);

            if (!creep.room.controller) {
                return;
            }

            creep.addJob({
                type: "MOVE_TO",
                target: creep.room.controller.id,
                closeness: 6,
                options: {ignoreDestructibleStructures: true}
            });

            return;
        }

        if (target instanceof Creep) {
            console.log(creep.name + " has acquired target: " + target.id + " belonging to " + target.owner.username);
        } else if (target instanceof Structure) {
            console.log(creep.name + " has acquired target: " + target.id + " of type " + target.structureType);
        }

        creep.say("KILL");
        creep.addJob({
            type: "ATTACK",
            target: target.id
        });
    },

    getBlueprint(budget: number) {
        return [
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
    }
};
