import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-clr)', borderRadius: 14, padding: '1.5rem', maxWidth: 360, width: '100%', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-hi)', marginBottom: '1.25rem', whiteSpace: 'pre-line' }}>{message}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '0.45rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border-clr)', borderRadius: 8, color: 'var(--text-mid)', fontSize: '0.82rem', cursor: 'pointer' }}>취소</button>
          <button onClick={onConfirm} style={{ padding: '0.45rem 1rem', background: '#e84057', border: 'none', borderRadius: 8, color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>삭제</button>
        </div>
      </div>
    </div>
  );
}

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState([]);
  const [newYear, setNewYear] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null);

  async function fetchSeasons() {
    const { data } = await supabase.from('seasons').select('*').order('year', { ascending: false });
    setSeasons(data || []);
    setLoading(false);
  }

  useEffect(() => {
    async function init() { await fetchSeasons(); }
    init();
  }, []);

  async function handleAdd(e) {
    e.preventDefault(); setError('');
    if (!newYear) { setError('연도를 입력하세요.'); return; }
    setSaving(true);
    const { error: err } = await supabase.from('seasons').insert({
      year: parseInt(newYear),
      label: newLabel || `${newYear}시즌`,
      is_active: true,
    });
    if (err) { setError(err.code === '23505' ? '이미 등록된 시즌입니다.' : '저장 중 오류가 발생했습니다.'); setSaving(false); return; }
    setNewYear(''); setNewLabel('');
    fetchSeasons();
    setSaving(false);
  }

  async function toggleActive(id, current) {
    const { error: err } = await supabase.from('seasons').update({ is_active: !current }).eq('id', id);
    if (err) { setError('상태 변경 중 오류가 발생했습니다.'); return; }
    setSeasons((prev) => prev.map((s) => s.id === id ? { ...s, is_active: !current } : s));
  }

  async function deleteSeason(id) {
    const { error: err } = await supabase.from('seasons').delete().eq('id', id);
    if (err) { setError('삭제 중 오류가 발생했습니다.'); return; }
    setSeasons((prev) => prev.filter((s) => s.id !== id));
  }

  const inputStyle = {
    background: 'var(--bg-input)', border: '1px solid var(--border-clr)', borderRadius: 10,
    padding: '0.5rem 0.75rem', color: 'var(--text-hi)', fontSize: '0.875rem', outline: 'none',
  };

  return (
    <div style={{ maxWidth: 600 }}>
      {confirmTarget && (
        <ConfirmModal
          message={`${confirmTarget.year}시즌을 삭제하시겠습니까?\n(실제 경기 데이터는 삭제되지 않습니다)`}
          onConfirm={() => { deleteSeason(confirmTarget.id); setConfirmTarget(null); }}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-hi)', marginBottom: '0.5rem' }}>시즌 관리</h1>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-lo)', marginBottom: '2rem' }}>
        활성화된 시즌만 스트리머 전적 페이지에 표시됩니다.
      </p>

      {/* 추가 폼 */}
      <form onSubmit={handleAdd} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-clr)', borderRadius: 14, padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-mid)', marginBottom: 5 }}>연도 *</label>
          <input type="number" value={newYear} onChange={(e) => setNewYear(e.target.value)}
            placeholder="2027" min="2020" max="2099" style={{ ...inputStyle, width: 100 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-mid)', marginBottom: 5 }}>라벨 (선택)</label>
          <input type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
            placeholder="2027시즌" style={{ ...inputStyle, width: 140 }} />
        </div>
        <button type="submit" disabled={saving} style={{
          background: '#4489c8', border: 'none', borderRadius: 10, padding: '0.55rem 1.25rem',
          color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', opacity: saving ? 0.6 : 1,
        }}>+ 시즌 추가</button>
      </form>

      {error && <p style={{ color: '#e84057', fontSize: '0.82rem', marginBottom: '1rem', background: 'rgba(232,64,87,0.1)', border: '1px solid rgba(232,64,87,0.3)', borderRadius: 10, padding: '0.5rem 0.75rem' }}>{error}</p>}

      {/* 시즌 목록 */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-clr)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-clr)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-lo)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>등록된 시즌</span>
        </div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-lo)', fontSize: '0.85rem' }}>불러오는 중...</div>
        ) : seasons.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-lo)', fontSize: '0.85rem' }}>등록된 시즌이 없습니다.</div>
        ) : seasons.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.25rem', borderBottom: i < seasons.length - 1 ? '1px solid var(--border-clr)' : 'none', transition: 'background 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-hi)' }}>{s.year}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-lo)' }}>{s.label}</span>
              <span style={{
                fontSize: '0.68rem', fontWeight: 700, padding: '1px 8px', borderRadius: 20,
                background: s.is_active ? 'rgba(68,137,200,0.2)' : 'var(--bg-hover)',
                color: s.is_active ? '#4489c8' : 'var(--text-lo)',
              }}>{s.is_active ? '활성' : '비활성'}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => toggleActive(s.id, s.is_active)} style={{
                background: s.is_active ? 'rgba(232,64,87,0.1)' : 'rgba(68,137,200,0.1)',
                border: `1px solid ${s.is_active ? 'rgba(232,64,87,0.3)' : 'rgba(68,137,200,0.3)'}`,
                borderRadius: 8, padding: '0.3rem 0.7rem',
                color: s.is_active ? '#e84057' : '#4489c8',
                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
              }}>{s.is_active ? '비활성화' : '활성화'}</button>
              <button onClick={() => setConfirmTarget({ id: s.id, year: s.year })} style={{
                background: 'transparent', border: '1px solid var(--border-clr)',
                borderRadius: 8, padding: '0.3rem 0.7rem',
                color: 'var(--text-lo)', fontSize: '0.75rem', cursor: 'pointer',
                transition: 'color 0.2s, border-color 0.2s',
              }}
                onMouseEnter={(e) => { e.target.style.color = '#e84057'; e.target.style.borderColor = 'rgba(232,64,87,0.3)'; }}
                onMouseLeave={(e) => { e.target.style.color = 'var(--text-lo)'; e.target.style.borderColor = 'var(--border-clr)'; }}>
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
