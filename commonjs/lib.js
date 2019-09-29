console.log('is requireing')

exports.hello = 'world';
exports.showHello = () => { console.log('hello') }
exports.person = {
    name: 'xiaoming',
    age: 20,
}

module.exports = function minus(a, b) {     // 修改 module.exports会把整个导出的对象给覆盖掉
    return a - b;
}

// 在使用 module.exports 导出对象后，该文件内的 exports 对象不变
// 但是该文件最终导出的结果是 module.exports 的内容

setTimeout(() => {
    console.log(exports);
    console.log(module);
}, 2000)

// module => 

// Module {
//     id: '/Users/dengyu/project/my-node/commonjs/lib.js',
//     exports: { [Function: minus] ex: 'this is ex test' },
//     parent: Module {
//         id: '.',
//         exports: { },
//         parent: null,
//         filename: '/Users/dengyu/project/my-node/commonjs/index.js',
//         loaded: true,
//         children: [[Circular]],
//         paths:
//              [
//                  '/Users/dengyu/project/my-node/commonjs/node_modules',
//                  '/Users/dengyu/project/my-node/node_modules',
//                  '/Users/dengyu/project/node_modules',
//                  '/Users/dengyu/node_modules',
//                  '/Users/node_modules',
//                  '/node_modules'
//              ]
//     },
//     filename: '/Users/dengyu/project/my-node/commonjs/lib.js',
//     loaded: true,
//     children: [],
//     paths:
//          [   
//              '/Users/dengyu/project/my-node/commonjs/node_modules',
//              '/Users/dengyu/project/my-node/node_modules',
//              '/Users/dengyu/project/node_modules',
//              '/Users/dengyu/node_modules',
//              '/Users/node_modules',
//              '/node_modules'
//          ]
// }

// 通过上面的方法就可以在输出的对象的挂载属性和方法

// 当指定了模块输出的内容之后， require('./lib.js') 的值就会变成 { hello: 'world', showHello: [Function] }， 而不是一个空对象

// exports存在一个问题：它输出的对象的内容可以在外面被改变，因为这里导出的和那边引入的是同一个exports的引用

