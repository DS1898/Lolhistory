import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { fetchChampions, fetchSpells, fetchItems, fetchRunes,
         getChampionIconUrl, getAllKeystones, getSecondaryPaths } from '../../lib/ddragon';
import ChampionIcon from '../../components/common/ChampionIcon';
import SpellIcon from '../../components/common/SpellIcon';
import ItemIcon from '../../components/common/ItemIcon';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const POSITIONS = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
const POSITION_KO = { TOP: '탑', JUNGLE: '정글', MID: '미드', ADC: '원딜', SUPPORT: '서폿' };

function emptyPlayer(idx) {
  return {
    participantId: null,
    streamerId: '', streamerName: '', championId: '',
    position: POSITIONS[idx], championLevel: '',
    spell1: '', spell2: '',
    runeKeystone: '', runeSecondary: '',
    item0: '', item1: '', item2: '', item3: '', item4: '', item5: '', item6: '',
    kills: '', deaths: '', assists: '',
  };
}

/* 공통 픽커 모달 */
function PickerModal({ title, items, onClose, renderItem, searchKey = 'name' }) {
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const filtered = search
    ? items.filter((c) => (c[searchKey] || '').toLowerCase().includes(search.toLowerCase()))
    : items;
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-bg-card border border-border rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex items-center gap-3">
          <span className="text-sm font-semibold text-text-primary">{title}</span>
          <input ref={inputRef} type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="검색..." className="flex-1 bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted" />
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-lg">✕</button>
        </div>
        <div className="overflow-y-auto p-3 grid grid-cols-6 sm:grid-cols-8 gap-2">
          {filtered.map((item, i) => renderItem(item, i))}
        </div>
      </div>
    </div>
  );
}

/* 스트리머 자동완성 */
function StreamerInput({ streamerName, onChange, streamers }) {
  const [input, setInput] = useState(streamerName || '');
  const [suggestions, setSuggestions] = useState([]);
  const [show, setShow] = useState(false);
  const wrapRef = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => setInput(streamerName || ''), 0);
    return () => clearTimeout(t);
  }, [streamerName]);
  useEffect(() => {
    const fn = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setShow(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);
  function handleInput(e) {
    const val = e.target.value; setInput(val);
    if (val.trim()) { setSuggestions(streamers.filter((s) => s.name.toLowerCase().includes(val.toLowerCase())).slice(0, 8)); setShow(true); }
    else { setSuggestions([]); setShow(false); onChange('', ''); }
  }
  function select(s) { setInput(s.name); setShow(false); onChange(s.id, s.name); }
  return (
    <div ref={wrapRef} className="relative">
      <input type="text" value={input} onChange={handleInput} placeholder="스트리머 검색..."
        className="w-full bg-bg-input border border-border rounded-lg px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted" />
      {show && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-0.5 bg-bg-card border border-border rounded-lg overflow-hidden shadow-xl z-40 max-h-40 overflow-y-auto">
          {suggestions.map((s) => (
            <button key={s.id} onClick={() => select(s)} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-bg-hover transition-colors">
              <div className="w-6 h-6 rounded-full bg-bg-input border border-border overflow-hidden shrink-0">
                {s.profile_image_url ? <img src={s.profile_image_url} alt={s.name} className="w-full h-full object-cover" />
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

/* 플레이어 입력 행 */
function PlayerRow({ idx, player, onChange, streamers, onOpenChampionPicker, onOpenSpellPicker, onOpenItemPicker, onOpenRunePicker }) {
  const pos = POSITIONS[idx];
  return (
    <div className="py-3 border-b border-border last:border-0">
      {/* Row 1: 포지션 + 스트리머 + 챔피언 + 레벨 */}
      <div className="grid gap-2 items-center mb-1.5" style={{ gridTemplateColumns: '58px 1fr 90px 72px 22px' }}>
        <div className="text-center">
          <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'var(--bg-input)', color: 'var(--text-mid)', border: '1px solid var(--border-clr)' }}>
            {POSITION_KO[pos]}
          </span>
        </div>
        <StreamerInput value={player.streamerId} streamerName={player.streamerName} streamers={streamers}
          onChange={(id, name) => { onChange('streamerId', id); onChange('streamerName', name); }} />
        <button type="button" onClick={() => onOpenChampionPicker()}
          className="flex items-center gap-1 bg-bg-input border border-border rounded-lg px-2 py-1.5 hover:border-accent transition-colors">
          {player.championId ? <><ChampionIcon championId={player.championId} size={18} rounded="rounded-sm" /><span className="text-xs truncate">{player.championId}</span></>
            : <span className="text-xs text-text-muted">챔피언</span>}
        </button>
        <input type="number" min="1" max="18" value={player.championLevel}
          onChange={(e) => onChange('championLevel', e.target.value)} placeholder="Lv"
          className="bg-bg-input border border-border rounded-lg px-2 py-1.5 text-sm text-center text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted" />
        <span className="text-xs text-text-muted text-center" style={{fontSize:9}}>레벨</span>
      </div>
      {/* Row 1-b: KDA 넓게 */}
      <div className="flex gap-2 items-center mb-2 pl-1">
        <span className="text-xs text-text-muted" style={{ width: 28, flexShrink: 0 }}>KDA</span>
        {[{f:'kills',label:'킬'},{f:'deaths',label:'데스'},{f:'assists',label:'어시'}].map(({f,label}) => (
          <div key={f} style={{ flex: 1 }}>
            <input type="number" min="0" value={player[f]} onChange={(e) => onChange(f, e.target.value)}
              placeholder={label}
              className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-center text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted" />
          </div>
        ))}
      </div>
      <div className="flex gap-2 items-center flex-wrap pl-1">
        <div className="flex gap-1 items-center">
          <span className="text-xs text-text-muted mr-1">스펠</span>
          {[1, 2].map((n) => {
            const field = `spell${n}`;
            return (
              <button key={n} type="button" onClick={() => onOpenSpellPicker(field)}
                className="border border-border rounded hover:border-accent transition-colors" style={{ padding: 1 }}>
                {player[field] ? <SpellIcon spellId={player[field]} size={22} />
                  : <div style={{ width: 22, height: 22, background: 'var(--bg-input)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="text-text-muted text-xs">{n}</span></div>}
              </button>
            );
          })}
        </div>
        <div className="flex gap-1 items-center">
          <span className="text-xs text-text-muted mr-1">룬</span>
          {[{field:'runeKeystone',label:'키스톤'},{field:'runeSecondary',label:'보조'}].map(({field}) => (
            <button key={field} type="button" onClick={() => onOpenRunePicker(field)}
              className="border border-border rounded-full hover:border-accent transition-colors" style={{ padding: 1 }}>
              {player[field]
                ? <img src={`https://ddragon.leagueoflegends.com/cdn/img/${player[field]}`} alt="" width={22} height={22} style={{ borderRadius: '50%' }} />
                : <div style={{ width: 22, height: 22, background: 'var(--bg-input)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="text-text-muted text-xs">?</span></div>}
            </button>
          ))}
        </div>
        <div className="flex gap-1 items-center">
          <span className="text-xs text-text-muted mr-1">아이템</span>
          {['item0','item1','item2','item3','item4','item5','item6'].map((f, i) => (
            <button key={f} type="button" onClick={() => onOpenItemPicker(f)}
              className="border border-border rounded hover:border-accent transition-colors" style={{ padding: 1 }}>
              {player[f] ? <ItemIcon itemId={player[f]} size={22} />
                : <div style={{ width: 22, height: 22, background: 'var(--bg-input)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="text-text-muted" style={{ fontSize: 9 }}>{i < 6 ? i+1 : '장'}</span></div>}
            </button>
          ))}
        </div>
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
  const [spells, setSpells] = useState([]);
  const [runes, setRunes] = useState([]);
  const [items, setItems] = useState([]);
  const [date, setDate] = useState('');
  const [season, setSeason] = useState(0);
  const [activeSeasons, setActiveSeasons] = useState([]);
  const [winningTeam, setWinningTeam] = useState(1);
  const [team1, setTeam1] = useState([]);
  const [team2, setTeam2] = useState([]);
  const [pickerTarget, setPickerTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function init() {
      let seasonList = [];
      try {
        const [{ data: sData }, champs, sp, ru, it, { data: seasonData }] = await Promise.all([
          supabase.from('streamers').select('id, name, profile_image_url').order('name'),
          fetchChampions(),
          fetchSpells(),
          fetchRunes(),
          fetchItems(),
          supabase.from('seasons').select('id, label').eq('is_active', true).order('year', { ascending: false }),
        ]);
        seasonList = seasonData || [];
        setStreamers(sData || []);
        setChampions(champs);
        setSpells(sp);
        setRunes(ru);
        setItems(it);
        setActiveSeasons(seasonList);
      } catch {
        setError('데이터 로딩 중 오류가 발생했습니다.');
        return;
      }

      setLoading(true);
      const { data: match } = await supabase.from('matches').select('*').eq('id', matchId).single();
      if (!match) { navigate('/admin'); return; }
      setDate(match.played_at);
      // match.season(연도 정수)이 활성 시즌 목록에 있으면 그대로 사용, 없으면 첫 번째 활성 시즌으로 설정
      setSeason(seasonList.find((s) => s.year === match.season)?.year ?? seasonList[0]?.year ?? 0);

      const { data: parts } = await supabase
        .from('match_participants')
        .select('*, streamer:streamers(id, name, profile_image_url)')
        .eq('match_id', matchId);

      const makeTeam = (teamNum) =>
        POSITIONS.map((pos, idx) => {
          const p = (parts || []).find((x) => x.team === teamNum && x.position === pos);
          if (p) return {
            participantId: p.id,
            streamerId: p.streamer_id,
            streamerName: p.streamer?.name || '',
            championId: p.champion_id || '',
            position: pos,
            championLevel: String(p.champion_level || ''),
            spell1: p.spell1_id || '',
            spell2: p.spell2_id || '',
            runeKeystone: p.rune_keystone || '',
            runeSecondary: p.rune_secondary || '',
            item0: p.item0 || '', item1: p.item1 || '', item2: p.item2 || '',
            item3: p.item3 || '', item4: p.item4 || '', item5: p.item5 || '', item6: p.item6 || '',
            kills: String(p.kills || 0),
            deaths: String(p.deaths || 0),
            assists: String(p.assists || 0),
          };
          return emptyPlayer(idx);
        });

      const winTeam = (parts || []).find((p) => p.result === 'WIN');
      if (winTeam) setWinningTeam(winTeam.team);
      setTeam1(makeTeam(1));
      setTeam2(makeTeam(2));
      setLoading(false);
    }
    init();
  }, [matchId, navigate]);

  function updatePlayer(teamNum, idx, field, value) {
    const setter = teamNum === 1 ? setTeam1 : setTeam2;
    setter((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  }

  async function handleSave(e) {
    e.preventDefault(); setError(''); setSaving(true);
    const { error: updateErr } = await supabase.from('matches').update({ played_at: date, season }).eq('id', matchId);
    if (updateErr) { setError('경기 수정 중 오류가 발생했습니다.'); setSaving(false); return; }
    const { error: deleteErr } = await supabase.from('match_participants').delete().eq('match_id', matchId);
    if (deleteErr) { setError('경기 수정 중 오류가 발생했습니다.'); setSaving(false); return; }

    const participants = [];
    for (const [teamPlayers, teamNum] of [[team1, 1], [team2, 2]]) {
      for (let i = 0; i < teamPlayers.length; i++) {
        const p = teamPlayers[i];
        if (!p.streamerId) continue;
        participants.push({
          match_id: matchId, streamer_id: p.streamerId, team: teamNum,
          champion_id: p.championId || null, position: POSITIONS[i],
          champion_level: parseInt(p.championLevel) || null,
          spell1_id: p.spell1 || null, spell2_id: p.spell2 || null,
          rune_keystone: p.runeKeystone || null, rune_secondary: p.runeSecondary || null,
          item0: p.item0||null, item1: p.item1||null, item2: p.item2||null,
          item3: p.item3||null, item4: p.item4||null, item5: p.item5||null, item6: p.item6||null,
          kills: parseInt(p.kills)||0, deaths: parseInt(p.deaths)||0, assists: parseInt(p.assists)||0,
          result: teamNum === winningTeam ? 'WIN' : 'LOSS',
        });
      }
    }
    const { error: partErr } = await supabase.from('match_participants').insert(participants);
    if (partErr) { setError('경기 수정 중 오류가 발생했습니다.'); setSaving(false); return; }
    navigate('/admin');
  }

  const keystones = getAllKeystones(runes);
  const secPaths = getSecondaryPaths(runes);
  const itemList = Object.entries(items).filter(([, item]) => item.gold?.purchasable && item.maps?.['11']).map(([id, item]) => ({ id, name: item.name }));

  function openPicker(team, idx, type, field = null) { setPickerTarget({ team, idx, type, field }); }
  function closePicker() { setPickerTarget(null); }
  function handlePickerSelect(value) {
    if (!pickerTarget) return;
    const { team, idx, type, field } = pickerTarget;
    if (type === 'champion') updatePlayer(team, idx, 'championId', value);
    else if (type === 'spell') updatePlayer(team, idx, field, value);
    else if (type === 'rune') updatePlayer(team, idx, field, value);
    else if (type === 'item') updatePlayer(team, idx, field, value);
    closePicker();
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/admin')} className="text-text-muted hover:text-text-primary transition-colors text-sm">← 대시보드</button>
        <h1 className="text-xl font-bold text-text-primary">경기 수정</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-bg-card border border-border rounded-xl p-5 flex flex-wrap gap-4 items-end">
          <div><label className="block text-xs text-text-secondary mb-1.5">경기 날짜</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
              className="bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent" /></div>
          <div><label className="block text-xs text-text-secondary mb-1.5">시즌</label>
            <select value={season} onChange={(e) => setSeason(Number(e.target.value))}
              className="bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent">
              {activeSeasons.length === 0
                ? <option value="">시즌 없음</option>
                : activeSeasons.map((s) => <option key={s.id} value={s.year}>{s.label}</option>)}
            </select></div>
          <div><label className="block text-xs text-text-secondary mb-1.5">승리팀</label>
            <div className="flex gap-2">
              {[1,2].map((t) => (
                <button key={t} type="button" onClick={() => setWinningTeam(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${winningTeam===t?'bg-win text-white':'bg-bg-input border border-border text-text-secondary hover:text-text-primary'}`}>
                  {t}팀 승
                </button>
              ))}
            </div></div>
        </div>

        {[{ players: team1, teamNum: 1, isWin: winningTeam===1 }, { players: team2, teamNum: 2, isWin: winningTeam===2 }].map(({ players, teamNum, isWin }) => (
          <div key={teamNum} className="bg-bg-card rounded-xl overflow-hidden"
            style={{ border: isWin ? '1px solid rgba(68,137,200,0.3)' : '1px solid rgba(232,64,87,0.2)' }}>
            <div className="px-5 py-3 border-b border-border flex items-center gap-2">
              <span className={`font-bold text-sm ${isWin ? 'text-win' : 'text-loss'}`}>{teamNum}팀</span>
              {isWin && <span className="text-xs bg-win/20 text-win px-2 py-0.5 rounded-full">승리</span>}
            </div>
            <div className="px-4">
              {players.map((p, i) => (
                <PlayerRow key={POSITIONS[i]} idx={i} player={p}
                  onChange={(field, val) => updatePlayer(teamNum, i, field, val)}
                  streamers={streamers}
                  onOpenChampionPicker={() => openPicker(teamNum, i, 'champion')}
                  onOpenSpellPicker={(field) => openPicker(teamNum, i, 'spell', field)}
                  onOpenItemPicker={(field) => openPicker(teamNum, i, 'item', field)}
                  onOpenRunePicker={(field) => openPicker(teamNum, i, 'rune', field)} />
              ))}
            </div>
          </div>
        ))}

        {error && <p className="text-loss text-sm bg-loss/10 border border-loss/30 rounded-lg px-4 py-3">{error}</p>}
        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="px-8 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg font-semibold transition-colors disabled:opacity-50">
            {saving ? '저장 중...' : '수정 저장'}
          </button>
          <button type="button" onClick={() => navigate('/admin')}
            className="px-8 py-2.5 bg-bg-input border border-border text-text-secondary hover:text-text-primary rounded-lg transition-colors">취소</button>
        </div>
      </form>

      {pickerTarget?.type === 'champion' && (
        <PickerModal title="챔피언 선택" items={champions} searchKey="name" onClose={closePicker}
          renderItem={(c) => (
            <button key={c.id} onClick={() => handlePickerSelect(c.id)}
              className="flex flex-col items-center gap-1 p-1 rounded-lg hover:bg-bg-hover transition-colors group">
              <img src={getChampionIconUrl(c.id)} width={44} height={44} className="rounded-md" loading="lazy" />
              <span className="text-[10px] text-text-muted group-hover:text-text-primary text-center truncate w-full">{c.name}</span>
            </button>
          )} />
      )}
      {pickerTarget?.type === 'spell' && (
        <PickerModal title="스펠 선택" items={spells} searchKey="name" onClose={closePicker}
          renderItem={(s) => (
            <button key={s.id} onClick={() => handlePickerSelect(s.id)}
              className="flex flex-col items-center gap-1 p-1 rounded-lg hover:bg-bg-hover transition-colors group">
              <SpellIcon spellId={s.id} size={44} />
              <span className="text-[10px] text-text-muted group-hover:text-text-primary text-center truncate w-full">{s.name}</span>
            </button>
          )} />
      )}
      {pickerTarget?.type === 'rune' && (
        <PickerModal title={pickerTarget.field === 'runeKeystone' ? '키스톤 룬 선택' : '보조 경로 선택'}
          items={pickerTarget.field === 'runeKeystone' ? keystones : secPaths}
          searchKey="name" onClose={closePicker}
          renderItem={(r) => (
            <button key={r.id} onClick={() => handlePickerSelect(r.icon)}
              className="flex flex-col items-center gap-1 p-1 rounded-lg hover:bg-bg-hover transition-colors group">
              <img src={`https://ddragon.leagueoflegends.com/cdn/img/${r.icon}`} width={44} height={44} style={{ borderRadius: '50%' }} />
              <span className="text-[10px] text-text-muted group-hover:text-text-primary text-center truncate w-full">{r.name}</span>
            </button>
          )} />
      )}
      {pickerTarget?.type === 'item' && (
        <PickerModal title="아이템 선택" items={itemList} searchKey="name" onClose={closePicker}
          renderItem={(item) => (
            <button key={item.id} onClick={() => handlePickerSelect(item.id)}
              className="flex flex-col items-center gap-1 p-1 rounded-lg hover:bg-bg-hover transition-colors group">
              <ItemIcon itemId={item.id} size={44} />
              <span className="text-[10px] text-text-muted group-hover:text-text-primary text-center truncate w-full">{item.name}</span>
            </button>
          )} />
      )}
    </div>
  );
}
