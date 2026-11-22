/* 오프라인에서도 쓰도록 앱 파일과 AI 모델을 폰에 저장해 두는 서비스워커.
   앱을 수정해서 다시 올렸다면 아래 버전(v3)를 v4, v5…로 올려 주세요. */
const CACHE = 'kidcam-v3';
const CORE = [
  './', 'index.html', 'manifest.json',
  'icon-180.png', 'icon-192.png', 'icon-512.png',
  'ort/ort.min.js', 'ort/ort-wasm-simd.wasm',
  'models/yolov8n-seg.onnx'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
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
        if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then(h => h || caches.match('index.html')))
    );
    return;
  }

  // 나머지(모델·라이브러리·아이콘)는 저장본 우선
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
      return res;
    }))
  );
});
