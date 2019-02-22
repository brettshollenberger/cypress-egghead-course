import { Factory } from './helpers';

class TodoFactory extends Factory {
    build() {
        return {
            id: this.id,
            text: `Hello World ${this.id}`,
            completed: false
        }
    }
}

module.exports = TodoFactory;