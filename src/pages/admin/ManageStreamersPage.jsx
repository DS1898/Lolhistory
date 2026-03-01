import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

const PAGE_SIZE   = 15;
const BUCKET_NAME = 'streamer-images';

function emptyForm() {
  return { name: '', soop_url: '', profile_image_url: '' };
}

/* ── 이미지 업로더 컴포넌트 ── */
function ImageUploader({ currentUrl, onUploadDone }) {
  const [uploading, setUploading]     = useState(false);
  const [preview, setPreview]         = useState(currentUrl || '');
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { setPreview(currentUrl || ''); }, [currentUrl]);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('파일 크기는 5MB 이하여야 합니다.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setUploadError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setUploadError('');
    setUploading(true);
    setPreview(URL.createObjectURL(file)); // 즉시 미리보기

    const ext      = file.name.split('.').pop();
    const fileName = `${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, { upsert: false, cacheControl: '3600' });

    if (error) {
      setUploadError(`업로드 실패: ${error.message}`);
      setPreview(currentUrl || '');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    setPreview(publicUrl);
    onUploadDone(publicUrl);
    setUploading(false);
  }

  function handleRemove() {
    setPreview('');
    onUploadDone('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.75rem', color: '#8b8b9e', marginBottom: 8 }}>
        프로필 이미지
      </label>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* 원형 미리보기 */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
          background: '#1c1d28', border: '2px dashed #2a2b3d',
          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          {preview ? (
            <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#55556e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          )}
          {uploading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4489c8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
              </svg>
            </div>
          )}
        </div>

        {/* 버튼 + 안내 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.45rem 1rem', borderRadius: 8,
              background: 'rgba(68,137,200,0.12)',
              border: '1px solid rgba(68,137,200,0.3)',
              color: '#4489c8', fontSize: '0.8rem', fontWeight: 600,
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.6 : 1, transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { if (!uploading) e.currentTarget.style.background = 'rgba(68,137,200,0.22)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(68,137,200,0.12)'; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {uploading ? '업로드 중...' : preview ? '이미지 변경' : '이미지 업로드'}
          </button>

          {preview && !uploading && (
            <button
              type="button"
              onClick={handleRemove}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0.45rem 1rem', borderRadius: 8,
                background: 'rgba(232,64,87,0.08)',
                border: '1px solid rgba(232,64,87,0.2)',
                color: '#e84057', fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(232,64,87,0.16)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(232,64,87,0.08)'; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              이미지 제거
            </button>
          )}

          <p style={{ fontSize: '0.68rem', color: '#55556e', margin: 0 }}>
            JPG · PNG · WEBP · 최대 5MB
          </p>
        </div>
      </div>

      {uploadError && (
        <p style={{ fontSize: '0.75rem', color: '#e84057', marginTop: 8 }}>{uploadError}</p>
      )}

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ── 메인 페이지 ── */
export default function ManageStreamersPage() {
  const [streamers, setStreamers] = useState([]);
  const [form, setForm]           = useState(emptyForm());
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);

  async function fetchStreamers() {
    const { data } = await supabase.from('streamers').select('*').order('name');
    setStreamers(data || []);
  }

  useEffect(() => { fetchStreamers(); }, []);

  const filtered   = search.trim()
    ? streamers.filter((s) => s.name.toLowerCase().includes(search.trim().toLowerCase()))
    : streamers;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('스트리머 이름을 입력해주세요.'); return; }
    setSaving(true);

    const payload = {
      name:              form.name.trim(),
      soop_url:          form.soop_url.trim() || null,
      profile_image_url: form.profile_image_url || null,
    };

    if (editId) {
      const { error: err } = await supabase.from('streamers').update(payload).eq('id', editId);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from('streamers').insert(payload);
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
    if (!confirm('이 스트리머를 삭제하시겠습니까?')) return;
    const { error: err } = await supabase.from('streamers').delete().eq('id', id);
    if (err) { setError(err.message); return; }
    setStreamers((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-bold text-text-primary mb-8">스트리머 관리</h1>

      {/* 추가/수정 폼 */}
      <div className="bg-bg-card border border-border rounded-xl p-5 mb-8">
        <h2 className="text-sm font-semibold text-text-primary mb-5">
          {editId ? '스트리머 수정' : '스트리머 추가'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">이름 *</label>
              <input
                type="text" value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="스트리머 닉네임"
                className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">SOOP URL</label>
              <input
                type="url" value={form.soop_url}
                onChange={(e) => setForm((f) => ({ ...f, soop_url: e.target.value }))}
                placeholder="https://www.sooplive.co.kr/..."
                className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted"
              />
            </div>
          </div>

          {/* ✅ 이미지 업로더 */}
          <div style={{ background: '#1c1d28', borderRadius: 12, padding: '1rem 1.25rem', border: '1px solid #2a2b3d' }}>
            <ImageUploader
              currentUrl={form.profile_image_url}
              onUploadDone={(url) => setForm((f) => ({ ...f, profile_image_url: url }))}
            />
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
        <input
          type="text" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="스트리머 이름 검색..."
          className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted"
        />
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
                    <div className="w-full h-full flex items-center justify-center text-text-muted font-bold text-sm">
                      {s.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{s.name}</p>
                  {s.soop_url && (
                    <a href={s.soop_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-text-muted hover:text-accent transition-colors truncate block">
                      {s.soop_url}
                    </a>
                  )}
                  {/* 이미지 출처 뱃지 */}
                  {s.profile_image_url && (
                    <p style={{ fontSize: '0.65rem', marginTop: 2, color: s.profile_image_url.includes('supabase') ? '#4489c8' : '#e84057', fontWeight: 600 }}>
                      {s.profile_image_url.includes('supabase') ? '✓ Storage 업로드' : '⚠ 외부 URL — 수정 권장'}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(s)}
                    className="text-xs text-text-secondary hover:text-text-primary transition-colors px-3 py-1 rounded-md hover:bg-bg-input">
                    수정
                  </button>
                  <button onClick={() => handleDelete(s.id)}
                    className="text-xs text-text-muted hover:text-loss transition-colors px-3 py-1 rounded-md hover:bg-loss/10">
                    삭제
                  </button>
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
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span key={`e-${p}`} className="text-text-muted text-xs">...</span>
                  )}
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
