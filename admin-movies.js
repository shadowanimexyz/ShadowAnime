const API = "https://anikoto-api-nine.vercel.app";
const $ = (id) => document.getElementById(id);

const sidebar = $("sidebar");
const menuToggle = $("menuToggle");
const apiStatus = $("apiStatus");

const autoSearch = $("autoSearch");
const autoSearchBtn = $("autoSearchBtn");
const autoResults = $("autoResults");

const movieGrid = $("movieGrid");
const saveMovieBtn = $("saveMovieBtn");
const clearFormBtn = $("clearFormBtn");
const exportBtn = $("exportBtn");
const refreshApiBtn = $("refreshApiBtn");

const librarySearch = $("librarySearch");
const filterType = $("filterType");

const fillDemoBtn = $("fillDemoBtn");
const copyJsonBtn = $("copyJsonBtn");

const previewModal = $("previewModal");
const closeModal = $("closeModal");

const apiCount = $("apiCount");
const localCount = $("localCount");

let adminMovies = JSON.parse(localStorage.getItem("shadowAdminMovies")) || [];
let apiMovieLibrary = [];
let searchApiMovies = [];
let hiddenApiMovies = JSON.parse(localStorage.getItem("hiddenApiMovies")) || [];

document.addEventListener("DOMContentLoaded", () => {
  loadApiMovies();
  renderMovieGrid();
  updateCounts();
  setupPreview();

  if (menuToggle) menuToggle.addEventListener("click", () => sidebar.classList.toggle("open"));

  if (autoSearchBtn) autoSearchBtn.addEventListener("click", searchMovieAPI);
  if (autoSearch) autoSearch.addEventListener("keypress", e => {
    if (e.key === "Enter") searchMovieAPI();
  });

  if (librarySearch) {
    librarySearch.addEventListener("keypress", e => {
      if (e.key === "Enter") searchMovieForCards();
    });

    librarySearch.addEventListener("input", () => {
      if (librarySearch.value.trim().length === 0) {
        searchApiMovies = [];
        renderMovieGrid();
      }
    });
  }

  if (saveMovieBtn) saveMovieBtn.addEventListener("click", saveMovie);
  if (clearFormBtn) clearFormBtn.addEventListener("click", clearForm);
  if (exportBtn) exportBtn.addEventListener("click", exportJSON);
  if (refreshApiBtn) refreshApiBtn.addEventListener("click", loadApiMovies);
  if (filterType) filterType.addEventListener("change", renderMovieGrid);
  if (fillDemoBtn) fillDemoBtn.addEventListener("click", fillDemoData);
  if (copyJsonBtn) copyJsonBtn.addEventListener("click", copyCurrentJSON);
  if (closeModal) closeModal.addEventListener("click", () => previewModal.classList.remove("show"));
});

async function loadApiMovies() {
  setAPIStatus("LOADING API...", "checking");

  const searches = [
    "movie",
    "film",
    "one piece movie",
    "naruto movie",
    "dragon ball movie"
  ];

  try {
    const results = await Promise.allSettled(
      searches.map(q => fetch(`${API}/api/search?keyword=${encodeURIComponent(q)}`).then(r => r.json()))
    );

    const merged = [];

    results.forEach(res => {
      if (res.status === "fulfilled") {
        merged.push(...extractList(res.value));
      }
    });

    apiMovieLibrary = dedupeMovies(merged.map(item => normalizeMovieCard(item, "api")));

    setAPIStatus("API ONLINE", "online");
    updateCounts();
    renderMovieGrid();
  } catch (err) {
    console.error(err);
    setAPIStatus("API OFFLINE", "offline");
    renderMovieGrid();
  }
}

async function searchMovieForCards() {
  const q = librarySearch.value.trim();

  if (!q) {
    searchApiMovies = [];
    renderMovieGrid();
    return;
  }

  setAPIStatus("SEARCHING API...", "checking");
  movieGrid.innerHTML = `<div class="empty-state">Searching API movie cards...</div>`;

  try {
    const res = await fetch(`${API}/api/search?keyword=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error("Search failed");

    const data = await res.json();
    searchApiMovies = extractList(data).map(item => normalizeMovieCard(item, "api"));

    setAPIStatus("API ONLINE", "online");
    renderMovieGrid(true);
  } catch (err) {
    console.error(err);
    setAPIStatus("API OFFLINE", "offline");
    movieGrid.innerHTML = `<div class="empty-state">Search API failed.</div>`;
  }
}

async function searchMovieAPI() {
  const query = autoSearch.value.trim();
  if (!query) return;

  setAPIStatus("SEARCHING...", "checking");
  autoResults.innerHTML = `<div class="empty-state">Searching movie...</div>`;

  try {
    const res = await fetch(`${API}/api/search?keyword=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Search failed");

    const data = await res.json();
    const list = extractList(data).map(item => normalizeMovieCard(item, "api"));

    autoResults.innerHTML = list.length
      ? list.map(item => autoResultHTML(item)).join("")
      : `<div class="empty-state">No movie found.</div>`;

    searchApiMovies = list;
    renderMovieGrid(true);

    setAPIStatus("API ONLINE", "online");
  } catch (err) {
    console.error(err);
    autoResults.innerHTML = `<div class="empty-state">API search failed.</div>`;
    setAPIStatus("API OFFLINE", "offline");
  }
}

function renderMovieGrid(searchMode = false) {
  if (!movieGrid) return;

  const search = librarySearch ? librarySearch.value.toLowerCase() : "";
  const filter = filterType ? filterType.value : "all";

  const localItems = adminMovies.map(item => ({ ...item, source: "local" }));

  const baseApiList = searchMode || searchApiMovies.length
    ? searchApiMovies
    : apiMovieLibrary;

  const apiItems = baseApiList.filter(item => !hiddenApiMovies.includes(item.localId));

  let allItems = [...localItems, ...apiItems];

  if (!searchApiMovies.length && search) {
    allItems = allItems.filter(movie => movie.title.toLowerCase().includes(search));
  }

  if (filter !== "all") {
    allItems = allItems.filter(movie => {
      if (filter === "featured") return movie.featured;
      if (filter === "trending") return movie.trending;
      if (filter === "popular") return movie.popular;
      if (filter === "premium") return movie.premium;
      return true;
    });
  }

  if (!allItems.length) {
    movieGrid.innerHTML = `<div class="empty-state">No movies found.</div>`;
    return;
  }

  movieGrid.innerHTML = allItems.map(movie => `
    <div class="admin-movie-card">
      <img src="${movie.image || movie.banner || ""}" alt="${escapeHTML(movie.title)}">

      <div class="card-info">
        <span>${movie.source === "api" ? "API MOVIE" : escapeHTML(movie.type)}</span>
        <h4>${escapeHTML(movie.title)}</h4>
        <p>${escapeHTML(movie.description || "No description available.")}</p>

        <div class="card-flags">
          ${movie.source === "api" ? `<div class="flag">API</div>` : ""}
          ${movie.featured ? `<div class="flag">FEATURED</div>` : ""}
          ${movie.trending ? `<div class="flag">TRENDING</div>` : ""}
          ${movie.popular ? `<div class="flag">POPULAR</div>` : ""}
          ${movie.premium ? `<div class="flag">PREMIUM</div>` : ""}
        </div>

        <div class="card-actions">
          <button onclick="previewAnyMovie('${movie.localId}', '${movie.source}')">Preview</button>
          <button onclick="editAnyMovie('${movie.localId}', '${movie.source}')">Edit</button>
          <button class="delete" onclick="deleteAnyMovie('${movie.localId}', '${movie.source}')">Delete</button>
        </div>
      </div>
    </div>
  `).join("");
}

function saveMovie() {
  const movie = collectFormData();
  if (!movie.title.trim()) return alert("Movie title required.");

  const exists = adminMovies.some(item => item.localId === movie.localId);

  if (exists) {
    adminMovies = adminMovies.map(item => item.localId === movie.localId ? movie : item);
  } else {
    adminMovies.unshift(movie);
  }

  localStorage.setItem("shadowAdminMovies", JSON.stringify(adminMovies));

  renderMovieGrid();
  updateCounts();
  clearForm();

  alert("Movie saved successfully.");
}

function collectFormData() {
  return {
    localId: $("editId").value || `movie_${Date.now()}`,
    movieId: $("movieId").value.trim(),
    title: $("movieTitle").value.trim(),
    image: $("movieImage").value.trim(),
    banner: $("movieBanner").value.trim(),
    type: $("movieType").value,
    quality: $("movieQuality").value.trim(),
    year: $("movieYear").value.trim(),
    rating: $("movieRating").value.trim(),
    genre: $("movieGenre").value.trim(),
    studio: $("movieStudio").value.trim(),
    watch: $("movieWatch").value.trim(),
    description: $("movieDescription").value.trim(),
    featured: $("featuredFlag").checked,
    trending: $("trendingFlag").checked,
    popular: $("popularFlag").checked,
    premium: $("premiumFlag").checked,
    source: "local"
  };
}

function normalizeMovieCard(item, source) {
  const key = getMovieKey(item);

  return {
    localId: key,
    movieId: item.id || item.animeId || item.slug || key,
    title: item.title || item.name || "Unknown Movie",
    image: item.image || item.poster || item.cover || "",
    banner: item.banner || item.cover || item.image || item.poster || "",
    type: item.type || "Movie",
    quality: item.quality || "HD",
    year: item.year || item.releaseDate || "",
    rating: item.rating || item.score || "",
    genre: Array.isArray(item.genre) ? item.genre.join(", ") : (item.genre || item.category || ""),
    studio: item.studio || "",
    watch: `anime-details.html?id=${item.id || item.animeId || item.slug || key}`,
    description: item.description || item.synopsis || "No description available.",
    featured: false,
    trending: false,
    popular: false,
    premium: false,
    source
  };
}

function fillForm(movie) {
  $("editId").value = movie.localId;
  $("movieTitle").value = movie.title || "";
  $("movieId").value = movie.movieId || "";
  $("movieImage").value = movie.image || "";
  $("movieBanner").value = movie.banner || "";
  $("movieType").value = movie.type || "Movie";
  $("movieQuality").value = movie.quality || "";
  $("movieYear").value = movie.year || "";
  $("movieRating").value = movie.rating || "";
  $("movieGenre").value = movie.genre || "";
  $("movieStudio").value = movie.studio || "";
  $("movieWatch").value = movie.watch || "";
  $("movieDescription").value = movie.description || "";

  $("featuredFlag").checked = !!movie.featured;
  $("trendingFlag").checked = !!movie.trending;
  $("popularFlag").checked = !!movie.popular;
  $("premiumFlag").checked = !!movie.premium;

  updatePreview();
}

window.editAnyMovie = function (id, source) {
  const movie = findMovieById(id, source);
  if (!movie) return;

  fillForm(movie);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.deleteAnyMovie = function (id, source) {
  if (!confirm("Delete/hide this movie from admin library?")) return;

  if (source === "api") {
    hiddenApiMovies.push(String(id));
    localStorage.setItem("hiddenApiMovies", JSON.stringify(hiddenApiMovies));
  } else {
    adminMovies = adminMovies.filter(movie => movie.localId !== id);
    localStorage.setItem("shadowAdminMovies", JSON.stringify(adminMovies));
  }

  renderMovieGrid();
  updateCounts();
};

window.previewAnyMovie = function (id, source) {
  const movie = findMovieById(id, source);
  if (!movie) return;

  $("modalImage").src = movie.banner || movie.image || "";
  $("modalTitle").textContent = movie.title;
  $("modalDesc").textContent = movie.description || "No description available.";

  $("modalMeta").innerHTML = `
    <span>${movie.type || "Movie"}</span>
    <span>${movie.quality || "HD"}</span>
    <span>★ ${movie.rating || "?"}</span>
    <span>${movie.year || "Unknown Year"}</span>
  `;

  previewModal.classList.add("show");
};

function findMovieById(id, source) {
  if (source === "local") {
    return adminMovies.find(item => item.localId === id);
  }

  return [...apiMovieLibrary, ...searchApiMovies].find(item => item.localId === id);
}

function setupPreview() {
  [
    "movieTitle", "movieImage", "movieDescription",
    "movieType", "movieQuality", "movieRating", "movieYear"
  ].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener("input", updatePreview);
  });

  updatePreview();
}

function updatePreview() {
  $("previewTitle").textContent = $("movieTitle").value || "Movie Title";
  $("previewDesc").textContent = $("movieDescription").value || "Description preview will appear here.";
  $("previewType").textContent = $("movieType").value || "Movie";
  $("previewQuality").textContent = $("movieQuality").value || "HD";
  $("previewRating").textContent = `★ ${$("movieRating").value || "?"}`;
  $("previewYear").textContent = $("movieYear").value || "Year";

  const image = $("movieImage").value;

  if (image) {
    $("previewImage").src = image;
    $("previewImage").style.display = "block";
    $("previewFallback").style.display = "none";
  } else {
    $("previewImage").style.display = "none";
    $("previewFallback").style.display = "grid";
  }
}

function clearForm() {
  document.querySelectorAll("input, textarea").forEach(el => {
    if (el.type !== "checkbox" && el.type !== "hidden") el.value = "";
  });

  document.querySelectorAll("input[type='checkbox']").forEach(el => {
    el.checked = false;
  });

  $("movieType").value = "Movie";
  $("editId").value = "";
  updatePreview();
}

function autoResultHTML(movie) {
  return `
    <div class="auto-result">
      <img src="${movie.image || movie.banner || ""}" alt="${escapeHTML(movie.title)}">
      <div>
        <strong>${escapeHTML(movie.title)}</strong>
        <span>${escapeHTML(movie.type)} • ${escapeHTML(movie.year || "?")}</span>
      </div>
      <button onclick="autoFillMovieById('${movie.localId}')">Fill</button>
    </div>
  `;
}

window.autoFillMovieById = function (id) {
  const movie = [...apiMovieLibrary, ...searchApiMovies].find(x => x.localId === id);
  if (!movie) return;
  fillForm(movie);
};

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.anime)) return data.anime;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.episodes)) return data.episodes;
  return [];
}

function dedupeMovies(list) {
  const map = new Map();
  list.forEach(item => {
    if (!map.has(item.localId)) map.set(item.localId, item);
  });
  return [...map.values()];
}

function getMovieKey(item) {
  return String(
    item.localId ||
    item.id ||
    item.animeId ||
    item.slug ||
    item.title ||
    item.name ||
    Date.now()
  );
}

function exportJSON() {
  const data = JSON.stringify(adminMovies, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "shadow-movies-library.json";
  a.click();

  URL.revokeObjectURL(url);
}

function fillDemoData() {
  fillForm({
    localId: `movie_${Date.now()}`,
    movieId: "one-piece-film-red",
    title: "One Piece Film Red",
    image: "https://m.media-amazon.com/images/M/MV5BN2I5YmM4M2ItZGE2Yi00N2QxLTk0ZjUtODI1YTY2ZGUzM2M5XkEyXkFqcGc@._V1_.jpg",
    banner: "https://wallpapercave.com/wp/wp11405328.jpg",
    type: "Anime Movie",
    quality: "FHD",
    year: "2022",
    rating: "8.0",
    genre: "Action, Adventure, Fantasy",
    studio: "Toei Animation",
    watch: "anime-details.html?id=one-piece-film-red",
    description: "The Straw Hat Pirates attend a concert by Uta, a world-famous singer with a hidden connection to Shanks.",
    featured: true,
    trending: true,
    popular: true,
    premium: false
  });
}

function copyCurrentJSON() {
  const movie = collectFormData();
  navigator.clipboard.writeText(JSON.stringify(movie, null, 2));
  alert("Movie JSON copied.");
}

function updateCounts() {
  if (localCount) localCount.textContent = adminMovies.length;
  if (apiCount) apiCount.textContent = apiMovieLibrary.length + searchApiMovies.length;
}

function setAPIStatus(text, state) {
  if (!apiStatus) return;

  apiStatus.textContent = text;
  apiStatus.classList.remove("online", "offline", "checking");

  if (state) apiStatus.classList.add(state);
}

function escapeHTML(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}