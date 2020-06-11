const net = require('net');

const LESSON_DATA = {
    136797: "01 | 课程介绍",
    136798: "02 | 内容综述",
    136799: "03 | Node.js是什么？",
    136800: "04 | Node.js可以用来做什么？",
    136801: "05 | 课程实战项目介绍",
    136803: "06 | 什么是技术预研？",
    136804: "07 | Node.js开发环境安装",
    136806: "08 | 第一个Node.js程序：石头剪刀布游戏",
    136807: "09 | 模块：CommonJS规范",
    136808: "10 | 模块：使用模块规范改造石头剪刀布游戏",
    136809: "11 | 模块：npm",
    141994: "12 | 模块：Node.js内置模块",
    143517: "13 | 异步：非阻塞I/O",
    143557: "14 | 异步：异步编程之callback",
    143564: "15 | 异步：事件循环",
    143644: "16 | 异步：异步编程之Promise",
    146470: "17 | 异步：异步编程之async/await",
    146569: "18 | HTTP：什么是HTTP服务器？",
    146582: "19 | HTTP：简单实现一个HTTP服务器"
}

/**
 * TODO:  这里是客户端单工通信
 */

// const server = net.createServer(socket => {
//     socket.on('data', buffer => {
//         console.log(buffer, buffer.toString())
//     })
// })


/**
 * TODO:  这里是半双工通信
 */

// const server = net.createServer(socket => {
//     // 服务端通过监听 socket.on('data',()=>{}) 来及时地获取客户端的请求，
//     // 并通过 socket.write 向socket中写入新的数据，触发客户端的 socket.on('data', () => { }) 的回调函数
//     // 需要注意的是，写入buffer的内容必须通过 Buffer.from 将其转换为二进制格式
//     socket.on('data', buffer => {
//         const lessonId = buffer.readInt32BE();
//         setTimeout(() => {
//             socket.write(
//                 Buffer.from(LESSON_DATA[lessonId])
//             )
//         }, 500)
//     })
// })

/**
 * TODO:  半双工通信通道出现并发请求的时候，容易出现返回结果与请求不对应的情况，所以需要增加 seq
 *          这就是【全双工通信】在【半双工通信】的基础上做的第一个改进：增加序号
 */

const server = net.createServer(socket => {
    // 由于客户端在buffer的前两位中增加seq，
    // 所以服务端需要从第2位开始读取课程Id
    socket.on('data', buffer => {
        const seqBuffer = buffer.slice(0, 2);
        const lessonId = buffer.readInt32BE(2);

        setTimeout(() => {
            const buffer = Buffer.concat([
                seqBuffer,
                Buffer.from(LESSON_DATA[lessonId])
            ])
            socket.write(
                buffer
            )
        }, Math.random() * 1000)
    })
})

server.listen(4000)