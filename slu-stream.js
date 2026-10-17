// slucam 플레이어 요소 — go2rtc 의 VideoRTC(video-rtc.js, MIT © AlexxIT)를 그대로
// 쓰되 두 가지만 다르다.
//   1) <video> 를 처음부터 무음으로 만든다. go2rtc 원본은 소리를 켠 채 시작하고
//      자동재생이 거부될 때만 무음으로 물러서기 때문에, 화면을 한 번 탭한 뒤
//      재접속되면 비밀번호 없이 소리가 났다. 소리는 부모 앱이 비밀번호 뒤에서만 켠다.
//   2) 플레이어 자체 컨트롤을 뺀다 — 부모 앱의 HUD 가 전부 그린다.
import { VideoRTC } from "./video-rtc.js";

class SluStream extends VideoRTC {
  oninit() {
    super.oninit();
    this.video.muted = true;
    this.video.controls = false;
  }
}

customElements.define("slu-stream", SluStream);
