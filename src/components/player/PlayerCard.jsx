import { getProfileIconUrl } from '../../utils/championUtils';
import { useChampions } from '../../context/ChampionDataContext';
import RankBadge from './RankBadge';

export default function PlayerCard({ profile, region }) {
  const { version } = useChampions();
  const { account, summoner, soloRank, flexRank } = profile;

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-6">
      <div className="flex flex-col sm:flex-row items-start gap-6">
        <div className="relative">
          <img
            src={getProfileIconUrl(summoner.profileIconId, version)}
            alt="프로필"
            className="w-24 h-24 rounded-xl border-2 border-primary-dark"
          />
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-bg-tertiary text-primary text-xs font-bold px-2 py-0.5 rounded-full border border-border">
            {summoner.summonerLevel}
          </span>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">
            {account.gameName}
            <span className="text-text-muted">#{account.tagLine}</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1">{region}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <RankBadge entry={soloRank} />
            <RankBadge entry={flexRank} />
          </div>
        </div>
      </div>
    </div>
  );
}
