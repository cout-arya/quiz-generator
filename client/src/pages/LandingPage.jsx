import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="text-center mb-16 animate-fade-in relative z-10">
                <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight tracking-tight">
                    Next-Gen<br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        AI Quiz Builder
                    </span>
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
                    Experience the future of learning. Generate infinite quizzes instantly with AI, host live sessions, and compete in real-time.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl px-4 animate-fade-in delay-100">
                <Link to="/player/join" className="group card-glass flex flex-col items-center text-center hover:bg-white/10 transition-colors duration-300">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🎓</div>
                    <h2 className="text-3xl font-bold mb-2">Student</h2>
                    <p className="text-gray-400 mb-8">Join a live game session with a PIN code.</p>
                    <button className="btn-primary w-full">Join Game</button>
                </Link>

                <Link to="/host/login" className="group card-glass flex flex-col items-center text-center hover:bg-white/10 transition-colors duration-300">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🚀</div>
                    <h2 className="text-3xl font-bold mb-2">Host</h2>
                    <p className="text-gray-400 mb-8">Create, manage, and host quizzes for your audience.</p>
                    <button className="px-6 py-3 w-full bg-white/10 rounded-xl font-bold hover:bg-white/20 transition-all border border-white/20">
                        Host Login
                    </button>
                </Link>
            </div>

            <footer className="mt-auto py-8 text-white/40 text-sm">
                <p>© 2024 AI Quiz Builder. Powered by OpenRouter.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
