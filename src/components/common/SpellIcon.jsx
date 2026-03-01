import { getSpellIconUrl, getSpellName } from '../../lib/ddragon';

export default function SpellIcon({ spellId, size = 24 }) {
  const url = getSpellIconUrl(spellId);
  if (!url) return (
    <div style={{ width: size, height: size, borderRadius: 4, background: 'var(--bg-input)', border: '1px solid var(--border-clr)' }} />
  );
  return (
    <img src={url} alt={getSpellName(spellId)} width={size} height={size}
      style={{ borderRadius: 4, objectFit: 'cover' }}
      title={getSpellName(spellId)}
      onError={(e) => { e.currentTarget.style.opacity = '0.3'; }} />
  );
}
