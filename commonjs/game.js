module.exports = function game(playerAction) {

    const random = Math.random() * 3;

    let computerAction = '';
    // let computerActionName = '';

    if (random < 1) {
        computerAction = 'rock';
        computerActionName = '石头';
    } else if (random > 2) {
        computerAction = 'scissors';
        computerActionName = '剪刀';
    } else {
        computerAction = 'paper';
        computerActionName = '布';
    }

    // console.log(`我出了${computerActionName}`);

    if (computerAction === playerAction) {
        // console.log('平局');
        return 0;
    } else if (
        (computerAction === 'rock' && playerAction === 'paper') ||
        (computerAction === 'paper' && playerAction === 'scissors') ||
        (computerAction === 'scissors' && playerAction === 'rock')
    ) {
        // console.log('你赢了');
        return -1;

    } else {
        // console.log('你输了');
        return 1;
    }
}