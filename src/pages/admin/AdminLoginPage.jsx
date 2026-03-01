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
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 60% 20%, #1a2744 0%, #0d0e14 55%, #0a0b10 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', fontFamily: 'inherit',
    }}>
      {/* 배경 광원 효과 */}
      <div style={{
        position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300,
        background: 'radial-gradient(ellipse, rgba(68,137,200,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative' }}>
        {/* 로고 */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #4489c8, #2d6ea8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 900, color: '#fff', boxShadow: '0 4px 16px rgba(68,137,200,0.4)',
            }}>S</div>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-hi)', letterSpacing: '-0.5px' }}>
              <span style={{ color: '#4489c8' }}>So</span>Log
            </span>
          </div>
          <p style={{ color: 'var(--text-mid)', fontSize: '0.85rem' }}>관리자 전용 공간입니다</p>
        </div>

        {/* 카드 */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '2.5rem',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}>
          <h2 style={{ color: 'var(--text-hi)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.75rem' }}>
            로그인
          </h2>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* 이메일 */}
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', color: 'var(--text-mid)', fontSize: '0.75rem', marginBottom: 6, fontWeight: 500 }}>
                이메일
              </label>
              <input
                type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                required placeholder="admin@example.com"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: '0.75rem 1rem',
                  color: 'var(--text-hi)', fontSize: '0.9rem',
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#4489c8'; e.target.style.background = 'rgba(68,137,200,0.08)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label style={{ display: 'block', color: 'var(--text-mid)', fontSize: '0.75rem', marginBottom: 6, fontWeight: 500 }}>
                비밀번호
              </label>
              <input
                type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                required placeholder="••••••••"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: '0.75rem 1rem',
                  color: 'var(--text-hi)', fontSize: '0.9rem',
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#4489c8'; e.target.style.background = 'rgba(68,137,200,0.08)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(232,64,87,0.1)', border: '1px solid rgba(232,64,87,0.3)',
                borderRadius: 10, padding: '0.6rem 0.9rem', color: '#e84057', fontSize: '0.8rem',
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              marginTop: 8,
              background: loading ? '#2d6ea8' : 'linear-gradient(135deg, #4489c8, #2d6ea8)',
              border: 'none', borderRadius: 12,
              padding: '0.85rem', color: '#fff',
              fontSize: '0.95rem', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(68,137,200,0.35)',
              transition: 'opacity 0.2s, transform 0.1s',
              opacity: loading ? 0.7 : 1,
            }}
              onMouseEnter={(e) => { if (!loading) e.target.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.target.style.opacity = loading ? '0.7' : '1'; }}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
