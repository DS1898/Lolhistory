import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { fetchChampions, getChampionIconUrl } from '../../lib/ddragon';
import ChampionIcon from '../../components/common/ChampionIcon';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const POSITIONS = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
const POSITION_KO = { TOP: '탑', JUNGLE: '정글', MID: '미드', ADC: '원딜', SUPPORT: '서폿' };
const CURRENT_YEAR = new Date().getFullYear();

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
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-lg">✕</button>
        </div>
        <div className="overflow-y-auto p-3 grid grid-cols-6 sm:grid-cols-8 gap-2">
          {filtered.map((c) => (
            <button key={c.id} onClick={() => { onSelect(c.id); onClose(); }}
              className="flex flex-col items-center gap-1 p-1 rounded-lg hover:bg-bg-hover transition-colors group" title={c.name}>
              <img src={getChampionIconUrl(c.id)} alt={c.name} width={44} height={44} className="rounded-md" loading="lazy" />
              <span className="text-[10px] text-text-muted group-hover:text-text-primary text-center truncate w-full">{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

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
      setSuggestions(streamers.filter((s) => s.name.toLowerCase().includes(val.toLowerCase())).slice(0, 8));
      setShow(true);
    } else {
      setSuggestions([]); setShow(false); onChange('', '');
    }
  }

  function select(s) { setInput(s.name); setShow(false); onChange(s.id, s.name); }

  return (
    <div ref={wrapRef} className="relative">
      <input type="text" value={input} onChange={handleInput}
        placeholder="스트리머 검색..."
        className="w-full bg-bg-input border border-border rounded-lg px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted" />
      {show && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-0.5 bg-bg-card border border-border rounded-lg overflow-hidden shadow-xl z-40 max-h-40 overflow-y-auto">
          {suggestions.map((s) => (
            <button key={s.id} onClick={() => select(s)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-bg-hover transition-colors">
              <div className="w-6 h-6 rounded-full bg-bg-input border border-border overflow-hidden shrink-0">
                {s.profile_image_url
                  ? <img src={s.profile_image_url} alt={s.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-text-muted text-xs font-bold">{s.name.charAt(0)}</div>}
              </div>
              <span className="text-xs text-text-primary">{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PlayerRow({ idx, player, onChange, streamers, champions, onOpenChampionPicker }) {
  const pos = POSITIONS[idx];
  return (
    <div className="grid grid-cols-6 gap-2 items-center py-2 border-b border-border last:border-0">
      <span className="text-center">
        <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: '#2a2b3d', color: '#8b8b9e' }}>
          {POSITION_KO[pos]}
        </span>
      </span>
      <StreamerInput value={player.streamerId} streamerName={player.streamerName} streamers={streamers}
        onChange={(id, name) => { onChange('streamerId', id); onChange('streamerName', name); }} />
      <button type="button" onClick={() => onOpenChampionPicker()}
        className="flex items-center gap-2 bg-bg-input border border-border rounded-lg px-2 py-1.5 hover:border-accent transition-colors">
        {player.championId ? (
          <><ChampionIcon championId={player.championId} size={20} rounded="rounded-sm" />
            <span className="text-xs text-text-primary truncate">{player.championId}</span></>
        ) : <span className="text-xs text-text-muted">챔피언</span>}
      </button>
      <div className="flex gap-1 items-center col-span-3">
        {['kills', 'deaths', 'assists'].map((field, fi) => (
          <input key={field} type="number" min="0" value={player[field]}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder={fi === 0 ? 'K' : fi === 1 ? 'D' : 'A'}
            className="w-full bg-bg-input border border-border rounded-md px-2 py-1.5 text-sm text-center text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted" />
        ))}
      </div>
    </div>
  );
}

export default function EditMatchPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [streamers, setStreamers] = useState([]);
  const [champions, setChampions] = useState([]);
  const [date, setDate] = useState('');
  const [season, setSeason] = useState(CURRENT_YEAR);
  const [winningTeam, setWinningTeam] = useState(1);
  const [team1, setTeam1] = useState([]);
  const [team2, setTeam2] = useState([]);
  const [pickerTarget, setPickerTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      supabase.from('streamers').select('id, name, profile_image_url').order('name'),
      fetchChampions(),
    ]).then(([{ data: sData }, champs]) => {
      setStreamers(sData || []);
      setChampions(champs);
    });
    loadMatch();
  }, [matchId]);

  async function loadMatch() {
    setLoading(true);
    const { data: match } = await supabase.from('matches').select('*').eq('id', matchId).single();
    if (!match) { navigate('/admin'); return; }
    setDate(match.played_at);
    setSeason(match.season);

    const { data: parts } = await supabase
      .from('match_participants')
      .select('*, streamer:streamers(id, name, profile_image_url)')
      .eq('match_id', matchId);

    // 팀1/팀2 분리 후 5자리로 패딩
    const makeTeam = (teamNum) => {
      const teamParts = (parts || []).filter((p) => p.team === teamNum);
      // 포지션 순서로 정렬
      const sorted = POSITIONS.map((pos) => teamParts.find((p) => p.position === pos) || null);
      return sorted.map((p, i) => p ? {
        participantId: p.id,
        streamerId: p.streamer_id,
        streamerName: p.streamer?.name || '',
        championId: p.champion_id || '',
        position: POSITIONS[i],
        kills: String(p.kills || 0),
        deaths: String(p.deaths || 0),
        assists: String(p.assists || 0),
        result: p.result,
      } : {
        participantId: null,
        streamerId: '', streamerName: '', championId: '',
        position: POSITIONS[i], kills: '', deaths: '', assists: '', result: '',
      });
    };

    // 승리팀 파악
    const winTeam = (parts || []).find((p) => p.result === 'WIN');
    if (winTeam) setWinningTeam(winTeam.team);

    setTeam1(makeTeam(1));
    setTeam2(makeTeam(2));
    setLoading(false);
  }

  function updatePlayer(teamNum, idx, field, value) {
    const setter = teamNum === 1 ? setTeam1 : setTeam2;
    setter((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    // 경기 기본 정보 수정
    await supabase.from('matches').update({ played_at: date, season }).eq('id', matchId);

    // 기존 참여자 전체 삭제 후 재입력
    await supabase.from('match_participants').delete().eq('match_id', matchId);

    const participants = [];
    for (const [teamPlayers, teamNum] of [[team1, 1], [team2, 2]]) {
      for (let i = 0; i < teamPlayers.length; i++) {
        const p = teamPlayers[i];
        if (!p.streamerId) continue;
        participants.push({
          match_id: matchId,
          streamer_id: p.streamerId,
          team: teamNum,
          champion_id: p.championId || null,
          position: POSITIONS[i],
          kills: parseInt(p.kills) || 0,
          deaths: parseInt(p.deaths) || 0,
          assists: parseInt(p.assists) || 0,
          result: teamNum === winningTeam ? 'WIN' : 'LOSS',
        });
      }
    }

    const { error: partErr } = await supabase.from('match_participants').insert(participants);
    if (partErr) { setError('저장 중 오류: ' + partErr.message); setSaving(false); return; }
    navigate('/admin');
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/admin')} className="text-text-muted hover:text-text-primary transition-colors text-sm">← 대시보드</button>
        <h1 className="text-xl font-bold text-text-primary">경기 수정</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 기본 정보 */}
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

        {/* 컬럼 헤더 */}
        <div className="grid grid-cols-6 gap-2 px-1 text-xs text-text-muted">
          <span className="text-center">포지션</span>
          <span>스트리머</span>
          <span>챔피언</span>
          <span className="col-span-3 text-center">K / D / A</span>
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
            {saving ? '저장 중...' : '수정 저장'}
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
