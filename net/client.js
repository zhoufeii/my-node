const LESSON_IDS = [
    "136797",
    "136798",
    "136799",
    "136800",
    "136801",
    "136803",
    "136804",
    "136806",
    "136807",
    "136808",
    "136809",
    "141994",
    "143517",
    "143557",
    "143564",
    "143644",
    "146470",
    "146569",
    "146582"
]

/**
 * TODO:  这里是客户端单工通信
 */

// const net = require('net');
// const socket = new net.Socket({})

// socket.connect({
//     host: '127.0.0.1',
//     port: 4000
// })

// socket.write('hello world!')

/**
 * TODO:  这里是客户端半双工通信
 */

const net = require('net');
const socket = new net.Socket({})

socket.connect({
    host: '127.0.0.1',
    port: 4000
})

/**
 * TODO:  此处是客户端第一次向服务端发送请求，传输的数据格式为 buffer ，传输的渠道为 socket
 */

// function encode(index) {
//     buffer = Buffer.alloc(4);
//     buffer.writeInt32BE(
//         LESSON_IDS[index]
//     )
//     return buffer;
// }

// let buffer = Buffer.alloc(4);
// let index = Math.floor(Math.random() * LESSON_IDS.length);

// socket.on('data',()=>{}) 用于监听 socket 通道的数据变化，当服务端返回数据时，便会触发这个回调函数
// 通过在监听的回调函数内部发送buffer，实现了客户端接收到服务端数据返回后，立即向服务端重新发送请求的目的，实现了半双工通信

// socket.on('data', buffer => {
//     console.log(buffer.toString())
//     index = Math.floor(Math.random() * LESSON_IDS.length);
//     socket.write(encode(index))
// })


/**
 * TODO:  改进为全双工通信
 */

function encode(index) {
    buffer = Buffer.alloc(6);   // 增加buffer的长度 4 => 6
    buffer.writeInt16BE(seq++);     // 在buffer前两位写入 seq
    buffer.writeInt32BE(LESSON_IDS[index], 2)   // 从第2位开始，在buffer中写入课程Id (从第0位开始)
    return buffer;
}

let seq = 0;    // 设置一个自增的序号

let buffer = null;
let index = Math.floor(Math.random() * LESSON_IDS.length);

socket.write(encode(index))

socket.on('data', buffer => {
    const seqBuffer = buffer.slice(0, 2);
    const titleBuffer = buffer.slice(2);
    console.log(seqBuffer.readInt16BE(), titleBuffer.toString())
})

setInterval(() => {
    console.log(seq, LESSON_IDS[index])
    index = Math.floor(Math.random() * LESSON_IDS.length);
    socket.write(encode(index))
}, 500);

