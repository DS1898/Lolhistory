import { useState } from 'react';
import ChampionIcon from '../common/ChampionIcon';
import SpellIcon from '../common/SpellIcon';
import ItemIcon from '../common/ItemIcon';
import RuneIcon from '../common/RuneIcon';

const POSITION_KO = { TOP: '탑', JUNGLE: '정글', MID: '미드', ADC: '원딜', SUPPORT: '서폿' };

function kda(kills, deaths, assists) {
  if (deaths === 0) return 'Perfect';
  return ((kills + assists) / deaths).toFixed(2);
}

function relativeDate(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return '오늘';
  if (days === 1) return '1일 전';
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  return `${Math.floor(days / 30)}개월 전`;
}

// 아이템 + 장신구 (ADC는 item0~item6 = 7개 + item7 장신구)
function ItemRow({ participant }) {
  const isADC = participant.position === 'ADC';
  const items = isADC
    ? [participant.item0, participant.item1, participant.item2, participant.item3, participant.item4, participant.item5, participant.item6]
    : [participant.item0, participant.item1, participant.item2, participant.item3, participant.item4, participant.item5];
  const trinket = isADC ? participant.item7 : participant.item6;
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {items.map((id, i) => <ItemIcon key={i} itemId={id} size={22} />)}
      <div style={{ width: 4 }} />
      <ItemIcon itemId={trinket} size={22} />
    </div>
  );
}

// 확장된 팀 행
function ParticipantRow({ p, isMe, isWin }) {
  const kdaRatio = kda(p.kills, p.deaths, p.assists);
  const bg = isMe
    ? isWin ? 'rgba(68,137,200,0.15)' : 'rgba(232,64,87,0.12)'
    : 'transparent';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '28px 44px 1fr 52px 80px 160px',
      alignItems: 'center', gap: 8,
      padding: '5px 12px',
      background: bg,
      borderRadius: 6,
      transition: 'background 0.15s',
    }}>
      {/* 스펠 + 룬 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <SpellIcon spellId={p.spell1_id} size={13} />
        <SpellIcon spellId={p.spell2_id} size={13} />
      </div>

      {/* 챔피언 + 레벨 */}
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <ChampionIcon championId={p.champion_id} size={36} rounded="rounded-md" />
        {p.champion_level && (
          <span style={{
            position: 'absolute', bottom: -2, right: -4,
            background: '#0d0e14', border: '1px solid #2a2b3d',
            borderRadius: 4, fontSize: 9, fontWeight: 800,
            color: '#e8e8ea', padding: '0 3px', lineHeight: '14px',
          }}>{p.champion_level}</span>
        )}
      </div>

      {/* 이름 */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: '0.8rem', fontWeight: isMe ? 700 : 500,
          color: isMe ? '#e8e8ea' : '#8b8b9e',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {p.streamer?.name || '(미등록)'}
        </div>
        <div style={{ fontSize: '0.68rem', color: '#6b6b7e' }}>
          {POSITION_KO[p.position] || p.position || ''}
        </div>
      </div>

      {/* KDA */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#e8e8ea' }}>
          {p.kills}/<span style={{ color: '#e84057' }}>{p.deaths}</span>/{p.assists}
        </div>
        <div style={{ fontSize: '0.68rem', color: kdaRatio === 'Perfect' ? '#4489c8' : '#8b8b9e' }}>
          {kdaRatio} KDA
        </div>
      </div>

      {/* 룬 */}
      <div style={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
        {p.rune_keystone && <RuneIcon icon={p.rune_keystone} name="키스톤" size={20} />}
        {p.rune_secondary && <RuneIcon icon={p.rune_secondary} name="보조" size={16} />}
      </div>

      {/* 아이템 */}
      <div>
        <ItemRow participant={p} />
      </div>
    </div>
  );
}

export default function MatchCard({ participation, allParticipants, streamerId }) {
  const [expanded, setExpanded] = useState(false);
  const isWin = participation.result === 'WIN';
  const match = participation.match;
  const myTeam = participation.team;

  const teammates = allParticipants
    .filter((p) => p.match_id === match.id && p.team === myTeam && p.streamer_id !== streamerId)
    .slice(0, 4);
  const opponents = allParticipants
    .filter((p) => p.match_id === match.id && p.team !== myTeam)
    .slice(0, 5);

  // 확장 시 팀별 참여자 (포지션 순 정렬)
  const POSITIONS_ORDER = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
  const sortByPosition = (arr) => [...arr].sort((a, b) => {
    const ai = POSITIONS_ORDER.indexOf(a.position);
    const bi = POSITIONS_ORDER.indexOf(b.position);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const team1 = sortByPosition(allParticipants.filter((p) => p.match_id === match.id && p.team === 1));
  const team2 = sortByPosition(allParticipants.filter((p) => p.match_id === match.id && p.team === 2));
  const winTeam = allParticipants.find((p) => p.match_id === match.id && p.result === 'WIN')?.team;

  const kdaRatio = kda(participation.kills, participation.deaths, participation.assists);

  return (
    <div style={{
      borderRadius: 10, overflow: 'hidden',
      border: isWin ? '1px solid rgba(68,137,200,0.25)' : '1px solid rgba(232,64,87,0.2)',
      marginBottom: 4,
    }}>
      {/* 요약 행 (항상 보임) */}
      <div
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '8px 14px',
          background: isWin ? 'rgba(68,137,200,0.08)' : 'rgba(232,64,87,0.08)',
          cursor: 'pointer', userSelect: 'none',
          transition: 'filter 0.15s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.08)'}
        onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
      >
        {/* 좌측 색상 바 */}
        <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 4, background: isWin ? '#4489c8' : '#e84057', flexShrink: 0 }} />

        {/* 승/패 + 날짜 */}
        <div style={{ width: 52, textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isWin ? '#4489c8' : '#e84057' }}>{isWin ? '승' : '패'}</div>
          <div style={{ fontSize: '0.7rem', color: '#6b6b7e', marginTop: 2 }}>{relativeDate(match.played_at)}</div>
        </div>

        {/* 챔피언 */}
        <div style={{ flexShrink: 0, position: 'relative' }}>
          <ChampionIcon championId={participation.champion_id} size={44} rounded="rounded-lg" />
          {participation.champion_level && (
            <span style={{
              position: 'absolute', bottom: -3, right: -5,
              background: '#0d0e14', border: '1px solid #2a2b3d',
              borderRadius: 4, fontSize: 9, fontWeight: 800, color: '#e8e8ea', padding: '0 3px', lineHeight: '14px',
            }}>{participation.champion_level}</span>
          )}
          {participation.position && (
            <div style={{ fontSize: '0.65rem', color: '#6b6b7e', textAlign: 'center', marginTop: 3 }}>
              {POSITION_KO[participation.position] || participation.position}
            </div>
          )}
        </div>

        {/* 스펠 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
          <SpellIcon spellId={participation.spell1_id} size={18} />
          <SpellIcon spellId={participation.spell2_id} size={18} />
        </div>

        {/* KDA */}
        <div style={{ flexShrink: 0, minWidth: 80 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e8e8ea' }}>
            {participation.kills}/<span style={{ color: '#e84057' }}>{participation.deaths}</span>/{participation.assists}
          </div>
          <div style={{ fontSize: '0.72rem', color: kdaRatio === 'Perfect' ? '#4489c8' : '#8b8b9e', marginTop: 1 }}>
            {kdaRatio} KDA
          </div>
        </div>

        {/* 아이템 미리보기 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <ItemRow participant={participation} />
        </div>

        {/* 아군/상대 아이콘 */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 3 }} className="hidden sm:flex">
          {teammates.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: '0.65rem', color: '#6b6b7e', width: 28 }}>아군</span>
              <div style={{ display: 'flex', gap: 2 }}>
                {teammates.map((t) => <ChampionIcon key={t.id} championId={t.champion_id} size={20} rounded="rounded-sm" />)}
              </div>
            </div>
          )}
          {opponents.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: '0.65rem', color: '#6b6b7e', width: 28 }}>상대</span>
              <div style={{ display: 'flex', gap: 2 }}>
                {opponents.map((t) => <ChampionIcon key={t.id} championId={t.champion_id} size={20} rounded="rounded-sm" />)}
              </div>
            </div>
          )}
        </div>

        {/* 펼치기 화살표 */}
        <div style={{ flexShrink: 0, color: '#6b6b7e', fontSize: 12, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          ▼
        </div>
      </div>

      {/* 확장 상세 */}
      {expanded && (
        <div style={{ background: '#0d0e14', borderTop: '1px solid #1e2030', padding: '10px 0' }}>
          {/* 헤더 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '28px 44px 1fr 52px 80px 160px',
            gap: 8, padding: '0 12px 6px',
            borderBottom: '1px solid #1e2030',
          }}>
            {['스펠', '챔피언', '소환사', 'KDA', '룬', '아이템'].map((h) => (
              <div key={h} style={{ fontSize: '0.65rem', color: '#6b6b7e', textAlign: h === 'KDA' ? 'center' : 'left' }}>{h}</div>
            ))}
          </div>

          {/* 팀 1 */}
          <div style={{ padding: '6px 0 2px' }}>
            <div style={{ padding: '3px 12px 5px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px', borderRadius: 4,
                background: winTeam === 1 ? 'rgba(68,137,200,0.2)' : winTeam === 2 ? 'rgba(232,64,87,0.15)' : 'rgba(255,255,255,0.05)',
                color: winTeam === 1 ? '#4489c8' : winTeam === 2 ? '#e84057' : '#8b8b9e',
              }}>
                1팀 {winTeam === 1 ? '승리' : winTeam === 2 ? '패배' : '-'}
              </span>
            </div>
            {team1.map((p) => (
              <ParticipantRow key={p.id} p={p} isMe={p.streamer_id === streamerId} isWin={p.result === 'WIN'} />
            ))}
          </div>

          {/* 구분선 */}
          <div style={{ height: 1, background: '#1e2030', margin: '6px 12px' }} />

          {/* 팀 2 */}
          <div style={{ padding: '2px 0 6px' }}>
            <div style={{ padding: '3px 12px 5px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px', borderRadius: 4,
                background: winTeam === 2 ? 'rgba(68,137,200,0.2)' : winTeam === 1 ? 'rgba(232,64,87,0.15)' : 'rgba(255,255,255,0.05)',
                color: winTeam === 2 ? '#4489c8' : winTeam === 1 ? '#e84057' : '#8b8b9e',
              }}>
                2팀 {winTeam === 2 ? '승리' : winTeam === 1 ? '패배' : '-'}
              </span>
            </div>
            {team2.map((p) => (
              <ParticipantRow key={p.id} p={p} isMe={p.streamer_id === streamerId} isWin={p.result === 'WIN'} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
