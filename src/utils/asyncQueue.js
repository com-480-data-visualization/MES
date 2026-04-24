export class AsyncQueue {
    constructor() {
        this.items = [];
        this.waitingConsumers = [];
        this.closed = false;
        this.error = null;
    }

    enqueue(item) {
        if (this.closed) {
            throw new Error("Cannot enqueue into a closed queue.");
        }

        const consumer = this.waitingConsumers.shift();
        if (consumer) {
            consumer.resolve({ value: item, done: false });
            return;
        }

        this.items.push(item);
    }

    close() {
        this.closed = true;
        this.flushWaitingConsumers();
    }

    fail(error) {
        this.closed = true;
        this.error = error;
        this.flushWaitingConsumers();
    }

    next() {
        if (this.items.length > 0) {
            return Promise.resolve({ value: this.items.shift(), done: false });
        }

        if (this.error) {
            return Promise.reject(this.error);
        }

        if (this.closed) {
            return Promise.resolve({ value: undefined, done: true });
        }

        return new Promise((resolve, reject) => {
            this.waitingConsumers.push({ resolve, reject });
        });
    }

    flushWaitingConsumers() {
        const waiting = this.waitingConsumers.splice(0);

        waiting.forEach(({ resolve, reject }) => {
            if (this.error) {
                reject(this.error);
                return;
            }

            resolve({ value: undefined, done: true });
        });
    }

    [Symbol.asyncIterator]() {
        return this;
    }
}
