// slucam 플레이어 요소 — go2rtc 의 VideoRTC(video-rtc.js, MIT © AlexxIT)를 그대로
// 쓰되 세 가지가 다르다.
//   1) <video> 를 처음부터 무음으로 만든다. go2rtc 원본은 소리를 켠 채 시작하고
//      자동재생이 거부될 때만 무음으로 물러서기 때문에, 화면을 한 번 탭한 뒤
//      재접속되면 비밀번호 없이 소리가 났다. 소리는 부모 앱이 비밀번호 뒤에서만 켠다.
//   2) 플레이어 자체 컨트롤을 뺀다 — 부모 앱의 HUD 가 전부 그린다.
//   3) 실시간 감시(2026-10-29). 사용자 신고: 가끔 몇 분 전 화면이 보이고, 그때 캡처를
//      누르면 서버의 "지금" 이 찍혀 어긋난다. 원인은 회선이 느려지면 터널·서버에 밀린
//      데이터가 실시간 속도로만 흘러와, 버퍼는 비어 있는데 내용은 계속 몇 분 전인 것.
//      (버퍼가 쌓이는 쪽은 video-rtc.js 가 5초 넘으면 스스로 끝으로 건너뛴다.)
//      "흘러간 실제 시간 − 재생된 영상 시간" 을 재서 10초 넘게 뒤처지면
//      다시 접속한다(새 접속은 서버의 지금 키프레임부터). 3분 안에 두 번 반복되면
//      회선이 그 화질을 못 버티는 것이라 player.html 이 저화질로 내려간다(resync 이벤트).
//      WebRTC 모드(srcObject)는 프레임을 버리며 따라가므로 해당 없음. MSE(blob:) 만.
import { VideoRTC } from "./video-rtc.js";

const DELAY_LIMIT = 10; // 초 — 이보다 뒤처지면 재접속
const RESYNC_WINDOW = 180_000; // ms — 이 안에 두 번이면 저화질 권고

class SluStream extends VideoRTC {
  oninit() {
    super.oninit();
    this.video.muted = true;
    this.video.controls = false;
    this.drift = { t0: 0, c0: 0, last: 0, resyncs: [] };
    // 일시정지 뒤 재생은 기준을 새로 잡는다 (정지한 동안은 뒤처진 게 아니다)
    this.video.addEventListener("play", () => {
      this.drift.t0 = 0;
    });
    this.liveTimer = setInterval(() => this.watch(), 2000);
  }

  watch() {
    const v = this.video;
    if (!v || v.srcObject || v.paused || v.readyState < 2) return;
    if (!String(v.src || "").startsWith("blob:")) return; // MSE 가 아니면(HLS 등) 건드리지 않는다

    // 버퍼 끝으로 건너뛰는 일은 video-rtc.js 에 맡긴다(5초 넘으면 끝−1초). 여기서 2초
    // 기준으로 더 촘촘히 건너뛰게 했더니 폰 하드웨어 디코더가 키프레임이 아닌 지점에서
    // 다음 키프레임까지 까만 화면을 보여 "소리 켜면 까매진다" 는 신고가 왔다(2026-10-29).

    // 세션 시작 뒤로 "흘러간 실제 시간 − 재생된 영상 시간" = 쌓인 지연
    const d = this.drift;
    if (v.currentTime < d.last - 1) d.t0 = 0; // 영상 시간이 되돌아갔다 = 새 세션(재접속)
    d.last = v.currentTime;
    if (!d.t0) {
      if (v.currentTime > 0.5) {
        d.t0 = Date.now();
        d.c0 = v.currentTime;
      }
      return;
    }
    const delay = (Date.now() - d.t0) / 1000 - (v.currentTime - d.c0);
    if (delay <= DELAY_LIMIT) return;

    d.t0 = 0;
    const now = Date.now();
    d.resyncs = d.resyncs.filter((t) => now - t < RESYNC_WINDOW);
    d.resyncs.push(now);
    this.ondisconnect();
    this.onconnect();
    this.dispatchEvent(
      new CustomEvent("resync", { detail: { delay: Math.round(delay), count: d.resyncs.length } })
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (!this.isConnected && this.liveTimer) clearInterval(this.liveTimer);
  }
}

customElements.define("slu-stream", SluStream);
