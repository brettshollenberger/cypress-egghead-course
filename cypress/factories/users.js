import { Factory } from './helpers';

class UserGenerator extends Factory {
    build() {
        return {
            id: this.id,
            email: `test-email-${this.id}@gmail.com`
        }
    }
}

module.exports = UserGenerator;