const API = "https://anikoto-api-nine.vercel.app";
const MAIN = "/api/all-anime?page=1";
const SEARCH = "/api/search?keyword=";

const loader = document.getElementById("loader");
const loaderText = document.getElementById("loaderText");

const canvas = document.getElementById("particleCanvas");
const mouseGlow = document.getElementById("mouseGlow");

const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

const openSearch = document.getElementById("openSearch");
const closeSearch = document.getElementById("closeSearch");

const searchModal = document.getElementById("searchModal");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

const randomBtn = document.getElementById("randomBtn");

const bgImage = document.getElementById("bgImage");

const animeSub = document.getElementById("animeSub");
const animeType = document.getElementById("animeType");
const animeRank = document.getElementById("animeRank");

const heroLink = document.getElementById("heroLink");

const posterImage = document.getElementById("posterImage");
const posterTitle = document.getElementById("posterTitle");

const dbStatus = document.getElementById("dbStatus");

const mini1 = document.getElementById("mini1");
const mini2 = document.getElementById("mini2");
const mini3 = document.getElementById("mini3");

const featuredGrid = document.getElementById("featuredGrid");
const latestRail = document.getElementById("latestRail");

const continueTitle = document.getElementById("continueTitle");
const continueLink = document.getElementById("continueLink");

let allAnime = [];
let current = 0;
let timer;

const loadingTexts = [
  "Loading Shadow Universe...",
  "Connecting Anime API...",
  "Opening Anime Portals...",
  "Initializing Shadow Core...",
  "Shadow Anime Ready..."
];

let loadIndex = 0;

setInterval(() => {
  if (!loaderText) return;

  loaderText.textContent =
    loadingTexts[loadIndex % loadingTexts.length];

  loadIndex++;
}, 500);

window.addEventListener("load", () => {
  setTimeout(() => {
    loader.classList.add("hide");
  }, 1800);
});

menuBtn?.addEventListener("click", () => {
  menu.classList.toggle("active");
});

openSearch?.addEventListener("click", () => {
  searchModal.classList.add("active");

  setTimeout(() => {
    searchInput.focus();
  }, 100);
});

closeSearch?.addEventListener("click", () => {
  searchModal.classList.remove("active");
});

document.addEventListener("mousemove", e => {
  mouseGlow.style.left = e.clientX + "px";
  mouseGlow.style.top = e.clientY + "px";
});

randomBtn?.addEventListener("click", () => {
  if (!allAnime.length) return;

  const randomIndex =
    Math.floor(Math.random() * allAnime.length);

  renderHero(randomIndex);

  restartSlide();
});

async function loadAnime() {

  try {

    const res = await fetch(API + MAIN);

    const json = await res.json();

    const raw =
      json.data ||
      json.results ||
      json.anime ||
      json.items ||
      [];

    allAnime = raw
      .map(mapAnime)
      .filter(a => a.id);

    if (!allAnime.length) {
      throw new Error("No anime found");
    }

    dbStatus.textContent = "Online";

    loadContinue();

    renderHero(0);

    renderFeatured();

    renderLatest();

    timer = setInterval(() => {
      renderHero(current + 1);
    }, 7000);

  } catch (err) {

    console.error(err);

    dbStatus.textContent = "Offline";

    animeSub.textContent = "API Failed";

    featuredGrid.innerHTML =
      `<p style="color:#9fb4c9;">API failed</p>`;
  }
}

function mapAnime(a) {

  return {
    id: a.id,
    title: a.title || "Unknown Anime",
    image: a.image || "image/default.jpg",
    type: a.type || "Anime",
    episode: a.episodes || a.sub || "Unknown Episodes",
    link: `anime-details.html?id=${a.id}`
  };
}

function img(a) {
  return a.image || "image/default.jpg";
}

function renderHero(index) {

  current =
    (index + allAnime.length) % allAnime.length;

  const anime = allAnime[current];

  animeSub.textContent = anime.title;

  animeType.textContent =
    "Type: " + anime.type;

  animeRank.textContent =
    "Universe #" +
    String(current + 1).padStart(3, "0");

  heroLink.href = anime.link;

  posterTitle.textContent = anime.title;

  posterImage.src = img(anime);

  bgImage.src = img(anime);

  const minis = [mini1, mini2, mini3];

  minis.forEach((box, i) => {

    const item =
      allAnime[
        (current + i + 1) % allAnime.length
      ];

    box.innerHTML = `
      <a href="${item.link}">
        <img src="${img(item)}" alt="${item.title}">
      </a>
    `;
  });
}

function renderFeatured() {

  const shuffled =
    [...allAnime]
      .sort(() => Math.random() - 0.5)
      .slice(0, 12);

  featuredGrid.innerHTML =
    shuffled.map(cardHTML).join("");

  saveContinue();
}

function renderLatest() {

  const latest =
    [...allAnime]
      .slice(-12)
      .reverse();

  latestRail.innerHTML =
    latest.map(a => `
      <a class="rail-card"
         href="${a.link}"
         data-title="${a.title}">

        <img src="${img(a)}">

        <div>
          <h3>${a.title}</h3>
          <p>${a.type}</p>
        </div>

      </a>
    `).join("");

  saveContinue();
}

function cardHTML(a) {

  return `
    <a class="card"
       href="${a.link}"
       data-title="${a.title}">

      <img src="${img(a)}">

      <div>
        <h3>${a.title}</h3>
        <p>${a.type}</p>
      </div>

    </a>
  `;
}

function restartSlide() {

  clearInterval(timer);

  timer = setInterval(() => {
    renderHero(current + 1);
  }, 7000);
}

function saveContinue() {

  document
    .querySelectorAll(".card,.rail-card")
    .forEach(card => {

      card.addEventListener("click", () => {

        localStorage.setItem(
          "shadowContinue",

          JSON.stringify({
            title: card.dataset.title,
            link: card.href
          })
        );
      });
    });
}

function loadContinue() {

  const saved =
    localStorage.getItem("shadowContinue");

  if (!saved) return;

  try {

    const data = JSON.parse(saved);

    continueTitle.textContent =
      data.title;

    continueLink.href =
      data.link;

    continueLink.textContent =
      "Continue";

  } catch {}
}

searchInput?.addEventListener("input", async () => {

  const q =
    searchInput.value.trim();

  if (!q) {
    searchResults.innerHTML = "";
    return;
  }

  try {

    const res =
      await fetch(
        API +
        SEARCH +
        encodeURIComponent(q)
      );

    const json =
      await res.json();

    const raw =
      json.data ||
      json.results ||
      json.anime ||
      json.items ||
      [];

    const mapped =
      raw
        .map(mapAnime)
        .filter(a => a.id)
        .slice(0, 8);

    searchResults.innerHTML =
      mapped.length
        ? mapped.map(searchItem).join("")
        : `
          <div class="search-item">
            <b>No anime found</b>
          </div>
        `;

  } catch {

    searchResults.innerHTML =
      `
      <div class="search-item">
        <b>Search failed</b>
      </div>
      `;
  }
});

function searchItem(a) {

  return `
    <a class="search-item"
       href="${a.link}">

      <img src="${img(a)}">

      <div>
        <b>${a.title}</b>
        <small>${a.type}</small>
      </div>

    </a>
  `;
}

function particles() {

  const ctx =
    canvas.getContext("2d");

  const particles = [];

  function resize() {

    canvas.width =
      window.innerWidth;

    canvas.height =
      window.innerHeight;
  }

  resize();

  window.addEventListener(
    "resize",
    resize
  );

  for (let i = 0; i < 80; i++) {

    particles.push({

      x:
        Math.random() *
        canvas.width,

      y:
        Math.random() *
        canvas.height,

      r:
        Math.random() * 2 + 0.5,

      vx:
        (Math.random() - 0.5) * 0.42,

      vy:
        (Math.random() - 0.5) * 0.42
    });
  }

  function draw() {

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    particles.forEach((p, i) => {

      p.x += p.vx;
      p.y += p.vy;

      if (
        p.x < 0 ||
        p.x > canvas.width
      ) p.vx *= -1;

      if (
        p.y < 0 ||
        p.y > canvas.height
      ) p.vy *= -1;

      ctx.beginPath();

      ctx.arc(
        p.x,
        p.y,
        p.r,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        "rgba(0,200,255,.55)";

      ctx.fill();

      for (
        let j = i + 1;
        j < particles.length;
        j++
      ) {

        const q = particles[j];

        const dx = p.x - q.x;
        const dy = p.y - q.y;

        const dist =
          Math.sqrt(dx * dx + dy * dy);

        if (dist < 115) {

          ctx.beginPath();

          ctx.moveTo(p.x, p.y);

          ctx.lineTo(q.x, q.y);

          ctx.strokeStyle =
            `rgba(0,200,255,${
              1 - dist / 115
            })`;

          ctx.lineWidth = 0.35;

          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(draw);
  }

  draw();
}

loadAnime();

particles();