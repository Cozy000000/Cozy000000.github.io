import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ExternalLink, LinkArrow } from './Shared';

type MapStatus = 'loading' | 'ready' | 'error' | 'timeout' | 'unconfigured';

const statusMessages: Record<MapStatus, string> = {
  loading: 'Loading visitor map…',
  ready: 'Visitor map loaded.',
  error: 'The visitor map is temporarily unavailable.',
  timeout: 'The visitor map is taking longer than expected to load.',
  unconfigured: 'The visitor map is awaiting activation.',
};

export function VisitorMap({ scriptUrl, statsUrl }: { scriptUrl: string; statsUrl: string }) {
  const instanceId = useId();
  const frame = useRef<HTMLIFrameElement>(null);
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${instanceId}:${scriptUrl}:${statsUrl}:${attempt}`;
  const completedRequest = useRef<string | null>(null);
  const [result, setResult] = useState<{ key: string; status: MapStatus }>({ key: requestKey, status: scriptUrl ? 'loading' : 'unconfigured' });
  const [height, setHeight] = useState(300);
  const status: MapStatus = !scriptUrl ? 'unconfigured' : result.key === requestKey ? result.status : 'loading';
  const frameUrl = useMemo(() => {
    if (!scriptUrl) return '';
    const source = new URL(scriptUrl);
    if (attempt) source.searchParams.set('_retry', String(attempt));
    const params = new URLSearchParams({ script: source.href, stats: statsUrl, channel: requestKey });
    return `/visitor-map.html?${params}`;
  }, [scriptUrl, statsUrl, requestKey, attempt]);

  useEffect(() => {
    if (!scriptUrl) return;
    const timer = setTimeout(() => {
      if (completedRequest.current !== requestKey) setResult({ key: requestKey, status: 'timeout' });
    }, 12_000);
    const receive = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || event.data?.widget !== 'mapmyvisitors' || event.data.channel !== requestKey) return;
      if (Number.isFinite(event.data.height) && event.data.height >= 80 && event.data.height <= 1200) setHeight(Math.ceil(event.data.height));
      if (event.data.status === 'ready' || (event.data.status === 'error' && completedRequest.current !== requestKey)) {
        completedRequest.current = requestKey;
        clearTimeout(timer);
        setResult(previous => previous.key === requestKey && previous.status === event.data.status ? previous : { key: requestKey, status: event.data.status });
      }
    };
    window.addEventListener('message', receive);
    frame.current?.contentWindow?.postMessage({ widget: 'mapmyvisitors', channel: requestKey }, '*');
    return () => { clearTimeout(timer); window.removeEventListener('message', receive); };
  }, [requestKey, scriptUrl]);

  const canRetry = status === 'error' || status === 'timeout';
  return <section className="visitor-map" aria-labelledby="visitor-map-heading" data-state={status}>
    <div className="visitor-map-heading"><div><h2 id="visitor-map-heading">Visitors around the world</h2><p>Visitor countries and regions</p></div><ExternalLink href={statsUrl || 'https://mapmyvisitors.com/'} className="text-link visitor-map-provider">MapMyVisitors <LinkArrow /></ExternalLink></div>
    <div className="visitor-map-content" aria-busy={status === 'loading'} hidden={status === 'unconfigured'}>
      {scriptUrl && <iframe key={requestKey} ref={frame} title="Visitor map powered by MapMyVisitors" className="visitor-map-frame" src={frameUrl} height={height} loading="eager" sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" referrerPolicy="strict-origin-when-cross-origin" onLoad={() => frame.current?.contentWindow?.postMessage({ widget: 'mapmyvisitors', channel: requestKey }, '*')} />}
    </div>
    <div className="visitor-map-feedback"><p className={status === 'ready' ? 'sr-only' : 'visitor-map-status'} role="status" aria-live="polite">{statusMessages[status]}</p>{canRetry && <button className="paper-link visitor-map-retry" type="button" aria-label="Retry visitor map" onClick={() => setAttempt(value => value + 1)}>Retry</button>}</div>
  </section>;
}
