export class AsyncQueue {
    constructor() {
        this.items = [];
        this.readIndex = 0;
    }

    // Producer: adds items
    push(item) {
        this.items.push(item);
    }

    // Consumer: reads next item without removing it
    peek() {
        return this.items[this.readIndex];
    }

    // Move forward manually when you're done processing
    advance() {
        if (this.readIndex < this.items.length) {
            this.readIndex++;
        }
    }

    // Optional: how many unread items exist
    size() {
        return this.items.length - this.readIndex;
    }
}
