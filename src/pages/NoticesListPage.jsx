import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function relDate(d) {
  const days = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (days === 0) return '오늘';
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  return new Date(d).toLocaleDateString('ko-KR');
}

export default function NoticesListPage() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('notices').select('id, title, created_at').eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => { setNotices(data || []); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div style={{ width: 28, height: 28, border: '3px solid #4489c8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: '48px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4489c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </svg>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary,#e8e8ea)', margin: 0 }}>공지사항</h1>
      </div>

      {notices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#8b8b9e' }}>
          <p>등록된 공지사항이 없습니다.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--color-bg-card,#13141f)', border: '1px solid var(--color-border,#2a2b3d)', borderRadius: 14, overflow: 'hidden' }}>
          {notices.map((n, i) => (
            <button
              key={n.id}
              onClick={() => navigate('/notices/' + n.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                borderBottom: i < notices.length - 1 ? '1px solid var(--color-border,#2a2b3d)' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary,#e8e8ea)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {n.title}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted,#55556e)', flexShrink: 0, marginLeft: 16 }}>
                {relDate(n.created_at)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
