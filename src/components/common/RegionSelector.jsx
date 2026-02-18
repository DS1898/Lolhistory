import { REGIONS, DEFAULT_REGION } from '../../utils/constants';

export default function RegionSelector({ value, onChange, className = '' }) {
  return (
    <select
      value={value || DEFAULT_REGION}
      onChange={(e) => onChange(e.target.value)}
      className={`bg-bg-tertiary text-text-primary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary ${className}`}
    >
      {Object.entries(REGIONS).map(([key, { label }]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  );
}
