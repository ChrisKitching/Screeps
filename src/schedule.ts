export class Schedule<T> {
    // Amount of ticks this schedule lasts
    private length = 1500;
    private nextId = 0;
    private jobs: ScheduledJob<T>[] = [];

    constructor(serialized: SerializedSchedule<T>) {
        if(!serialized) {
            return this;
        }
        this.nextId = serialized.nextId || 0;
        this.length = serialized.length || 1500;
        this.jobs = serialized.jobs || [];
    }
    getJobs() {
        return this.jobs;
    }
    timeTo(currentTime: number, job: ScheduledJob<T> | number) {
        let t = currentTime % this.length;
        if(_.isNumber(job)) {
            return t < job ? job - t : ((1500-t)+job)%1500;
        }
        else {
            if(t > job.start && t < job.start + job.length) return 0;
            return t < job.start ? job.start - t : ((1500-t)+job.start)%1500;
        }
    }
    private cleanup(time: number) {
        if(Game.time % 10 != 0) return;
        for(let job of this.jobs) {
            if(job.job.kind == "Renew" && job.job.id && !Game.getObjectById(job.job.id)) {
                console.log("Removing", job, "because no target");
                this.removeJob(job);
                continue;
            }
            if(job.executed && (job.start+job.length) < time) {
                this.removeJob(job);
            }
        }
    }
    getJobAt(time: number): ScheduledJob<T> | undefined {
        let t = time % this.length;
        this.cleanup(t);
        for(let job of this.jobs) {
            let end = (job.start + job.length) % this.length;
            if(job.start <= t && end > t) {
                return job;
            }
        }
        return undefined;
    }
    getJobAfter(time: number): ScheduledJob<T> | undefined {
        let t = time % this.length;
        for(let job of this.jobs) {
            if(job.start >= t) {
                return job;
            }
        }
        return this.jobs[0];
    }
    isEmpty() {
        return !!this.jobs.length;
    }
    hasJob(t: T) {
        for(let job of this.jobs) {
            if(_.isEqual(job.job, t)) {
                return true;
            }
        }
        return false;
    }
    removeJob(job: ScheduledJob<T>) {
        _.remove(this.jobs, j => _.isEqual(job, j));
    }
    remove(t: T) {
        _.remove(this.jobs, j => _.isEqual(j.job, t));
    }
    schedule(currentTime: number, job: T, jobLength: number, once=false): ScheduledJob<T> | false {
        let t = currentTime % this.length;
        this.cleanup(t);
        // No overlaps
        if(t + jobLength > 1500) {
            t = 0;
        }
        while(!this.isFree(t, (t+jobLength))) {
            once? t+=5 : t -= 5;
            if(t <= 0 || t>=this.length) {
                return false;
            }
        }
        let scheduled = {
            job,
            start: t,
            length: jobLength,
            once: once
        };
        this.jobs.push(scheduled);
        return scheduled;
    }
    rush(currentTime: number, maxDist: number, job: ScheduledJob<T>) {
        if(job.start >= 1500) job.start=1500-job.length;
        if(job.start <= 0) job.start=0;
        let jobStart = this.length-(job.length+1);
        while(!this.isFree(jobStart, jobStart+job.length) || this.timeTo(currentTime, jobStart) > maxDist) {
            jobStart -= 5;
            if(jobStart < 0 || jobStart+job.length >= 1500) {
                return false;
            }
        }
        job.start = jobStart;
        return true;
    }
    push(job: ScheduledJob<T>) {
        if(job.start >= 1500) job.start=1500-job.length;
        if(job.start <= 0) job.start=0;
        let jobStart = job.start+5;
        while(!this.isFree(jobStart, jobStart+job.length)) {
            jobStart += 5;
            if(jobStart <= 0 || jobStart+job.length >= 1500) {
                return false;
            }
        }
        job.start = jobStart;
        return true;
    }
    private isFree(start: number, end: number): boolean {
        if(end>=this.length) return false;
        if(start < 0) return false;
        for(let job of this.jobs) {
            if(job.executed) continue;
            let jobEnd = job.start + job.length;
            if(job.start <= start && jobEnd >= start // Stored job overlaps starting position
                || job.start <= end && jobEnd >= end // Stored job overlaps ending position
            ) {
                return false;
            }
        }
        return true;
    }
    serialize() {
        return {
            length: this.length,
            jobs: this.jobs.sort((j1, j2) => j1.start > j2.start ? 1 : -1)
        }
    }
}
