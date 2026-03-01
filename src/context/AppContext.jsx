import { createContext, useContext, useState, useEffect } from 'react';

// ── 번역 데이터 ────────────────────────────────────────────
const T = {
  ko: {
    nav_streamers: '스트리머',
    nav_search_placeholder: '스트리머 검색...',
    hero_subtitle: '방송인들의 팀게임 전적을 한눈에 확인하세요',
    hero_search_placeholder: '스트리머 이름 검색...',
    streak_title: '연승 현황',
    streak_subtitle: '최근 연속 기록',
    streak_win_label: '연승 중',
    streak_loss_label: '연패 중',
    streak_win_unit: '연승',
    streak_loss_unit: '연패',
    streak_win_badge: '연승 중',
    streak_loss_badge: '연패 중',
    section_all_streamers: '전체 스트리머',
    section_view_all: '전체 보기 →',
    dropdown_recent: '최근 기록',
    dropdown_results: '검색 결과',
    tab_recent: '최근 20경기',
    tab_champ: '챔피언 통계',
    tab_h2h: '상대전적',
    stat_games: '게임',
    stat_wins: '승',
    stat_losses: '패',
    stat_winrate: '승률',
    soop_link: 'SOOP 방송 보기',
    no_matches: '이 시즌의 경기 기록이 없습니다.',
    streamer_not_found: '스트리머를 찾을 수 없습니다.',
    back_to_list: '목록으로',
    streamers_title: '스트리머',
    search_placeholder: '이름 검색...',
    search_btn: '검색',
    no_results: '에 해당하는 스트리머가 없습니다.',
    no_streamers: '등록된 스트리머가 없습니다.',
    footer_desc: '방송인들의 팀게임 전적을 한눈에 확인하세요.',
    footer_riot: '이 사이트는 Riot Games의 공식 서비스가 아닙니다.',
    footer_menu: '메뉴',
    footer_home: '홈',
    footer_streamers: '스트리머',
    footer_share: '공유',
    footer_share_btn: '이 페이지 공유하기',
    footer_copied: '링크가 복사되었습니다!',
    footer_copyright: '© {year} SoLog. League of Legends는 Riot Games의 상표입니다.',
    footer_made: 'Made with ♥',
    hover_view: '전적 보기 →',
    loading: '불러오는 중...',
    lang_label: '한국어',
    // 포지션
    pos_top: '탑', pos_jungle: '정글', pos_mid: '미드', pos_adc: '원딜', pos_support: '서폿',
    // 경기 카드
    match_win: '승', match_loss: '패',
    ally_label: '아군', enemy_label: '상대',
    unregistered: '(미등록)',
    team_label: '{n}팀', team_win: '승리', team_loss: '패배',
    // 컬럼 헤더
    col_spell: '스펠', col_champion: '챔피언', col_summoner: '소환사',
    col_rune: '룬', col_item: '아이템', col_streamer: '스트리머',
    col_games: '경기', col_winrate: '승률', col_wl: '승/패', col_avg_kda: '평균 KDA',
    // 날짜
    date_today: '오늘', date_days_ago: '{n}일 전', date_weeks_ago: '{n}주 전', date_months_ago: '{n}개월 전',
    // 데이터 없음
    champ_no_data: '챔피언 통계 데이터가 없습니다.',
    h2h_no_data: '상대 전적 데이터가 없습니다.',
    // 스탯 표시
    total_games: '총 {n}게임',
    search_results_count: '"{q}" 검색 결과 — {n}명',
  },
  en: {
    nav_streamers: 'Streamers',
    nav_search_placeholder: 'Search streamer...',
    hero_subtitle: 'Check broadcaster team game records at a glance',
    hero_search_placeholder: 'Search streamer name...',
    streak_title: 'Streak Status',
    streak_subtitle: 'Recent consecutive records',
    streak_win_label: 'Win streak',
    streak_loss_label: 'Loss streak',
    streak_win_unit: 'W Streak',
    streak_loss_unit: 'L Streak',
    streak_win_badge: 'Win Streak',
    streak_loss_badge: 'Loss Streak',
    section_all_streamers: 'All Streamers',
    section_view_all: 'View all →',
    dropdown_recent: 'Recent',
    dropdown_results: 'Results',
    tab_recent: 'Recent 20 Games',
    tab_champ: 'Champion Stats',
    tab_h2h: 'Head to Head',
    stat_games: 'Games',
    stat_wins: 'W',
    stat_losses: 'L',
    stat_winrate: 'Win Rate',
    soop_link: 'Watch on SOOP',
    no_matches: 'No match records for this season.',
    streamer_not_found: 'Streamer not found.',
    back_to_list: 'Back to list',
    streamers_title: 'Streamers',
    search_placeholder: 'Search name...',
    search_btn: 'Search',
    no_results: 'No streamers found for ',
    no_streamers: 'No streamers registered.',
    footer_desc: 'Check broadcaster team game records at a glance.',
    footer_riot: 'This site is not an official Riot Games service.',
    footer_menu: 'Menu',
    footer_home: 'Home',
    footer_streamers: 'Streamers',
    footer_share: 'Share',
    footer_share_btn: 'Share this page',
    footer_copied: 'Link copied!',
    footer_copyright: '© {year} SoLog. League of Legends is a trademark of Riot Games.',
    footer_made: 'Made with ♥',
    hover_view: 'View stats →',
    loading: 'Loading...',
    lang_label: 'English',
    // Positions
    pos_top: 'Top', pos_jungle: 'Jungle', pos_mid: 'Mid', pos_adc: 'ADC', pos_support: 'Support',
    // Match card
    match_win: 'W', match_loss: 'L',
    ally_label: 'Ally', enemy_label: 'Enemy',
    unregistered: '(Unknown)',
    team_label: 'Team {n}', team_win: 'Win', team_loss: 'Loss',
    // Column headers
    col_spell: 'Spell', col_champion: 'Champion', col_summoner: 'Summoner',
    col_rune: 'Rune', col_item: 'Item', col_streamer: 'Streamer',
    col_games: 'Games', col_winrate: 'Win Rate', col_wl: 'W/L', col_avg_kda: 'Avg KDA',
    // Dates
    date_today: 'Today', date_days_ago: '{n}d ago', date_weeks_ago: '{n}w ago', date_months_ago: '{n}mo ago',
    // No data
    champ_no_data: 'No champion stats available.',
    h2h_no_data: 'No head-to-head data.',
    // Stats
    total_games: 'Total {n} Games',
    search_results_count: '"{q}" results — {n}',
  },
  zh: {
    nav_streamers: '主播',
    nav_search_placeholder: '搜索主播...',
    hero_subtitle: '一眼掌握主播的团队游戏战绩',
    hero_search_placeholder: '搜索主播名字...',
    streak_title: '连胜状态',
    streak_subtitle: '近期连续记录',
    streak_win_label: '连胜中',
    streak_loss_label: '连败中',
    streak_win_unit: '连胜',
    streak_loss_unit: '连败',
    streak_win_badge: '连胜中',
    streak_loss_badge: '连败中',
    section_all_streamers: '全部主播',
    section_view_all: '查看全部 →',
    dropdown_recent: '最近记录',
    dropdown_results: '搜索结果',
    tab_recent: '最近20场',
    tab_champ: '英雄统计',
    tab_h2h: '对战记录',
    stat_games: '场',
    stat_wins: '胜',
    stat_losses: '败',
    stat_winrate: '胜率',
    soop_link: '观看直播',
    no_matches: '本赛季暂无比赛记录。',
    streamer_not_found: '未找到该主播。',
    back_to_list: '返回列表',
    streamers_title: '主播',
    search_placeholder: '搜索名字...',
    search_btn: '搜索',
    no_results: '没有找到相关主播：',
    no_streamers: '暂无注册主播。',
    footer_desc: '一眼掌握主播的团队游戏战绩。',
    footer_riot: '本网站非Riot Games官方服务。',
    footer_menu: '菜单',
    footer_home: '首页',
    footer_streamers: '主播',
    footer_share: '分享',
    footer_share_btn: '分享此页面',
    footer_copied: '链接已复制！',
    footer_copyright: '© {year} SoLog. League of Legends 是 Riot Games 的商标。',
    footer_made: 'Made with ♥',
    hover_view: '查看战绩 →',
    loading: '加载中...',
    lang_label: '中文',
    // 位置
    pos_top: '上单', pos_jungle: '打野', pos_mid: '中路', pos_adc: 'ADC', pos_support: '辅助',
    // 对战卡
    match_win: '胜', match_loss: '败',
    ally_label: '队友', enemy_label: '对手',
    unregistered: '(未注册)',
    team_label: '{n}队', team_win: '胜利', team_loss: '失败',
    // 列标题
    col_spell: '技能', col_champion: '英雄', col_summoner: '召唤师',
    col_rune: '符文', col_item: '装备', col_streamer: '主播',
    col_games: '场次', col_winrate: '胜率', col_wl: '胜/负', col_avg_kda: '平均KDA',
    // 日期
    date_today: '今天', date_days_ago: '{n}天前', date_weeks_ago: '{n}周前', date_months_ago: '{n}个月前',
    // 无数据
    champ_no_data: '无英雄统计数据。',
    h2h_no_data: '无对战记录。',
    // 统计
    total_games: '共{n}场',
    search_results_count: '"{q}" 搜索结果 — {n}人',
  },
};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('soop_theme') || 'dark');
  const [lang, setLangState] = useState(() => localStorage.getItem('soop_lang') || 'ko');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('soop_theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  function setLang(l) {
    setLangState(l);
    localStorage.setItem('soop_lang', l);
  }

  function t(key, vars = {}) {
    const str = T[lang]?.[key] ?? T['ko']?.[key] ?? key;
    return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : ''));
  }

  return (
    <AppContext.Provider value={{ theme, toggleTheme, lang, setLang, t }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  return useContext(AppContext);
}
