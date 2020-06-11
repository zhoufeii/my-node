// TODO: nodejs进程对象

// console.log(process.argv);
// console.log(__filename);
// console.log(__dirname);

// const playerAction = process.argv[process.argv.length - 1];
// console.log(process.argv);

// process 表示进程对象
// process.env => 表示当前Node运行的环境变量
// process.argv => 表示用户在启动node程序时输入的命令

// const random = Math.random() * 3;

// let computerAction = ''

// if (random < 1) {
//     computerAction = 'rock'
// } else if (random > 2) {
//     computerAction = 'scissors'
// } else {
//     computerAction = 'paper'
// }

// console.log(computerAction)
// if (computerAction === playerAction) {
//     console.log('平局')
// } else if (
//     (computerAction === 'rock' && playerAction === 'paper') ||
//     (computerAction === 'paper' && playerAction === 'scissors') ||
//     (computerAction === 'scissors' && playerAction === 'rock')
// ) {
//     console.log('你赢了')
// } else {
//     console.log('你输了')
// }

// TODO: 事件监听

// const EventEmitter = require('events').EventEmitter;

// class GeekTime extends EventEmitter {
//     constructor() {
//         super()
//         setInterval(() => {
//             this.emit('NEW_LESSON', { price: Math.random() * 100 })
//         }, 3000)
//     }
// }

// const geekTime = new GeekTime;

// module.exports = geekTime;

// TODO: 非阻塞I/O

// const glob = require('glob');

// 阻塞I/O的模式

// let result = null;
// console.time('glob');
// result = glob.sync(__dirname + '/**/*');
// console.log(result);
// console.timeEnd('glob');

// 非阻塞I/O的模式

// let result = null;
// console.time('glob');
// glob(__dirname + '/**/*', (err, res) => {
//     result = res;
//     console.log(result);
//     console.timeEnd('glob');
// })

// 异步编程

function getResult(res) {
    if (res instanceof Error) {
        console.log(res);
        console.log(res + ' cry')
    } else {
        console.log('simle')
    }
}

function interview(callback) {
    setTimeout(() => {
        if (Math.random() < 0.5) {
            callback('success')
        } else {
            callback(new Error('interview fail'));
        }
    }, 1000);
}

interview(getResult)
