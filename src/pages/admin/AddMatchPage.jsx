import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { fetchChampions, fetchSpells, fetchItems, fetchRunes,
         getAllKeystones, getSecondaryPaths } from '../../lib/ddragon';
import ChampionIcon from '../../components/common/ChampionIcon';
import SpellIcon from '../../components/common/SpellIcon';
import ItemIcon from '../../components/common/ItemIcon';

const POSITIONS = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
const POSITION_KO = { TOP: '탑', JUNGLE: '정글', MID: '미드', ADC: '원딜', SUPPORT: '서폿' };
const CURRENT_YEAR = new Date().getFullYear();

function emptyPlayer(idx) {
  return {
    streamerId: '', streamerName: '', championId: '',
    position: POSITIONS[idx], championLevel: '',
    spell1: '', spell2: '',
    runeKeystone: '', runeSecondary: '',
    item0: '', item1: '', item2: '', item3: '', item4: '', item5: '', item6: '', item7: '',
    kills: '', deaths: '', assists: '',
  };
}

/* 공통 픽커 모달 */
function PickerModal({ title, items, onClose, renderItem, searchKey = 'name', onSelect, enableNumberShortcut = false }) {
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  // 숫자 단축키 (보조룬 전용)
  useEffect(() => {
    if (!enableNumberShortcut || !onSelect) return;
    function handleKey(e) {
      const n = parseInt(e.key);
      if (n >= 1 && n <= items.length) {
        const item = items[n - 1];
        if (item) onSelect(item.icon ?? item.id);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [enableNumberShortcut, items, onSelect]);

  const filtered = search
    ? items.filter((c) => (c[searchKey] || '').toLowerCase().includes(search.toLowerCase()))
    : items;
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-bg-card border border-border rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex items-center gap-3">
          <span className="text-sm font-semibold text-text-primary">{title}</span>
          {enableNumberShortcut && (
            <div style={{ display: 'flex', gap: 4 }}>
              {items.slice(0, 5).map((item, i) => (
                <span key={i} style={{
                  fontSize: '0.65rem', fontWeight: 700,
                  background: 'rgba(68,137,200,0.15)', border: '1px solid rgba(68,137,200,0.3)',
                  color: '#4489c8', borderRadius: 5, padding: '1px 5px',
                }} title={item.name}>{i + 1}</span>
              ))}
              <span style={{ fontSize: '0.65rem', color: '#55556e', alignSelf: 'center' }}>단축키</span>
            </div>
          )}
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

/* 슬롯 클리어 래퍼 */
function ClearableSlot({ hasValue, onClear, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      {children}
      {hasValue && hovered && (
        <button type="button" onClick={(e) => { e.stopPropagation(); onClear(); }}
          style={{
            position: 'absolute', top: -5, right: -5,
            width: 14, height: 14, borderRadius: '50%',
            background: '#e84057', border: '1.5px solid var(--bg-card)',
            color: '#fff', fontSize: 9, fontWeight: 900,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10, padding: 0, lineHeight: 1,
          }}>✕</button>
      )}
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
      {/* Row 1: 기본 정보 */}
      <div className="grid gap-2 items-center mb-2" style={{ gridTemplateColumns: '60px 1fr 90px 70px 26px 130px' }}>
        <div className="text-center">
          <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: '#1e2030', color: '#8b8b9e', border: '1px solid #2a2b3d' }}>
            {POSITION_KO[pos]}
          </span>
        </div>
        <StreamerInput value={player.streamerId} streamerName={player.streamerName} streamers={streamers}
          onChange={(id, name) => { onChange('streamerId', id); onChange('streamerName', name); }} />
        <ClearableSlot hasValue={!!player.championId} onClear={() => onChange('championId', '')}>
          <button type="button" onClick={() => onOpenChampionPicker()}
            className="flex items-center gap-1 bg-bg-input border border-border rounded-lg px-2 py-1.5 hover:border-accent transition-colors">
            {player.championId ? <><ChampionIcon championId={player.championId} size={18} rounded="rounded-sm" /><span className="text-xs truncate">{player.championId}</span></>
              : <span className="text-xs text-text-muted">챔피언</span>}
          </button>
        </ClearableSlot>
        <input type="number" min="1" max={player.position === 'TOP' ? 20 : 18} value={player.championLevel}
          onChange={(e) => onChange('championLevel', e.target.value)}
          placeholder="레벨"
          className="bg-bg-input border border-border rounded-lg px-2 py-1.5 text-sm text-center text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted" />
        <span className="text-xs text-text-muted text-center">Lv</span>
        {/* KDA */}
        <div className="flex gap-1">
          {['kills','deaths','assists'].map((f, fi) => (
            <input key={f} type="number" min="0" value={player[f]} onChange={(e) => onChange(f, e.target.value)}
              placeholder={fi===0?'K':fi===1?'D':'A'}
              className="w-full bg-bg-input border border-border rounded-md px-1 py-1.5 text-xs text-center text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted" />
          ))}
        </div>
      </div>

      {/* Row 2: 스펠, 룬, 아이템 */}
      <div className="flex gap-2 items-center flex-wrap pl-1">
        {/* 스펠 */}
        <div className="flex gap-1 items-center">
          <span className="text-xs text-text-muted mr-1">스펠</span>
          {[1, 2].map((n) => {
            const field = `spell${n}`;
            return (
              <ClearableSlot key={n} hasValue={!!player[field]} onClear={() => onChange(field, '')}>
                <button type="button" onClick={() => onOpenSpellPicker(field)}
                  className="border border-border rounded hover:border-accent transition-colors" style={{ padding: 1 }}>
                  {player[field] ? <SpellIcon spellId={player[field]} size={22} />
                    : <div style={{ width: 22, height: 22, background: '#1e2030', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="text-text-muted text-xs">{n}</span></div>}
                </button>
              </ClearableSlot>
            );
          })}
        </div>

        {/* 룬 */}
        <div className="flex gap-1 items-center">
          <span className="text-xs text-text-muted mr-1">룬</span>
          {[{field:'runeKeystone'},{field:'runeSecondary'}].map(({field}) => (
            <ClearableSlot key={field} hasValue={!!player[field]} onClear={() => onChange(field, '')}>
              <button type="button" onClick={() => onOpenRunePicker(field)}
                className="border border-border rounded-full hover:border-accent transition-colors" style={{ padding: 1 }}>
                {player[field]
                  ? <img src={`https://ddragon.leagueoflegends.com/cdn/img/${player[field]}`} alt="" width={22} height={22} style={{ borderRadius: '50%' }} />
                  : <div style={{ width: 22, height: 22, background: '#1e2030', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="text-text-muted text-xs">?</span></div>}
              </button>
            </ClearableSlot>
          ))}
        </div>

        {/* 아이템 */}
        <div className="flex gap-1 items-center">
          <span className="text-xs text-text-muted mr-1">아이템</span>
          {[...['item0','item1','item2','item3','item4','item5','item6'], ...(player.position === 'ADC' ? ['item7'] : [])].map((f, i) => (
            <ClearableSlot key={f} hasValue={!!player[f]} onClear={() => onChange(f, '')}>
              <button type="button" onClick={() => onOpenItemPicker(f)}
                className="border border-border rounded hover:border-accent transition-colors" style={{ padding: 1 }}>
                {player[f] ? <ItemIcon itemId={player[f]} size={22} />
                  : <div style={{ width: 22, height: 22, background: '#1e2030', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="text-text-muted" style={{ fontSize: 9 }}>{f === 'item7' ? '장' : i < 6 ? i+1 : player.position === 'ADC' ? 7 : '장'}</span></div>}
              </button>
            </ClearableSlot>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AddMatchPage() {
  const navigate = useNavigate();
  const [streamers, setStreamers] = useState([]);
  const [champions, setChampions] = useState([]);
  const [spells, setSpells] = useState([]);
  const [runes, setRunes] = useState([]);
  const [items, setItems] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [season, setSeason] = useState(CURRENT_YEAR);
  const [winningTeam, setWinningTeam] = useState(1);
  const [team1, setTeam1] = useState(Array.from({ length: 5 }, (_, i) => emptyPlayer(i)));
  const [team2, setTeam2] = useState(Array.from({ length: 5 }, (_, i) => emptyPlayer(i)));
  const [pickerTarget, setPickerTarget] = useState(null); // { team, idx, type, field }
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('streamers').select('id, name, profile_image_url').order('name')
      .then(({ data, error }) => { if (!error) setStreamers(data || []); })
      .catch(() => {});
    fetchChampions().then(setChampions).catch(() => {});
    fetchSpells().then(setSpells).catch(() => {});
    fetchRunes().then(setRunes).catch(() => {});
    fetchItems().then(setItems).catch(() => {});
  }, []);

  function updatePlayer(teamNum, idx, field, value) {
    const setter = teamNum === 1 ? setTeam1 : setTeam2;
    setter((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  }

  async function handleSubmit(e) {
    e.preventDefault(); setError('');
    if (!team1.some((p) => p.streamerId) || !team2.some((p) => p.streamerId)) {
      setError('각 팀에 최소 1명 이상의 스트리머를 선택해주세요.'); return;
    }
    setSaving(true);
    const { data: matchData, error: matchErr } = await supabase.from('matches').insert({ played_at: date, season }).select('id').single();
    if (matchErr) { setError(matchErr.message); setSaving(false); return; }
    const participants = [];
    for (const [teamPlayers, teamNum] of [[team1, 1], [team2, 2]]) {
      for (let i = 0; i < teamPlayers.length; i++) {
        const p = teamPlayers[i];
        if (!p.streamerId) continue;
        participants.push({
          match_id: matchData.id, streamer_id: p.streamerId, team: teamNum,
          champion_id: p.championId || null, position: POSITIONS[i],
          champion_level: parseInt(p.championLevel) || null,
          spell1_id: p.spell1 || null, spell2_id: p.spell2 || null,
          rune_keystone: p.runeKeystone || null, rune_secondary: p.runeSecondary || null,
          item0: p.item0||null, item1: p.item1||null, item2: p.item2||null,
          item3: p.item3||null, item4: p.item4||null, item5: p.item5||null, item6: p.item6||null, item7: p.position === 'ADC' ? (p.item7||null) : null,
          kills: parseInt(p.kills)||0, deaths: parseInt(p.deaths)||0, assists: parseInt(p.assists)||0,
          result: teamNum === winningTeam ? 'WIN' : 'LOSS',
        });
      }
    }
    const { error: partErr } = await supabase.from('match_participants').insert(participants);
    if (partErr) { setError(partErr.message); setSaving(false); return; }
    navigate('/admin');
  }

  // 픽커 렌더
  const keystones = getAllKeystones(runes);
  const secPaths = getSecondaryPaths(runes);
  const itemList    = Object.entries(items).filter(([, item]) => item.gold?.purchasable && item.maps?.['11']).map(([id, item]) => ({ id, name: item.name }));
  const trinketList = Object.entries(items).filter(([, item]) => item.tags?.includes('Trinket') && item.maps?.['11']).map(([id, item]) => ({ id, name: item.name }));

  function openPicker(team, idx, type, field = null) {
    setPickerTarget({ team, idx, type, field });
  }

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

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-bold text-text-primary mb-8">경기 추가</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="bg-bg-card border border-border rounded-xl p-5 flex flex-wrap gap-4 items-end">
          <div><label className="block text-xs text-text-secondary mb-1.5">경기 날짜</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
              className="bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent" /></div>
          <div><label className="block text-xs text-text-secondary mb-1.5">시즌</label>
            <select value={season} onChange={(e) => setSeason(Number(e.target.value))}
              className="bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent">
              {[CURRENT_YEAR-1, CURRENT_YEAR, CURRENT_YEAR+1].map((y) => <option key={y} value={y}>{y}</option>)}
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
          <div key={teamNum} className={`bg-bg-card rounded-xl overflow-hidden`}
            style={{ border: isWin ? '1px solid rgba(68,137,200,0.3)' : '1px solid rgba(232,64,87,0.2)' }}>
            <div className="px-5 py-3 border-b border-border flex items-center gap-2">
              <span className={`font-bold text-sm ${isWin ? 'text-win' : 'text-loss'}`}>{teamNum}팀</span>
              {isWin && <span className="text-xs bg-win/20 text-win px-2 py-0.5 rounded-full">승리</span>}
            </div>
            <div className="px-4">
              {players.map((p, i) => (
                <PlayerRow key={i} idx={i} player={p}
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
            {saving ? '저장 중...' : '경기 저장'}
          </button>
          <button type="button" onClick={() => navigate('/admin')}
            className="px-8 py-2.5 bg-bg-input border border-border text-text-secondary hover:text-text-primary rounded-lg transition-colors">취소</button>
        </div>
      </form>

      {/* 픽커 모달들 */}
      {pickerTarget?.type === 'champion' && (
        <PickerModal title="챔피언 선택" items={champions} searchKey="name" onSelect={handlePickerSelect} onClose={closePicker}
          renderItem={(c) => (
            <button key={c.id} onClick={() => handlePickerSelect(c.id)}
              className="flex flex-col items-center gap-1 p-1 rounded-lg hover:bg-bg-hover transition-colors group" title={c.name}>
              <img src={`https://ddragon.leagueoflegends.com/cdn/${c.version||'15.6.1'}/img/champion/${c.id}.png`} width={44} height={44} className="rounded-md" loading="lazy" />
              <span className="text-[10px] text-text-muted group-hover:text-text-primary text-center truncate w-full">{c.name}</span>
            </button>
          )} />
      )}
      {pickerTarget?.type === 'spell' && (
        <PickerModal title="스펠 선택" items={spells} searchKey="name" onSelect={handlePickerSelect} onClose={closePicker}
          renderItem={(s) => (
            <button key={s.id} onClick={() => handlePickerSelect(s.id)}
              className="flex flex-col items-center gap-1 p-1 rounded-lg hover:bg-bg-hover transition-colors group" title={s.name}>
              <SpellIcon spellId={s.id} size={44} />
              <span className="text-[10px] text-text-muted group-hover:text-text-primary text-center truncate w-full">{s.name}</span>
            </button>
          )} />
      )}
      {pickerTarget?.type === 'rune' && (
        <PickerModal title={pickerTarget.field === 'runeKeystone' ? '키스톤 룬 선택' : '보조 경로 선택'}
          items={pickerTarget.field === 'runeKeystone' ? keystones : secPaths}
          searchKey="name" onClose={closePicker}
          enableNumberShortcut={pickerTarget.field === 'runeSecondary'}
          onSelect={(val) => { handlePickerSelect(val); }}
          renderItem={(r) => (
            <button key={r.id} onClick={() => handlePickerSelect(r.icon)}
              className="flex flex-col items-center gap-1 p-1 rounded-lg hover:bg-bg-hover transition-colors group" title={r.name}>
              <img src={`https://ddragon.leagueoflegends.com/cdn/img/${r.icon}`} width={44} height={44} style={{ borderRadius: '50%' }} />
              <span className="text-[10px] text-text-muted group-hover:text-text-primary text-center truncate w-full">{r.name}</span>
            </button>
          )} />
      )}
      {pickerTarget?.type === 'item' && (
        <PickerModal
          title={
            pickerTarget?.field === 'item7' ||
            (pickerTarget?.field === 'item6' && (pickerTarget.team === 1 ? team1 : team2)?.[pickerTarget.idx]?.position !== 'ADC')
              ? '장신구 선택' : '아이템 선택'
          }
          items={
            pickerTarget?.field === 'item7' ||
            (pickerTarget?.field === 'item6' && (pickerTarget.team === 1 ? team1 : team2)?.[pickerTarget.idx]?.position !== 'ADC')
              ? trinketList : itemList
          }
          searchKey="name" onClose={closePicker}
          onSelect={(val) => { handlePickerSelect(val); }}
          enableNumberShortcut={
            pickerTarget?.field === 'item7' ||
            (pickerTarget?.field === 'item6' && (pickerTarget.team === 1 ? team1 : team2)?.[pickerTarget.idx]?.position !== 'ADC')
          }
          renderItem={(item) => (
            <button key={item.id} onClick={() => handlePickerSelect(item.id)}
              className="flex flex-col items-center gap-1 p-1 rounded-lg hover:bg-bg-hover transition-colors group" title={item.name}>
              <ItemIcon itemId={item.id} size={44} />
              <span className="text-[10px] text-text-muted group-hover:text-text-primary text-center truncate w-full">{item.name}</span>
            </button>
          )} />
      )}
    </div>
  );
}
