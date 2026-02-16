// 读取 URL 参数：?to=xxx&from=xxx
function getParam(name, fallback = "") {
  const u = new URL(location.href);
  return u.searchParams.get(name) || fallback;
}

const to = getParam("to", "");
const from = getParam("from", "");

const titleEl = document.getElementById("title");
const subtitleEl = document.getElementById("subtitle");

// 兼容：你现在 HTML 里可能没有 subtitle
if (titleEl && to) titleEl.textContent = `新年快乐，${to}！🎉`;
if (subtitleEl && (to || from)) {
  const base = "愿新的一年，平安喜乐、万事胜意，也愿我们一直一直在一起。";
  subtitleEl.textContent = from ? `${base}（来自：${from}）` : base;
}

// ===== 音乐按钮（你放 music.mp3 才会有声音）=====
const musicBtn = document.getElementById("musicBtn");
const bgm = document.getElementById("bgm");
let playing = false;

if (musicBtn && bgm) {
  musicBtn.addEventListener("click", async () => {
    try {
      const src = bgm.querySelector("source")?.getAttribute("src");
      if (!src) {
        alert("你还没放音乐文件：把 music.mp3 放到同目录，并在 index.html 里加上 <source>。");
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
      alert("播放失败（手机常见）：请再点一次或换个浏览器试试。");
    }
  });
}

// ===== 复制链接按钮（如果你 HTML 里没有 shareBtn，也不会报错）=====
const shareBtn = document.getElementById("shareBtn");
if (shareBtn) {
  shareBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      alert("链接已复制！发给她就好～");
    } catch {
      prompt("复制失败（可能不支持剪贴板权限），你手动复制这个：", location.href);
    }
  });
}

// ===== 烟花效果（Canvas）=====
// 粉色浪漫：整体偏粉紫 + 柔光 + 慢一些 + 更梦幻的光晕
const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d");

function resize() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

const particles = [];
function rand(min, max) { return Math.random() * (max - min) + min; }

// 粉紫色系（浪漫）：在 300°~360°（偏粉紫） + 0°~25°（偏玫红）之间取
function romanticHue() {
  return Math.random() < 0.72 ? rand(300, 360) : rand(0, 25);
}

// 爱心形状（轻量版）：偶尔给一点“心动感”
function isHeart() {
  return Math.random() < 0.12; // 12% 概率是爱心爆炸
}

function burst(x, y) {
  const heart = isHeart();
  const count = heart ? Math.floor(rand(140, 210)) : Math.floor(rand(90, 150));
  const baseHue = romanticHue();

  for (let i = 0; i < count; i++) {
    let a, s;

    if (heart) {
      // 近似心形散开：用参数方程生成方向（不是精确，但很像“心”）
      const t = rand(0, Math.PI * 2);
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
      a = Math.atan2(hy, hx);
      s = rand(1.6, 4.8);
    } else {
      a = rand(0, Math.PI * 2);
      s = rand(1.8, 6.2); // 比“震撼版”慢一点，更浪漫
    }

    particles.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: rand(75, 140),    // 更长寿命，更梦幻拖尾
      age: 0,
      size: rand(1.6, 3.4),
      hue: baseHue + rand(-12, 12), // 同一束颜色更统一（粉紫）
    });
  }
}

function loop() {
  // 更柔和的黑幕（别太黑，保留梦幻感）
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  // 柔光叠加
  ctx.globalCompositeOperation = "lighter";

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.age++;

    // 更轻的重力 + 更慢的阻尼（漂浮感）
    p.vy += 0.028;
    p.vx *= 0.992;
    p.vy *= 0.992;

    p.x += p.vx;
    p.y += p.vy;

    const t = 1 - p.age / p.life;
    if (t <= 0) {
      particles.splice(i, 1);
      continue;
    }

    const alpha = Math.max(0, t);
    const r = p.size;

    // 梦幻光晕（更大、更柔）
    ctx.beginPath();
    ctx.fillStyle = `hsla(${p.hue}, 100%, 78%, ${alpha * 0.22})`;
    ctx.arc(p.x, p.y, r * 4.2, 0, Math.PI * 2);
    ctx.fill();

    // 第二层光晕（更亮一些）
    ctx.beginPath();
    ctx.fillStyle = `hsla(${p.hue}, 100%, 80%, ${alpha * 0.45})`;
    ctx.arc(p.x, p.y, r * 2.4, 0, Math.PI * 2);
    ctx.fill();

    // 核心亮点
    ctx.beginPath();
    ctx.fillStyle = `hsla(${p.hue}, 100%, 84%, ${alpha})`;
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = "source-over";
  requestAnimationFrame(loop);
}
loop();

// ✅ 进入页面就一直循环放烟花（不需要按钮）
// 说明：用 setInterval 持续发射；再做“开场小连发”
let loopTimer = null;

// 发射一发：位置偏上半屏更浪漫
function shootOne() {
  burst(
    rand(80, window.innerWidth - 80),
    rand(120, window.innerHeight * 0.52)
  );
}

// 开场：先来一小段连发（仪式感）
function opening() {
  for (let i = 0; i < 7; i++) {
    setTimeout(shootOne, i * 260);
  }
}

// 持续：一直放（建议 420~650ms 之间）
function startLoop() {
  if (loopTimer) clearInterval(loopTimer);
  loopTimer = setInterval(() => {
    shootOne();

    // 偶尔加一发“同点双爆”（更浪漫但不吵）
    if (Math.random() < 0.22) {
      setTimeout(() => burst(rand(80, innerWidth - 80), rand(120, innerHeight * 0.52)), 140);
    }
  }, 520);
}

window.addEventListener("load", () => {
  setTimeout(() => {
    opening();
    startLoop();
  }, 350);
});

// （可选）如果你想完全禁止点击触发，就不要加 pointerdown 监听
// 这里我不加，保证“只自动循环放”，符合你的要求。
