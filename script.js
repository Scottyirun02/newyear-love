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
      // 有些浏览器 source 存在但文件 404，这里简单提醒即可
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

function burst(x, y) {
  const count = Math.floor(rand(120, 200)); // ✅ 更多粒子
  for (let i = 0; i < count; i++) {
    const a = rand(0, Math.PI * 2);
    const s = rand(2.4, 8.8);              // ✅ 更猛的爆炸速度
    particles.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: rand(55, 110),                 // ✅ 更长寿命（更有拖尾感）
      age: 0,
      size: rand(1.8, 3.8),                // ✅ 更大
      hue: rand(0, 360),
    });
  }
}

function loop() {
  // 轻微黑幕（让亮点更突出）
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  // 发光叠加
  ctx.globalCompositeOperation = "lighter";

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.age++;
    p.vy += 0.045;     // 重力（略增一点更像烟花下落）
    p.vx *= 0.990;     // 阻尼
    p.vy *= 0.990;
    p.x += p.vx;
    p.y += p.vy;

    const t = 1 - p.age / p.life; // 0~1
    if (t <= 0) {
      particles.splice(i, 1);
      continue;
    }

    const alpha = Math.max(0, t);
    const r = p.size;

    // ✅ 光晕（更亮更梦幻）
    ctx.beginPath();
    ctx.fillStyle = `hsla(${p.hue}, 100%, 75%, ${alpha * 0.55})`;
    ctx.arc(p.x, p.y, r * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // ✅ 核心亮点
    ctx.beginPath();
    ctx.fillStyle = `hsla(${p.hue}, 100%, 82%, ${alpha})`;
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 恢复默认混合模式
  ctx.globalCompositeOperation = "source-over";
  requestAnimationFrame(loop);
}
loop();

// 点击“放烟花”
const fireBtn = document.getElementById("fireBtn");
if (fireBtn) {
  fireBtn.addEventListener("click", () => {
    // 连放 3 发（更爽）
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        burst(rand(80, window.innerWidth - 80), rand(120, window.innerHeight * 0.55));
      }, i * 220);
    }
  });
}

// ✅ 打开页面自动连放烟花（3轮，每轮3发）
function autoFireworks() {
  const rounds = 20;     // 想更久：改 6 或 8
  const perRound = 3;
  const gap = 250;

  for (let r = 0; r < rounds; r++) {
    setTimeout(() => {
      for (let i = 0; i < perRound; i++) {
        setTimeout(() => {
          burst(
            rand(80, window.innerWidth - 80),
            rand(120, window.innerHeight * 0.55)
          );
        }, i * 220);
      }
    }, r * gap);
  }
}

window.addEventListener("load", () => {
  setTimeout(autoFireworks, 450);
});

// 点击任意空白处也放烟花
window.addEventListener("pointerdown", (e) => {
  if (e.target.closest(".btn")) return; // 点按钮不额外触发
  burst(e.clientX, e.clientY);
});
