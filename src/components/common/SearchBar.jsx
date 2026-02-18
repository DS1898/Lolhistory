import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegionSelector from './RegionSelector';
import { DEFAULT_REGION } from '../../utils/constants';

export default function SearchBar({ className = '', size = 'md' }) {
  const [riotId, setRiotId] = useState('');
  const [region, setRegion] = useState(DEFAULT_REGION);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = riotId.trim();
    if (!trimmed) return;

    const hashIndex = trimmed.lastIndexOf('#');
    let gameName, tagLine;

    if (hashIndex > 0) {
      gameName = trimmed.slice(0, hashIndex);
      tagLine = trimmed.slice(hashIndex + 1);
    } else {
      gameName = trimmed;
      tagLine = region;
    }

    if (gameName && tagLine) {
      navigate(`/player/${region}/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`);
      setRiotId('');
    }
  };

  const sizeClasses = {
    sm: 'h-9 text-sm',
    md: 'h-11 text-base',
    lg: 'h-13 text-lg',
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <RegionSelector value={region} onChange={setRegion} />
      <div className="flex-1 flex">
        <input
          type="text"
          value={riotId}
          onChange={(e) => setRiotId(e.target.value)}
          placeholder="소환사명#태그 (예: Hide on bush#KR1)"
          className={`flex-1 bg-bg-tertiary text-text-primary border border-border rounded-l-lg px-4 focus:outline-none focus:border-primary placeholder:text-text-muted ${sizeClasses[size]}`}
        />
        <button
          type="submit"
          className={`bg-primary text-bg-primary font-semibold px-6 rounded-r-lg hover:bg-primary-light transition-colors ${sizeClasses[size]}`}
        >
          검색
        </button>
      </div>
    </form>
  );
}
