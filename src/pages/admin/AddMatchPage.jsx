import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { fetchChampions, getChampionIconUrl } from '../../lib/ddragon';
import ChampionIcon from '../../components/common/ChampionIcon';

// 포지션 순서 고정
const POSITIONS = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
const POSITION_KO = { TOP: '탑', JUNGLE: '정글', MID: '미드', ADC: '원딜', SUPPORT: '서폿' };
const CURRENT_YEAR = new Date().getFullYear();

function emptyPlayer() {
  return { streamerId: '', streamerName: '', championId: '', position: '', kills: '', deaths: '', assists: '' };
}

/* 챔피언 선택 모달 */
function ChampionPickerModal({ champions, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const filtered = search
    ? champions.filter((c) => c.name.includes(search) || c.id.toLowerCase().includes(search.toLowerCase()))
    : champions;
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-bg-card border border-border rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex items-center gap-3">
          <input ref={inputRef} type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="챔피언 검색..."
            className="flex-1 bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted" />
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-lg leading-none">✕</button>
        </div>
        <div className="overflow-y-auto p-3 grid grid-cols-6 sm:grid-cols-8 gap-2">
          {filtered.map((c) => (
            <button key={c.id} onClick={() => { onSelect(c.id); onClose(); }}
              className="flex flex-col items-center gap-1 p-1 rounded-lg hover:bg-bg-hover transition-colors group" title={c.name}>
              <img src={getChampionIconUrl(c.id)} alt={c.name} width={44} height={44} className="rounded-md" loading="lazy" />
              <span className="text-[10px] text-text-muted group-hover:text-text-primary text-center leading-tight truncate w-full">{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* 스트리머 자동완성 입력 */
function StreamerInput({ value, streamerName, onChange, streamers }) {
  const [input, setInput] = useState(streamerName || '');
  const [suggestions, setSuggestions] = useState([]);
  const [show, setShow] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => { setInput(streamerName || ''); }, [streamerName]);

  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShow(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleInput(e) {
    const val = e.target.value;
    setInput(val);
    if (val.trim()) {
      const filtered = streamers.filter((s) => s.name.toLowerCase().includes(val.toLowerCase())).slice(0, 8);
      setSuggestions(filtered);
      setShow(true);
    } else {
      setSuggestions([]);
      setShow(false);
      onChange('', '');
    }
  }

  function select(s) {
    setInput(s.name);
    setShow(false);
    onChange(s.id, s.name);
  }

  return (
    <div ref={wrapRef} className="relative">
      <input type="text" value={input} onChange={handleInput} onFocus={() => input.trim() && suggestions.length > 0 && setShow(true)}
        placeholder="스트리머 검색..."
        className="w-full bg-bg-input border border-border rounded-lg px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted" />
      {show && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-0.5 bg-bg-card border border-border rounded-lg overflow-hidden shadow-xl z-40 max-h-48 overflow-y-auto">
          {suggestions.map((s) => (
            <button key={s.id} onClick={() => select(s)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-bg-hover transition-colors">
              <div className="w-6 h-6 rounded-full bg-bg-input border border-border overflow-hidden shrink-0">
                {s.profile_image_url ? (
                  <img src={s.profile_image_url} alt={s.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted text-xs font-bold">{s.name.charAt(0)}</div>
                )}
              </div>
              <span className="text-xs text-text-primary">{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* 개별 플레이어 입력 행 */
function PlayerRow({ idx, player, onChange, streamers, champions, onOpenChampionPicker }) {
  return (
    <div className="grid grid-cols-6 gap-2 items-center py-2 border-b border-border last:border-0">
      <span className="text-text-muted text-xs text-center">{idx + 1}</span>
      <StreamerInput
        value={player.streamerId}
        streamerName={player.streamerName}
        streamers={streamers}
        onChange={(id, name) => { onChange('streamerId', id); onChange('streamerName', name); }}
      />
      <button type="button" onClick={() => onOpenChampionPicker()}
        className="flex items-center gap-2 bg-bg-input border border-border rounded-lg px-2 py-1.5 hover:border-accent transition-colors">
        {player.championId ? (
          <>
            <ChampionIcon championId={player.championId} size={20} rounded="rounded-sm" />
            <span className="text-xs text-text-primary truncate">{player.championId}</span>
          </>
        ) : (
          <span className="text-xs text-text-muted">챔피언</span>
        )}
      </button>
      <select value={player.position} onChange={(e) => onChange('position', e.target.value)}
        className="bg-bg-input border border-border rounded-lg px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent">
        <option value="">포지션</option>
        {POSITIONS.map((p) => (
          <option key={p} value={p}>{POSITION_KO[p]}</option>
        ))}
      </select>
      <div className="flex gap-1 items-center col-span-2">
        {['kills', 'deaths', 'assists'].map((field, fi) => (
          <input key={field} type="number" min="0" value={player[field]} onChange={(e) => onChange(field, e.target.value)}
            placeholder={fi === 0 ? 'K' : fi === 1 ? 'D' : 'A'}
            className="w-full bg-bg-input border border-border rounded-md px-2 py-1.5 text-sm text-center text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted" />
        ))}
      </div>
    </div>
  );
}

export default function AddMatchPage() {
  const navigate = useNavigate();
  const [streamers, setStreamers] = useState([]);
  const [champions, setChampions] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [season, setSeason] = useState(CURRENT_YEAR);
  const [winningTeam, setWinningTeam] = useState(1);
  const [team1, setTeam1] = useState(Array.from({ length: 5 }, emptyPlayer));
  const [team2, setTeam2] = useState(Array.from({ length: 5 }, emptyPlayer));
  const [pickerTarget, setPickerTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('streamers').select('id, name, profile_image_url').order('name').then(({ data }) => setStreamers(data || []));
    fetchChampions().then(setChampions);
  }, []);

  function updatePlayer(teamNum, idx, field, value) {
    const setter = teamNum === 1 ? setTeam1 : setTeam2;
    setter((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const t1Valid = team1.some((p) => p.streamerId);
    const t2Valid = team2.some((p) => p.streamerId);
    if (!t1Valid || !t2Valid) { setError('각 팀에 최소 1명 이상의 스트리머를 선택해주세요.'); return; }
    setSaving(true);
    const { data: matchData, error: matchErr } = await supabase.from('matches').insert({ played_at: date, season }).select('id').single();
    if (matchErr) { setError('경기 저장 중 오류: ' + matchErr.message); setSaving(false); return; }
    const matchId = matchData.id;
    const participants = [];
    for (const [teamPlayers, teamNum] of [[team1, 1], [team2, 2]]) {
      for (const p of teamPlayers) {
        if (!p.streamerId) continue;
        participants.push({
          match_id: matchId, streamer_id: p.streamerId, team: teamNum,
          champion_id: p.championId || null, position: p.position || null,
          kills: parseInt(p.kills) || 0, deaths: parseInt(p.deaths) || 0, assists: parseInt(p.assists) || 0,
          result: teamNum === winningTeam ? 'WIN' : 'LOSS',
        });
      }
    }
    const { error: partErr } = await supabase.from('match_participants').insert(participants);
    if (partErr) { setError('참여자 저장 중 오류: ' + partErr.message); setSaving(false); return; }
    navigate('/admin');
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-bold text-text-primary mb-8">경기 추가</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-bg-card border border-border rounded-xl p-5 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">경기 날짜</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
              className="bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">시즌</label>
            <select value={season} onChange={(e) => setSeason(Number(e.target.value))}
              className="bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent">
              {[CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">승리팀</label>
            <div className="flex gap-2">
              {[1, 2].map((t) => (
                <button key={t} type="button" onClick={() => setWinningTeam(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${winningTeam === t ? 'bg-win text-white' : 'bg-bg-input border border-border text-text-secondary hover:text-text-primary'}`}>
                  {t}팀 승
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-2 px-5 text-xs text-text-muted">
          <span className="text-center">#</span>
          <span>스트리머</span>
          <span>챔피언</span>
          <span>포지션</span>
          <span className="col-span-2 text-center">K / D / A</span>
        </div>

        {/* 팀 1 */}
        <div className="bg-bg-card border border-win/30 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            <span className="text-win font-bold text-sm">1팀</span>
            {winningTeam === 1 && <span className="text-xs bg-win/20 text-win px-2 py-0.5 rounded-full">승리</span>}
          </div>
          <div className="px-5">
            {team1.map((p, i) => (
              <PlayerRow key={i} idx={i} player={p}
                onChange={(field, val) => updatePlayer(1, i, field, val)}
                streamers={streamers} champions={champions}
                onOpenChampionPicker={() => setPickerTarget({ team: 1, idx: i })} />
            ))}
          </div>
        </div>

        {/* 팀 2 */}
        <div className="bg-bg-card border border-loss/30 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            <span className="text-loss font-bold text-sm">2팀</span>
            {winningTeam === 2 && <span className="text-xs bg-win/20 text-win px-2 py-0.5 rounded-full">승리</span>}
          </div>
          <div className="px-5">
            {team2.map((p, i) => (
              <PlayerRow key={i} idx={i} player={p}
                onChange={(field, val) => updatePlayer(2, i, field, val)}
                streamers={streamers} champions={champions}
                onOpenChampionPicker={() => setPickerTarget({ team: 2, idx: i })} />
            ))}
          </div>
        </div>

        {error && <p className="text-loss text-sm bg-loss/10 border border-loss/30 rounded-lg px-4 py-3">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="px-8 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg font-semibold transition-colors disabled:opacity-50">
            {saving ? '저장 중...' : '경기 저장'}
          </button>
          <button type="button" onClick={() => navigate('/admin')}
            className="px-8 py-2.5 bg-bg-input border border-border text-text-secondary hover:text-text-primary rounded-lg transition-colors">
            취소
          </button>
        </div>
      </form>

      {pickerTarget && (
        <ChampionPickerModal champions={champions}
          onSelect={(champId) => updatePlayer(pickerTarget.team, pickerTarget.idx, 'championId', champId)}
          onClose={() => setPickerTarget(null)} />
      )}
    </div>
  );
}
