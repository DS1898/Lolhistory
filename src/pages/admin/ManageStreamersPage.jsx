import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const PAGE_SIZE = 15;

function emptyForm() {
  return { name: '', soop_url: '', profile_image_url: '' };
}

export default function ManageStreamersPage() {
  const [streamers, setStreamers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchStreamers(); }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    const result = q ? streamers.filter((s) => s.name.toLowerCase().includes(q)) : streamers;
    setFiltered(result);
    setPage(1);
  }, [search, streamers]);

  async function fetchStreamers() {
    const { data } = await supabase.from('streamers').select('*').order('name');
    setStreamers(data || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('스트리머 이름을 입력해주세요.'); return; }
    setSaving(true);
    if (editId) {
      const { error: err } = await supabase.from('streamers').update({
        name: form.name.trim(),
        soop_url: form.soop_url.trim() || null,
        profile_image_url: form.profile_image_url.trim() || null,
      }).eq('id', editId);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from('streamers').insert({
        name: form.name.trim(),
        soop_url: form.soop_url.trim() || null,
        profile_image_url: form.profile_image_url.trim() || null,
      });
      if (err) { setError(err.message); setSaving(false); return; }
    }
    setForm(emptyForm());
    setEditId(null);
    setSaving(false);
    fetchStreamers();
  }

  function startEdit(s) {
    setEditId(s.id);
    setForm({ name: s.name, soop_url: s.soop_url || '', profile_image_url: s.profile_image_url || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() { setEditId(null); setForm(emptyForm()); setError(''); }

  async function handleDelete(id) {
    if (!confirm('이 스트리머를 삭제하시겠습니까? 관련 경기 기록도 함께 삭제됩니다.')) return;
    await supabase.from('streamers').delete().eq('id', id);
    setStreamers((prev) => prev.filter((s) => s.id !== id));
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-bold text-text-primary mb-8">스트리머 관리</h1>

      {/* 추가/수정 폼 */}
      <div className="bg-bg-card border border-border rounded-xl p-5 mb-8">
        <h2 className="text-sm font-semibold text-text-primary mb-4">
          {editId ? '스트리머 수정' : '스트리머 추가'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">이름 *</label>
              <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="스트리머 닉네임"
                className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">SOOP URL</label>
              <input type="url" value={form.soop_url} onChange={(e) => setForm((f) => ({ ...f, soop_url: e.target.value }))}
                placeholder="https://www.sooplive.co.kr/..."
                className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">프로필 이미지 URL</label>
            <input type="url" value={form.profile_image_url} onChange={(e) => setForm((f) => ({ ...f, profile_image_url: e.target.value }))}
              placeholder="https://..."
              className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted" />
          </div>
          {error && <p className="text-loss text-sm">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
              {saving ? '저장 중...' : editId ? '수정' : '추가'}
            </button>
            {editId && (
              <button type="button" onClick={cancelEdit}
                className="px-5 py-2 bg-bg-input border border-border text-text-secondary hover:text-text-primary rounded-lg text-sm transition-colors">
                취소
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 검색 */}
      <div className="mb-4">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="스트리머 이름 검색..."
          className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted" />
      </div>

      {/* 스트리머 목록 */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">
            등록된 스트리머 ({filtered.length}명)
          </h2>
          {totalPages > 1 && (
            <span className="text-xs text-text-muted">{page} / {totalPages} 페이지</span>
          )}
        </div>

        {paginated.length === 0 ? (
          <p className="text-center py-10 text-text-muted text-sm">
            {search ? '검색 결과가 없습니다.' : '등록된 스트리머가 없습니다.'}
          </p>
        ) : (
          <div className="divide-y divide-border">
            {paginated.map((s) => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-3 hover:bg-bg-hover transition-colors">
                <div className="w-9 h-9 rounded-full bg-bg-input border border-border overflow-hidden shrink-0">
                  {s.profile_image_url ? (
                    <img src={s.profile_image_url} alt={s.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted font-bold text-sm">{s.name.charAt(0)}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{s.name}</p>
                  {s.soop_url && (
                    <a href={s.soop_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-text-muted hover:text-accent transition-colors truncate block">{s.soop_url}</a>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(s)}
                    className="text-xs text-text-secondary hover:text-text-primary transition-colors px-3 py-1 rounded-md hover:bg-bg-input">수정</button>
                  <button onClick={() => handleDelete(s.id)}
                    className="text-xs text-text-muted hover:text-loss transition-colors px-3 py-1 rounded-md hover:bg-loss/10">삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-border flex items-center justify-center gap-2">
            <button onClick={() => setPage(1)} disabled={page === 1}
              className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors">◀◀</button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1 text-xs text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors">◀</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .map((p, idx, arr) => (
                <>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span key={`ellipsis-${p}`} className="text-text-muted text-xs">...</span>}
                  <button key={p} onClick={() => setPage(p)}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${p === page ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary hover:bg-bg-input'}`}>
                    {p}
                  </button>
                </>
              ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1 text-xs text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors">▶</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
              className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors">▶▶</button>
          </div>
        )}
      </div>
    </div>
  );
}
