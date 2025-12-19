import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HostLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (res.ok) {
                if (isLogin) {
                    localStorage.setItem('token', data.token);
                    navigate('/host');
                } else {
                    alert('Registration successful! Please login.');
                    setIsLogin(true);
                }
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card-glass w-full max-w-md animate-fade-in">
                <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-2 text-sm text-gray-400 font-medium tracking-wide">USERNAME</label>
                        <input
                            type="text"
                            className="input-glass"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            placeholder="Enter your username"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm text-gray-400 font-medium tracking-wide">PASSWORD</label>
                        <input
                            type="password"
                            className="input-glass"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full shadow-lg shadow-primary/20">
                        {isLogin ? 'Login Dashboard' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-center mt-6 text-gray-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-primary font-bold hover:text-accent transition-colors ml-1"
                    >
                        {isLogin ? 'Register' : 'Login'}
                    </button>
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="w-full mt-4 text-sm text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                    <span>←</span> Back to Home
                </button>
            </div>
        </div>
    );
};

export default HostLogin;
