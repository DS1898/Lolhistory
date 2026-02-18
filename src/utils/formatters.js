export function calcKDA(kills, deaths, assists) {
  if (deaths === 0) return 'Perfect';
  return ((kills + assists) / deaths).toFixed(2);
}

export function calcWinRate(wins, losses) {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

export function formatGameDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function timeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 30) return `${days}일 전`;
  return `${Math.floor(days / 30)}개월 전`;
}

export function formatCS(cs, duration) {
  const perMin = (cs / (duration / 60)).toFixed(1);
  return `${cs} (${perMin}/분)`;
}

export function tierToKorean(tier) {
  const map = {
    IRON: '아이언', BRONZE: '브론즈', SILVER: '실버',
    GOLD: '골드', PLATINUM: '플래티넘', EMERALD: '에메랄드',
    DIAMOND: '다이아몬드', MASTER: '마스터',
    GRANDMASTER: '그랜드마스터', CHALLENGER: '챌린저',
  };
  return map[tier] || tier;
}
