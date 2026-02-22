import { useState, Fragment } from 'react';
import ChampionIcon from '../common/ChampionIcon';
import { DUMMY_CHAMPION_STATS } from './dummyData';

/* ─── Helpers ──────────────────────────────────────────── */

function kdaDisplay(kills, deaths, assists) {
  if (deaths === 0) return { text: '완벽', color: 'var(--clr-kda-perfect)' };
  const ratio = (kills + assists) / deaths;
  return {
    text: ratio.toFixed(2),
    color:
      ratio >= 4.0 ? 'var(--clr-kda-great)' :
      ratio >= 2.5 ? 'var(--clr-kda-good)'  :
                     'var(--txt-hi)',
  };
}

function wrColor(rate) {
  return rate >= 60 ? 'var(--clr-win)' :
         rate <= 40 ? 'var(--clr-loss)' :
                      'var(--txt-mid)';
}

/* ─── Sub-components ───────────────────────────────────── */

function WrBar({ rate }) {
  const color = wrColor(rate);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div className="st-wr-track">
        <div
          className="st-wr-fill"
          style={{ width: `${rate}%`, background: color }}
        />
      </div>
      <span style={{
        fontSize: '12px',
        fontWeight: 600,
        minWidth: '34px',
        textAlign: 'right',
        fontVariantNumeric: 'tabular-nums',
        color,
      }}>
        {new Intl.NumberFormat('ko', { maximumFractionDigits: 0 }).format(rate)}%
      </span>
    </div>
  );
}

function OpponentGrid({ opponents }) {
  return (
    <div className="st-expand-content">
      <p className="st-expand-label">상대 챔피언</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {opponents.map((opp) => {
          const wr = opp.games > 0 ? (opp.wins / opp.games) * 100 : 0;
          const chipClass =
            wr >= 60 ? 'st-chip-win' :
            wr <= 40 ? 'st-chip-loss' :
                       'st-chip-neutral';

          return (
            <div key={opp.id} className="st-opp-card">
              <ChampionIcon championId={opp.id} size={28} rounded="rounded-sm" />
              <div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--txt-hi)',
                  lineHeight: 1.25,
                  marginBottom: '3px',
                }}>
                  {opp.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span className={`st-chip ${chipClass}`}>
                    {opp.wins}W {opp.losses}L
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontVariantNumeric: 'tabular-nums',
                    color: wrColor(wr),
                  }}>
                    {new Intl.NumberFormat('ko', { maximumFractionDigits: 0 }).format(wr)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────── */

export default function ChampionTable({ data = DUMMY_CHAMPION_STATS }) {
  const [expanded, setExpanded] = useState(null);

  function handleToggle(id) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  return (
    <div className="st-panel" style={{ overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        padding: '13px 18px',
        borderBottom: '1px solid var(--bdr-faint)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--txt-hi)' }}>
          챔피언 통계
        </span>
        <span className="st-chip st-chip-neutral">{data.length}개</span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="st-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: '18px' }}>챔피언</th>
              <th className="th-center">게임</th>
              <th style={{ minWidth: '160px' }}>승률</th>
              <th className="th-center">승 / 패</th>
              <th className="th-center">KDA</th>
              <th style={{ width: '40px' }} aria-label="행 펼치기" />
            </tr>
          </thead>
          <tbody>
            {data.map((champ) => {
              const wr  = champ.games > 0 ? (champ.wins / champ.games) * 100 : 0;
              const kda = kdaDisplay(champ.kills, champ.deaths, champ.assists);
              const isOpen = expanded === champ.id;

              return (
                <Fragment key={champ.id}>
                  {/* Data row */}
                  <tr
                    className={isOpen ? 'is-expanded' : ''}
                    onClick={() => handleToggle(champ.id)}
                    style={{ cursor: 'pointer' }}
                    aria-expanded={isOpen}
                  >
                    {/* Champion */}
                    <td style={{ paddingLeft: '18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ChampionIcon
                          championId={champ.id}
                          size={36}
                          rounded="rounded-md"
                        />
                        <div>
                          <div style={{
                            fontWeight: 600,
                            fontSize: '13px',
                            color: 'var(--txt-hi)',
                            lineHeight: 1.3,
                          }}>
                            {champ.name}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            color: 'var(--txt-lo)',
                            fontVariantNumeric: 'tabular-nums',
                            marginTop: '1px',
                          }}>
                            {champ.kills.toFixed(1)}
                            {' / '}
                            <span style={{ color: 'var(--clr-loss)' }}>
                              {champ.deaths.toFixed(1)}
                            </span>
                            {' / '}
                            {champ.assists.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Games */}
                    <td className="td-center">
                      <span style={{
                        fontWeight: 700,
                        fontSize: '16px',
                        fontVariantNumeric: 'tabular-nums',
                        color: 'var(--txt-hi)',
                      }}>
                        {champ.games}
                      </span>
                    </td>

                    {/* Win rate bar */}
                    <td style={{ paddingRight: '20px' }}>
                      <WrBar rate={wr} />
                    </td>

                    {/* W / L chips */}
                    <td className="td-center">
                      <div style={{
                        display: 'flex',
                        gap: '4px',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        <span className="st-chip st-chip-win">{champ.wins}W</span>
                        <span style={{ color: 'var(--bdr-emphasis)', fontSize: '10px' }}>·</span>
                        <span className="st-chip st-chip-loss">{champ.losses}L</span>
                      </div>
                    </td>

                    {/* KDA */}
                    <td className="td-center">
                      <span style={{
                        fontWeight: 700,
                        fontSize: '14px',
                        fontVariantNumeric: 'tabular-nums',
                        color: kda.color,
                      }}>
                        {kda.text}
                      </span>
                    </td>

                    {/* Expand toggle */}
                    <td style={{ paddingRight: '14px', textAlign: 'center' }}>
                      <span className={`st-expand-icon ${isOpen ? 'is-open' : ''}`}>
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 11 11"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M3.5 1.5L7.5 5.5L3.5 9.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </td>
                  </tr>

                  {/* Expanded opponent row */}
                  {isOpen && (
                    <tr className="expand-row">
                      <td colSpan={6}>
                        <OpponentGrid opponents={champ.opponents} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
