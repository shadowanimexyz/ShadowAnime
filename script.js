(function(){
  const settings = JSON.parse(localStorage.getItem("shadowSettings")) || {};
  const pageControl = JSON.parse(localStorage.getItem("shadowPageControl")) || {};
  const featureControl = JSON.parse(localStorage.getItem("shadowFeatureControl")) || {};

  const file = location.pathname.split("/").pop().toLowerCase() || "index.html";

  const pageMap = {
    "index.html": "home",
    "anime.html": "anime",
    "movies.html": "movies",
    "popular.html": "popular",
    "manga.html": "manga",
    "community.html": "community",
    "watchlist.html": "watchlist",
    "policy.html": "policy",
    "profile.html": "profile",
    "notifications.html": "notifications"
  };

  const pageKey = pageMap[file];

  if(featureControl.maintenance === true || pageControl[pageKey] === false){
    document.addEventListener("DOMContentLoaded", () => {
      document.body.innerHTML = `
        <div style="min-height:100vh;display:grid;place-items:center;background:#030712;color:white;font-family:Poppins,sans-serif;text-align:center;padding:30px;">
          <div style="max-width:650px;padding:40px;border-radius:28px;border:1px solid rgba(0,200,255,.3);box-shadow:0 0 40px rgba(0,200,255,.25);background:rgba(7,18,35,.85);">
            <h1 style="color:#00c8ff;margin-bottom:12px;">SHADOW ANIME</h1>
            <h2>This Page Is Offline</h2>
            <p style="color:#9fb4c9;margin-top:10px;">Admin has temporarily disabled this page.</p>
            <a href="index.html" style="display:inline-block;margin-top:22px;padding:13px 20px;border-radius:15px;background:#00c8ff;color:#00111c;text-decoration:none;font-weight:900;">Go Home</a>
          </div>
        </div>
      `;
    });
    return;
  }

  document.documentElement.style.setProperty("--shadow-theme", settings.themeColor || "#00c8ff");
  document.documentElement.style.setProperty("--shadow-accent", settings.accentColor || "#8a2cff");

  document.addEventListener("DOMContentLoaded", () => {
    if(settings.logoText){
      document.querySelectorAll(".logo").forEach(el => el.innerText = settings.logoText);
    }

    if(settings.siteNotice){
      const notice = document.createElement("div");
      notice.className = "shadow-site-notice";
      notice.innerText = settings.siteNotice;
      document.body.prepend(notice);
    }

    document.body.classList.remove(
      "cards-premium",
      "cards-compact",
      "cards-large",
      "cards-glass",
      "quality-ultra",
      "quality-high",
      "quality-balanced",
      "quality-performance",
      "anim-full",
      "anim-light",
      "anim-none"
    );

    const cardMode = (settings.cardMode || "Premium Cards").toLowerCase();

    if(cardMode.includes("compact")) document.body.classList.add("cards-compact");
    else if(cardMode.includes("large")) document.body.classList.add("cards-large");
    else if(cardMode.includes("glass")) document.body.classList.add("cards-glass");
    else document.body.classList.add("cards-premium");

    const quality = (settings.qualityMode || "Ultra").toLowerCase();

    if(quality.includes("performance")) document.body.classList.add("quality-performance");
    else if(quality.includes("balanced")) document.body.classList.add("quality-balanced");
    else if(quality.includes("high")) document.body.classList.add("quality-high");
    else document.body.classList.add("quality-ultra");

    const animation = (settings.animationMode || "Full Animations").toLowerCase();

    if(animation.includes("no")) document.body.classList.add("anim-none");
    else if(animation.includes("light")) document.body.classList.add("anim-light");
    else document.body.classList.add("anim-full");
  });
})();
let animeData = JSON.parse(localStorage.getItem("animeData")) || [];
let movieData = JSON.parse(localStorage.getItem("movieData")) || [];
let userData = JSON.parse(localStorage.getItem("userData")) || [];
let settings = JSON.parse(localStorage.getItem("siteSettings")) || {};

/* LOADER */
window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if(loader){
        loader.classList.add("hide-loader");
    }
});

/* MOBILE MENU */
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

if(menuBtn && menu){
    menuBtn.onclick = () => {
        menu.classList.toggle("active");
    };
}

/* LOGIN POPUP */
const openLogin = document.getElementById("openLogin");
const loginModal = document.getElementById("loginModal");
const closeModal = document.getElementById("closeModal");

if(openLogin && loginModal){
    openLogin.onclick = () => {
        loginModal.style.display = "flex";
    };
}

if(closeModal && loginModal){
    closeModal.onclick = () => {
        loginModal.style.display = "none";
    };
}

/* ANIME PAGE */

const animeGrid = document.getElementById("animeGrid");

if(animeGrid){
    animeGrid.innerHTML = animeData.map((anime, index) => `
        <a class="card" href="anime-details.html?id=${index}">
            <img src="${anime.image}" alt="${anime.name}">

            <div class="card-overlay">
                <h2>${anime.name}</h2>
                <p>${anime.category || anime.genre || "Anime"} • ⭐ ${anime.rating || "N/A"}</p>
                <p>${anime.episodes || ""} Episodes</p>

                <div class="card-buttons">
                    <button class="trailer-btn" onclick="event.stopPropagation(); openTrailer('${anime.trailer || ""}')">
    Watch Trailer
</button>

<button class="watch-btn" onclick="event.stopPropagation(); openWatch('${anime.watch || ""}')">
    Watch Now
</button>
                </div>
            </div>
        </a>
    `).join("");
}

function openAnimeDetails(index){
    window.location.href = `anime-details.html?id=${index}`;
}

/* PROFESSIONAL HOME SEARCH */

const homeAnimeGrid = document.getElementById("homeAnimeGrid");
const searchInput = document.getElementById("searchInput");


/* MOVIES PAGE */
const movieGrid = document.getElementById("movieGrid");
const movieSearch = document.getElementById("movieSearch");
const movieFilter = document.getElementById("movieFilter");
const movieEmpty = document.getElementById("movieEmpty");

function renderMovies(){
    if(!movieGrid) return;

    let searchValue = movieSearch ? movieSearch.value.toLowerCase() : "";
    let filterValue = movieFilter ? movieFilter.value.toLowerCase() : "all";

    let filteredMovies = movieData.filter(movie => {
        let name = (movie.name || "").toLowerCase();
        let genre = (movie.genre || "").toLowerCase();

        let matchSearch = name.includes(searchValue) || genre.includes(searchValue);
        let matchFilter = filterValue === "all" || genre.includes(filterValue);

        return matchSearch && matchFilter;
    });

    movieGrid.innerHTML = filteredMovies.map(movie => `
        <div class="card">
            <img src="${movie.image}" alt="${movie.name}">
            <div class="card-overlay">
                <h2>${movie.name}</h2>
                <p>${movie.genre || "Anime Movie"} • ⭐ ${movie.rating || "N/A"}</p>
                <p>${movie.year || ""}</p>
                <p>${movie.desc || ""}</p>

                <div class="card-buttons">
                    <button class="trailer-btn" onclick="openTrailer('${movie.trailer || ""}')">
                        Watch Trailer
                    </button>

                    <button class="watch-btn" onclick="openWatch('${movie.watch || ""}')">
                        Watch Movie
                    </button>
                </div>
            </div>
        </div>
    `).join("");

    if(movieEmpty){
        movieEmpty.style.display = filteredMovies.length === 0 ? "block" : "none";
    }
}

if(movieSearch){
    movieSearch.addEventListener("input", renderMovies);
}

if(movieFilter){
    movieFilter.addEventListener("change", renderMovies);
}

renderMovies();

/* WATCH LINK */
function openWatch(url){
    if(!url){
        alert("Watch URL not added yet");
        return;
    }

    window.location.href = url;
}

/* TRAILER POPUP */
function openTrailer(url){
    if(!url || url === "undefined"){
        alert("Trailer URL not added");
        return;
    }

    let videoId = "";

    if(url.includes("watch?v=")){
        videoId = url.split("watch?v=")[1].split("&")[0];
    }
    else if(url.includes("youtu.be/")){
        videoId = url.split("youtu.be/")[1].split("?")[0];
    }
    else if(url.includes("embed/")){
        videoId = url.split("embed/")[1].split("?")[0];
    }
    else if(url.includes("shorts/")){
        videoId = url.split("shorts/")[1].split("?")[0];
    }

    if(!videoId){
        alert("Invalid YouTube trailer link");
        return;
    }

    const trailerFrame = document.getElementById("trailerFrame");
    const trailerModal = document.getElementById("trailerModal");

    trailerFrame.src = `https://www.youtube.com/embed/${videoId}`;
    trailerModal.style.display = "flex";
}

function closeTrailer(){
    const trailerFrame = document.getElementById("trailerFrame");
    const trailerModal = document.getElementById("trailerModal");

    if(trailerFrame && trailerModal){
        trailerFrame.src = "";
        trailerModal.style.display = "none";
    }
}

/* LIVE COUNTS */

if(document.getElementById("homeAnimeCount")){
  fetch("anime.json?v=" + Date.now())
    .then(res => res.json())
    .then(data => homeAnimeCount.innerText = data.length)
    .catch(() => homeAnimeCount.innerText = "0");
}

if(document.getElementById("homeMovieCount")){
  fetch("movies.json?v=" + Date.now())
    .then(res => res.json())
    .then(data => homeMovieCount.innerText = data.length)
    .catch(() => homeMovieCount.innerText = "0");
}

if(document.getElementById("homeMangaCount")){
  fetch("manga.json?v=" + Date.now())
    .then(res => res.json())
    .then(data => homeMangaCount.innerText = data.length)
    .catch(() => homeMangaCount.innerText = "0");
}

if(document.getElementById("homeUserCount")){
  homeUserCount.innerText = userData.length;
}
/* SETTINGS */
if(settings.logoText){
    document.querySelectorAll(".logo").forEach(logo => {
        logo.innerText = settings.logoText;
    });
}

if(settings.siteName){
    document.title = settings.siteName;
}
/* ANIME PAGE 2 */

const animeGridPage2 =
document.getElementById("animeGridPage2");

if(animeGridPage2){

    let animePage2 = animeData.slice(8, 16);

    animeGridPage2.innerHTML =
    animePage2.map(anime => `

        <div class="card">

            <img src="${anime.image}">

            <div class="card-overlay">

                <h2>${anime.name}</h2>

                <p>
                    ${anime.category || anime.genre}
                    • ⭐ ${anime.rating}
                </p>

                <p>
                    ${anime.episodes} Episodes
                </p>

                <div class="card-buttons">

                    <button class="trailer-btn"
                        onclick="openTrailer('${anime.trailer || ""}')">

                        Watch Trailer

                    </button>

                    <button class="watch-btn"
                        onclick="openWatch('${anime.watch || ""}')">

                        Watch Now

                    </button>

                </div>

            </div>

        </div>

    `).join("");

}
/* ANIME PAGE 3 */

const animeGridPage3 =
document.getElementById("animeGridPage3");

if(animeGridPage3){

    let animePage3 = animeData.slice(16, 24);

    animeGridPage3.innerHTML =
    animePage3.map(anime => `

        <div class="card">

            <img src="${anime.image}">

            <div class="card-overlay">

                <h2>${anime.name}</h2>

                <p>
                    ${anime.category || anime.genre}
                    • ⭐ ${anime.rating}
                </p>

                <p>
                    ${anime.episodes} Episodes
                </p>

                <div class="card-buttons">

                    <button class="trailer-btn"
                        onclick="openTrailer('${anime.trailer || ""}')">

                        Watch Trailer

                    </button>

                    <button class="watch-btn"
                        onclick="openWatch('${anime.watch || ""}')">

                        Watch Now

                    </button>

                </div>

            </div>

        </div>

    `).join("");

}
/* POPULAR PAGE */

const popularAnimeGrid = document.getElementById("popularAnimeGrid");
const popularMovieGrid = document.getElementById("popularMovieGrid");
const popularSearch = document.getElementById("popularSearch");

function renderPopular(search = ""){

    let keyword = search.toLowerCase().trim();

    if(popularAnimeGrid){

        let popularAnime = animeData.filter(anime => {
            let text = `
                ${anime.name || ""}
                ${anime.category || ""}
                ${anime.genre || ""}
                ${anime.desc || ""}
            `.toLowerCase();

            return anime.popular && text.includes(keyword);
        });

        popularAnimeGrid.innerHTML = popularAnime.map(anime => `
            <div class="card">
                <img src="${anime.image}" alt="${anime.name}">

                <div class="card-overlay">
                    <h2>${anime.name}</h2>
                    <p>${anime.category || anime.genre || "Anime"} • ⭐ ${anime.rating || "N/A"}</p>
                    <p>${anime.episodes || ""} Episodes</p>

                    <div class="card-buttons">
                        <button class="trailer-btn" onclick="openTrailer('${anime.trailer || ""}')">
                            Watch Trailer
                        </button>

                        <button class="watch-btn" onclick="openWatch('${anime.watch || ""}')">
                            Watch Now
                        </button>
                    </div>
                </div>
            </div>
        `).join("");

        if(popularAnime.length === 0){
            popularAnimeGrid.innerHTML = `
                <div class="empty-box">
                    <h2>No Popular Anime Found</h2>
                    <p>Mark anime as Popular from admin panel.</p>
                </div>
            `;
        }
    }

    if(popularMovieGrid){

        let popularMovies = movieData.filter(movie => {
            let text = `
                ${movie.name || ""}
                ${movie.genre || ""}
                ${movie.desc || ""}
            `.toLowerCase();

            return text.includes(keyword);
        });

        popularMovieGrid.innerHTML = popularMovies.map(movie => `
            <div class="card">
                <img src="${movie.image}" alt="${movie.name}">

                <div class="card-overlay">
                    <h2>${movie.name}</h2>
                    <p>${movie.genre || "Anime Movie"} • ⭐ ${movie.rating || "N/A"}</p>
                    <p>${movie.year || ""}</p>

                    <div class="card-buttons">
                        <button class="trailer-btn" onclick="openTrailer('${movie.trailer || ""}')">
                            Watch Trailer
                        </button>

                        <button class="watch-btn" onclick="openWatch('${movie.watch || ""}')">
                            Watch Movie
                        </button>
                    </div>
                </div>
            </div>
        `).join("");

        if(popularMovies.length === 0){
            popularMovieGrid.innerHTML = `
                <div class="empty-box">
                    <h2>No Popular Movies Found</h2>
                    <p>Add movies from admin panel.</p>
                </div>
            `;
        }
    }
}

if(popularSearch){
    popularSearch.addEventListener("input", e => {
        renderPopular(e.target.value);
    });
}

renderPopular();
/* MANGA PAGE */

const mangaGrid = document.getElementById("mangaGrid");
const mangaSearch = document.getElementById("mangaSearch");
const mangaFilter = document.getElementById("mangaFilter");
const mangaEmpty = document.getElementById("mangaEmpty");

/* TEMP MANGA DATA */

renderManga();

if(mangaSearch){

    mangaSearch.addEventListener("input", e => {

        renderManga(e.target.value);

    });

}

if(mangaFilter){

    mangaFilter.addEventListener("change", () => {

        renderManga(
            mangaSearch
            ? mangaSearch.value
            : ""
        );

    });

}
/* COMMUNITY SYSTEM */

let communityPosts = JSON.parse(localStorage.getItem("communityPosts")) || [];

const communityFeed = document.getElementById("communityFeed");
const communitySearch = document.getElementById("communitySearch");
const communityFilter = document.getElementById("communityFilter");
const communityEmpty = document.getElementById("communityEmpty");

function addCommunityPost(){

    let name = document.getElementById("postName").value.trim();
    let title = document.getElementById("postTitle").value.trim();
    let type = document.getElementById("postType").value;
    let rating = document.getElementById("postRating").value;
    let message = document.getElementById("postMessage").value.trim();

    if(!name || !title || !message){
        alert("Fill name, title and message");
        return;
    }

    let post = {
        name,
        title,
        type,
        rating,
        message,
        likes:0,
        date:new Date().toLocaleDateString()
    };

    communityPosts.unshift(post);

    localStorage.setItem("communityPosts", JSON.stringify(communityPosts));

    location.reload();
}

function renderCommunity(){

    if(!communityFeed) return;

    let keyword = communitySearch ? communitySearch.value.toLowerCase().trim() : "";
    let filter = communityFilter ? communityFilter.value.toLowerCase() : "all";

    let filteredPosts = communityPosts.filter(post => {

        let text = `
            ${post.name}
            ${post.title}
            ${post.type}
            ${post.message}
        `.toLowerCase();

        let matchSearch = text.includes(keyword);

        let matchFilter =
            filter === "all" ||
            post.type.toLowerCase().includes(filter) ||
            (filter === "request" && post.type.toLowerCase().includes("request"));

        return matchSearch && matchFilter;
    });

    communityFeed.innerHTML = filteredPosts.map((post,index)=>`
        <div class="community-post">

            <span class="post-type">${post.type}</span>

            <h2>${post.title}</h2>

            <h4>By ${post.name} • ${post.date}</h4>

            <p>${post.rating || ""}</p>

            <p>${post.message}</p>

            <div class="post-actions">
                <button class="like-btn" onclick="likePost(${index})">
                    👍 ${post.likes}
                </button>

                <button class="delete-post" onclick="deletePost(${index})">
                    Delete
                </button>
            </div>

        </div>
    `).join("");

    if(communityEmpty){
        communityEmpty.style.display = filteredPosts.length === 0 ? "block" : "none";
    }
}

function likePost(index){
    communityPosts[index].likes++;
    localStorage.setItem("communityPosts", JSON.stringify(communityPosts));
    renderCommunity();
}

function deletePost(index){
    if(confirm("Delete this post?")){
        communityPosts.splice(index,1);
        localStorage.setItem("communityPosts", JSON.stringify(communityPosts));
        renderCommunity();
    }
}

if(communitySearch){
    communitySearch.addEventListener("input", renderCommunity);
}

if(communityFilter){
    communityFilter.addEventListener("change", renderCommunity);
}

renderCommunity();

/* ANIME DETAILS WITH EPISODES */

const detailsHero = document.getElementById("detailsHero");

if(detailsHero){

    let params = new URLSearchParams(window.location.search);
    let animeIndex = params.get("id");
    let anime = animeData[animeIndex];

    let currentEpisodePage = 1;
    let episodesPerPage = 30;

    if(!anime){
        detailsHero.innerHTML = "<h1>Anime Not Found</h1>";
    }else{

        detailsHero.style.backgroundImage = `url('${anime.banner || anime.image}')`;

        detailsPoster.src = anime.image;
        detailsTitle.innerText = anime.name;
        detailsGenre.innerText = anime.category || anime.genre || "Anime";
        detailsRating.innerText = "⭐ " + (anime.rating || "N/A");
        detailsEpisodes.innerText = (anime.episodes || "0") + " Episodes";
        detailsYear.innerText = anime.year || "Unknown";
        detailsDesc.innerText = anime.desc || "No description available.";

        trailerBtn.onclick = () => openTrailer(anime.trailer || "");
        watchNowBtn.onclick = () => openEpisode(1, anime);
        watchlistBtn.onclick = () => alert("Added to Watchlist");

        renderEpisodes();

        function renderEpisodes(){
            let totalEpisodes = Number(anime.episodes) || 0;
            let searchValue = episodeSearch.value.trim();

            let allEpisodes = [];

            for(let i = 1; i <= totalEpisodes; i++){
                allEpisodes.push(i);
            }

            if(searchValue){
                allEpisodes = allEpisodes.filter(ep => ep.toString().includes(searchValue));
            }

            let start = (currentEpisodePage - 1) * episodesPerPage;
            let end = start + episodesPerPage;
            let currentEpisodes = allEpisodes.slice(start, end);

            episodeGrid.innerHTML = currentEpisodes.map(ep => `
                <button class="episode-btn" onclick="openEpisode(${ep}, animeData[${animeIndex}])">
                    EP ${ep}
                </button>
            `).join("");

            episodePageInfo.innerText = `Page ${currentEpisodePage}`;
            prevEpisodeBtn.style.display = currentEpisodePage === 1 ? "none" : "inline-block";
            nextEpisodeBtn.style.display = end >= allEpisodes.length ? "none" : "inline-block";
        }

        episodeSearch.addEventListener("input", () => {
            currentEpisodePage = 1;
            renderEpisodes();
        });

        nextEpisodeBtn.onclick = () => {
            currentEpisodePage++;
            renderEpisodes();
        };

        prevEpisodeBtn.onclick = () => {
            currentEpisodePage--;
            renderEpisodes();
        };

        recommendedGrid.innerHTML = animeData
        .filter((item,index) => index != animeIndex)
        .slice(0,4)
        .map((item,index) => `
            <div class="card" onclick="window.location.href='anime-details.html?id=${animeData.indexOf(item)}'">
                <img src="${item.image}">
                <div class="card-overlay">
                    <h2>${item.name}</h2>
                    <p>${item.category || item.genre || "Anime"} • ⭐ ${item.rating || "N/A"}</p>
                </div>
            </div>
        `).join("");
    }
}

function openEpisode(ep, anime){
    if(!anime.watch){
        alert("Watch URL not added yet");
        return;
    }

    window.location.href = `${anime.watch}?episode=${ep}`;
}
/* ADVANCED WATCH PAGE */

const videoPlayer = document.getElementById("videoPlayer");

if(videoPlayer){

    const params = new URLSearchParams(window.location.search);
    const animeIndex = Number(params.get("id"));
    let currentEp = Number(params.get("ep")) || 1;

    let anime = animeData[animeIndex];

    if(!anime){
        document.querySelector(".watch-page").innerHTML = "<h1>Anime not found</h1>";
    }else{

        function getEpisodeUrl(ep){
            if(!anime.watch) return "";
            if(anime.watch.endsWith(".mp4")) return anime.watch;
            return `${anime.watch}${ep}.mp4`;
        }

       function loadEpisode(ep){
    currentEp = ep;

    watchTitle.innerText = `${anime.name} - Episode ${currentEp}`;

    if(anime.watch){
        videoPlayer.src = `${anime.watch}?episode=${currentEp}`;
    }else{
        videoPlayer.src = "";
        alert("Watch URL not added");
    }

    let continueWatching =
    JSON.parse(localStorage.getItem("continueWatching")) || [];

    continueWatching = continueWatching.filter(item => item.id !== animeIndex);

    continueWatching.unshift({
        id: animeIndex,
        name: anime.name,
        image: anime.image,
        episode: currentEp,
        totalEpisodes: anime.episodes,
        date: new Date().toLocaleDateString()
    });

    localStorage.setItem(
        "continueWatching",
        JSON.stringify(continueWatching)
    );

    renderWatchEpisodes();

    history.replaceState(
        null,
        "",
        `watch.html?id=${animeIndex}&ep=${currentEp}`
    );
}

        function renderWatchEpisodes(){
            let total = Number(anime.episodes) || 0;
            let search = watchEpisodeSearch.value.trim();

            let episodes = [];

            for(let i = 1; i <= total; i++){
                episodes.push(i);
            }

            if(search){
                episodes = episodes.filter(ep => ep.toString().includes(search));
            }

            watchEpisodeList.innerHTML = episodes.map(ep => `
                <button class="watch-ep-btn ${ep === currentEp ? "active" : ""}"
                    onclick="loadEpisode(${ep})">
                    EP ${ep}
                </button>
            `).join("");
        }

        function saveContinueWatching(){
            localStorage.setItem("continueWatching", JSON.stringify({
                animeIndex,
                episode: currentEp,
                time: videoPlayer.currentTime || 0,
                name: anime.name,
                image: anime.image
            }));
        }

        videoPlayer.addEventListener("timeupdate", saveContinueWatching);

        videoPlayer.addEventListener("ended", () => {
            let total = Number(anime.episodes) || 0;

            if(currentEp < total){
                loadEpisode(currentEp + 1);
            }
        });

        watchEpisodeSearch.addEventListener("input", renderWatchEpisodes);

        nextWatchBtn.onclick = () => {
            let total = Number(anime.episodes) || 0;
            if(currentEp < total){
                loadEpisode(currentEp + 1);
            }
        };

        prevWatchBtn.onclick = () => {
            if(currentEp > 1){
                loadEpisode(currentEp - 1);
            }
        };

        window.skipIntro = function(){
            videoPlayer.currentTime += 90;
        };

        window.toggleTheater = function(){
            document.body.classList.toggle("theater-mode");
        };

        window.addWatchlist = function(){
            let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
            watchlist.push(anime);
            localStorage.setItem("watchlist", JSON.stringify(watchlist));
            alert("Added to Watchlist");
        };

        window.goBackDetails = function(){
            window.location.href = `anime-details.html?id=${animeIndex}`;
        };

        loadEpisode(currentEp);
    }
}
/* WATCHLIST PAGE */

const wlGrid = document.getElementById("watchlistGrid");
const wlEmpty = document.getElementById("watchlistEmpty");

if(wlGrid){

    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

    wlGrid.innerHTML = watchlist.map((anime, index) => `
        <div class="card">
            <img src="${anime.image}" alt="${anime.name}">

            <div class="card-overlay">
                <h2>${anime.name}</h2>
                <p>${anime.category || anime.genre || "Anime"} • ⭐ ${anime.rating || "N/A"}</p>

                <div class="card-buttons">
                    <button class="watch-btn" onclick="openWatchlistAnime(${index})">
                        Open
                    </button>

                    <button class="trailer-btn" onclick="removeWatchlistAnime(${index})">
                        Remove
                    </button>
                </div>
            </div>
        </div>
    `).join("");

    if(wlEmpty){
        wlEmpty.style.display = watchlist.length === 0 ? "block" : "none";
    }
}

function openWatchlistAnime(index){
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    let anime = watchlist[index];

    let realIndex = animeData.findIndex(a => a.name === anime.name);

    if(realIndex !== -1){
        window.location.href = `anime-details.html?id=${realIndex}`;
    }else{
        alert("Anime not found");
    }
}

function removeWatchlistAnime(index){
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

    watchlist.splice(index, 1);

    localStorage.setItem("watchlist", JSON.stringify(watchlist));

    location.reload();
}
/* CONTINUE WATCHING */

const continueWatchingGrid =
document.getElementById("continueWatchingGrid");

if(continueWatchingGrid){

    let continueWatching =
    JSON.parse(localStorage.getItem("continueWatching")) || [];

    continueWatchingGrid.innerHTML = continueWatching.map(item => `
        <div class="card" onclick="window.location.href='watch.html?id=${item.id}&ep=${item.episode}'">

            <img src="${item.image}">

            <div class="card-overlay">

                <h2>${item.name}</h2>

                <p>
                    Continue EP ${item.episode}
                </p>

                <p>
                    ${item.totalEpisodes} Episodes
                </p>

                <button class="watch-btn">
                    Resume
                </button>

            </div>

        </div>
    `).join("");

}
/* NOTIFICATIONS */

function addNotification(title, message){
    let notifications =
    JSON.parse(localStorage.getItem("notifications")) || [];

    notifications.unshift({
        title,
        message,
        date:new Date().toLocaleString()
    });

    localStorage.setItem(
        "notifications",
        JSON.stringify(notifications)
    );
}

const notificationList =
document.getElementById("notificationList");

if(notificationList){
    let notifications =
    JSON.parse(localStorage.getItem("notifications")) || [];

    if(notifications.length === 0){
        notificationList.innerHTML = `
            <div class="empty-box">
                <h2>No Notifications</h2>
                <p>You are all caught up.</p>
            </div>
        `;
    }else{
        notificationList.innerHTML = notifications.map(note => `
            <div class="notification-card">
                <h2>${note.title}</h2>
                <p>${note.message}</p>
                <p>${note.date}</p>
            </div>
        `).join("");
    }
}

function clearNotifications(){
    localStorage.removeItem("notifications");
    location.reload();
}
/* TOP RATED */

const topRatedGrid = document.getElementById("topRatedGrid");

if(topRatedGrid){

    let topRated = [...animeData]
    .sort((a,b) => Number(b.rating || 0) - Number(a.rating || 0))
    .slice(0,8);

    topRatedGrid.innerHTML = topRated.map(anime => `
        <div class="card">
            <img src="${anime.image}">
            <div class="card-overlay">
                <h2>${anime.name}</h2>
                <p>⭐ ${anime.rating || "N/A"}</p>
            </div>
        </div>
    `).join("");
}

/* LATEST EPISODES */

const latestEpisodes = document.getElementById("latestEpisodes");

if(latestEpisodes){

    latestEpisodes.innerHTML = animeData.slice(0,6).map(anime => `
        <div class="latest-episode-card">
            <img src="${anime.banner || anime.image}">
            <div class="latest-episode-content">
                <h2>${anime.name}</h2>
                <p>Latest Episode Available</p>
            </div>
        </div>
    `).join("");
}
/* ADVANCED ANIME COMMENTS */

let currentAnimeCommentId = null;

if(document.getElementById("detailsHero")){
    const params = new URLSearchParams(window.location.search);
    currentAnimeCommentId = params.get("id");
    renderAnimeComments();
}

function getAnimeComments(){
    return JSON.parse(localStorage.getItem("animeComments")) || {};
}

function saveAnimeComments(data){
    localStorage.setItem("animeComments", JSON.stringify(data));
}

function addAnimeComment(){

    let name = commentName.value.trim();
    let text = commentText.value.trim();

    if(!name || !text){
        alert("Please enter name and comment");
        return;
    }

    let allComments = getAnimeComments();

    if(!allComments[currentAnimeCommentId]){
        allComments[currentAnimeCommentId] = [];
    }

    allComments[currentAnimeCommentId].unshift({
        name,
        text,
        spoiler: spoilerCheck.checked,
        likes:0,
        replies:[],
        date:new Date().toLocaleString()
    });

    saveAnimeComments(allComments);

    commentText.value = "";
    spoilerCheck.checked = false;

    renderAnimeComments();
}

function renderAnimeComments(){

    if(!document.getElementById("commentsList")) return;

    let allComments = getAnimeComments();
    let comments = allComments[currentAnimeCommentId] || [];

    let search = commentSearch ? commentSearch.value.toLowerCase().trim() : "";
    let sort = commentSort ? commentSort.value : "newest";

    let filtered = comments.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.text.toLowerCase().includes(search)
    );

    if(sort === "oldest"){
        filtered = [...filtered].reverse();
    }

    if(sort === "likes"){
        filtered = [...filtered].sort((a,b)=> b.likes - a.likes);
    }

    commentsList.innerHTML = filtered.map((comment,index)=>`
        <div class="comment-card ${comment.spoiler ? "spoiler-comment" : ""}">

            <div class="comment-top">
                <h3>${comment.name}</h3>
                <span class="comment-date">${comment.date}</span>
            </div>

            ${comment.spoiler ? `<span class="post-type">Spoiler</span>` : ""}

            <p class="comment-text">${comment.text}</p>

            <div class="comment-actions">
                <button onclick="likeAnimeComment(${index})">👍 ${comment.likes}</button>
                <button onclick="showReplyBox(${index})">Reply</button>
                <button onclick="deleteAnimeComment(${index})">Delete</button>
            </div>

            <div class="reply-box" id="replyBox${index}" style="display:none;">
                <input id="replyName${index}" placeholder="Your name">
                <textarea id="replyText${index}" placeholder="Write reply..."></textarea>
                <button onclick="addReply(${index})">Post Reply</button>
            </div>

            <div class="reply-box">
                ${comment.replies.map(reply=>`
                    <div class="reply-card">
                        <h4>${reply.name}</h4>
                        <p>${reply.text}</p>
                        <small>${reply.date}</small>
                    </div>
                `).join("")}
            </div>

        </div>
    `).join("");

    if(filtered.length === 0){
        commentsList.innerHTML = `
            <div class="empty-box">
                <h2>No Comments Yet</h2>
                <p>Be the first to comment on this anime.</p>
            </div>
        `;
    }
}

function likeAnimeComment(index){
    let data = getAnimeComments();
    data[currentAnimeCommentId][index].likes++;
    saveAnimeComments(data);
    renderAnimeComments();
}

function deleteAnimeComment(index){
    if(confirm("Delete this comment?")){
        let data = getAnimeComments();
        data[currentAnimeCommentId].splice(index,1);
        saveAnimeComments(data);
        renderAnimeComments();
    }
}

function showReplyBox(index){
    let box = document.getElementById(`replyBox${index}`);
    box.style.display = box.style.display === "none" ? "block" : "none";
}

function addReply(index){

    let name = document.getElementById(`replyName${index}`).value.trim();
    let text = document.getElementById(`replyText${index}`).value.trim();

    if(!name || !text){
        alert("Fill reply name and text");
        return;
    }

    let data = getAnimeComments();

    data[currentAnimeCommentId][index].replies.push({
        name,
        text,
        date:new Date().toLocaleString()
    });

    saveAnimeComments(data);
    renderAnimeComments();
}

if(document.getElementById("commentSearch")){
    commentSearch.addEventListener("input", renderAnimeComments);
}

if(document.getElementById("commentSort")){
    commentSort.addEventListener("change", renderAnimeComments);
}
const params =
new URLSearchParams(window.location.search);

const title =
params.get("title");

const episode =
params.get("episode");

const embed =
params.get("embed");

const player =
document.getElementById("videoPlayer");

const watchTitle =
document.getElementById("watchTitle");

const watchMeta =
document.getElementById("watchMeta");

if (watchTitle) {

    watchTitle.innerText = title;

}

if (watchMeta) {

    watchMeta.innerText = episode;

}

if (player && embed) {

    player.src = embed;

}
function loadLiveCounts(){
  if(document.getElementById("homeAnimeCount")){
    fetch("anime.json?v=" + Date.now())
      .then(res => res.json())
      .then(data => homeAnimeCount.innerText = data.length)
      .catch(() => homeAnimeCount.innerText = "0");
  }

  if(document.getElementById("homeMovieCount")){
    fetch("movies.json?v=" + Date.now())
      .then(res => res.json())
      .then(data => homeMovieCount.innerText = data.length)
      .catch(() => homeMovieCount.innerText = "0");
  }

  if(document.getElementById("homeMangaCount")){
    fetch("manga.json?v=" + Date.now())
      .then(res => res.json())
      .then(data => homeMangaCount.innerText = data.length)
      .catch(() => homeMangaCount.innerText = "0");
  }
}

function loadAutoHomeAnime(){
  const grid = document.getElementById("homeAnimeGrid");
  if(!grid) return;

  fetch("anime.json?v=" + Date.now())
    .then(res => res.json())
    .then(data => {
      function showRandomAnime(){
        grid.innerHTML = "";

        [...data]
          .sort(() => Math.random() - 0.5)
          .slice(0, 6)
          .forEach(anime => {
            grid.innerHTML += `
              <div class="shadow-card auto-card">
                <img src="${anime.image}" alt="${anime.title || anime.name}">
                <div class="shadow-info">
                  <h3>${anime.title || anime.name}</h3>
                  <p>${anime.episode || anime.quality || ""}</p>
                  <a href="${anime.link}" target="_blank">Watch Now</a>
                </div>
              </div>
            `;
          });
      }

      showRandomAnime();
      setInterval(showRandomAnime, 2000);
    });
}

loadLiveCounts();
loadAutoHomeAnime();
(function(){
  const control = JSON.parse(localStorage.getItem("shadowPageControl")) || {};
  const features = JSON.parse(localStorage.getItem("shadowFeatureControl")) || {};
  const page = location.pathname.split("/").pop().toLowerCase();

  const map = {
    "index.html":"home",
    "anime.html":"anime",
    "movies.html":"movies",
    "popular.html":"popular",
    "manga.html":"manga",
    "community.html":"community",
    "watchlist.html":"watchlist",
    "policy.html":"policy",
    "profile.html":"profile",
    "notifications.html":"notifications"
  };

  const key = map[page] || "home";

  if(features.maintenance || control[key] === false){
    document.body.innerHTML = `
      <div style="min-height:100vh;display:grid;place-items:center;background:#030712;color:white;font-family:Poppins,sans-serif;text-align:center;padding:30px;">
        <div style="max-width:600px;padding:35px;border-radius:25px;border:1px solid rgba(0,200,255,.3);box-shadow:0 0 35px rgba(0,200,255,.2);">
          <h1 style="color:#00c8ff;">SHADOW ANIME</h1>
          <h2>This page is currently offline</h2>
          <p style="color:#9fb4c9;">Admin has temporarily disabled this page.</p>
          <a href="index.html" style="display:inline-block;margin-top:20px;padding:12px 18px;border-radius:14px;background:#00c8ff;color:#00111c;text-decoration:none;font-weight:900;">Go Home</a>
        </div>
      </div>
    `;
  }
})();

let installPrompt;

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  installPrompt = e;

  const btn = document.getElementById("installAppBtn");
  if(btn) btn.style.display = "inline-block";
});

const installBtn = document.getElementById("installAppBtn");
if(installBtn){
  installBtn.addEventListener("click", async () => {
    if(!installPrompt) return;

    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installBtn.style.display = "none";
  });
}
