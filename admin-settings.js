// admin-settings.js

const $ = (id) => document.getElementById(id);

const sidebar = $("sidebar");
const menuToggle = $("menuToggle");

const saveAllBtn = $("saveAllBtn");
const exportBtn = $("exportBtn");

const themePreview = $("themePreview");
const modePreview = $("modePreview");
const adsPreview = $("adsPreview");

const previewShort = $("previewShort");
const previewHero = $("previewHero");
const previewSubtitle = $("previewSubtitle");

const previewPrimary = $("previewPrimary");
const previewSecondary = $("previewSecondary");

const settingsStatus = $("settingsStatus");

const STORAGE_KEY = "shadowSettingsCore";

let settings = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

document.addEventListener("DOMContentLoaded", () => {

  if(menuToggle){
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  loadSettings();
  updatePreview();

  attachLivePreview();

  if(saveAllBtn){
    saveAllBtn.addEventListener("click", saveSettings);
  }

  if(exportBtn){
    exportBtn.addEventListener("click", exportJSON);
  }

});

function loadSettings(){

  const defaults = {

    siteName:"Shadow Anime",
    shortName:"SHADOW",
    logoText:"SHADOW ANIME",
    logoImage:"",

    accentTheme:"neon-blue",
    animationLevel:"ultra",
    pageMode:"public",
    cardStyle:"glass",

    heroTitle:"Enter the Shadow Anime Universe",
    heroSubtitle:"Watch anime, movies and explore the Shadow Anime community.",

    primaryBtnText:"Start Watching",
    primaryBtnLink:"anime.html",

    secondaryBtnText:"Explore Movies",
    secondaryBtnLink:"movies.html",

    announcementEnabled:false,
    announcementText:"",

    enableLogin:false,
    enableCommunity:true,
    enableWatchlist:true,
    enableContinueWatching:true,
    enableMovies:true,
    enableManga:false,

    adsEnabled:false,
    adCode:"",

    metaTitle:"Shadow Anime - Watch Anime Online",
    metaDescription:"Premium anime streaming website with movies and community.",
    metaKeywords:"anime, anime movies, watch anime",

    instagramLink:"",
    discordLink:"",
    twitterLink:""

  };

  settings = {
    ...defaults,
    ...settings
  };

  fillInputs();

}

function fillInputs(){

  $("siteName").value = settings.siteName;
  $("shortName").value = settings.shortName;
  $("logoText").value = settings.logoText;
  $("logoImage").value = settings.logoImage;

  $("accentTheme").value = settings.accentTheme;
  $("animationLevel").value = settings.animationLevel;
  $("pageMode").value = settings.pageMode;
  $("cardStyle").value = settings.cardStyle;

  $("heroTitle").value = settings.heroTitle;
  $("heroSubtitle").value = settings.heroSubtitle;

  $("primaryBtnText").value = settings.primaryBtnText;
  $("primaryBtnLink").value = settings.primaryBtnLink;

  $("secondaryBtnText").value = settings.secondaryBtnText;
  $("secondaryBtnLink").value = settings.secondaryBtnLink;

  $("announcementEnabled").checked = settings.announcementEnabled;
  $("announcementText").value = settings.announcementText;

  $("enableLogin").checked = settings.enableLogin;
  $("enableCommunity").checked = settings.enableCommunity;
  $("enableWatchlist").checked = settings.enableWatchlist;
  $("enableContinueWatching").checked = settings.enableContinueWatching;
  $("enableMovies").checked = settings.enableMovies;
  $("enableManga").checked = settings.enableManga;

  $("adsEnabled").checked = settings.adsEnabled;
  $("adCode").value = settings.adCode;

  $("metaTitle").value = settings.metaTitle;
  $("metaDescription").value = settings.metaDescription;
  $("metaKeywords").value = settings.metaKeywords;

  $("instagramLink").value = settings.instagramLink;
  $("discordLink").value = settings.discordLink;
  $("twitterLink").value = settings.twitterLink;

}

function collectSettings(){

  return {

    siteName:$("siteName").value.trim(),
    shortName:$("shortName").value.trim(),
    logoText:$("logoText").value.trim(),
    logoImage:$("logoImage").value.trim(),

    accentTheme:$("accentTheme").value,
    animationLevel:$("animationLevel").value,
    pageMode:$("pageMode").value,
    cardStyle:$("cardStyle").value,

    heroTitle:$("heroTitle").value.trim(),
    heroSubtitle:$("heroSubtitle").value.trim(),

    primaryBtnText:$("primaryBtnText").value.trim(),
    primaryBtnLink:$("primaryBtnLink").value.trim(),

    secondaryBtnText:$("secondaryBtnText").value.trim(),
    secondaryBtnLink:$("secondaryBtnLink").value.trim(),

    announcementEnabled:$("announcementEnabled").checked,
    announcementText:$("announcementText").value.trim(),

    enableLogin:$("enableLogin").checked,
    enableCommunity:$("enableCommunity").checked,
    enableWatchlist:$("enableWatchlist").checked,
    enableContinueWatching:$("enableContinueWatching").checked,
    enableMovies:$("enableMovies").checked,
    enableManga:$("enableManga").checked,

    adsEnabled:$("adsEnabled").checked,
    adCode:$("adCode").value.trim(),

    metaTitle:$("metaTitle").value.trim(),
    metaDescription:$("metaDescription").value.trim(),
    metaKeywords:$("metaKeywords").value.trim(),

    instagramLink:$("instagramLink").value.trim(),
    discordLink:$("discordLink").value.trim(),
    twitterLink:$("twitterLink").value.trim()

  };

}

function saveSettings(){

  settings = collectSettings();

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(settings)
  );

  updatePreview();

  settingsStatus.textContent = "Saved";

  setTimeout(() => {
    settingsStatus.textContent = "Ready";
  }, 2000);

}

function attachLivePreview(){

  const fields = [

    "shortName",
    "heroTitle",
    "heroSubtitle",

    "primaryBtnText",
    "primaryBtnLink",

    "secondaryBtnText",
    "secondaryBtnLink",

    "accentTheme",
    "pageMode",

    "adsEnabled"

  ];

  fields.forEach(id => {

    const el = $(id);

    if(!el) return;

    el.addEventListener("input", updatePreview);
    el.addEventListener("change", updatePreview);

  });

}

function updatePreview(){

  previewShort.textContent =
    $("shortName").value || "SHADOW";

  previewHero.textContent =
    $("heroTitle").value ||
    "Enter the Shadow Anime Universe";

  previewSubtitle.textContent =
    $("heroSubtitle").value ||
    "Your homepage subtitle preview will appear here.";

  previewPrimary.textContent =
    $("primaryBtnText").value ||
    "Start Watching";

  previewPrimary.href =
    $("primaryBtnLink").value || "#";

  previewSecondary.textContent =
    $("secondaryBtnText").value ||
    "Explore Movies";

  previewSecondary.href =
    $("secondaryBtnLink").value || "#";

  themePreview.textContent =
    formatText($("accentTheme").value);

  modePreview.textContent =
    formatText($("pageMode").value);

  adsPreview.textContent =
    $("adsEnabled").checked
      ? "Enabled"
      : "Disabled";

}

function exportJSON(){

  const data = JSON.stringify(
    collectSettings(),
    null,
    2
  );

  const blob = new Blob(
    [data],
    {type:"application/json"}
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = "shadow-settings-core.json";

  a.click();

  URL.revokeObjectURL(url);

}

function formatText(text){

  return String(text || "")
    .replaceAll("-", " ")
    .replace(/\b\w/g, l => l.toUpperCase());

}