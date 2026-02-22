import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { fetchChampions, getChampionIconUrl } from '../../lib/ddragon';
import ChampionIcon from '../../components/common/ChampionIcon';

const POSITIONS = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
const POSITION_KO = { TOP: '탑', JUNGLE: '정글', MID: '미드', ADC: '원딜', SUPPORT: '서폿' };
const CURRENT_YEAR = new Date().getFullYear();

function emptyPlayer() {
  return { streamerId: '', championId: '', position: '', kills: '', deaths: '', assists: '' };
}

/* 챔피언 선택 모달 */
function ChampionPickerModal({ champions, onSelect, onClose, version }) {
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = search
    ? champions.filter(
        (c) =>
          c.name.includes(search) ||
          c.id.toLowerCase().includes(search.toLowerCase())
      )
    : champions;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-bg-card border border-border rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="챔피언 검색..."
            className="flex-1 bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted"
          />
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-lg leading-none">✕</button>
        </div>
        <div className="overflow-y-auto p-3 grid grid-cols-6 sm:grid-cols-8 gap-2">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => { onSelect(c.id); onClose(); }}
              className="flex flex-col items-center gap-1 p-1 rounded-lg hover:bg-bg-hover transition-colors group"
              title={c.name}
            >
              <img
                src={getChampionIconUrl(c.id)}
                alt={c.name}
                width={44}
                height={44}
                className="rounded-md"
                loading="lazy"
              />
              <span className="text-[10px] text-text-muted group-hover:text-text-primary text-center leading-tight truncate w-full">
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* 개별 플레이어 입력 행 */
function PlayerRow({ idx, player, onChange, streamers, champions, onOpenChampionPicker }) {
  return (
    <div className="grid grid-cols-6 gap-2 items-center py-2 border-b border-border last:border-0">
      <span className="text-text-muted text-xs text-center">{idx + 1}</span>

      {/* 스트리머 선택 */}
      <select
        value={player.streamerId}
        onChange={(e) => onChange('streamerId', e.target.value)}
        className="col-span-1 bg-bg-input border border-border rounded-lg px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent"
      >
        <option value="">스트리머</option>
        {streamers.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      {/* 챔피언 선택 */}
      <button
        type="button"
        onClick={() => onOpenChampionPicker()}
        className="flex items-center gap-2 bg-bg-input border border-border rounded-lg px-2 py-1.5 hover:border-accent transition-colors"
      >
        {player.championId ? (
          <>
            <ChampionIcon championId={player.championId} size={20} rounded="rounded-sm" />
            <span className="text-xs text-text-primary truncate">{player.championId}</span>
          </>
        ) : (
          <span className="text-xs text-text-muted">챔피언</span>
        )}
      </button>

      {/* 포지션 */}
      <select
        value={player.position}
        onChange={(e) => onChange('position', e.target.value)}
        className="bg-bg-input border border-border rounded-lg px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent"
      >
        <option value="">포지션</option>
        {POSITIONS.map((p) => (
          <option key={p} value={p}>{POSITION_KO[p]}</option>
        ))}
      </select>

      {/* KDA */}
      <div className="flex gap-1 items-center col-span-2">
        {['kills', 'deaths', 'assists'].map((field, fi) => (
          <input
            key={field}
            type="number"
            min="0"
            value={player[field]}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder={fi === 0 ? 'K' : fi === 1 ? 'D' : 'A'}
            className="w-full bg-bg-input border border-border rounded-md px-2 py-1.5 text-sm text-center text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted"
          />
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
  const [pickerTarget, setPickerTarget] = useState(null); // { team, idx }
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('streamers').select('id, name').order('name').then(({ data }) => {
      setStreamers(data || []);
    });
    fetchChampions().then(setChampions);
  }, []);

  function updatePlayer(teamNum, idx, field, value) {
    const setter = teamNum === 1 ? setTeam1 : setTeam2;
    setter((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // 유효성 검사: 각 팀 최소 1명은 스트리머 선택
    const t1Valid = team1.some((p) => p.streamerId);
    const t2Valid = team2.some((p) => p.streamerId);
    if (!t1Valid || !t2Valid) {
      setError('각 팀에 최소 1명 이상의 스트리머를 선택해주세요.');
      return;
    }

    setSaving(true);

    // 1. 경기 생성
    const { data: matchData, error: matchErr } = await supabase
      .from('matches')
      .insert({ played_at: date, season })
      .select('id')
      .single();

    if (matchErr) {
      setError('경기 저장 중 오류가 발생했습니다: ' + matchErr.message);
      setSaving(false);
      return;
    }

    const matchId = matchData.id;

    // 2. 참여자 생성
    const participants = [];
    for (const [teamPlayers, teamNum] of [[team1, 1], [team2, 2]]) {
      for (const p of teamPlayers) {
        if (!p.streamerId) continue;
        participants.push({
          match_id: matchId,
          streamer_id: p.streamerId,
          team: teamNum,
          champion_id: p.championId || null,
          position: p.position || null,
          kills: parseInt(p.kills) || 0,
          deaths: parseInt(p.deaths) || 0,
          assists: parseInt(p.assists) || 0,
          result: teamNum === winningTeam ? 'WIN' : 'LOSS',
        });
      }
    }

    const { error: partErr } = await supabase.from('match_participants').insert(participants);

    if (partErr) {
      setError('참여자 저장 중 오류가 발생했습니다: ' + partErr.message);
      setSaving(false);
      return;
    }

    navigate('/admin');
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-bold text-text-primary mb-8">경기 추가</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="bg-bg-card border border-border rounded-xl p-5 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">경기 날짜</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">시즌</label>
            <select
              value={season}
              onChange={(e) => setSeason(Number(e.target.value))}
              className="bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
            >
              {[CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">승리팀</label>
            <div className="flex gap-2">
              {[1, 2].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setWinningTeam(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    winningTeam === t
                      ? 'bg-win text-white'
                      : 'bg-bg-input border border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {t}팀 승
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 컬럼 헤더 */}
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
            {winningTeam === 1 && (
              <span className="text-xs bg-win/20 text-win px-2 py-0.5 rounded-full">승리</span>
            )}
          </div>
          <div className="px-5">
            {team1.map((p, i) => (
              <PlayerRow
                key={i}
                idx={i}
                player={p}
                onChange={(field, val) => updatePlayer(1, i, field, val)}
                streamers={streamers}
                champions={champions}
                onOpenChampionPicker={() => setPickerTarget({ team: 1, idx: i })}
              />
            ))}
          </div>
        </div>

        {/* 팀 2 */}
        <div className="bg-bg-card border border-loss/30 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            <span className="text-loss font-bold text-sm">2팀</span>
            {winningTeam === 2 && (
              <span className="text-xs bg-win/20 text-win px-2 py-0.5 rounded-full">승리</span>
            )}
          </div>
          <div className="px-5">
            {team2.map((p, i) => (
              <PlayerRow
                key={i}
                idx={i}
                player={p}
                onChange={(field, val) => updatePlayer(2, i, field, val)}
                streamers={streamers}
                champions={champions}
                onOpenChampionPicker={() => setPickerTarget({ team: 2, idx: i })}
              />
            ))}
          </div>
        </div>

        {error && (
          <p className="text-loss text-sm bg-loss/10 border border-loss/30 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? '저장 중...' : '경기 저장'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-8 py-2.5 bg-bg-input border border-border text-text-secondary hover:text-text-primary rounded-lg transition-colors"
          >
            취소
          </button>
        </div>
      </form>

      {/* 챔피언 선택 모달 */}
      {pickerTarget && (
        <ChampionPickerModal
          champions={champions}
          onSelect={(champId) => updatePlayer(pickerTarget.team, pickerTarget.idx, 'championId', champId)}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </div>
  );
}
