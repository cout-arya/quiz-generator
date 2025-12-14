import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const HostDashboard = () => {
    const [mode, setMode] = useState('topic');
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
        if (mode === 'topic' && !topic) return;
        if (mode === 'pdf' && !file) return;
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('numQuestions', numQuestions);
            formData.append('timeLimit', timeLimit);
            if (mode === 'topic') formData.append('topic', topic);
            else { formData.append('pdf', file); formData.append('topic', 'PDF Content'); }
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch('http://localhost:5000/api/quizzes/generate', { method: 'POST', headers, body: formData });
            const data = await res.json();
            if (res.ok) setQuiz(data); else alert(data.message);
        } catch (err) { alert('Failed to generate quiz: ' + err.message); }
        finally { setIsLoading(false); }
    };

    const createGame = () => { if (quiz && socket) socket.emit('create_game', { quizId: quiz._id }); };
    const startGame = () => { if (socket && pin) socket.emit('start_game', { pin }); };
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const handleLogout = () => { localStorage.removeItem('token'); navigate('/'); };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Host Dashboard</h1>
                    <p className="text-gray-400 mt-2">Manage your live quiz sessions</p>
                </div>
                <div className="flex items-center gap-4">
                    {pin && (
                        <div className="px-6 py-2 bg-gradient-to-r from-primary to-secondary rounded-full font-mono text-xl font-bold shadow-lg animate-pulse-fast">
                            PIN: {pin}
                        </div>
                    )}
                    <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium">
                        Logout
                    </button>
                </div>
            </header>

            {gameStatus === 'idle' && (
                <div className="card-glass animate-fade-in max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm">1</span>
                        Quiz Configuration
                    </h2>

                    <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
                        <button
                            onClick={() => setMode('topic')}
                            className={`px-4 py-2 rounded-lg transition-all ${mode === 'topic' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Write Topic
                        </button>
                        <button
                            onClick={() => setMode('pdf')}
                            className={`px-4 py-2 rounded-lg transition-all ${mode === 'pdf' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Upload PDF
                        </button>
                    </div>

                    <div className="space-y-6">
                        {mode === 'topic' ? (
                            <div>
                                <label className="block text-primary font-bold mb-2">Quiz Topic</label>
                                <input
                                    type="text"
                                    placeholder="Enter any topic (e.g., Quantum Physics)..."
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="input-glass text-lg"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-primary font-bold mb-2">Upload PDF Document</label>
                                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        className="hidden"
                                        id="pdf-upload"
                                    />
                                    <label htmlFor="pdf-upload" className="cursor-pointer">
                                        <div className="text-4xl mb-2">📄</div>
                                        <span className="text-gray-300 hover:text-white underline">{file ? file.name : "Click to Browse"}</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-400 mb-2 text-sm uppercase tracking-wider">Questions</label>
                                <input type="number" value={numQuestions} onChange={e => setNumQuestions(e.target.value)} className="input-glass" />
                            </div>
                            <div>
                                <label className="block text-gray-400 mb-2 text-sm uppercase tracking-wider">Total Time (Min)</label>
                                <input type="number" value={timeLimit} onChange={e => setTimeLimit(e.target.value)} className="input-glass" />
                            </div>
                        </div>

                        {!quiz && (
                            <button onClick={generateQuiz} disabled={isLoading} className="btn-primary w-full py-4 text-lg">
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Generating Magic...
                                    </span>
                                ) : '✨ Generate Quiz with AI'}
                            </button>
                        )}
                    </div>

                    {quiz && (
                        <div className="mt-8 p-6 bg-accent/10 border border-accent/20 rounded-xl animate-fade-in flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-accent mb-1">Quiz Ready: {quiz.title}</h3>
                                <p className="text-accent/80 text-sm">{quiz.questions.length} Questions • {timeLimit} Min Limit</p>
                            </div>
                            <button onClick={createGame} className="px-6 py-3 bg-accent text-white font-bold rounded-lg hover:bg-emerald-400 transition-colors shadow-lg shadow-accent/20">
                                🚀 Create Lobby
                            </button>
                        </div>
                    )}
                </div>
            )}

            {gameStatus === 'lobby' && (
                <div className="card-glass text-center max-w-4xl mx-auto animate-fade-in">
                    <div className="mb-12">
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold uppercase tracking-wider border border-green-500/20">Lobby Active</span>
                        <h2 className="text-3xl font-bold mt-4 mb-2">Waiting for Players...</h2>
                        <div className="text-7xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary my-8">
                            {pin}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        {players.map(p => (
                            <div key={p.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold">
                                    {p.name.charAt(0)}
                                </div>
                                <span className="font-medium truncate">{p.name}</span>
                            </div>
                        ))}
                        {players.length === 0 && <div className="col-span-full text-gray-500 italic">Waiting for connection...</div>}
                    </div>

                    <button onClick={startGame} disabled={players.length === 0} className="btn-primary w-full max-w-md mx-auto text-xl">
                        Start Game Now
                    </button>
                </div>
            )}

            {gameStatus === 'active' && (
                <div className="card-glass animate-fade-in">
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                            Live Leaderboard
                        </h2>
                        <div className="text-gray-400 text-sm">Real-time Updates</div>
                    </div>

                    <ul className="space-y-3">
                        {sortedPlayers.map((p, i) => (
                            <li key={p.id} className={`flex justify-between items-center p-4 rounded-xl border transition-all duration-300 ${p.finished ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${i === 0 ? 'bg-yellow-500 text-black' : (i === 1 ? 'bg-gray-400 text-black' : (i === 2 ? 'bg-orange-700 text-white' : 'bg-white/10 text-white'))}`}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <span className={`font-bold text-lg ${i < 3 ? 'text-white' : 'text-gray-300'}`}>{p.name}</span>
                                        {p.finished && <span className="ml-2 text-xs bg-green-500 text-black px-2 py-0.5 rounded font-bold uppercase">Done</span>}
                                    </div>
                                </div>
                                <span className="font-mono text-2xl font-bold textual-primary">
                                    {p.score}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default HostDashboard;
