let mangaData = JSON.parse(localStorage.getItem("mangaData")) || [];
let animeData = JSON.parse(localStorage.getItem("animeData")) || [];
let movieData = JSON.parse(localStorage.getItem("movieData")) || [];
let userData = JSON.parse(localStorage.getItem("userData")) || [];

/* SAVE ANIME */

function saveAnime(){

    let anime = {
        name: animeName.value,
        category: animeCategory.value,
        image: animeImage.value,
        banner: animeBanner ? animeBanner.value : "",
        rating: animeRating.value,
        episodes: animeEpisodes.value,
        studio: animeStudio ? animeStudio.value : "",
        year: animeYear ? animeYear.value : "",
        trailer: animeTrailer ? animeTrailer.value : "",
        watch: animeWatch ? animeWatch.value : "",
        desc: animeDesc.value,
        featured: animeFeatured ? animeFeatured.checked : false,
        trending: animeTrending ? animeTrending.checked : false,
        popular: animePopular ? animePopular.checked : false
    };

    let editIndex = localStorage.getItem("editAnimeIndex");

if(editIndex !== null){

    animeData[editIndex] = anime;

    localStorage.removeItem("editAnimeIndex");

}else{

    animeData.push(anime);

}
    localStorage.setItem("animeData", JSON.stringify(animeData));

/* NOTIFICATION */

let notifications =
JSON.parse(localStorage.getItem("notifications")) || [];

notifications.unshift({
    title:"New Anime Added",
    message:`${anime.name} is now available on Shadow Anime.`,
    date:new Date().toLocaleString()
});

localStorage.setItem(
    "notifications",
    JSON.stringify(notifications)
);

alert("Anime Added Successfully 🔥");

location.reload();

}
    
function editAnime(index){

    let anime = animeData[index];

    animeName.value = anime.name;
    animeCategory.value = anime.category;
    animeImage.value = anime.image;
    animeBanner.value = anime.banner;
    animeRating.value = anime.rating;
    animeEpisodes.value = anime.episodes;
    animeStudio.value = anime.studio;
    animeYear.value = anime.year;
    animeTrailer.value = anime.trailer;
    animeWatch.value = anime.watch;
    animeDesc.value = anime.desc;

    animeFeatured.checked = anime.featured;
    animeTrending.checked = anime.trending;
    animePopular.checked = anime.popular;

    localStorage.setItem("editAnimeIndex", index);

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });
}

/* SAVE MOVIE */

function addMovie(){

    let movie = {

        name: movieName.value,
        genre: movieGenre.value,
        image: movieImage.value,
        banner: movieBanner.value,
        rating: movieRating.value,
        year: movieYear.value,
        trailer: movieTrailer.value,
        watch: movieWatch.value,
        desc: movieDesc.value

    };

    movieData.push(movie);

    localStorage.setItem(
        "movieData",
        JSON.stringify(movieData)
    );

    alert("Movie Added Successfully 🎬");

    location.reload();
}

/* SAVE USER */

function addUser(){

    let user = {
        name: userName.value,
        email: userEmail.value,
        role: userRole.value
    };

    userData.push(user);
    localStorage.setItem("userData", JSON.stringify(userData));

    alert("User Added Successfully 👤");
    location.reload();
}

/* SETTINGS */

function saveSettings(){

    let settings = {
        siteName: siteName.value,
        logoText: logoText.value,
        themeColor: themeColor.value,
        siteDesc: siteDesc.value
    };

    localStorage.setItem("siteSettings", JSON.stringify(settings));
    alert("Settings Saved ⚙️");
}

/* RENDER LISTS */

function renderAdmin(){

    if(document.getElementById("animeList")){
        animeList.innerHTML = "";

        animeData.forEach((anime,index)=>{
            animeList.innerHTML += `
                <div class="anime-item">
                    <img src="${anime.image}">
                    <div class="anime-info">
                        <h3>${anime.name}</h3>
                        <p>${anime.desc}</p>
                        <span class="badge">${anime.category}</span>
                        <span class="badge">⭐ ${anime.rating}</span>
                        ${anime.featured ? `<span class="badge">Featured</span>` : ""}
                    </div>
                    <div class="actions">
                        <button class="edit" onclick="editAnime(${index})">Edit</button>

                        <button class="delete" onclick="deleteAnime(${index})">Delete</button>
                    </div>
                </div>
            `;
        });
    }

    if(document.getElementById("movieList")){
        movieList.innerHTML = "";

        movieData.forEach((movie,index)=>{
            movieList.innerHTML += `
                <div class="anime-item">
                    <img src="${movie.image}">
                    <div class="anime-info">
                        <h3>${movie.name}</h3>
                        <p>${movie.desc}</p>
                        <span class="badge">${movie.genre}</span>
                        <span class="badge">⭐ ${movie.rating}</span>
                        <span class="badge">${movie.year}</span>
                    </div>
                    <div class="actions">
                        <button class="delete" onclick="deleteMovie(${index})">Delete</button>
                    </div>
                </div>
            `;
        });
    }

    if(document.getElementById("userList")){
        userList.innerHTML = "";

        userData.forEach((user,index)=>{
            userList.innerHTML += `
                <div class="anime-item">
                    <div class="anime-info">
                        <h3>${user.name}</h3>
                        <p>${user.email}</p>
                        <span class="badge">${user.role}</span>
                    </div>
                    <div class="actions">
                        <button class="delete" onclick="deleteUser(${index})">Delete</button>
                    </div>
                </div>
            `;
        });
    }

    if(document.getElementById("totalAnime")){
        totalAnime.innerText = animeData.length;
    }

    if(document.getElementById("featuredAnime")){
        featuredAnime.innerText = animeData.filter(a => a.featured).length;
    }

    if(document.getElementById("totalMovies")){
        totalMovies.innerText = movieData.length;
    }

    if(document.getElementById("totalUsers")){
        totalUsers.innerText = userData.length;
    }
    if(document.getElementById("recentAnimeList")){

    recentAnimeList.innerHTML = animeData.slice(-5).reverse().map(anime => `
        <div class="anime-item">

            <img src="${anime.image}">

            <div class="anime-info">

                <h3>${anime.name}</h3>

                <p>
                    ${anime.category || "Anime"}
                    • ⭐ ${anime.rating || "N/A"}
                </p>

            </div>

        </div>
    `).join("");

}
}

/* DELETE */

function deleteAnime(index){
    animeData.splice(index,1);
    localStorage.setItem("animeData", JSON.stringify(animeData));
    location.reload();
}

function deleteMovie(index){
    movieData.splice(index,1);
    localStorage.setItem("movieData", JSON.stringify(movieData));
    location.reload();
}

function deleteUser(index){
    userData.splice(index,1);
    localStorage.setItem("userData", JSON.stringify(userData));
    location.reload();
}

renderAdmin();
let communityPosts = JSON.parse(localStorage.getItem("communityPosts")) || [];

function renderCommunityAdmin(){

    let list = document.getElementById("adminCommunityList");

    if(!list) return;

    list.innerHTML = "";

    communityPosts.forEach((post,index)=>{

        list.innerHTML += `
            <div class="anime-item">
                <div class="anime-info">
                    <h3>${post.title}</h3>
                    <p>${post.message}</p>
                    <span class="badge">${post.type}</span>
                    <span class="badge">By ${post.name}</span>
                    <span class="badge">👍 ${post.likes}</span>
                    <span class="badge">${post.date}</span>
                </div>

                <div class="actions">
                    <button class="delete" onclick="deleteCommunityPost(${index})">
                        Delete
                    </button>
                </div>
            </div>
        `;
    });

    if(document.getElementById("totalPosts")){
        totalPosts.innerText = communityPosts.length;
    }

    if(document.getElementById("totalReviews")){
        totalReviews.innerText =
        communityPosts.filter(p => p.type === "Review").length;
    }

    if(document.getElementById("totalRequests")){
        totalRequests.innerText =
        communityPosts.filter(p => p.type.includes("Request")).length;
    }
}

function deleteCommunityPost(index){
    if(confirm("Delete this community post?")){
        communityPosts.splice(index,1);
        localStorage.setItem("communityPosts", JSON.stringify(communityPosts));
        location.reload();
    }
}

function clearCommunityPosts(){
    if(confirm("Delete all community posts?")){
        localStorage.removeItem("communityPosts");
        location.reload();
    }
}

renderCommunityAdmin();

if(document.getElementById("totalManga")){
    totalManga.innerText = mangaData.length;
}

if(document.getElementById("totalPosts")){
    totalPosts.innerText = communityPosts.length;
}

if(document.getElementById("recentAnimeList")){
    recentAnimeList.innerHTML = animeData.slice(-4).reverse().map(anime => `
        <div class="mini-item">
            <img src="${anime.image}">
            <div>
                <h3>${anime.name}</h3>
                <p>${anime.category || anime.genre || "Anime"} • ⭐ ${anime.rating || "N/A"}</p>
            </div>
        </div>
    `).join("");
}

if(document.getElementById("recentCommunityList")){
    recentCommunityList.innerHTML = communityPosts.slice(0,4).map(post => `
        <div class="mini-item">
            <div>
                <h3>${post.title}</h3>
                <p>${post.type} • By ${post.name}</p>
            </div>
        </div>
    `).join("");
}
function fillAnimeFromText(){

    let text = smartAnimeInput.value.trim();

    if(!text){
        alert("Paste anime details first");
        return;
    }

    let data = {};

    text.split("\n").forEach(line => {

        let parts = line.split(":");

        if(parts.length < 2) return;

        let key = parts[0].trim().toLowerCase();
        let value = parts.slice(1).join(":").trim();

        data[key] = value;

    });

    animeName.value =
    data.anime ||
    data["anime name"] ||
    data.name ||
    data.title ||
    data["title name"] ||
    "";

    animeCategory.value =
        data.genre ||
        data.category ||
        "";

    animeImage.value =
        data.poster ||
        data["poster image path"] ||
        data.image ||
        "";

    animeBanner.value =
        data.banner ||
        data["banner image path"] ||
        "";

    animeRating.value =
        data.rating ||
        "";

    animeEpisodes.value =
        data.episodes ||
        "";

    animeStudio.value =
        data.studio ||
        data["studio name"] ||
        "";

    animeYear.value =
        data.year ||
        data["release year"] ||
        "";

    animeTrailer.value =
        data.trailer ||
        data["trailer url"] ||
        "";

    animeWatch.value =
        data.watch ||
        data["watch url"] ||
        "";

    animeDesc.value =
        data.description ||
        data.desc ||
        "";

    animeFeatured.checked =
        (data.featured || "").toLowerCase() === "yes";

    animeTrending.checked =
        (data.trending || "").toLowerCase() === "yes";

    animePopular.checked =
        (data.popular || "").toLowerCase() === "yes";

    alert("Anime details filled successfully 🔥");
}