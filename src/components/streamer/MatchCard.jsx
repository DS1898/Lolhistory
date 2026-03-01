import { useState } from 'react';
import ChampionIcon from '../common/ChampionIcon';
import SpellIcon from '../common/SpellIcon';
import ItemIcon from '../common/ItemIcon';
import RuneIcon from '../common/RuneIcon';
import { useApp } from '../../context/AppContext';

function kda(kills, deaths, assists) {
  if (deaths === 0) return 'Perfect';
  return ((kills + assists) / deaths).toFixed(2);
}

function relativeDate(dateStr, t) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return t('date_today');
  if (days < 7) return t('date_days_ago', { n: days });
  if (days < 30) return t('date_weeks_ago', { n: Math.floor(days / 7) });
  return t('date_months_ago', { n: Math.floor(days / 30) });
}

const ITEM_SLOTS = ['item0', 'item1', 'item2', 'item3', 'item4', 'item5'];

function ItemRow({ participant }) {
  const trinket = participant.item6;
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {ITEM_SLOTS.map((slot) => <ItemIcon key={slot} itemId={participant[slot]} size={22} />)}
      <div style={{ width: 4 }} />
      <ItemIcon itemId={trinket} size={22} />
    </div>
  );
}

function ParticipantRow({ p, isMe, isWin, positionLabel }) {
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
      {/* 스펠 */}
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
            background: 'var(--bg-base)', border: '1px solid var(--border-clr)',
            borderRadius: 4, fontSize: 9, fontWeight: 800,
            color: 'var(--text-hi)', padding: '0 3px', lineHeight: '14px',
          }}>{p.champion_level}</span>
        )}
      </div>

      {/* 이름 */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: '0.8rem', fontWeight: isMe ? 700 : 500,
          color: isMe ? 'var(--text-hi)' : 'var(--text-mid)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {p.streamer?.name || positionLabel.unregistered}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-lo)' }}>
          {positionLabel[p.position] || p.position || ''}
        </div>
      </div>

      {/* KDA */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-hi)' }}>
          {p.kills}/<span style={{ color: '#e84057' }}>{p.deaths}</span>/{p.assists}
        </div>
        <div style={{ fontSize: '0.68rem', color: kdaRatio === 'Perfect' ? '#4489c8' : 'var(--text-mid)' }}>
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
  const { t } = useApp();
  const [expanded, setExpanded] = useState(false);
  const isWin = participation.result === 'WIN';
  const match = participation.match;
  const myTeam = participation.team;

  const POSITION_MAP = {
    TOP: t('pos_top'), JUNGLE: t('pos_jungle'), MID: t('pos_mid'),
    ADC: t('pos_adc'), SUPPORT: t('pos_support'),
    unregistered: t('unregistered'),
  };

  const teammates = allParticipants
    .filter((p) => p.match_id === match.id && p.team === myTeam && p.streamer_id !== streamerId)
    .slice(0, 4);
  const opponents = allParticipants
    .filter((p) => p.match_id === match.id && p.team !== myTeam)
    .slice(0, 5);

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
      {/* 요약 행 */}
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
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isWin ? '#4489c8' : '#e84057' }}>
            {isWin ? t('match_win') : t('match_loss')}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-lo)', marginTop: 2 }}>
            {relativeDate(match.played_at, t)}
          </div>
        </div>

        {/* 챔피언 */}
        <div style={{ flexShrink: 0, position: 'relative' }}>
          <ChampionIcon championId={participation.champion_id} size={44} rounded="rounded-lg" />
          {participation.champion_level && (
            <span style={{
              position: 'absolute', bottom: -3, right: -5,
              background: 'var(--bg-base)', border: '1px solid var(--border-clr)',
              borderRadius: 4, fontSize: 9, fontWeight: 800, color: 'var(--text-hi)', padding: '0 3px', lineHeight: '14px',
            }}>{participation.champion_level}</span>
          )}
          {participation.position && (
            <div style={{ fontSize: '0.65rem', color: 'var(--text-lo)', textAlign: 'center', marginTop: 3 }}>
              {POSITION_MAP[participation.position] || participation.position}
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
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-hi)' }}>
            {participation.kills}/<span style={{ color: '#e84057' }}>{participation.deaths}</span>/{participation.assists}
          </div>
          <div style={{ fontSize: '0.72rem', color: kdaRatio === 'Perfect' ? '#4489c8' : 'var(--text-mid)', marginTop: 1 }}>
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
              <span style={{ fontSize: '0.65rem', color: 'var(--text-lo)', width: 28 }}>{t('ally_label')}</span>
              <div style={{ display: 'flex', gap: 2 }}>
                {teammates.map((p) => <ChampionIcon key={p.id} championId={p.champion_id} size={20} rounded="rounded-sm" />)}
              </div>
            </div>
          )}
          {opponents.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-lo)', width: 28 }}>{t('enemy_label')}</span>
              <div style={{ display: 'flex', gap: 2 }}>
                {opponents.map((p) => <ChampionIcon key={p.id} championId={p.champion_id} size={20} rounded="rounded-sm" />)}
              </div>
            </div>
          )}
        </div>

        {/* 펼치기 화살표 */}
        <div style={{ flexShrink: 0, color: 'var(--text-lo)', fontSize: 12, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          ▼
        </div>
      </div>

      {/* 확장 상세 */}
      {expanded && (
        <div style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border-clr)', padding: '10px 0' }}>
          {/* 헤더 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '28px 44px 1fr 52px 80px 160px',
            gap: 8, padding: '0 12px 6px',
            borderBottom: '1px solid var(--border-clr)',
          }}>
            {[t('col_spell'), t('col_champion'), t('col_summoner'), 'KDA', t('col_rune'), t('col_item')].map((h) => (
              <div key={h} style={{ fontSize: '0.65rem', color: 'var(--text-lo)', textAlign: h === 'KDA' ? 'center' : 'left' }}>{h}</div>
            ))}
          </div>

          {/* 팀 1 */}
          <div style={{ padding: '6px 0 2px' }}>
            <div style={{ padding: '3px 12px 5px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px', borderRadius: 4,
                background: winTeam === 1 ? 'rgba(68,137,200,0.2)' : winTeam === 2 ? 'rgba(232,64,87,0.15)' : 'rgba(255,255,255,0.05)',
                color: winTeam === 1 ? '#4489c8' : winTeam === 2 ? '#e84057' : 'var(--text-mid)',
              }}>
                {t('team_label', { n: 1 })} {winTeam === 1 ? t('team_win') : winTeam === 2 ? t('team_loss') : '-'}
              </span>
            </div>
            {team1.map((p) => (
              <ParticipantRow key={p.id} p={p} isMe={p.streamer_id === streamerId} isWin={p.result === 'WIN'} positionLabel={POSITION_MAP} />
            ))}
          </div>

          {/* 구분선 */}
          <div style={{ height: 1, background: 'var(--border-clr)', margin: '6px 12px' }} />

          {/* 팀 2 */}
          <div style={{ padding: '2px 0 6px' }}>
            <div style={{ padding: '3px 12px 5px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px', borderRadius: 4,
                background: winTeam === 2 ? 'rgba(68,137,200,0.2)' : winTeam === 1 ? 'rgba(232,64,87,0.15)' : 'rgba(255,255,255,0.05)',
                color: winTeam === 2 ? '#4489c8' : winTeam === 1 ? '#e84057' : 'var(--text-mid)',
              }}>
                {t('team_label', { n: 2 })} {winTeam === 2 ? t('team_win') : winTeam === 1 ? t('team_loss') : '-'}
              </span>
            </div>
            {team2.map((p) => (
              <ParticipantRow key={p.id} p={p} isMe={p.streamer_id === streamerId} isWin={p.result === 'WIN'} positionLabel={POSITION_MAP} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
