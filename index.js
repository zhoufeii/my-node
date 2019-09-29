// console.log(process.argv);
// console.log(__filename);
// console.log(__dirname);

const playerAction = process.argv[process.argv.length - 1];
console.log(process.argv);
// process 表示进程对象
// process.env => 表示当前Node运行的环境变量
// process.argv => 表示用户在启动node程序时输入的命令

const random = Math.random() * 3;

let computerAction = ''

if (random < 1) {
    computerAction = 'rock'
} else if (random > 2) {
    computerAction = 'scissors'
} else {
    computerAction = 'paper'
}

console.log(computerAction)
if (computerAction === playerAction) {
    console.log('平局')
} else if (
    (computerAction === 'rock' && playerAction === 'paper') ||
    (computerAction === 'paper' && playerAction === 'scissors') ||
    (computerAction === 'scissors' && playerAction === 'rock')
) {
    console.log('你赢了')
} else {
    console.log('你输了')
}