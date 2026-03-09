import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

function relDate(iso) {
  if (!iso) return '-';
  const days = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (days === 0) return '오늘';
  if (days < 7) return days + '일 전';
  if (days < 30) return Math.floor(days / 7) + '주 전';
  return new Date(iso).toLocaleDateString('ko-KR');
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [err, setErr] = useState('');

  const load = () => {
    setLoading(true);
    supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setInquiries(data || []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  async function toggleRead(inq) {
    await supabase.from('inquiries').update({ is_read: !inq.is_read }).eq('id', inq.id);
    load();
  }

  async function handleDelete(id) {
    if (!window.confirm('이 문의를 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('inquiries').delete().eq('id', id);
    if (error) { setErr(error.message); return; }
    load();
  }

  async function handleReply(inq) {
    const reply = (replyDrafts[inq.id] ?? '').trim();
    if (!reply) return;
    setSavingId(inq.id);
    const { error } = await supabase.from('inquiries').update({
      reply,
      replied_at: new Date().toISOString(),
      is_read: true,
    }).eq('id', inq.id);
    setSavingId(null);
    if (error) { setErr(error.message); return; }
    setReplyDrafts((prev) => { const next = { ...prev }; delete next[inq.id]; return next; });
    load();
  }

  async function handleDeleteReply(inq) {
    if (!window.confirm('답변을 삭제하시겠습니까?')) return;
    await supabase.from('inquiries').update({ reply: null, replied_at: null }).eq('id', inq.id);
    load();
  }

  function handleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
    const inq = inquiries.find((i) => i.id === id);
    if (inq && !inq.is_read && expandedId !== id) {
      supabase.from('inquiries').update({ is_read: true }).eq('id', id).then(load);
    }
  }

  const unread = inquiries.filter((i) => !i.is_read).length;
  const replied = inquiries.filter((i) => i.reply).length;

  // 문의 본문: content 또는 message 필드 둘 다 지원
  function getBody(inq) {
    return inq.content || inq.message || '';
  }

  return (
    <div style={{ maxWidth: 900 }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">문의 관리</h1>
          <p className="text-sm text-text-muted mt-1" style={{ display: 'flex', gap: 12 }}>
            <span>총 {inquiries.length}건</span>
            {unread > 0 && <span style={{ color: '#4489c8', fontWeight: 700 }}>미읽음 {unread}건</span>}
            {replied > 0 && <span style={{ color: '#22c55e', fontWeight: 700 }}>답변완료 {replied}건</span>}
          </p>
        </div>
      </div>

      {err && <p className="text-loss text-xs mb-4">{err}</p>}

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        {/* 테이블 헤더 */}
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 140px 90px 110px' }}
          className="px-4 py-3 border-b border-border text-xs font-semibold text-text-muted uppercase tracking-wide"
        >
          <span>이름 / 제목</span>
          <span>이메일</span>
          <span>상태</span>
          <span>액션</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div style={{ width: 28, height: 28, border: '3px solid #4489c8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
          </div>
        ) : inquiries.length === 0 ? (
          <p className="text-center py-12 text-text-muted text-sm">접수된 문의가 없습니다.</p>
        ) : inquiries.map((inq) => (
          <div key={inq.id} className="border-b border-border last:border-b-0">
            {/* 행 */}
            <div
              style={{ display: 'grid', gridTemplateColumns: '1fr 140px 90px 110px' }}
              className="px-4 py-3 items-center hover:bg-bg-hover transition-colors"
            >
              {/* 이름 + 제목 */}
              <button
                onClick={() => handleExpand(inq.id)}
                className="flex items-center gap-2 text-left group min-w-0"
              >
                <svg
                  width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className="text-text-muted shrink-0 transition-transform"
                  style={{ transform: expandedId === inq.id ? 'rotate(90deg)' : 'rotate(0)' }}
                >
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
                <div className="min-w-0">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {!inq.is_read && (
                      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#4489c8', flexShrink: 0 }} />
                    )}
                    <span className={`text-sm font-semibold truncate ${!inq.is_read ? 'text-text-primary' : 'text-text-secondary'}`}>
                      {inq.name}
                    </span>
                    {inq.reply && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.12)', borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>
                        답변완료
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted truncate mt-0.5">
                    {inq.title || getBody(inq)}
                  </p>
                </div>
              </button>

              {/* 이메일 */}
              <span className="text-xs text-text-muted truncate">
                {inq.email || '-'}
              </span>

              {/* 읽음 토글 */}
              <button
                onClick={() => toggleRead(inq)}
                className={`text-xs font-semibold px-2 py-1 rounded-full w-fit transition-colors ${
                  !inq.is_read
                    ? 'bg-win/15 text-win'
                    : 'bg-bg-input text-text-muted border border-border'
                }`}
              >
                {!inq.is_read ? '미읽음' : '읽음'}
              </button>

              {/* 액션 버튼 */}
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleExpand(inq.id)}
                  className="px-2.5 py-1 text-xs bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 rounded-md transition-colors"
                >
                  {expandedId === inq.id ? '닫기' : '답변'}
                </button>
                <button
                  onClick={() => handleDelete(inq.id)}
                  className="px-2.5 py-1 text-xs bg-bg-input border border-border text-text-secondary hover:text-loss hover:border-loss/50 rounded-md transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>

            {/* 아코디언 상세 */}
            {expandedId === inq.id && (
              <div style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid var(--border-clr)', padding: '16px 20px 20px 44px' }}>

                {/* 문의자 정보 */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-lo)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>이름</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-hi)', margin: '2px 0 0', fontWeight: 600 }}>{inq.name}</p>
                  </div>
                  {inq.email && (
                    <div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-lo)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>이메일</span>
                      <p style={{ fontSize: '0.85rem', color: '#4489c8', margin: '2px 0 0' }}>
                        <a href={`mailto:${inq.email}`} style={{ color: '#4489c8', textDecoration: 'none' }}>{inq.email}</a>
                      </p>
                    </div>
                  )}
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-lo)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>등록일</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-mid)', margin: '2px 0 0' }}>
                      {new Date(inq.created_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>

                {/* 제목 */}
                {inq.title && (
                  <div style={{ marginBottom: 10 }}>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-lo)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>제목</p>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-hi)', margin: 0 }}>{inq.title}</p>
                  </div>
                )}

                {/* 문의 내용 */}
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-lo)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>문의 내용</p>
                  <p style={{
                    fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--text-mid)',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0,
                    padding: '10px 14px', background: 'var(--bg-input)',
                    borderRadius: 8, border: '1px solid var(--border-clr)',
                  }}>
                    {getBody(inq)}
                  </p>
                </div>

                {/* 기존 답변 표시 */}
                {inq.reply && !(inq.id in replyDrafts) && (
                  <div style={{ marginBottom: 14 }}>
                    <p style={{ fontSize: '0.68rem', color: '#22c55e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                      답변완료 · {relDate(inq.replied_at)}
                    </p>
                    <p style={{
                      fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--text-mid)',
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0,
                      padding: '10px 14px', background: 'rgba(34,197,94,0.06)',
                      borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)',
                    }}>
                      {inq.reply}
                    </p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button
                        onClick={() => setReplyDrafts((prev) => ({ ...prev, [inq.id]: inq.reply }))}
                        style={{ fontSize: '0.75rem', padding: '5px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-clr)', borderRadius: 7, color: 'var(--text-mid)', cursor: 'pointer' }}
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteReply(inq)}
                        style={{ fontSize: '0.75rem', padding: '5px 12px', background: 'transparent', border: '1px solid rgba(232,64,87,0.3)', borderRadius: 7, color: '#e84057', cursor: 'pointer' }}
                      >
                        답변 삭제
                      </button>
                    </div>
                  </div>
                )}

                {/* 답변 입력 폼 */}
                {(!inq.reply || inq.id in replyDrafts) && (
                  <div>
                    <p style={{ fontSize: '0.68rem', color: '#4489c8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                      {inq.reply ? '답변 수정' : '답변 작성'}
                    </p>
                    <textarea
                      rows={4}
                      value={replyDrafts[inq.id] ?? ''}
                      onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [inq.id]: e.target.value }))}
                      placeholder="답변 내용을 입력하세요..."
                      style={{
                        width: '100%', boxSizing: 'border-box', resize: 'vertical',
                        background: 'var(--bg-input)', border: '1px solid rgba(68,137,200,0.4)',
                        borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem',
                        color: 'var(--text-hi)', outline: 'none', lineHeight: 1.7, fontFamily: 'inherit',
                      }}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button
                        onClick={() => handleReply(inq)}
                        disabled={savingId === inq.id || !(replyDrafts[inq.id] ?? '').trim()}
                        style={{
                          padding: '7px 18px', background: '#4489c8', color: '#fff',
                          border: 'none', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700,
                          cursor: (savingId === inq.id || !(replyDrafts[inq.id] ?? '').trim()) ? 'not-allowed' : 'pointer',
                          opacity: (savingId === inq.id || !(replyDrafts[inq.id] ?? '').trim()) ? 0.5 : 1,
                          transition: 'opacity 0.2s',
                        }}
                      >
                        {savingId === inq.id ? '저장 중...' : '답변 저장'}
                      </button>
                      {inq.id in replyDrafts && (
                        <button
                          onClick={() => setReplyDrafts((prev) => { const next = { ...prev }; delete next[inq.id]; return next; })}
                          style={{ padding: '7px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-clr)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-mid)', cursor: 'pointer' }}
                        >
                          취소
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
