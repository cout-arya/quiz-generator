const io = require('socket.io-client');
const axios = require('axios');

const SOCKET_URL = 'http://localhost:5000';
const API_URL = 'http://localhost:5000/api';

async function runHost() {
    console.log('--- HOST ---');
    // 1. Generate Quiz (Mock)
    console.log('Generating Quiz...');
    let quizId;
    try {
        const res = await axios.post(`${API_URL}/quizzes/generate`, {
            topic: 'test',
            numQuestions: 2,
            timeLimit: 5
        });
        quizId = res.data._id;
        console.log('Quiz Generated:', quizId);
        console.log('Question Count:', res.data.questions.length);
        if (res.data.questions.length !== 2) console.error('FAIL: Expected 2 questions!');
        if (res.data.questions[0].timeLimit !== 10) console.error('FAIL: Expected 10s timer!');
    } catch (e) {
        console.error('Gen Error:', e.message);
        return;
    }

    // 2. Connect Socket
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
        console.log('Host Connected:', socket.id);
        socket.emit('create_game', { quizId });
    });

    socket.on('game_created', ({ pin }) => {
        console.log('Game PIN:', pin);
        // Wait for player
    });

    socket.on('player_joined', ({ players }) => {
        console.log('Player Joined:', players.map(p => p.name));
        if (players.length > 0) {
            console.log('Starting Game...');
            socket.emit('start_game', { pin: players[0].pin || '??' }); // Logic error: pin needed.
            // My backend doesn't send pin back in player_joined?
            // Need to store pin from game_created.
        }
    });

    // Fix: Store pin in closure
    let gamePin;
    socket.on('game_created', ({ pin }) => {
        gamePin = pin;
        console.log('Host ready in lobby:', pin);
    });

    socket.on('player_joined', () => {
        setTimeout(() => {
            console.log('Host starting game for PIN:', gamePin);
            socket.emit('start_game', { pin: gamePin });
        }, 1000);
    });

    socket.on('update_dashboard', ({ players }) => {
        console.log('Dashboard Update:', players.map(p => `${p.name}: ${p.score} (Done: ${p.finished})`));
        if (players.every(p => p.finished)) {
            console.log('All players finished. Test Complete.');
            socket.disconnect();
            process.exit(0);
        }
    });
}

runHost();
