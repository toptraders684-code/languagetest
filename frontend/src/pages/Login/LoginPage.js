import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login({ email, password });
      loginUser(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141414] px-4"
      style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9))' }}>
      <div className="bg-[#000000]/75 rounded-md p-10 w-full max-w-md border border-[#333]">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#E50914] tracking-wider">AutoCRM</h1>
          <p className="text-[#808080] mt-2 text-sm">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-[#E50914]/20 border border-[#E50914]/50 text-[#E50914] px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#aaa] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#333] border border-[#444] rounded px-4 py-3 text-white placeholder-[#808080] focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914] outline-none"
              placeholder="admin@carcrm.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#aaa] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#333] border border-[#444] rounded px-4 py-3 text-white placeholder-[#808080] focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914] outline-none"
              placeholder="Enter password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E50914] text-white py-3 rounded font-semibold hover:bg-[#B20710] transition-all duration-200 disabled:opacity-50 text-base"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-[#666] mt-8">
          Default: admin@carcrm.com / admin123
        </p>
      </div>
    </div>
  );
}
