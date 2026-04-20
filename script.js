/* ========================
   요소 가져오기
======================== */
const intro = document.getElementById("intro");
const introVideo = document.getElementById("introVideo");
const entry = document.getElementById("entry");
const experience = document.getElementById("experience");
const entryImage = document.getElementById("entryImage");
const cursor = document.getElementById("cursor");
const audioElement = document.getElementById("audio");
const indicator = document.getElementById("indicator");
const outro = document.getElementById("outro");
const outroText = document.getElementById("outroText");

let started = false;


/* ========================
   Web Audio API
======================== */
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
window._audioCtx = audioCtx;

const filter = audioCtx.createBiquadFilter();
filter.type = "lowpass";
filter.frequency.value = 100;

const gainNode = audioCtx.createGain();
gainNode.gain.value = 0.3;

const source = audioCtx.createMediaElementSource(audioElement);
source.connect(filter);
filter.connect(gainNode);
gainNode.connect(audioCtx.destination);

audioElement.addEventListener("play", () => {
  audioCtx.resume().then(() => {
    filter.frequency.value = 100;
    gainNode.gain.value = 0.3;
  });
});

/* 오디오 끊김 방지 */
audioElement.addEventListener("ended", () => {
  audioElement.currentTime = 0;
  audioElement.play();
});

setInterval(() => {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}, 1000);


/* ========================
   커서 변경 함수
======================== */
function setExperienceCursor() {
  cursor.style.width = "32px";
  cursor.style.height = "32px";
  cursor.style.borderRadius = "0";
  cursor.style.backgroundImage = "url('contents/arrow.svg')";
  cursor.style.backgroundSize = "contain";
  cursor.style.backgroundRepeat = "no-repeat";
  cursor.style.backgroundPosition = "center";
  cursor.style.backgroundColor = "transparent";
}

function setEntryCursor() {
  cursor.style.width = "15px";
  cursor.style.height = "15px";
  cursor.style.borderRadius = "50%";
  cursor.style.backgroundImage = "none";
  cursor.style.backgroundColor = "#000000";
  cursor.style.backgroundSize = "";
  cursor.style.backgroundRepeat = "";
  cursor.style.backgroundPosition = "";
}

function setHoverCursor(color) {
  cursor.style.width = "15px";
  cursor.style.height = "15px";
  cursor.style.borderRadius = "50%";
  cursor.style.backgroundImage = "none";
  cursor.style.backgroundColor = color;
  cursor.style.backgroundSize = "";
  cursor.style.backgroundRepeat = "";
  cursor.style.backgroundPosition = "";
}

/* ========================
   오디오 초기화 함수
======================== */
function resetAudio() {
  audioElement.currentTime = 0;
  filter.frequency.value = 100;
  gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.setTargetAtTime(0.3, audioCtx.currentTime, 0.5);
  audioElement.play();
}


/* ========================
   랜딩 시퀀스 (최초 진입)
======================== */
function startLanding() {
  const outroSound = document.getElementById("outroSound");

  outro.classList.remove("hidden");
  outro.classList.add("active");

  outroSound.currentTime = 0;
  outroSound.play();

  setTimeout(() => {
    outroText.classList.add("visible");
  }, 1000);

  setTimeout(() => {
    outroText.classList.remove("visible");
    entry.classList.remove("hidden");
    setEntryCursor();

    outro.classList.add("fadeout");

    setTimeout(() => {
      outro.classList.add("hidden");
      outro.classList.remove("fadeout");
      outro.classList.remove("active");
    }, 2000);
  }, 4000);
}

startLanding();


/* ========================
   커스텀 커서
======================== */
window.addEventListener("mousemove", (e) => {
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
});


/* ========================
   entry 마우스 패럴랙스
======================== */
window.addEventListener("mousemove", (e) => {
  if (started) return;
  const x = (e.clientX / window.innerWidth - 0.5);
  const y = (e.clientY / window.innerHeight - 0.5);
  const strength = 40;
  entryImage.style.transform = `translate(${x * strength * -1}px, ${y * strength * -1}px) scale(1.1)`;
});


/* ========================
   entryWord 호버
======================== */
const introStr = "entering";

document.querySelectorAll(".entryWord").forEach((word) => {
  word.addEventListener("mouseenter", () => {
    document.querySelectorAll(".entryWord").forEach(w => w.classList.add("hovered"));
    setHoverCursor("#935c66");
  });
  word.addEventListener("mouseleave", () => {
    document.querySelectorAll(".entryWord").forEach(w => w.classList.remove("hovered"));
    setEntryCursor();
  });
});


/* ========================
   entry 전체 클릭 → intro 전환
======================== */
function goToIntro() {
  audioCtx.resume();
  entry.classList.add("hidden");
  intro.classList.remove("hidden");
  introVideo.currentTime = 0;
  introVideo.play();

  document.querySelectorAll(".introWord").forEach((el) => {
    el.textContent = "";
    let i = 0;
    const typing = setInterval(() => {
      el.textContent += introStr[i];
      i++;
      if (i >= introStr.length) clearInterval(typing);
    }, 120);
  });
}

entry.addEventListener("click", () => {
  goToIntro();
});


/* ========================
   intro → experience 전환
======================== */
introVideo.addEventListener("ended", () => {
  intro.classList.add("hidden");
  experience.classList.remove("hidden");
  indicator.classList.remove("hidden");
  started = true;
  startSlides();
  setExperienceCursor();

  filter.frequency.setTargetAtTime(20000, audioCtx.currentTime, 0.5);
  gainNode.gain.setTargetAtTime(1, audioCtx.currentTime, 0.5);

  setTimeout(() => experience.classList.add("active"), 50);
  resetInactivityTimer();
});


/* ========================
   비활성 타이머
======================== */
let inactivityTimer = null;
const INACTIVITY_LIMIT = 60000; /* 60초 - 조절 가능 */

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  if (!started) return;
  inactivityTimer = setTimeout(() => {
    if (started) {
      experience.classList.remove("active");
      indicator.classList.add("hidden");
      setEntryCursor();
      started = false;

      gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5);

      setTimeout(() => {
        experience.classList.add("hidden");
        entry.classList.remove("hidden");
        resetSlides();
        resetAudio(); /* 오디오 초기화 */
      }, 2500);
    }
  }, INACTIVITY_LIMIT);
}

window.addEventListener("wheel", (e) => {
  if (!started) return;
  resetInactivityTimer();
});

window.addEventListener("mousemove", () => {
  if (!started) return;
  resetInactivityTimer();
});


/* ========================
   슬라이드 초기화 함수
======================== */
const slides = document.querySelectorAll(".slide");
let currentSlide = 0;
let isTransitioning = false;
let scrollProgress = 0;
let targetProgress = 0;

function resetSlides() {
  clearTimeout(inactivityTimer);
  slides.forEach(s => {
    s.classList.remove("active");
    s.classList.remove("current");
    const img = s.querySelector("img");
    const overlay = s.querySelector(".slideOverlay");
    if (img) img.style.transform = "scale(1)";
    if (overlay) overlay.style.opacity = 0;
  });
  currentSlide = 0;
  scrollProgress = 0;
  targetProgress = 0;
  isTransitioning = false;

  document.getElementById("indLeft").style.width = "0%";
  document.getElementById("indRight").style.width = "0%";
  document.getElementById("indTop").style.height = "0%";
  document.getElementById("indBottom").style.height = "0%";
  ["indLeft", "indRight", "indTop", "indBottom"].forEach(i => {
    document.getElementById(i).style.opacity = "1";
  });
}


/* ========================
   슬라이드 시퀀스 (스크롤 줌인)
======================== */
function updateIndicator() {
  const total = slides.length;
  const progress = currentSlide / (total - 1);
  const pct = 2 + progress * 45;

  document.getElementById("indLeft").style.width = pct + "%";
  document.getElementById("indRight").style.width = pct + "%";
  document.getElementById("indTop").style.height = pct + "%";
  document.getElementById("indBottom").style.height = pct + "%";
}

function startSlides() {
  slides[0].classList.add("active");
  slides[0].classList.add("current");
  if (slides[1]) slides[1].classList.add("active");
  updateIndicator();
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

window.addEventListener("wheel", (e) => {
  if (!started) return;
  if (isTransitioning) return;

  targetProgress += e.deltaY * 0.003;
  targetProgress = Math.max(0, Math.min(1, targetProgress));
});

function updateSlide() {
  if (started && !isTransitioning) {
    scrollProgress = lerp(scrollProgress, targetProgress, 0.12);

    const img = slides[currentSlide].querySelector("img");
    const overlay = slides[currentSlide].querySelector(".slideOverlay");
    const scale = 1 + scrollProgress * 0.8;

    img.style.transform = `scale(${scale})`;
    overlay.style.opacity = Math.min(1, scrollProgress * 1.2);

    if (scrollProgress >= 0.95) {
      isTransitioning = true;

      if (currentSlide === slides.length - 1) {
        slides[currentSlide].classList.remove("active");
        slides[currentSlide].classList.remove("current");
        startOutro();
      } else {
        slides[currentSlide].classList.remove("active");
        slides[currentSlide].classList.remove("current");

        currentSlide = (currentSlide + 1) % slides.length;
        scrollProgress = 0;
        targetProgress = 0;

        slides[currentSlide].classList.add("current");

        const nextImg = slides[currentSlide].querySelector("img");
        const nextOverlay = slides[currentSlide].querySelector(".slideOverlay");
        nextImg.style.transform = "scale(1)";
        nextOverlay.style.opacity = 0;

        const afterNext = (currentSlide + 1) % slides.length;
        slides[afterNext].classList.add("active");

        updateIndicator();

        setTimeout(() => {
          isTransitioning = false;
        }, 500);
      }
    }
  }

  requestAnimationFrame(updateSlide);
}

updateSlide();


/* ========================
   outro 시퀀스
======================== */
function startOutro() {
  started = false;
  clearTimeout(inactivityTimer);
  const outroSound = document.getElementById("outroSound");

  document.getElementById("indLeft").style.width = "50%";
  document.getElementById("indRight").style.width = "50%";
  document.getElementById("indTop").style.height = "50%";
  document.getElementById("indBottom").style.height = "50%";
  gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.8);

  experience.classList.remove("active");

  setTimeout(() => {
    outro.classList.remove("hidden");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        outro.classList.add("active");
      });
    });
  }, 2000);

  setTimeout(() => {
    outroText.classList.add("visible");
    outroSound.currentTime = 0;
    outroSound.play();
  }, 3000);

  setTimeout(() => {
    outroText.classList.remove("visible");
    indicator.classList.add("hidden");

    experience.classList.add("hidden");
    resetSlides();
    entry.classList.remove("hidden");
    setEntryCursor();

    outro.classList.add("fadeout");

    setTimeout(() => {
      outro.classList.add("hidden");
      outro.classList.remove("fadeout");
      outro.classList.remove("active");

      resetAudio(); /* 오디오 초기화 */
    }, 2000);
  }, 5000);
}


/* ========================
   indicator 호버 + 클릭 → entry로 복귀
======================== */
["indLeft", "indRight", "indTop", "indBottom"].forEach(id => {
  const el = document.getElementById(id);

  el.addEventListener("mouseenter", () => {
    document.querySelectorAll(".exitWord").forEach(w => w.style.color = "#802323");
    ["indLeft", "indRight", "indTop", "indBottom"].forEach(i => {
      document.getElementById(i).style.opacity = "0";
    });
    setHoverCursor("#935c66");
  });

  el.addEventListener("mouseleave", () => {
    document.querySelectorAll(".exitWord").forEach(w => w.style.color = "rgba(255,255,255,0)");
    ["indLeft", "indRight", "indTop", "indBottom"].forEach(i => {
      document.getElementById(i).style.opacity = "1";
    });
    setExperienceCursor();
  });

  el.addEventListener("click", () => {
    experience.classList.remove("active");
    indicator.classList.add("hidden");
    setEntryCursor();
    started = false;

    gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5);

    setTimeout(() => {
      experience.classList.add("hidden");
      entry.classList.remove("hidden");
      resetSlides();
      resetAudio(); /* 오디오 초기화 */
    }, 2500);
  });
});


/* ========================
   개발용 단축키 (E키 → experience 바로 이동)
======================== */
window.addEventListener("keydown", (e) => {
  if (e.key === "e" || e.key === "E") {
    entry.classList.add("hidden");
    intro.classList.add("hidden");
    experience.classList.remove("hidden");
    indicator.classList.remove("hidden");
    started = true;
    startSlides();
    setExperienceCursor();
    audioCtx.resume();
    filter.frequency.setTargetAtTime(20000, audioCtx.currentTime, 1.5);
    gainNode.gain.setTargetAtTime(1, audioCtx.currentTime, 1.5);
    setTimeout(() => experience.classList.add("active"), 50);
    resetInactivityTimer();
  }
});
