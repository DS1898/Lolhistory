import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}

export default function Footer() {
  const { t } = useApp();

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: 'SoLog', text: t('hero_subtitle'), url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(t('footer_copied'));
    }
  }

  return (
    <footer style={{ borderTop: '1px solid var(--border-clr)', marginTop: 'auto', background: 'var(--bg-base)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '3rem', marginBottom: '2.5rem' }}>
          {/* 브랜드 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#4489c8,#2d6ea8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#fff' }}>S</div>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-hi)' }}>
                <span style={{ color: '#4489c8' }}>So</span>Log
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-lo)', lineHeight: 1.7, maxWidth: 260 }}>
              {t('footer_desc')}<br />{t('footer_riot')}
            </p>
          </div>

          {/* 메뉴 */}
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4489c8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>{t('footer_menu')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['/', t('footer_home')], ['/streamers', t('footer_streamers')], ['/contact', '문의하기']].map(([to, label]) => (
                <Link key={to} to={to} style={{ fontSize: '0.85rem', color: 'var(--text-lo)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--text-hi)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-lo)'}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* 공유 */}
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4489c8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>{t('footer_share')}</p>
            <button onClick={handleShare} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(68,137,200,0.1)', border: '1px solid rgba(68,137,200,0.25)',
              borderRadius: 10, padding: '0.5rem 1rem', color: '#4489c8',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(68,137,200,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(68,137,200,0.1)'; }}>
              <ShareIcon />
              {t('footer_share_btn')}
            </button>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-clr)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-lo)' }}>
            {t('footer_copyright', { year: new Date().getFullYear() })}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-lo)' }}>{t('footer_made')}</p>
        </div>
      </div>
    </footer>
  );
}
