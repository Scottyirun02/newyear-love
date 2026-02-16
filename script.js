// 读取 URL 参数：?to=xxx&from=xxx
function getParam(name, fallback = "") {
  const u = new URL(location.href);
  return u.searchParams.get(name) || fallback;
}

const to = getParam("to", "");
const from = getParam("from", "");
const titleEl = document.getElementById("title");
const subtitleEl = document.getElementById("subtitle");

if (to) titleEl.textContent = `新年快乐，${to}！🎉`;
if (to || from) {
  const base = "愿新的一年，平安喜乐、万事胜意，也愿我们一直一直在一起。";
  subtitleEl.textContent = from ? `${base}（来自：${from}）` : base;
}

// 音乐按钮（你放 music.mp3 才会有声音）
const musicBtn = document.getElementById("musicBtn");
const bgm = document.getElementById("bgm");
let playing = false;

musicBtn.addEventListener("click", async () => {
  try {
    if (!bgm.querySelector("source")) {
      alert("你还没放音乐文件：把 music.mp3 放到同目录，并在 index.html 里取消注释 <source>。");
      return;
    }
    if (!playing) {
      await bgm.play();
      playing = true;
      musicBtn.textContent = "⏸ 暂停音乐";
    } else {
      bgm.pause();
      playing = false;
      musicBtn.textContent = "🎵 播放音乐";
    }
  } catch (e) {
    alert("浏览器阻止了自动播放/播放失败：请再点一次或换个浏览器试试。");
  }
});

// 复制链接按钮：把当前网址复制给她
document.getElementById("shareBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(location.href);
    alert("链接已复制！发给她就好～");
  } catch {
    prompt("复制失败（可能不支持剪贴板权限），你手动复制这个：", location.href);
  }
});

// ===== 烟花效果（Canvas）=====
const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d");
let W = 0, H = 0;

function resize() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  W = canvas.width = Math.floor(window.innerWidth * dpr);
  H = canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // 逻辑像素
}
window.addEventListener("resize", resize);
resize();

const particles = [];
function rand(min, max) { return Math.random() * (max - min) + min; }

function burst(x, y) {
  const count = Math.floor(rand(60, 110));
  for (let i = 0; i < count; i++) {
    const a = rand(0, Math.PI * 2);
    const s = rand(1.5, 5.2);
    particles.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: rand(40, 80),
      age: 0,
      size: rand(1, 2.6),
      hue: rand(0, 360),
    });
  }
}

function loop() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  ctx.globalCompositeOperation = "lighter"; // ✅ 发光叠加

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.age++;
    p.vy += 0.04;      // 重力
    p.vx *= 0.992;     // 阻尼
    p.vy *= 0.992;
    p.x += p.vx;
    p.y += p.vy;

    const t = 1 - p.age / p.life;
    if (t <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.beginPath();
    ctx.fillStyle = `hsla(${p.hue}, 95%, 70%, ${Math.max(0, t)})`;
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = "source-over"; // ✅ 恢复
  requestAnimationFrame(loop);
}
loop();

// 点击“放烟花”
document.getElementById("fireBtn").addEventListener("click", () => {
  for (let i = 0; i < 3; i++) {
    setTimeout(() => burst(rand(80, window.innerWidth - 80), rand(120, window.innerHeight * 0.55)), i * 220);
  }
});

// 首次进来自动放一次（更有仪式感）
setTimeout(() => burst(window.innerWidth * 0.5, window.innerHeight * 0.35), 700);

// 也支持点击任意位置放烟花
window.addEventListener("pointerdown", (e) => {
  // 避免点到按钮也触发太多
  if (e.target.closest(".btn")) return;
  burst(e.clientX, e.clientY);

});
