import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

const PlayerGame = () => {
    const { pin } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const socket = useSocket();
    const [status, setStatus] = useState('lobby');
    const [question, setQuestion] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [result, setResult] = useState(null);
    const [waiting, setWaiting] = useState(false);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [timeUp, setTimeUp] = useState(false);

    useEffect(() => {
        if (!socket) return;
        socket.on('game_started', ({ totalTime }) => { setStatus('active'); setMinutes(totalTime || 10); setSeconds(0); });
        socket.on('new_question', (q) => { setQuestion(q); setAnswered(false); setResult(null); setWaiting(false); });
        socket.on('answer_result', (res) => { setResult(res); setWaiting(true); });
        socket.on('game_over', ({ score, quiz }) => { setStatus('finished'); setResult({ score, quiz }); });
        return () => { socket.off('game_started'); socket.off('new_question'); socket.off('answer_result'); socket.off('game_over'); };
    }, [socket]);

    useEffect(() => {
        if (status === 'active' && !timeUp) {
            const interval = setInterval(() => {
                if (seconds > 0) setSeconds(p => p - 1);
                else if (minutes > 0) { setMinutes(p => p - 1); setSeconds(59); }
                else { clearInterval(interval); setTimeUp(true); setStatus('finished'); }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [status, timeUp, minutes, seconds]);

    // Warn user before refreshing during active quiz
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (status === 'active' && !timeUp) {
                e.preventDefault();
                e.returnValue = ''; // Required for Chrome
                return ''; // Required for some browsers
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [status, timeUp]);

    const downloadSolutions = async () => {
        if (!result?.quiz) return;

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: result.quiz.title,
                        heading: HeadingLevel.TITLE,
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                        text: `Your Final Score: ${result.score} Marks`,
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                    }),
                    ...result.quiz.questions.flatMap((q, i) => [
                        new Paragraph({
                            children: [
                                new TextRun({ text: `${i + 1}. ${q.text}`, bold: true }),
                            ],
                            spacing: { before: 200, after: 100 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: "Options:", italics: true }),
                            ],
                        }),
                        ...q.options.map((opt, optIdx) => new Paragraph({
                            text: `- ${opt}`,
                            indent: { left: 720 },
                        })),
                        new Paragraph({
                            children: [
                                new TextRun({ text: "Correct Answer: ", bold: true }),
                                new TextRun({ text: q.options[q.correctIndex], color: "228B22", bold: true }),
                            ],
                            spacing: { after: 200 },
                        }),
                    ]),
                ],
            }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${result.quiz.title}_Solutions.docx`);
    };

    const [isHaloNotified, setIsHaloNotified] = useState(false);
    const [isPageBlurred, setIsPageBlurred] = useState(false);

    useEffect(() => {
        const recordViolation = (type) => {
            // Debounce to avoid spamming the same event
            const now = Date.now();
            if (window._lastViolationType === type && now - (window._lastViolationTime || 0) < 1000) return;
            window._lastViolationTime = now;
            window._lastViolationType = type;

            console.log(`[Player] recordViolation called: ${type}. pin: ${pin}, socket: ${socket?.id}`);
            if (socket && pin) {
                console.log(`[Player] Emitting player_violation: ${type}`);
                socket.emit('player_violation', { pin, type });
            }
        };

        const handleBlur = () => {
            console.log('[Player] handleBlur fired, document.hidden:', document.hidden);
            setIsPageBlurred(true);
            // Always record blur violations - debouncing will prevent spam
            recordViolation('blur');
        };

        const handleFocus = () => {
            console.log('[Player] handleFocus fired');
            setIsPageBlurred(false);
        };

        const handleVisibilityChange = () => {
            console.log('[Player] handleVisibilityChange fired, document.hidden:', document.hidden);
            if (document.hidden) {
                console.log('[Player] Recording minimize_or_tab violation');
                setIsPageBlurred(true);
                recordViolation('minimize_or_tab');
            }
        };

        const handleResize = () => {
            console.log('[Player] handleResize fired');
            recordViolation('resize');
        };

        const handleKeys = (e) => {
            if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p') || (e.metaKey && e.shiftKey && e.key === 's')) {
                setIsPageBlurred(true);
                alert("Screenshots are disabled!");
                setTimeout(() => setIsPageBlurred(false), 2000);
            }
        };

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('resize', handleResize);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('keyup', handleKeys);
        window.addEventListener('keydown', handleKeys);

        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('keyup', handleKeys);
            window.removeEventListener('keydown', handleKeys);
        };
    }, [socket, pin]);

    const submitAnswer = (index) => { if (!answered && !waiting && !timeUp) { socket.emit('submit_answer', { pin, answerIndex: index }); setAnswered(true); } };
    const nextQuestion = () => { socket.emit('request_next_question', { pin }); };

    const preventCopy = (e) => { e.preventDefault(); return false; };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-4 select-none relative"
            onContextMenu={preventCopy}
            onCopy={preventCopy}
            onCut={preventCopy}
            onPaste={preventCopy}
        >
            {isPageBlurred && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center text-center p-8">
                    <div className="animate-pulse">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h2 className="text-4xl font-black text-red-500 mb-2">Anti-Cheating Active</h2>
                        <p className="text-gray-400">Please keep the quiz window focused.</p>
                    </div>
                </div>
            )}
            <div className={`w-full max-w-2xl transition-all duration-300 ${isPageBlurred ? 'blur-2xl grayscale' : ''}`}>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        <span className="font-bold text-sm tracking-wide">{location.state?.name || 'Guest'}</span>
                    </div>
                    {status === 'active' && (
                        <div className={`px-4 py-2 rounded-full border font-mono font-bold transition-colors ${minutes < 1 ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse' : 'bg-primary/20 border-primary/50 text-primary'}`}>
                            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                        </div>
                    )}
                </div>

                {status === 'lobby' && (
                    <div className="card-glass text-center py-20 animate-fade-in">
                        <div className="text-8xl mb-8 animate-bounce-slow">🎮</div>
                        <h2 className="text-4xl font-black mb-4">You're In!</h2>
                        <div className="flex justify-center items-center gap-3 text-gray-400">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
                            <span>Waiting for host</span>
                        </div>
                    </div>
                )}

                {status === 'active' && !timeUp && (
                    <div className="animate-fade-in">
                        {question ? (
                            <>
                                {waiting ? (
                                    <div className="card-glass text-center py-16">
                                        {result?.isCorrect ? (
                                            <div className="space-y-6">
                                                <div className="text-8xl animate-bounce">✅</div>
                                                <div>
                                                    <h2 className="text-4xl font-black text-green-400 mb-2">Correct!</h2>
                                                    <p className="text-green-400/60 font-mono">+1 Mark</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="text-8xl animate-pulse">❌</div>
                                                <div>
                                                    <h2 className="text-4xl font-black text-red-400 mb-2">Wrong!</h2>
                                                    <p className="text-red-400/60">Better luck next time</p>
                                                </div>
                                            </div>
                                        )}
                                        <button onClick={nextQuestion} className="btn-primary mt-12 w-full max-w-xs text-lg">
                                            Next Question ➔
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        <div>
                                            <span className="text-sm font-bold text-primary uppercase tracking-wider mb-2 block">Question {question.current} / {question.total}</span>
                                            <h2 className="text-3xl md:text-4xl font-bold leading-tight">{question.text}</h2>
                                        </div>

                                        <div className="grid gap-4">
                                            {question.options.map((opt, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => submitAnswer(i)}
                                                    className="group w-full text-left p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 hover:scale-[1.02] transition-all duration-200 flex items-center gap-4"
                                                >
                                                    <span className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                                        {String.fromCharCode(65 + i)}
                                                    </span>
                                                    <span className="text-xl">{opt}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="card-glass p-12 text-center">
                                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                                <p className="text-gray-400">Loading your question...</p>
                            </div>
                        )}
                    </div>
                )}

                {(status === 'finished' || timeUp) && (
                    <div className="card-glass text-center py-16 animate-fade-in relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
                        <div className="relative z-10">
                            <div className="text-8xl mb-6">🏁</div>
                            <h2 className="text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                                {timeUp ? "Time's Up!" : "Quiz Complete!"}
                            </h2>
                            <div className="my-12 p-8 bg-white/5 mx-6 rounded-2xl border border-white/10 inline-block min-w-[300px]">
                                <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">Final Marks</p>
                                <h1 className="text-8xl font-black text-white tracking-tighter">{result?.score || 0}</h1>
                            </div>
                            <div className="flex gap-4 justify-center mt-8">
                                <button
                                    onClick={() => navigate('/')}
                                    className="btn-primary px-8 py-4 text-lg flex items-center gap-2"
                                >
                                    <span>🏠</span>
                                    Back to Home
                                </button>
                                {result?.quiz && (
                                    <button
                                        onClick={downloadSolutions}
                                        className="px-8 py-4 text-lg font-bold flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all shadow-lg hover:shadow-blue-500/20"
                                    >
                                        <span>📝</span>
                                        Download Answers
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlayerGame;
