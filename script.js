const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

let stars = [];

function resize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createStars(count){
  stars = [];
  for(let i = 0; i < count; i++){
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.3,
      speed: Math.random() * 0.25 + 0.05,
      alpha: Math.random() * 0.4 + 0.6
    });
  }
}

function drawStars(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  for(let s of stars){

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);

    ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
    ctx.fill();

    s.y += s.speed;

    if(s.y > canvas.height){
      s.y = 0;
      s.x = Math.random() * canvas.width;
    }

    s.alpha += (Math.random() - 0.5) * 0.02;
    if(s.alpha < 0.2) s.alpha = 0.2;
    if(s.alpha > 1) s.alpha = 1;
  }

  requestAnimationFrame(drawStars);
}

window.addEventListener("resize", () => {
  resize();
  createStars(140);
});

resize();
createStars(140);
drawStars();


// =======================
// TAROT SYSTEM
// =======================

const cards = document.querySelectorAll(".card");
const intros = document.querySelectorAll(".intro");
const result = document.getElementById("result");
const linesEl = document.getElementById("lines");

let opened = false;
let loading = false;

async function loadWords(){
  if (window.wordCache) return window.wordCache;

  const res = await fetch("365word.json");
  window.wordCache = await res.json();
  return window.wordCache;
}

function getDayOfYear(){
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

cards.forEach(card => {

  card.addEventListener("click", async () => {

    if(opened || loading) return;
    loading = true;
    opened = true;

    const data = await loadWords();

    const randomIndex = Math.floor(Math.random() * data.length);
    const todayWord = data[randomIndex];

    // ซ่อนการ์ดอื่น
    cards.forEach(c => {
      if(c !== card){
        c.classList.add("fade-out");
      }
    });

    // ซ่อน title/subtitle
    intros.forEach(el => {
      el.classList.add("fade-out");
    });

    // =========================
    // STEP 1: จับตำแหน่งจริงก่อนลอย
    // =========================
    setTimeout(() => {

      const rect = card.getBoundingClientRect();

      card.style.setProperty("--start-x", rect.left + "px");
      card.style.setProperty("--start-y", rect.top + "px");

      card.classList.add("selected", "lifting");

    }, 250);

    // =========================
    // STEP 2: ลอยขึ้นไปด้านบน
    // =========================
    setTimeout(() => {

      card.style.left = "50%";
      card.style.top = "25%";
      card.style.transform = "translate(-50%, -50%) scale(1.35)";

    }, 550);

    // =========================
    // STEP 3: spin
    // =========================
    setTimeout(() => {

      card.classList.remove("lifting");
      card.classList.add("spinning");

    }, 900);

    // =========================
    // STEP 4: flip
    // =========================
    setTimeout(() => {

      card.classList.remove("spinning");

      const title = card.querySelector(".card-title");
      title.innerHTML = `THE<br>${todayWord.word}`;

      card.classList.add("flipped");

    }, 2200);

    // =========================
    // STEP 5: result
    // =========================
    setTimeout(() => {

      result.classList.remove("hidden");
      linesEl.innerHTML = "";

      todayWord.lines.forEach(([letter, text], i) => {

        const div = document.createElement("div");
        div.className = "line";
        div.style.animationDelay = `${i * 0.25}s`;
        div.innerHTML = `<strong>${letter}</strong> — ${text}`;

        linesEl.appendChild(div);
      });

      loading = false;

    }, 2500);

  });

});

const shareBtn = document.getElementById("shareBtn");

shareBtn.addEventListener("click", async () => {

  const target = document.querySelector(".container");

  const canvas = await html2canvas(target, {
    backgroundColor: null,
    scale: 2
  });

  canvas.toBlob(async (blob) => {

    const file = new File(
      [blob],
      "love-tarot.png",
      { type: "image/png" }
    );

    // มือถือรองรับ native share
    if(navigator.canShare && navigator.canShare({ files:[file] })){

      await navigator.share({
        files:[file],
        title:"Love Tarot",
        text:"My Love Card Tonight ✨"
      });

    }else{

      // fallback โหลดรูป
      const link = document.createElement("a");
      link.download = "love-tarot.png";
      link.href = URL.createObjectURL(blob);
      link.click();
    }

  });

});