import { useState, useEffect } from 'react';

export default function TypewriterText({ text = 'SoLog', highlightWord = 'So' }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    if (displayed.length < text.length) {
      const t = setTimeout(() => {
        const next = text.slice(0, displayed.length + 1);
        setDisplayed(next);
        if (next.length >= text.length) setDone(true);
      }, 90);
      return () => clearTimeout(t);
    }
  }, [displayed, done, text]);

  // 하이라이트 단어와 나머지 분리해서 색상 적용
  const idx = displayed.indexOf(highlightWord);
  if (idx === -1) {
    return (
      <span>
        <span style={{ color: 'var(--text-hi)' }}>{displayed}</span>
        {!done && <span style={{ display: 'inline-block', width: 3, height: '0.9em', background: '#4489c8', marginLeft: 2, verticalAlign: 'text-bottom', animation: 'blink 1s step-end infinite' }} />}
      </span>
    );
  }

  const before = displayed.slice(0, idx);
  const highlight = displayed.slice(idx, idx + highlightWord.length);
  const after = displayed.slice(idx + highlightWord.length);

  return (
    <span>
      <span style={{ color: 'var(--text-hi)' }}>{before}</span>
      <span style={{ color: '#4489c8' }}>{highlight}</span>
      <span style={{ color: 'var(--text-hi)' }}>{after}</span>
      {!done && <span style={{ display: 'inline-block', width: 3, height: '0.9em', background: '#4489c8', marginLeft: 2, verticalAlign: 'text-bottom', animation: 'blink 1s step-end infinite' }} />}
    </span>
  );
}
