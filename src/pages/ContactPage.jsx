import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', message: '' });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setErr('이름을 입력해주세요.'); return; }
    if (!form.message.trim()) { setErr('내용을 입력해주세요.'); return; }
    setSending(true);
    setErr('');

    const { error } = await supabase.from('inquiries').insert({
      name: form.name.trim(),
      message: form.message.trim(),
      is_read: false,
    });

    setSending(false);

    if (error) {
      console.error('[문의 전송 오류]', error);
      // 원인별 안내 메시지
      if (error.code === '42501' || error.message?.includes('row-level security')) {
        setErr('서버 보안 정책 오류입니다. 관리자에게 문의해주세요. (RLS)');
      } else if (error.code === '42P01' || error.message?.includes('does not exist')) {
        setErr('서버 테이블 설정이 필요합니다. 관리자에게 문의해주세요.');
      } else {
        setErr(`전송 실패: ${error.message || '알 수 없는 오류'}`);
      }
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div style={{ maxWidth: 560, margin: '80px auto', padding: '0 16px', textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(68,137,200,0.15)', border: '2px solid #4489c8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4489c8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary,#e8e8ea)', marginBottom: 8 }}>
          문의가 접수되었습니다
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted,#55556e)', lineHeight: 1.7 }}>
          내용을 확인 후 답변 드리겠습니다.<br />
          보통 1~2일 내로 확인합니다.
        </p>
        <button
          onClick={() => { setForm({ name: '', message: '' }); setDone(false); }}
          style={{
            marginTop: 24, padding: '9px 24px', background: '#4489c8', color: '#fff',
            border: 'none', borderRadius: 9, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          새 문의 작성
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: '48px auto', padding: '0 16px' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary,#e8e8ea)', marginBottom: 6 }}>
        문의하기
      </h1>
      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted,#55556e)', marginBottom: 28 }}>
        오류 제보, 스트리머 등록 요청 등 문의사항을 남겨주세요.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--color-bg-card,#13141f)',
          border: '1px solid var(--color-border,#2a2b3d)',
          borderRadius: 14, padding: '28px 28px 24px',
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary,#b0b0c0)', marginBottom: 6 }}>
            이름 *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="닉네임 또는 이름"
            maxLength={50}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'var(--color-bg-input,#1a1b2e)',
              border: '1px solid var(--color-border,#2a2b3d)',
              borderRadius: 9, padding: '10px 14px', fontSize: '0.875rem',
              color: 'var(--color-text-primary,#e8e8ea)', outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#4489c8'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--color-border,#2a2b3d)'; }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary,#b0b0c0)', marginBottom: 6 }}>
            내용 *
          </label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="문의 내용을 입력해주세요"
            rows={6}
            maxLength={2000}
            style={{
              width: '100%', boxSizing: 'border-box', resize: 'vertical',
              background: 'var(--color-bg-input,#1a1b2e)',
              border: '1px solid var(--color-border,#2a2b3d)',
              borderRadius: 9, padding: '10px 14px', fontSize: '0.875rem',
              color: 'var(--color-text-primary,#e8e8ea)', outline: 'none', lineHeight: 1.6,
              fontFamily: 'inherit', transition: 'border-color 0.2s',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#4489c8'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--color-border,#2a2b3d)'; }}
          />
          <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--color-text-muted,#55556e)', marginTop: 4 }}>
            {form.message.length} / 2000
          </div>
        </div>

        {err && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            background: 'rgba(232,64,87,0.08)', border: '1px solid rgba(232,64,87,0.3)',
            borderRadius: 8, padding: '10px 12px', marginBottom: 14,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e84057" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ fontSize: '0.8rem', color: '#e84057', margin: 0, lineHeight: 1.5 }}>{err}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={sending}
          style={{
            width: '100%', padding: '11px', background: sending ? '#2d6ea8' : '#4489c8',
            color: '#fff', border: 'none', borderRadius: 9, fontSize: '0.9rem', fontWeight: 700,
            cursor: sending ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s, opacity 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {sending ? (
            <>
              <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
              전송 중...
            </>
          ) : '문의 전송'}
        </button>
      </form>
    </div>
  );
}
