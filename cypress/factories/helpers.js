class PrimaryKeyGenerator {
    * nextIdGen() {
        let id = 0;

        while (true) {
            yield id += 1;

            if (id > 100000) { id = 0; }
        }
    }

    get next() {
        return this.idGenerator.next().value;
    }

    reset() {
        this.idGenerator = this.nextIdGen();
    }

    constructor() {
        this.reset();
    }
}

class Factory { 
    static get idGenerator() {
        return this._idGenerator = this._idGenerator || new PrimaryKeyGenerator();
    }

    static reset() {
        this.idGenerator.reset();
    }
    
    constructor() {
        this.id = this.constructor.idGenerator.next;
    }
}

module.exports.Factory = Factory;