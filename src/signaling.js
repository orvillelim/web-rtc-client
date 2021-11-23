
import EventEmmiter from 'events'

export default class Signaling extends EventEmmiter {

    constructor() {
        super()

        this.socket = new WebSocket('ws://localhost:8080');

        this.socket.onopen = (e) => {
            console.log('connected')
        }
     
        this.socket.onerror = (e) => {
            console.log('close', e)
        }

        this.socket.onmessage = (message) => {
            message = JSON.parse(message.data)

            switch (message.type) {

                case 'join':
                    this.join(message)
                    break
                case 'offer':
                    this.offer(message)
                    break
                case 'candidate':
                    this.candidate(message)
                    break
                case 'answer':
                    this.answer(message)
                    break
            }
        }
    }

    join (message) {
        this.emit('join', message)
    }

    offer (message) {
        this.emit('offer', message)
    }


    candidate (message) {
        this.emit('candidate', message)
    }

    answer (message) {
        this.emit('answer', message)
    }

    send(data) {
        this.socket.send(JSON.stringify(data))
    }
}