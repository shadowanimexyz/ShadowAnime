
    // LOAD SAVED PROFILE

    let savedName =
    localStorage.getItem("profileName");

    let savedBio =
    localStorage.getItem("profileBio");

    let savedAvatar =
    localStorage.getItem("profileAvatar");

    if(savedName){
        profileName.value = savedName;
    }

    if(savedBio){
        profileBio.value = savedBio;
    }

    if(savedAvatar){
        profileAvatar.src = savedAvatar;
    }

    // STATS

    let watchlist =
    JSON.parse(localStorage.getItem("watchlist")) || [];

    let animeData =
    JSON.parse(localStorage.getItem("animeData")) || [];

    let movieData =
    JSON.parse(localStorage.getItem("movieData")) || [];

    watchlistCount.innerText = watchlist.length;
    animeCount.innerText = animeData.length;
    movieCount.innerText = movieData.length;

// SAVE PROFILE

saveProfileBtn.onclick = () => {

    localStorage.setItem(
        "profileName",
        profileName.value
    );

    localStorage.setItem(
        "profileBio",
        profileBio.value
    );

    alert("Profile Saved!");
};

// CHANGE PROFILE PHOTO

avatarInput.addEventListener("change", () => {

    const file = avatarInput.files[0];

    if(file){

        const reader = new FileReader();

        reader.onload = e => {

            profileAvatar.src = e.target.result;

            localStorage.setItem(
                "profileAvatar",
                e.target.result
            );
        };

        reader.readAsDataURL(file);
    }
});