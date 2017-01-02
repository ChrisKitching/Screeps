interface TowerMemory {
    // The ID of the thing we are currently murdering.
    currentTarget: string;

    // How long we have been trying to murder this thing for.
    murderTime: number;
}

StructureTower.prototype.tick = function(this: StructureTower) {
    let room = this.room;

    // TODO: This is dumb as shit.

    // Find stuff to kill.
    let targets = room.getEnemies();
    if (targets.length > 0) {
        this.attack(targets[0]);
        return;
    }

    // Find stuff to heal.
    let toHeal = room.getInjuredFriendly();
    if (toHeal != undefined) {
        this.heal(toHeal);
        return;
    }

    // Find stuff to repair.
    let toRepair = room.getDamagedStructure();
    if (toRepair != undefined) {
        this.repair(toRepair);
        return;
    }
};
