import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const emptyForm = { title: '', content: '', is_active: true, sort_order: 0 };

function relDate(iso) {
  if (!iso) return '-';
  const days = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (days === 0) return '오늘';
  if (days < 7) return days + '일 전';
  if (days < 30) return Math.floor(days / 7) + '주 전';
  return new Date(iso).toLocaleDateString('ko-KR');
}

export default function NoticesAdminPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const load = () => {
    setLoading(true);
    supabase.from('notices').select('*').order('sort_order', { ascending: true })
      .then(({ data }) => { setNotices(data || []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  function openAdd() { setEditId(null); setForm(emptyForm); setErr(''); setShowForm(true); }
  function openEdit(n) { setEditId(n.id); setForm({ title: n.title, content: n.content, is_active: n.is_active, sort_order: n.sort_order }); setErr(''); setShowForm(true); }

  async function handleSave() {
    if (!form.title.trim()) { setErr('제목을 입력해주세요.'); return; }
    if (!form.content.trim()) { setErr('내용을 입력해주세요.'); return; }
    setSaving(true);
    const payload = { title: form.title.trim(), content: form.content.trim(), is_active: form.is_active, sort_order: Number(form.sort_order) || 0, updated_at: new Date().toISOString() };
    const { error } = editId
      ? await supabase.from('notices').update(payload).eq('id', editId)
      : await supabase.from('notices').insert(payload);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    setShowForm(false); setEditId(null); load();
  }

  async function handleDelete(id) {
    if (!window.confirm('이 공지사항을 삭제하시겠습니까?')) return;
    await supabase.from('notices').delete().eq('id', id);
    load();
  }

  async function toggleActive(n) {
    await supabase.from('notices').update({ is_active: !n.is_active }).eq('id', n.id);
    load();
  }

  return (
    <div style={{ maxWidth: 860 }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">공지사항 관리</h1>
          <p className="text-sm text-text-muted mt-1">배너에 노출될 공지사항을 관리합니다.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-semibold transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          공지 추가
        </button>
      </div>

      {/* 추가/수정 폼 */}
      {showForm && (
        <div className="bg-bg-card border border-border rounded-xl p-5 mb-6">
          <h2 className="text-sm font-bold text-text-primary mb-4">{editId ? '공지 수정' : '새 공지 추가'}</h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-text-secondary mb-1">제목 *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted"
                  placeholder="공지 제목을 입력하세요" />
              </div>
              <div style={{ width: 100 }}>
                <label className="block text-xs text-text-secondary mb-1">노출 순서</label>
                <input type="number" min="0" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">내용 *</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent resize-none"
                rows={5} placeholder="공지 내용을 입력하세요" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-accent" />
              <label htmlFor="is_active" className="text-sm text-text-secondary cursor-pointer">배너 노출 활성화</label>
            </div>
          </div>
          {err && <p className="text-loss text-xs mt-3">{err}</p>}
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
              {saving ? '저장 중...' : editId ? '수정 저장' : '추가'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 bg-bg-input border border-border text-text-secondary hover:text-text-primary rounded-lg text-sm transition-colors">
              취소
            </button>
          </div>
        </div>
      )}

      {/* 목록 */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        {/* 테이블 헤더 */}
        <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr 110px 72px 120px' }} className="px-4 py-3 border-b border-border text-xs font-semibold text-text-muted uppercase tracking-wide">
          <span>순서</span><span>제목</span><span>등록일</span><span>상태</span><span>액션</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div style={{ width: 28, height: 28, border: '3px solid #4489c8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
          </div>
        ) : notices.length === 0 ? (
          <p className="text-center py-12 text-text-muted text-sm">등록된 공지사항이 없습니다. 위 버튼으로 추가하세요.</p>
        ) : notices.map((n) => (
          <div key={n.id} className="border-b border-border last:border-b-0">
            {/* 행 */}
            <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr 110px 72px 120px' }} className="px-4 py-3 items-center hover:bg-bg-hover transition-colors">
              <span className="text-sm text-text-muted">{n.sort_order}</span>

              {/* 제목 + 아코디언 토글 */}
              <button onClick={() => setExpandedId(expandedId === n.id ? null : n.id)}
                className="flex items-center gap-2 text-left group min-w-0">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className="text-text-muted shrink-0 transition-transform"
                  style={{ transform: expandedId === n.id ? 'rotate(90deg)' : 'rotate(0)' }}>
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
                <span className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors truncate">{n.title}</span>
              </button>

              <span className="text-xs text-text-muted">{relDate(n.created_at)}</span>

              <button onClick={() => toggleActive(n)}
                className={`text-xs font-semibold px-2 py-1 rounded-full w-fit transition-colors ${n.is_active ? 'bg-win/15 text-win' : 'bg-bg-input text-text-muted border border-border'}`}>
                {n.is_active ? '노출' : '숨김'}
              </button>

              <div className="flex gap-1.5">
                <button onClick={() => openEdit(n)} className="px-2.5 py-1 text-xs bg-bg-input border border-border text-text-secondary hover:text-text-primary hover:border-accent rounded-md transition-colors">수정</button>
                <button onClick={() => handleDelete(n.id)} className="px-2.5 py-1 text-xs bg-bg-input border border-border text-text-secondary hover:text-loss hover:border-loss/50 rounded-md transition-colors">삭제</button>
              </div>
            </div>

            {/* 아코디언 내용 */}
            {expandedId === n.id && (
              <div style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid var(--color-border,#2a2b3d)', padding: '14px 20px 14px 50px' }}>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--color-text-secondary,#b0b0c0)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                  {n.content}
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted,#55556e)', marginTop: 10 }}>
                  {`등록: ${new Date(n.created_at).toLocaleString('ko-KR')}`}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
