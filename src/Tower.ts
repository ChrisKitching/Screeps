export function runDefensive(room: Room, tower) {
    // Find stuff to kill.
    let target = room.getAnEnemy();
    if (target != undefined) {
        tower.attack(target);
        return;
    }

    // Find stuff to heal.
    let toHeal = room.getInjuredFriendly();
    if (toHeal != undefined) {
        tower.heal(toHeal);
        return;
    }
}

export function run(room, tower) {
    // Find stuff to kill.
    let target = room.getAnEnemy();
    if (target != undefined) {
        tower.attack(target);
        return;
    }

    // Find stuff to heal.
    let toHeal = room.getInjuredFriendly();
    if (toHeal != undefined) {
        tower.heal(toHeal);
        return;
    }

    // Find stuff to repair.
    let toRepair = room.getDamagedStructure();
    if (toRepair != undefined) {
        tower.repair(toRepair);
        return;
    }
}

