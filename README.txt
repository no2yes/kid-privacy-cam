원아 사진 촬영 앱 (웹앱)

[올리는 방법 - GitHub Pages / 계정: no2yes]
1. GitHub(no2yes 계정)에서 새 저장소 만들기 (예: kid-privacy-cam, Public)
2. 이 폴더 안의 파일 전체를 저장소에 업로드 (index.html, manifest.json, sw.js, icon-*.png, models 폴더, ort 폴더)
   - 폴더째 끌어다 놓으면 됩니다. 압축은 먼저 풀어 주세요.
3. 저장소 Settings → Pages → Branch: main / (root) → Save
4. 1~2분 뒤 https://no2yes.github.io/kid-privacy-cam/ 로 접속
5. 아이폰 사파리로 접속 → 공유 버튼 → "홈 화면에 추가"

[수정해서 다시 올릴 때]
- sw.js 맨 위 CACHE = 'kidcam-v1' 의 숫자를 올려 주세요 (v2, v3 …). 그래야 폰에 저장된 옛 파일이 새 것으로 바뀝니다.
