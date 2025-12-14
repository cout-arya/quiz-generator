const Quiz = require('../models/Quiz');

module.exports = (io) => {
    const games = {};

    io.on('connection', (socket) => {
        // console.log('User connected:', socket.id);

        // Host creates a game
        socket.on('create_game', async ({ quizId }) => {
            try {
                const quiz = await Quiz.findById(quizId);
                if (!quiz) return socket.emit('error', { message: 'Quiz not found' });

                const pin = Math.floor(100000 + Math.random() * 900000).toString();
                games[pin] = {
                    id: pin,
                    hostId: socket.id,
                    quiz: quiz,
                    players: [], // { id, name, score, currentQuestionIndex, finished }
                    status: 'lobby',
                };
                socket.join(pin);
                socket.emit('game_created', { pin });
                console.log(`Game created: ${pin}`);
            } catch (err) {
                socket.emit('error', { message: err.message });
            }
        });

        // Player joins a game
        socket.on('join_game', ({ pin, name }) => {
            const game = games[pin];
            if (game && game.status === 'lobby') {
                socket.join(pin);
                game.players.push({
                    id: socket.id,
                    name,
                    score: 0,
                    currentQuestionIndex: 0,
                    finished: false
                });
                io.to(game.hostId).emit('player_joined', { players: game.players });
                socket.emit('joined_game', { pin });
            } else {
                socket.emit('error', { message: 'Game not found or already started' });
            }
        });

        // Host starts the game
        socket.on('start_game', ({ pin }) => {
            const game = games[pin];
            if (game && game.hostId === socket.id) {
                game.status = 'active';
                io.to(pin).emit('game_started', { totalTime: game.quiz.totalTime || 10 });
                // Send first question to ALL players
                game.players.forEach(player => {
                    sendQuestionToPlayer(io, player.id, game.quiz.questions[0], 0, game.quiz.questions.length);
                });
            }
        });

        // Player requests next question (Self-paced)
        socket.on('request_next_question', ({ pin }) => {
            const game = games[pin];
            if (!game || game.status !== 'active') return;

            const player = game.players.find(p => p.id === socket.id);
            if (!player) return;

            player.currentQuestionIndex++;

            if (player.currentQuestionIndex < game.quiz.questions.length) {
                const question = game.quiz.questions[player.currentQuestionIndex];
                sendQuestionToPlayer(io, player.id, question, player.currentQuestionIndex, game.quiz.questions.length);
            } else {
                player.finished = true;
                socket.emit('game_over', { score: player.score });
                // Notify host of completion
                io.to(game.hostId).emit('update_dashboard', { players: game.players });
            }
        });

        // Player submits answer
        socket.on('submit_answer', ({ pin, answerIndex }) => {
            const game = games[pin];
            if (!game || game.status !== 'active') return;

            const player = game.players.find(p => p.id === socket.id);
            if (!player || player.finished) return;

            const question = game.quiz.questions[player.currentQuestionIndex];
            const isCorrect = question.correctIndex === answerIndex;

            if (isCorrect) {
                // Speed bonus could apply here based on timeLimit vs actual time
                player.score += 100;
            }

            socket.emit('answer_result', { isCorrect, correctIndex: question.correctIndex, score: player.score });

            // Update Host Dashboard Live
            io.to(game.hostId).emit('update_dashboard', {
                players: game.players
            });
        });

        socket.on('disconnect', () => {
            // Cleanup logic simplified
        });
    });
};

function sendQuestionToPlayer(io, playerId, question, index, total) {
    io.to(playerId).emit('new_question', {
        text: question.text,
        options: question.options,
        current: index + 1,
        total: total,
        timeLimit: question.timeLimit || 20
    });
}
