const cv = $("game"), cx = cv.getContext("2d");
let W = 0, H = 0, DPR = 1, ZOOM = 1;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  cv.width = W * DPR; cv.height = H * DPR;
  ZOOM = Math.max(0.6, Math.min(1.15, Math.min(W, H) / 680));
}
window.addEventListener("resize", resize); resize();

