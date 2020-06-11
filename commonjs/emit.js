const EventEmitter = require('events').EventEmitter;

class GeekTime extends EventEmitter {
    constructor() {
        super()
        setInterval(() => {
            this.emit('NEW_LESSON', { price: Math.random() * 100 })
        }, 3000)
    }
}

const geekTime = new GeekTime;


geekTime.addListener('NEW_LESSON', () => {
    console.log('yeah!')
})