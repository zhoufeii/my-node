// console.log(process.argv);
// console.log(__filename);
// console.log(__dirname);

const playerAction = process.argv[process.argv.length - 1];
console.log(playerAction);

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