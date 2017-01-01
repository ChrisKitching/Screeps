import {Job, JobCompletionStatus} from "./Jobs";
import {DoMoveTo} from "./DoMoveTo";
import {DoUpgradeController} from "./DoUpgradeController";
import {DoWithdraw} from "./DoWithdraw";
import {DoFill} from "./DoFill";
import {DoHarvest} from "./DoHarvest";
import {DoReserve} from "./DoReserve";
import {DoClaim} from "./DoClaim";
import {DoRecycle} from "./DoRecycle";
import {DoMoveDirection} from "./DoMoveDirection";
import {DoRenew} from "./DoRenew";
import {DoBuild} from "./DoBuild";
import {DoHeal} from "./DoHeal";
import {DoAttack} from "./DoAttack";
import {DoRepair} from "./DoRepair";
import {DoDismantle} from "./DoDismantle";
import {DoRelocateToRoom} from "./DoRelocateToRoom";

export interface JobDoer<T extends Job> {
    /**
     * Begin executing the new job, returning true if the job is already finished.
     */
    start?: (job: T, subject: Creep) => JobCompletionStatus;

    /**
     * Continue executing the job, returning true if the job becomes finished.
     */
    tick: (job: T, subject: Creep) => JobCompletionStatus;
}

export let JOB_ACTUATORS: {[jobType: string]: JobDoer<Job>} = {
    "MOVE_TO": DoMoveTo,
    "FILL": DoFill,
    "WITHDRAW": DoWithdraw,
    "ATTACK": DoAttack,
    "REPAIR": DoRepair,
    "BUILD": DoBuild,
    "DISMANTLE": DoDismantle,
    "UPGRADE_CONTROLLER": DoUpgradeController,
    "HARVEST": DoHarvest,
    "RENEW": DoRenew,
    "HEAL": DoHeal,
    "RECYCLE": DoRecycle,
    "MOVE_DIRECTION": DoMoveDirection,
    "RELOCATE_TO_ROOM": DoRelocateToRoom,
    "RESERVE": DoReserve,
    "CLAIM": DoClaim
};
