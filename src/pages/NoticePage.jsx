import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function relDate(d) {
  const days = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (days === 0) return '오늘';
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  return new Date(d).toLocaleDateString('ko-KR');
}

export default function NoticePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('notices').select('id, title, content, created_at').eq('id', id).single()
      .then(({ data }) => { setNotice(data || null); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div style={{ width: 28, height: 28, border: '3px solid #4489c8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );

  if (!notice) return (
    <div style={{ textAlign: 'center', padding: 80, color: '#8b8b9e' }}>
      <p>공지사항을 찾을 수 없습니다.</p>
      <button onClick={() => navigate('/')} style={{ marginTop: 16, padding: '8px 20px', background: '#4489c8', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>메인으로</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: '48px auto', padding: '0 16px' }}>
      <div style={{ background: 'var(--color-bg-card,#13141f)', border: '1px solid var(--color-border,#2a2b3d)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '24px 28px 18px', borderBottom: '1px solid var(--color-border,#2a2b3d)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4489c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#4489c8' }}>공지사항</span>
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary,#e8e8ea)', margin: 0, lineHeight: 1.4 }}>{notice.title}</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted,#55556e)', marginTop: 10 }}>{relDate(notice.created_at)} · {new Date(notice.created_at).toLocaleDateString('ko-KR')}</p>
        </div>
        <div style={{ padding: '24px 28px' }}>
          <div style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--color-text-secondary,#b0b0c0)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{notice.content}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
        <button onClick={() => navigate('/notices')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 9, background: 'var(--color-bg-card,#13141f)', border: '1px solid var(--color-border,#2a2b3d)', color: 'var(--color-text-secondary,#8b8b9e)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
          목록 보기
        </button>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 9, background: '#4489c8', border: 'none', color: '#fff', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
          메인화면
        </button>
      </div>
    </div>
  );
}
