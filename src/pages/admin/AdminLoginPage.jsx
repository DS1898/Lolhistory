import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } else {
      navigate('/admin');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-text-primary">
            <span className="text-win">SOOP</span> Tracker
          </h1>
          <p className="text-text-secondary text-sm mt-2">관리자 로그인</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-bg-card border border-border rounded-xl p-8 space-y-4"
        >
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-loss text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover text-white py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
