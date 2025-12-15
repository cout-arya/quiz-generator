import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const HostDashboard = () => {
    // Mode is implicit now (both available)
    const [topic, setTopic] = useState('');
    const [file, setFile] = useState(null);
    const [numQuestions, setNumQuestions] = useState(5);
    const [timeLimit, setTimeLimit] = useState(10);
    const [quiz, setQuiz] = useState(null);
    const [pin, setPin] = useState(null);
    const [players, setPlayers] = useState([]);
    const [gameStatus, setGameStatus] = useState('idle');
    const [isLoading, setIsLoading] = useState(false);

    const socket = useSocket();
    const navigate = useNavigate();

    useEffect(() => {
        if (!socket) return;
        socket.on('game_created', ({ pin }) => { setPin(pin); setGameStatus('lobby'); });
        socket.on('player_joined', ({ players }) => setPlayers(players));
        socket.on('game_started', () => setGameStatus('active'));
        socket.on('update_dashboard', ({ players }) => setPlayers(players));
        return () => {
            socket.off('game_created'); socket.off('player_joined');
            socket.off('game_started'); socket.off('update_dashboard');
        };
    }, [socket]);

    const generateQuiz = async () => {
        if (!topic && !file) {
            alert("Please provide a topic/instruction OR upload a PDF.");
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('numQuestions', numQuestions);
            formData.append('timeLimit', timeLimit);

            if (topic) formData.append('topic', topic);
            if (file) formData.append('pdf', file);

            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch('http://localhost:5000/api/quizzes/generate', {
                method: 'POST',
                headers, // Do NOT set Content-Type for FormData
                body: formData
            });
            const data = await res.json();
            if (res.ok) setQuiz(data); else alert(data.message);
        } catch (err) {
            alert('Failed to generate quiz: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const createGame = () => { if (quiz && socket) socket.emit('create_game', { quizId: quiz._id }); };
    const startGame = () => { if (socket && pin) socket.emit('start_game', { pin }); };
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const handleLogout = () => { localStorage.removeItem('token'); navigate('/'); };

    return (
        <div className="min-h-screen p-6 flex flex-col">
            <header className="max-w-7xl mx-auto w-full flex justify-between items-center mb-8 md:mb-12">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent cursor-pointer" onClick={() => navigate('/')}>
                        Host Dashboard
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    {pin && (
                        <div className="px-6 py-2 bg-gradient-to-r from-primary to-secondary rounded-full font-mono text-xl font-bold shadow-lg animate-pulse-fast">
                            PIN: {pin}
                        </div>
                    )}
                    <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium">
                        Logout
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full flex flex-col">
                {!pin ? (
                    // CREATION MODE: Centered Hero Card
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-full max-w-4xl">
                            <div className="card-glass p-8 md:p-12 relative overflow-hidden border-orange-500/0 hover:border-white/10 transition-all duration-500">
                                {/* Decorational Background Elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

                                <div className="relative z-10">
                                    <div className="text-center mb-10">
                                        <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Create Your Quiz</h2>
                                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                                            Upload study materials or describe your topic. Our AI will handle the rest.
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                                        {/* Left Column: Inputs */}
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                                                    <span>📄</span> PDF Context (Optional)
                                                </label>
                                                <div className="relative group">
                                                    <input
                                                        type="file"
                                                        accept="application/pdf"
                                                        onChange={(e) => setFile(e.target.files[0])}
                                                        className="w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-white/5 file:text-white hover:file:bg-primary hover:file:text-white cursor-pointer transition-all border border-white/10 rounded-xl p-2"
                                                    />
                                                    {file && (
                                                        <button
                                                            onClick={() => setFile(null)}
                                                            className="absolute right-3 top-3 text-red-400 hover:text-red-300 bg-black/40 p-1 rounded-md"
                                                            title="Remove file"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                                                    <span>💡</span> Topic & Instructions
                                                </label>
                                                <textarea
                                                    className="input-glass min-h-[140px] resize-none text-lg p-4 leading-relaxed"
                                                    placeholder={file ? "Example: Focus on Chapter 2, specifically the section on molecular bonding..." : "Example: The French Revolution, 10th grade difficulty..."}
                                                    value={topic}
                                                    onChange={(e) => setTopic(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Right Column: Settings & Logic */}
                                        <div className="flex flex-col justify-between space-y-6">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center block">Questions</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            className="input-glass text-center text-3xl font-black py-4"
                                                            value={numQuestions}
                                                            onChange={(e) => setNumQuestions(e.target.value)}
                                                            min="1" max="20"
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold opacity-50">Q</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center block">Duration</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            className="input-glass text-center text-3xl font-black py-4"
                                                            value={timeLimit}
                                                            onChange={(e) => setTimeLimit(e.target.value)}
                                                            min="1" max="60"
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold opacity-50">min</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {!quiz ? (
                                                    <button
                                                        onClick={generateQuiz}
                                                        disabled={isLoading || (!topic && !file)}
                                                        className="btn-primary w-full py-5 text-xl shadow-2xl shadow-primary/20 flex justify-center items-center gap-3 group"
                                                    >
                                                        {isLoading ? (
                                                            <>
                                                                <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                                Generating Magic...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span>✨</span> Generate Quiz
                                                                <span className="group-hover:translate-x-1 transition-transform">➔</span>
                                                            </>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-6 text-center animate-fade-in relative overflow-hidden">
                                                        <div className="absolute inset-0 bg-green-500/10 animate-pulse pointer-events-none"></div>
                                                        <h3 className="font-bold text-2xl mb-2 text-white">Quiz Ready!</h3>
                                                        <p className="text-green-300 text-sm mb-6">{quiz.title}</p>
                                                        <button
                                                            onClick={createGame}
                                                            className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-black text-xl rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            🚀 Launch Game Lobby
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // LIVE MODE: Split Sidebar Layout
                    <div className="grid lg:grid-cols-4 gap-8 h-full">
                        {/* Sidebar: Controls */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="card-glass p-6 text-center">
                                <span className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Game Status</span>
                                <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-bold bg-white/5 border border-white/10 ${gameStatus === 'active' ? 'text-green-400 border-green-500/50' : 'text-yellow-400 border-yellow-500/50'}`}>
                                    <span className={`w-2 h-2 rounded-full ${gameStatus === 'active' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></span>
                                    {gameStatus === 'lobby' ? 'Lobby Open' : 'Game Active'}
                                </div>
                                {gameStatus === 'active' && (
                                    <button
                                        className="mt-6 w-full px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-bold"
                                        onClick={() => window.location.reload()}
                                    >
                                        End Session
                                    </button>
                                )}
                            </div>

                            {gameStatus === 'lobby' && (
                                <button onClick={startGame} className="btn-primary w-full py-4 text-xl shadow-xl shadow-primary/20 animate-bounce-slow">
                                    Start Game
                                </button>
                            )}
                        </div>

                        {/* Main: Leaderboard/Lobby */}
                        <div className="lg:col-span-3 card-glass p-8 min-h-[500px]">
                            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                                <h2 className="text-3xl font-black">
                                    {gameStatus === 'lobby' ? 'Waiting for Players...' : '🏆 Live Leaderboard'}
                                </h2>
                                <div className="text-right">
                                    <span className="block text-4xl font-black text-primary">{players.length}</span>
                                    <span className="text-xs uppercase tracking-widest text-gray-400">Players Joined</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {players.map((p, i) => (
                                    <div key={p.id} className="bg-white/5 rounded-2xl p-4 flex items-center gap-4 border border-white/5 hover:border-white/10 transition-colors animate-fade-in">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-lg ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-gray-300 text-black' : i === 2 ? 'bg-orange-700 text-white' : 'bg-white/10 text-gray-400'}`}>
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{p.name}</p>
                                            <p className="text-sm text-primary font-mono">{p.score} pts {p.finished && '🏁'}</p>
                                        </div>
                                    </div>
                                ))}
                                {players.length === 0 && (
                                    <div className="col-span-full py-20 text-center text-gray-500 italic">
                                        Join at localhost:5173/player/join with PIN: {pin}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default HostDashboard;
