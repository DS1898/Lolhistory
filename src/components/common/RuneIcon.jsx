import { getRuneIconUrl } from '../../lib/ddragon';

export default function RuneIcon({ icon, name = '', size = 24 }) {
  if (!icon) return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--bg-input)', border: '1px solid var(--border-clr)' }} />
  );
  return (
    <img src={getRuneIconUrl(icon)} alt={name} width={size} height={size}
      style={{ borderRadius: '50%', objectFit: 'cover' }}
      title={name}
      onError={(e) => { e.currentTarget.style.opacity = '0.3'; }} />
  );
}
