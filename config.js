// ─────────────────────────────────────────────────────────────
//  slucam 설정 — 여기가 유일한 설정이다.
//  (앱 안의 설정 UI는 제거됨 — 보는 사람이 실수로 만질 수 없게)
//  ⚠ 수정 후에는 tapo 폴더에서 `npm run build` 해야 실서비스에 반영된다.
// ─────────────────────────────────────────────────────────────
window.SLUCAM = {
  // 카메라 조종(PTZ) UI 표시 여부 — 현재 보류. 서버(slucam-ptz)와 코드는 살아
  // 있으므로 true 로 바꾸고 빌드하면 다시 나타난다.
  ptz: false,

  // 카메라 목록 — 화면에 보이는 순서 = 이 배열 순서. 이름은 자리 기준(pos N).
  // id 는 projects\slucam\go2rtc.yaml 의 streams: 이름과 동일해야 함.
  //   go2rtc.yaml 에 "<id>_lo"(작은 화면용 저화질)·"<id>_sub"(생존 확인·블랙박스)도 같이 있어야 함.
  // aspect(타일 비율)·rotate(고정 회전)는 필요할 때만 — 지금은 둘 다 정방향 16:9.
  // locked: 프라이버시 잠금 — 비밀번호 전까지 화면을 아예 안 불러온다.
  //   비밀번호는 캠마다 다르며 lib/pins.ts 의 PRIVACY_PINS 에 있다.
  // 임시 개방하려면 unlockUntil: <epoch ms> 를 붙이고 빌드 (지나면 자동 재잠금).
  //   epoch 값 뽑기: [DateTimeOffset]::Now.AddHours(2).ToUnixTimeMilliseconds()
  cams: [
    { id: "baby", name: "pos 1" },
    { id: "living", name: "pos 2", locked: true },
    { id: "home", name: "pos 3", locked: true }, // 고향집
  ],
};
