import ChampionTable from '../components/champions/ChampionTable';

export default function ChampionsPage() {
  return (
    <div style={{
      maxWidth: '920px',
      margin: '0 auto',
      padding: '36px 20px 60px',
    }}>
      {/* Page header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--txt-hi)',
          marginBottom: '5px',
          letterSpacing: '-0.2px',
        }}>
          챔피언 통계
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--txt-mid)' }}>
          챔피언별 전적 · 상대 챔피언 분석 — 행을 클릭하면 상세 정보를 확인할 수 있습니다.
        </p>
      </div>

      <ChampionTable />
    </div>
  );
}
