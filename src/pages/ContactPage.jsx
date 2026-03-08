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
    setSending(true); setErr('');
    const { error } = await supabase.from('inquiries').insert({
      name: form.name.trim(),
      message: form.message.trim(),
      is_read: false,
    });
    setSending(false);
    if (error) { setErr('전송 중 오류가 발생했습니다. 다시 시도해주세요.'); return; }
    setDone(true);
  }

  if (done) {
    return (
      <div style={{ maxWidth: 560, margin: '80px auto', padding: '0 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary,#e8e8ea)', marginBottom: 8 }}>
          문의가 접수되었습니다
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted,#55556e)' }}>
          내용을 확인 후 답변 드리겠습니다.
        </p>
        <button
          onClick={() => { setForm({ name: '', message: '' }); setDone(false); }}
          style={{ marginTop: 24, padding: '9px 24px', background: '#4489c8', color: '#fff', border: 'none', borderRadius: 9, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
        >
          새 문의 작성
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: '48px auto', padding: '0 16px' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary,#e8e8ea)', marginBottom: 6 }}>문의하기</h1>
      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted,#55556e)', marginBottom: 28 }}>
        오류 제보, 스트리머 등록 요청 등 문의사항을 남겨주세요.
      </p>

      <form onSubmit={handleSubmit}
        style={{ background: 'var(--color-bg-card,#13141f)', border: '1px solid var(--color-border,#2a2b3d)', borderRadius: 14, padding: '28px 28px 24px' }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary,#b0b0c0)', marginBottom: 6 }}>
            이름 *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="닉네임 또는 이름"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'var(--color-bg-input,#1a1b2e)', border: '1px solid var(--color-border,#2a2b3d)',
              borderRadius: 9, padding: '10px 14px', fontSize: '0.875rem',
              color: 'var(--color-text-primary,#e8e8ea)', outline: 'none',
            }}
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
            rows={5}
            style={{
              width: '100%', boxSizing: 'border-box', resize: 'none',
              background: 'var(--color-bg-input,#1a1b2e)', border: '1px solid var(--color-border,#2a2b3d)',
              borderRadius: 9, padding: '10px 14px', fontSize: '0.875rem',
              color: 'var(--color-text-primary,#e8e8ea)', outline: 'none', lineHeight: 1.6,
            }}
          />
        </div>

        {err && (
          <p style={{ fontSize: '0.8rem', color: '#e84057', marginBottom: 14 }}>{err}</p>
        )}

        <button
          type="submit"
          disabled={sending}
          style={{
            width: '100%', padding: '11px', background: '#4489c8', color: '#fff',
            border: 'none', borderRadius: 9, fontSize: '0.9rem', fontWeight: 700,
            cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.6 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {sending ? '전송 중...' : '문의 전송'}
        </button>
      </form>
    </div>
  );
}
