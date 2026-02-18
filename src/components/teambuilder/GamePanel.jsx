import { useState } from 'react';
import { useTeamBuilder } from '../../context/TeamBuilderContext';
import TeamPanel from './TeamPanel';
import GameResultSelector from './GameResultSelector';
import ChampionPickerModal from './ChampionPickerModal';

export default function GamePanel() {
  const { state } = useTeamBuilder();
  const [pickerInfo, setPickerInfo] = useState(null);

  const handleOpenPicker = (side, role) => {
    setPickerInfo({ side, role });
  };

  const game = state.games[state.activeGameIndex];
  if (!game) return null;

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-6">
        <TeamPanel side="BLUE" onOpenChampionPicker={handleOpenPicker} />
        <div className="hidden lg:flex items-center">
          <div className="w-px h-full bg-border" />
        </div>
        <TeamPanel side="RED" onOpenChampionPicker={handleOpenPicker} />
      </div>

      <GameResultSelector gameIndex={state.activeGameIndex} />

      {pickerInfo && (
        <ChampionPickerModal
          side={pickerInfo.side}
          role={pickerInfo.role}
          gameIndex={state.activeGameIndex}
          onClose={() => setPickerInfo(null)}
        />
      )}
    </div>
  );
}
