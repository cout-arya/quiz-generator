const io = require('socket.io-client');

const SOCKET_URL = 'http://localhost:5000';
// PIN must be passed as arg
const PIN = process.argv[2];

if (!PIN) {
    console.error('Please provide PIN');
    process.exit(1);
}

function runPlayer() {
    console.log('--- PLAYER ---');
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
        console.log('Player Connected');
        socket.emit('join_game', { pin: PIN, name: 'SimPlayer' });
    });

    socket.on('joined_game', () => {
        console.log('Joined Lobby');
    });

    socket.on('game_started', () => {
        console.log('Game Started!');
    });

    socket.on('new_question', (q) => {
        console.log(`Question ${q.current}/${q.total}: ${q.text}`);

        // Answer immediately
        setTimeout(() => {
            console.log('Submitting Answer...');
            socket.emit('submit_answer', { pin: PIN, answerIndex: 0 }); // Always 0
        }, 500);
    });

    socket.on('answer_result', (res) => {
        console.log(`Result: ${res.isCorrect ? 'Correct' : 'Wrong'}, Score: ${res.score}`);
        // Click Next immediately
        setTimeout(() => {
            console.log('Requesting Next...');
            socket.emit('request_next_question', { pin: PIN });
        }, 500);
    });

    socket.on('game_over', ({ score }) => {
        console.log('Game Over! Final Score:', score);
        socket.disconnect();
        process.exit(0);
    });
}

runPlayer();
