import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

// 입력 필드 컴포넌트
function Field({ label, required, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: '0.8rem', fontWeight: 600,
        color: 'var(--text-mid)', letterSpacing: '0.02em',
      }}>
        {label}
        {required && <span style={{ color: '#e84057', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: '0.72rem', color: '#e84057' }}>{error}</span>
      )}
    </div>
  );
}

const inputStyle = (hasError) => ({
  width: '100%', boxSizing: 'border-box',
  background: 'var(--bg-input)',
  border: `1px solid ${hasError ? '#e84057' : 'var(--border-clr)'}`,
  borderRadius: 10, padding: '0.7rem 1rem',
  color: 'var(--text-hi)', fontSize: '0.9rem',
  outline: 'none', fontFamily: 'inherit',
  transition: 'border-color 0.2s',
});

export default function ContactPage() {
  const { t } = useApp();

  const [form, setForm] = useState({ name: '', email: '', title: '', content: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [serverError, setServerError] = useState('');

  function validate() {
    const e = {};
    if (!form.name.trim())    e.name    = '이름을 입력해주세요.';
    if (!form.email.trim())   e.email   = '이메일을 입력해주세요.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                              e.email   = '올바른 이메일 형식이 아닙니다.';
    if (!form.title.trim())   e.title   = '제목을 입력해주세요.';
    if (!form.content.trim()) e.content = '내용을 입력해주세요.';
    else if (form.content.trim().length < 10)
                              e.content = '내용을 10자 이상 입력해주세요.';
    return e;
  }

  function handleChange(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    // 클라이언트 검증
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setStatus('loading');

    try {
      const { error } = await supabase.from('inquiries').insert({
        name:    form.name.trim(),
        email:   form.email.trim(),
        title:   form.title.trim(),
        content: form.content.trim(),
      });

      if (error) {
        console.error('[문의 전송 오류]', error);
        setServerError('오류가 발생했습니다. 다시 시도해주세요.');
        setStatus('error');
        return;
      }

      setStatus('success');
      setForm({ name: '', email: '', title: '', content: '' });

    } catch (err) {
      console.error('[문의 전송 오류]', err);
      setServerError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setStatus('error');
    }
  }

  // ── 성공 화면 ────────────────────────────────
  if (status === 'success') {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '5rem 1.5rem', textAlign: 'center' }}>
        {/* 체크 아이콘 */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(68,137,200,0.1)', border: '2px solid rgba(68,137,200,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4489c8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-hi)', marginBottom: '0.75rem' }}>
          문의가 접수되었습니다
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: '2rem' }}>
          소중한 의견 감사합니다.<br />
          빠른 시일 내에 입력하신 이메일로 답변 드리겠습니다.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setStatus('idle')}
            style={{
              padding: '0.6rem 1.4rem', borderRadius: 10,
              background: 'rgba(68,137,200,0.12)', border: '1px solid rgba(68,137,200,0.3)',
              color: '#4489c8', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
            }}>
            추가 문의하기
          </button>
          <Link to="/" style={{
            padding: '0.6rem 1.4rem', borderRadius: 10,
            background: '#4489c8', border: '1px solid #4489c8',
            color: '#fff', fontSize: '0.875rem', fontWeight: 600,
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
          }}>
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // ── 문의 폼 ──────────────────────────────────
  const isLoading = status === 'loading';

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-hi)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          문의하기
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.7 }}>
          SOOP Tracker에 대한 의견, 오류 제보, 기능 제안 등을 자유롭게 남겨주세요.
        </p>
      </div>

      {/* 폼 카드 */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-clr)',
        borderRadius: 16, padding: '2rem',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* 이름 + 이메일 (가로 배치) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="이름" required error={errors.name}>
              <input
                type="text" value={form.name}
                onChange={handleChange('name')}
                placeholder="홍길동"
                maxLength={50}
                style={inputStyle(!!errors.name)}
                onFocus={(e) => { e.target.style.borderColor = '#4489c8'; }}
                onBlur={(e)  => { e.target.style.borderColor = errors.name ? '#e84057' : 'var(--border-clr)'; }}
              />
            </Field>

            <Field label="이메일" required error={errors.email}>
              <input
                type="email" value={form.email}
                onChange={handleChange('email')}
                placeholder="example@email.com"
                maxLength={100}
                style={inputStyle(!!errors.email)}
                onFocus={(e) => { e.target.style.borderColor = '#4489c8'; }}
                onBlur={(e)  => { e.target.style.borderColor = errors.email ? '#e84057' : 'var(--border-clr)'; }}
              />
            </Field>
          </div>

          {/* 제목 */}
          <Field label="제목" required error={errors.title}>
            <input
              type="text" value={form.title}
              onChange={handleChange('title')}
              placeholder="문의 제목을 입력해주세요"
              maxLength={100}
              style={inputStyle(!!errors.title)}
              onFocus={(e) => { e.target.style.borderColor = '#4489c8'; }}
              onBlur={(e)  => { e.target.style.borderColor = errors.title ? '#e84057' : 'var(--border-clr)'; }}
            />
          </Field>

          {/* 내용 */}
          <Field label="내용" required error={errors.content}>
            <textarea
              value={form.content}
              onChange={handleChange('content')}
              placeholder="문의 내용을 자세히 작성해주세요. (최소 10자)"
              maxLength={2000}
              rows={6}
              style={{
                ...inputStyle(!!errors.content),
                resize: 'vertical', minHeight: 120,
              }}
              onFocus={(e) => { e.target.style.borderColor = '#4489c8'; }}
              onBlur={(e)  => { e.target.style.borderColor = errors.content ? '#e84057' : 'var(--border-clr)'; }}
            />
            <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-lo)', marginTop: 2 }}>
              {form.content.length} / 2000
            </div>
          </Field>

          {/* 서버 에러 */}
          {serverError && (
            <div style={{
              background: 'rgba(232,64,87,0.08)', border: '1px solid rgba(232,64,87,0.3)',
              borderRadius: 10, padding: '0.75rem 1rem',
              color: '#e84057', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {serverError}
            </div>
          )}

          {/* 제출 버튼 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '0.75rem 2rem', borderRadius: 10,
                background: isLoading ? 'rgba(68,137,200,0.5)' : 'linear-gradient(135deg, #4489c8, #2d6ea8)',
                border: 'none', color: '#fff', fontSize: '0.9rem', fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: isLoading ? 'none' : '0 4px 16px rgba(68,137,200,0.35)',
                transition: 'opacity 0.2s',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              {isLoading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                    <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
                  </svg>
                  전송 중...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  문의 제출
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
