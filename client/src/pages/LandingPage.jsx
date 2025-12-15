import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 selection:bg-primary/30">
            {/* Ambient Background Blobs */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse-slow pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] animate-pulse-slow delay-1000 pointer-events-none"></div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

            <div className="text-center mb-20 relative z-10 animate-fade-in md:mb-24">
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm font-medium text-gray-300 animate-slide-down">
                    ✨ The Future of Knowledge Testing
                </div>
                <h1 className="text-7xl md:text-9xl font-black mb-8 leading-tight tracking-tighter drop-shadow-2xl">
                    Quiz
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-secondary animate-gradient-x bg-[length:200%_auto]">
                        Master
                    </span>
                    <span className="text-primary">.</span>AI
                </h1>
                <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
                    Transform any PDF or topic into an interactive battle of wits. <br className="hidden md:block" />
                    Powered by advanced AI for instant, unlimited learning.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12 w-full max-w-5xl px-4 relative z-10">
                <Link to="/player/join" className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                    <div className="card-glass h-full flex flex-col items-center text-center p-10 hover:translate-y-[-5px] transition-transform duration-300 border-white/10 group-hover:border-blue-500/30 bg-black/40">
                        <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500 border border-blue-500/30">
                            🎓
                        </div>
                        <h2 className="text-4xl font-black mb-3 text-white group-hover:text-blue-400 transition-colors">I'm a Student</h2>
                        <p className="text-gray-400 mb-8 text-lg">Join a live session, compete with friends, and track your progress.</p>
                        <button className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 font-bold text-lg shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all">
                            Join with PIN
                        </button>
                    </div>
                </Link>

                <Link to="/host/login" className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                    <div className="card-glass h-full flex flex-col items-center text-center p-10 hover:translate-y-[-5px] transition-transform duration-300 border-white/10 group-hover:border-purple-500/30 bg-black/40">
                        <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500 border border-purple-500/30">
                            🚀
                        </div>
                        <h2 className="text-4xl font-black mb-3 text-white group-hover:text-purple-400 transition-colors">I'm a Host</h2>
                        <p className="text-gray-400 mb-8 text-lg">Create unlimited quizzes from PDFs or topics and host live games.</p>
                        <button className="w-full py-4 rounded-xl font-bold text-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-all group-hover:border-purple-500/50">
                            Launch Dashboard
                        </button>
                    </div>
                </Link>
            </div>

            <footer className="absolute bottom-6 w-full text-center text-white/20 text-xs font-mono tracking-widest uppercase">
                <p>Designed for the Next Generation of Learners</p>
            </footer>
        </div>
    );
};

export default LandingPage;
