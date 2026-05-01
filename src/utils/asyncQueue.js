export class AsyncQueue {
    constructor() {
        this.items = [];
        this.readIndex = 0;
        this.baseHour = 0
        this.lock = false
        this.runId = 0
    }

    startRun() {
        this.clear();
        this.runId++;
        return this.runId;
    }

    cancelRun() {
        this.clear();
        this.runId++;
    }

    isRunActive(runId) {
        return runId === this.runId;
    }

    clear() {
        this.items = [];
        this.readIndex = 0;
        this.baseHour = 0;
        this.lock = false;
    }

    push(item, runId = this.runId) {
        if (runId !== this.runId) return;
        this.items.push(item);
    }

    // returns all commits in same hour
    peek() {
        if (this.readIndex >= this.items.length) return [];


        const result = [];
        let i = this.readIndex;


        while (i < this.items.length && this.items[i].hours <= this.baseHour) {
            result.push(this.items[i]);
            i++;
        }

        return result;
    }

    // advance past entire hour group
    advance() {
        if (this.readIndex >= this.items.length) return;


        while (
            this.readIndex < this.items.length &&
            this.items[this.readIndex].hours === this.baseHour
            ) {
            this.readIndex++;
        }
        this.baseHour++;
    }
    peekAndAdvance() {
        if (this.lock) return;
        this.lock = true;
        const result = [];
        let i = this.readIndex;


        while (i < this.items.length && this.items[i].hours <= this.baseHour) {
            result.push(this.items[i]);
            i++;
        }
        this.readIndex = i
        this.baseHour++;
        this.lock = false

        return result;
    }

    size() {
        return this.items.length - this.readIndex;
    }
}
