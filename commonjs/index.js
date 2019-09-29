// console.log('start require');
// const Lib = require('./lib.js');    // 引用结果默认是一个空对象

// lib.ex = 'this is ex test';


// lib.js => module.exports ====> Lib = module.exports  

// lib.js => exports.xxx ====> Lib = exports

// 此处导入的 Lib 对应的始终是 lib.js 中导出的对象，是同一个引用

// console.log('end require', Lib);
// lib 中使用的是 module.exports ，在此处被引入的lib对象是 module.exports 的对象
// 但是在lib文件中，它的 exports 被 module.exports 覆盖

const game = require('./game');

let count = 0;

// const playerAction = process.argv[process.argv.length - 1];

process.stdin.on('data', e => {
    const playAction = e.toString().trim();
    const result = game(playAction);

    if (result === -1) {
        count++;
    }
    if (count === 3) {
        console.log('你太强了👍')
        process.exit();
    }
    console.log(result);
})



