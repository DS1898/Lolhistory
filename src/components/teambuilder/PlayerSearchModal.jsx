import { useState } from 'react';
import { useTeamBuilder } from '../../context/TeamBuilderContext';
import { ROLES, DEFAULT_REGION } from '../../utils/constants';
import RegionSelector from '../common/RegionSelector';

export default function PlayerSearchModal({ side, onClose }) {
  const { state, dispatch } = useTeamBuilder();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [region, setRegion] = useState(DEFAULT_REGION);

  const teamKey = side.toLowerCase();
  const existingRoles = state[teamKey].players.map((p) => p.role);
  const availableRoles = ROLES.filter((r) => !existingRoles.includes(r.key));

  const handleAdd = () => {
    if (!name.trim() || !role) return;
    dispatch({
      type: 'ADD_PLAYER',
      payload: {
        side,
        player: { name: name.trim(), role, region, profileData: null },
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-bg-secondary border border-border rounded-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">선수 추가</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-text-secondary text-sm mb-1">선수 이름 / Riot ID</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: Faker, Hide on bush#KR1"
              className="w-full bg-bg-tertiary text-text-primary border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-1">리전</label>
            <RegionSelector value={region} onChange={setRegion} className="w-full" />
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-1">포지션</label>
            <div className="flex gap-2 flex-wrap">
              {availableRoles.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRole(r.key)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    role === r.key
                      ? 'bg-primary text-bg-primary'
                      : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {r.icon} {r.label}
                </button>
              ))}
            </div>
            {availableRoles.length === 0 && (
              <p className="text-text-muted text-sm mt-1">모든 포지션이 배정되었습니다.</p>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={!name.trim() || !role}
            className="w-full py-3 bg-primary text-bg-primary font-semibold rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}
