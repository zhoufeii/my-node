// express 版本

const http = require('http');
const queryString = require('querystring');
const url = require('url');
const fs = require('fs');
const express = require('express');

const game = require('./commonjs/game');
const app = express();

let wonCount = 0;
let lastPlayerAction = null;
let sameAction = 0;

app.listen(3000);

app.get('/favicon.ico', function (req, res) {
    // res.writeHead('200');
    // res.end();

    // 如果 res.end 没有返回的内容，则可以直接使用res.status返回指定状态
    res.status(200);
    return;
})

app.get('/', function (req, res) {
    // res.writeHead('200');
    // fs.createReadStream(__dirname + '/index.html').pipe(res);

    // 可以使用 res.send 代替, 不需要放在pipe中

    // fs.readFileSync 读取到的是文件的buffer，如果后面参数没有指定返回的编码集，则会
    res.send(fs.readFileSync(__dirname + '/index.html', 'utf-8'))
    return;
})

app.get('/game', function (req, res, next) {    // next 属于中间件的范畴【洋葱圈模型】
    // const parsedUrl = url.parse(req.url);
    // const query = queryString.parse(parsedUrl.query);

    // 在express中，直接使用req.query就可以获得query
    const query = req.query;
    const playerAction = query.action;
    const gameResult = game(playerAction);
    if (sameAction >= 2) {
        // res.writeHead('400');
        // res.end('你作弊！')
        res.status(400);
        res.send('你作弊！')
        return;
    }
    res.query = query;
    res.playerAction = playerAction;
    res.gameResult = gameResult;
    console.log(new Date().toString())
    next();     // 使用next可以将大段的逻辑拆分为小部分，
    // 在需要使用next的函数中，接收第三个参数next，并在这个函数内部的末尾调用next，使进程运行到下一个函数中
    // 并且将需要传递给下一个函数的数据挂载到 res 中，使下一个函数可以直接获取

    // 【洋葱圈模型】的执行过程 ： 从洋葱的左侧传入，到洋葱中心，再从洋葱的右侧传出。每一张洋葱皮都会被穿过两次
    // 可以通过【洋葱圈模型】来完成一些特定的功能
    // 比如计算整个程序运行的耗时


    // 但是 express 的【洋葱圈模型】存在一个缺点：next() 属于同步操作的函数，在它执行完之后，才会开始执行存在的异步操作，
    // 此时整个【洋葱模型】已经结束，但是没有获取到异步操作的结果
    console.log('结束' + new Date().toString())

}, function (req, res) {
    const query = res.query;
    const gameResult = res.gameResult;
    const playerAction = res.playerAction;
    if (playerAction && playerAction === lastPlayerAction) {
        sameAction++;
    } else {
        sameAction = 0
    }

    lastPlayerAction = playerAction;

    if (wonCount >= 3) {
        // res.writeHead('500');
        // res.end('你太厉害了，不跟你玩')
        res.status(500);
        res.send('你太厉害了，不跟你玩');
        return;
    }

    if (gameResult == 1) {
        wonCount++;
        res.status(200);
        res.send('你赢了');

        return;
    } else if (gameResult == -1) {
        res.status(200);
        res.send('你输了')
        return;
    } else {
        res.status(200);
        res.send('平局了！')
        return;
    }
})


// http.createServer((req, res) => {
//     const parsedUrl = url.parse(req.url);
//     // 为了调试方便，不处理favicon.ico
//     if (parsedUrl.pathname === 'favicon.ico') {
//         res.writeHead('200');
//         res.end();
//         return;
//     }

//     if (parsedUrl.pathname === '/game') {
//         const query = queryString.parse(parsedUrl.query);
//         const playerAction = query.action;
//         const gameResult = game(playerAction);

//         if (sameAction >= 3) {
//             res.writeHead('400');
//             res.end('你作弊！')
//         }
//         lastPlayerAction = playerAction;
//         if (playerAction) {
//             sameAction++;
//         } else {
//             sameAction = 0
//         }

//         if (wonCount >= 3) {
//             res.writeHead('500');
//             res.end('你太厉害了，不跟你玩')
//         }

//         if (gameResult == 1) {
//             wonCount++;
//             res.writeHead('200');
//             res.end('你赢了')
//         } else if (gameResult == -1) {
//             res.writeHead('200');
//             res.end('你输了')
//         } else {
//             res.writeHead('200');
//             res.end('平局了！')
//         }
//     }

//     if (parsedUrl.pathname === '/') {
//         res.writeHead('200');
//         fs.createReadStream(__dirname + '/index.html').pipe(res);
//     }
// }).listen(3000)