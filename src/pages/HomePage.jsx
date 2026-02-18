import { Link } from 'react-router-dom';
import SearchBar from '../components/common/SearchBar';

const features = [
  {
    icon: '🔍',
    title: '전적 검색',
    desc: 'Riot ID로 소환사의 랭크, 전적, 모스트 챔피언을 확인하세요.',
    to: '/search',
  },
  {
    icon: '⚔️',
    title: '팀 빌더',
    desc: 'LCK 스타일 시리즈 경기를 구성하고 챔피언 제한을 관리하세요.',
    to: '/team-builder',
  },
  {
    icon: '🛡️',
    title: '챔피언 도감',
    desc: '전체 챔피언을 역할별로 검색하고 확인하세요.',
    to: '/champions',
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-bg-card/50 to-bg-primary" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-primary">LoL</span> Team Builder
          </h1>
          <p className="text-text-secondary text-lg mb-8">
            전적 검색부터 LCK 스타일 팀 빌더까지, 리그 오브 레전드를 더 즐겁게
          </p>
          <SearchBar size="lg" className="max-w-2xl mx-auto" />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="bg-bg-secondary border border-border rounded-xl p-6 hover:border-primary-dark hover:bg-bg-card transition-all group"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                {f.title}
              </h3>
              <p className="text-text-secondary text-sm">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
