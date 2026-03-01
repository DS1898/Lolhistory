import { getItemIconUrl, getItemName } from '../../lib/ddragon';

export default function ItemIcon({ itemId, size = 24 }) {
  if (!itemId || itemId === '0') return (
    <div style={{ width: size, height: size, borderRadius: 4, background: 'var(--bg-input)', border: '1px solid var(--border-clr)' }} />
  );
  const url = getItemIconUrl(itemId);
  return (
    <img src={url} alt={getItemName(itemId)} width={size} height={size}
      style={{ borderRadius: 4, objectFit: 'cover' }}
      title={getItemName(itemId)}
      onError={(e) => { e.currentTarget.style.opacity = '0.2'; }} />
  );
}
