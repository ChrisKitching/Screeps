export let creepPriority = [
    "filler",

    // Special cases...
    "claimer",
    "utility",
    "guard",

    "remoteBuilder",

    "leanRemoteMover",
    "lightGuard",

    "miner",
    "heavyMiner",
    "remoteMover",
    "reserver",
    "updater",

    "soldier",
    "towerdrain",
    "raider"
];

export let shouldSpawn = {
    miner: function (state: CreepMemory) {
        let source = Game.getObjectById(state.toMine);
        if (source instanceof Mineral) {
            // Minerals spend _long_ periods in the "dead" state. Check for
            // that...
            return source.mineralAmount > 0;
        }

        return true;
    },

    heavyMiner: this.miner,

    reserver: function (state: CreepMemory) {
        let room = Game.rooms[state.target];

        // If we have no units in the room, assume it needs more reserving.
        if (!room) {
            return true;
        }

        if (!room.controller.reservation) {
            return true;
        }

        // If the room isn't ours, we want it.
        if (room.controller.reservation.username != "ckitching") {
            return true;
        }

        // Don't let the reservation counter get unreasonably high.
        return room.controller.reservation.ticksToEnd < 3500;
    }
};
