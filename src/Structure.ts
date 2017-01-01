/**
 * Type predicate for conversion to EnergyFillableStructure.
 */
export function isEnergyfillable(s: Structure): s is EnergyFillableStructure {
    return s.structureType == STRUCTURE_SPAWN ||
           s.structureType == STRUCTURE_EXTENSION ||
           s.structureType == STRUCTURE_LAB ||
           s.structureType == STRUCTURE_TOWER ||
           s.structureType == STRUCTURE_NUKER ||
           s.structureType == STRUCTURE_POWER_SPAWN;
}
