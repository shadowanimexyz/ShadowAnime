let smartAnimeData = [];

async function loadSmartSearch(){
  try{
    const anime = await fetch("anime.json?v=" + Date.now()).then(r=>r.json()).catch(()=>[]);
    const movies = await fetch("movies.json?v=" + Date.now()).then(r=>r.json()).catch(()=>[]);
    const manga = await fetch("manga.json?v=" + Date.now()).then(r=>r.json()).catch(()=>[]);

    smartAnimeData = [
      ...anime.map(a=>({...a, type:"Anime"})),
      ...movies.map(m=>({...m, type:"Movie"})),
      ...manga.map(m=>({...m, type:"Manga"}))
    ];
  }catch{
    smartAnimeData = [];
  }
}

function getItemName(item){
  return item.title || item.name || "Unknown";
}

function getItemInfo(item){
  return item.episode || item.quality || item.chapter || item.year || item.genre || item.type;
}

function getItemText(item){
  return `
    ${item.title || ""}
    ${item.name || ""}
    ${item.genre || ""}
    ${item.category || ""}
    ${item.year || ""}
    ${item.rating || ""}
    ${item.episode || ""}
    ${item.quality || ""}
    ${item.chapter || ""}
    ${item.type || ""}
  `.toLowerCase();
}

function smartSearch(keyword){
  keyword = keyword.toLowerCase().trim();

  if(!keyword){
    searchSuggestions.style.display = "none";
    return;
  }

  let results = smartAnimeData
    .filter(item => getItemText(item).includes(keyword))
    .sort((a,b)=>{
      let scoreA = Number(a.rating) || 0;
      let scoreB = Number(b.rating) || 0;

      if(a.trending) scoreA += 5;
      if(a.popular) scoreA += 3;
      if(a.featured) scoreA += 2;

      if(b.trending) scoreB += 5;
      if(b.popular) scoreB += 3;
      if(b.featured) scoreB += 2;

      return scoreB - scoreA;
    })
    .slice(0,10);

  searchSuggestions.style.display = "block";

  searchSuggestions.innerHTML = results.length ? results.map(item=>`
    <a class="search-result-item" href="${item.link || item.watch || "#"}" target="_blank">
      <img src="${item.image || "image/bg.jpg"}">
      <div>
        <h4>${getItemName(item)}</h4>
        <p>${item.type} · ${getItemInfo(item)}</p>
        <p>⭐ ${item.rating || "N/A"} · ${item.year || "Unknown"}</p>
      </div>
    </a>
  `).join("") : `
    <p style="color:#9fb4c9;padding:15px;">No result found. Try Naruto, AOT, action, 2024, HD...</p>
  `;
}

function startVoiceSearch(){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if(!SpeechRecognition){
    alert("Voice search not supported in this browser");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onresult = e => {
    const text = e.results[0][0].transcript;
    globalSearch.value = text;
    smartSearch(text);
  };
}

document.addEventListener("DOMContentLoaded",()=>{
  loadSmartSearch();

  if(window.globalSearch){
    globalSearch.addEventListener("input",()=>{
      smartSearch(globalSearch.value);
    });

    globalSearch.addEventListener("keydown",e=>{
      if(e.key === "Enter"){
        window.location.href = "Anime.html?search=" + encodeURIComponent(globalSearch.value);
      }
    });
  }
});