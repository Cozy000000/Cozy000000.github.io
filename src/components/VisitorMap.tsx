import { useEffect, useRef, useState } from 'react';
import { ExternalLink, LinkArrow } from './Shared';

type MapStatus = 'loading' | 'ready' | 'error' | 'timeout' | 'unconfigured';

const statusMessages: Record<MapStatus, string> = {
  loading: 'Loading visitor map…',
  ready: 'Visitor map loaded.',
  error: 'The visitor map is temporarily unavailable.',
  timeout: 'The visitor map is taking longer than expected to load.',
  unconfigured: 'The visitor map is awaiting activation.',
};

export function VisitorMap({ imageUrl, statsUrl }: { imageUrl: string; statsUrl: string }) {
  const [attempt, setAttempt] = useState(0);
  // A new URL is needed only on explicit retry: browsers can otherwise reuse
  // the same stalled image request. Theme changes keep the original URL.
  const imageSrc = attempt ? `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}_retry=${attempt}` : imageUrl;
  const requestKey = `${imageUrl}:${attempt}`;
  const currentRequest = useRef(requestKey);
  currentRequest.current = requestKey;
  const completedRequest = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const [result, setResult] = useState<{ key: string; status: MapStatus }>({ key: requestKey, status: imageUrl ? 'loading' : 'unconfigured' });
  const status: MapStatus = !imageUrl ? 'unconfigured' : result.key === requestKey ? result.status : 'loading';

  useEffect(() => {
    if (!imageUrl || completedRequest.current === requestKey) return;
    timer.current = setTimeout(() => {
      if (currentRequest.current === requestKey && completedRequest.current !== requestKey) {
        setResult({ key: requestKey, status: 'timeout' });
      }
    }, 12_000);
    return () => clearTimeout(timer.current);
  }, [imageUrl, requestKey]);

  function finish(next: 'ready' | 'error') {
    if (currentRequest.current !== requestKey) return;
    completedRequest.current = requestKey;
    clearTimeout(timer.current);
    setResult({ key: requestKey, status: next });
  }

  const canRetry = status === 'error' || status === 'timeout';
  return <section className="visitor-map" aria-labelledby="visitor-map-heading" data-state={status}>
    <div className="visitor-map-heading"><div><h2 id="visitor-map-heading">Visitors around the world</h2><p>Visitor countries and regions</p></div><ExternalLink href={statsUrl || 'https://flagcounter.com/'} className="text-link visitor-map-provider">Flag Counter <LinkArrow /></ExternalLink></div>
    <div className="visitor-map-content" aria-busy={status === 'loading'} hidden={status === 'unconfigured'}>
      <div className="visitor-map-embed" style={{ width: '100%', maxWidth: 520 }}>
        {imageUrl && <ExternalLink href={statsUrl} aria-label="View visitor statistics on Flag Counter"><img key={requestKey} className="visitor-map-image" src={imageSrc} alt="World map showing visitor countries and regions" width={600} height={291} loading="eager" decoding="async" style={{ display: 'block', width: '100%', height: 'auto' }} onLoad={event => finish(event.currentTarget.naturalWidth > 1 ? 'ready' : 'error')} onError={() => finish('error')} /></ExternalLink>}
      </div>
    </div>
    <div className="visitor-map-feedback"><p className={status === 'ready' ? 'sr-only' : 'visitor-map-status'} role="status" aria-live="polite">{statusMessages[status]}</p>{canRetry && <button className="paper-link visitor-map-retry" type="button" aria-label="Retry visitor map" onClick={() => setAttempt(value => value + 1)}>Retry</button>}</div>
  </section>;
}
