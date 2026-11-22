/* 오프라인에서도 쓰도록 앱 파일과 AI 모델을 폰에 저장해 두는 서비스워커.
   - 화면·아이콘 같은 가벼운 파일: APP_CACHE (수정본을 올릴 때마다 아래 버전을 올려 주세요)
   - AI 모델·실행 파일(약 25MB): ASSET_CACHE (버전을 올려도 지우지 않음 → 다시 받지 않음)
   AI 모델 파일(models/, ort/)을 새것으로 바꿀 때만 ASSET_CACHE 이름의 숫자를 올리세요. */
const APP_CACHE = 'kidcam-app-v6';
const ASSET_CACHE = 'kidcam-assets-1';

const APP_FILES = ['./', 'index.html', 'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
const HEAVY_FILES = ['ort/ort.min.js', 'ort/ort-wasm-simd.wasm', 'models/yolov8n-seg.onnx'];
const isHeavy = url => /\/(models|ort)\//.test(url.pathname);

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const app = await caches.open(APP_CACHE);
    await app.addAll(APP_FILES);
    const assets = await caches.open(ASSET_CACHE);
    for (const f of HEAVY_FILES) {
      const url = new URL(f, self.location).href;
      if (await assets.match(url)) continue;               // 이미 있으면 그대로 사용
      const old = await caches.match(url);                 // 예전 버전 캐시에 있으면 복사 (다시 받지 않음)
      if (old) { await assets.put(url, old.clone()); continue; }
      const res = await fetch(url);
      if (res.ok) await assets.put(url, res);
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== APP_CACHE && k !== ASSET_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // 화면(HTML)은 인터넷이 되면 최신 것을, 안 되면 저장본을 사용
  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    e.respondWith(
      fetch(req).then(res => {
        if (res.ok) { const cp = res.clone(); caches.open(APP_CACHE).then(c => c.put(req, cp)); }
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then(h => h || caches.match('index.html')))
    );
    return;
  }

  // 나머지는 저장본 우선 (AI 파일은 ASSET_CACHE, 그 외는 APP_CACHE)
  const target = isHeavy(url) ? ASSET_CACHE : APP_CACHE;
  e.respondWith(
    caches.open(target).then(c => c.match(req, { ignoreSearch: true })).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(target).then(c => c.put(req, cp)); }
      return res;
    }))
  );
});
