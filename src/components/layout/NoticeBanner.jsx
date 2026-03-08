import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const INTERVAL = 10000;

export default function NoticeBanner() {
  const [notices, setNotices] = useState([]);
  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from('notices')
      .select('id, title')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => { if (data?.length) setNotices(data); });
  }, []);

  useEffect(() => {
    if (notices.length <= 1) return;
    timerRef.current = setInterval(() => {
      setExiting(true);
      setTimeout(() => {
        setCurrent((p) => (p + 1) % notices.length);
        setExiting(false);
      }, 350);
    }, INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [notices]);

  if (!notices.length) return null;

  const notice = notices[current];

  return (
    <div style={{
      width: '100%',
      background: 'var(--color-bg-card, #13141f)',
      borderBottom: '1px solid var(--color-border, #2a2b3d)',
    }}>
      <div style={{
        maxWidth: 900, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: '7px 16px',
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="#4489c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0 }}>
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </svg>

        <button
          onClick={() => navigate('/notices/' + notice.id)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontSize: '0.8rem', fontWeight: 600,
            color: 'var(--color-text-primary, #e8e8ea)',
            opacity: exiting ? 0 : 1,
            transform: exiting ? 'translateY(-6px)' : 'translateY(0)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
            maxWidth: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          {notice.title}
        </button>

        {notices.length > 1 && (
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            {notices.map((_, i) => (
              <button
                key={i}
                onClick={() => { clearInterval(timerRef.current); setCurrent(i); }}
                style={{
                  width: i === current ? 14 : 5, height: 5, borderRadius: 3,
                  background: i === current ? '#4489c8' : 'var(--color-border, #2a2b3d)',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'width 0.3s ease, background 0.3s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
