// admin-community.js

const $ = (id) => document.getElementById(id);

const sidebar = $("sidebar");
const menuToggle = $("menuToggle");

const totalPosts = $("totalPosts");
const pinnedPosts = $("pinnedPosts");
const spoilerPosts = $("spoilerPosts");

const postsList = $("postsList");

const savePostBtn = $("savePostBtn");
const clearPostBtn = $("clearPostBtn");
const exportBtn = $("exportBtn");
const refreshBtn = $("refreshBtn");

const postSearch = $("postSearch");
const categoryFilter = $("categoryFilter");
const statusFilter = $("statusFilter");

const demoPostsBtn = $("demoPostsBtn");
const clearAllBtn = $("clearAllBtn");

const postModal = $("postModal");
const closeModal = $("closeModal");

let communityPosts =
  JSON.parse(localStorage.getItem("communityPostsUltra")) || [];

document.addEventListener("DOMContentLoaded", () => {

  renderPosts();
  updateStats();

  if(menuToggle){
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  if(savePostBtn){
    savePostBtn.addEventListener("click", savePost);
  }

  if(clearPostBtn){
    clearPostBtn.addEventListener("click", clearForm);
  }

  if(exportBtn){
    exportBtn.addEventListener("click", exportJSON);
  }

  if(refreshBtn){
    refreshBtn.addEventListener("click", () => {
      loadPosts();
    });
  }

  if(postSearch){
    postSearch.addEventListener("input", renderPosts);
  }

  if(categoryFilter){
    categoryFilter.addEventListener("change", renderPosts);
  }

  if(statusFilter){
    statusFilter.addEventListener("change", renderPosts);
  }

  if(demoPostsBtn){
    demoPostsBtn.addEventListener("click", addDemoPosts);
  }

  if(clearAllBtn){
    clearAllBtn.addEventListener("click", clearAllPosts);
  }

  if(closeModal){
    closeModal.addEventListener("click", () => {
      postModal.classList.remove("show");
    });
  }

});

function loadPosts(){

  communityPosts =
    JSON.parse(localStorage.getItem("communityPostsUltra")) || [];

  renderPosts();
  updateStats();

}

function savePosts(){

  localStorage.setItem(
    "communityPostsUltra",
    JSON.stringify(communityPosts)
  );

}

function savePost(){

  const post = collectFormData();

  if(!post.title.trim()){

    alert("Post title required.");
    return;

  }

  const exists = communityPosts.some(
    item => item.id === post.id
  );

  if(exists){

    communityPosts = communityPosts.map(item =>
      item.id === post.id ? post : item
    );

  }else{

    communityPosts.unshift(post);

  }

  savePosts();

  renderPosts();
  updateStats();
  clearForm();

  alert("Community post saved.");

}

function collectFormData(){

  return {

    id:
      $("editPostId").value ||
      `post_${Date.now()}`,

    author:
      $("postAuthor").value.trim() ||
      "Shadow Admin",

    category:
      $("postCategory").value,

    title:
      $("postTitle").value.trim(),

    content:
      $("postContent").value.trim(),

    pinned:
      $("pinFlag").checked,

    spoiler:
      $("spoilerFlag").checked,

    approved:
      $("approvedFlag").checked,

    admin:
      $("adminFlag").checked,

    createdAt:
      new Date().toLocaleString(),

    likes:
      Math.floor(Math.random() * 500),

    replies:
      Math.floor(Math.random() * 80)

  };

}

function renderPosts(){

  if(!postsList) return;

  const search =
    postSearch.value.toLowerCase();

  const category =
    categoryFilter.value;

  const status =
    statusFilter.value;

  let filtered = [...communityPosts];

  filtered = filtered.filter(post => {

    const text = `
      ${post.title}
      ${post.content}
      ${post.author}
    `.toLowerCase();

    return text.includes(search);

  });

  if(category !== "all"){

    filtered = filtered.filter(post =>
      post.category === category
    );

  }

  if(status !== "all"){

    filtered = filtered.filter(post => {

      if(status === "pinned") return post.pinned;
      if(status === "spoiler") return post.spoiler;
      if(status === "approved") return post.approved;
      if(status === "pending") return !post.approved;

      return true;

    });

  }

  if(!filtered.length){

    postsList.innerHTML = `
      <div class="empty-state">
        No community posts found.
      </div>
    `;

    return;

  }

  filtered.sort((a,b) => b.pinned - a.pinned);

  postsList.innerHTML = filtered.map(post => {

    return `
      <div class="community-post">

        <div class="post-top">

          <div class="post-author">
            <b>${escapeHTML(post.author)}</b>
            <span>${post.createdAt}</span>
          </div>

          <div class="post-badges">

            ${post.pinned ? `<div class="badge pin">PINNED</div>` : ""}
            ${post.spoiler ? `<div class="badge spoiler">SPOILER</div>` : ""}
            ${post.admin ? `<div class="badge admin">ADMIN</div>` : ""}
            ${!post.approved ? `<div class="badge pending">PENDING</div>` : ""}

          </div>

        </div>

        <h4>${escapeHTML(post.title)}</h4>

        <p>${escapeHTML(post.content)}</p>

        <div class="modal-meta" style="margin-top:15px;">
          <span>${post.category}</span>
          <span>❤ ${post.likes}</span>
          <span>💬 ${post.replies}</span>
        </div>

        <div class="post-actions">

          <button onclick="previewPost('${post.id}')">
            Preview
          </button>

          <button onclick="editPost('${post.id}')">
            Edit
          </button>

          <button onclick="togglePin('${post.id}')">
            ${post.pinned ? "Unpin" : "Pin"}
          </button>

          <button onclick="toggleApprove('${post.id}')">
            ${post.approved ? "Unapprove" : "Approve"}
          </button>

          <button onclick="toggleSpoiler('${post.id}')">
            ${post.spoiler ? "Remove Spoiler" : "Spoiler"}
          </button>

          <button class="delete" onclick="deletePost('${post.id}')">
            Delete
          </button>

        </div>

      </div>
    `;

  }).join("");

}

window.previewPost = function(id){

  const post = communityPosts.find(
    item => item.id === id
  );

  if(!post) return;

  $("modalCategory").textContent =
    post.category;

  $("modalTitle").textContent =
    post.title;

  $("modalContent").textContent =
    post.content;

  $("modalMeta").innerHTML = `
    <span>${post.author}</span>
    <span>❤ ${post.likes}</span>
    <span>💬 ${post.replies}</span>
    <span>${post.createdAt}</span>
  `;

  postModal.classList.add("show");

}

window.editPost = function(id){

  const post = communityPosts.find(
    item => item.id === id
  );

  if(!post) return;

  $("editPostId").value = post.id;

  $("postAuthor").value = post.author;
  $("postCategory").value = post.category;
  $("postTitle").value = post.title;
  $("postContent").value = post.content;

  $("pinFlag").checked = post.pinned;
  $("spoilerFlag").checked = post.spoiler;
  $("approvedFlag").checked = post.approved;
  $("adminFlag").checked = post.admin;

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

}

window.deletePost = function(id){

  if(!confirm("Delete this community post?")) return;

  communityPosts = communityPosts.filter(
    post => post.id !== id
  );

  savePosts();
  renderPosts();
  updateStats();

}

window.togglePin = function(id){

  communityPosts = communityPosts.map(post => {

    if(post.id === id){
      post.pinned = !post.pinned;
    }

    return post;

  });

  savePosts();
  renderPosts();
  updateStats();

}

window.toggleApprove = function(id){

  communityPosts = communityPosts.map(post => {

    if(post.id === id){
      post.approved = !post.approved;
    }

    return post;

  });

  savePosts();
  renderPosts();

}

window.toggleSpoiler = function(id){

  communityPosts = communityPosts.map(post => {

    if(post.id === id){
      post.spoiler = !post.spoiler;
    }

    return post;

  });

  savePosts();
  renderPosts();
  updateStats();

}

function clearForm(){

  $("editPostId").value = "";

  $("postAuthor").value = "";
  $("postTitle").value = "";
  $("postContent").value = "";

  $("postCategory").value = "announcement";

  $("pinFlag").checked = false;
  $("spoilerFlag").checked = false;
  $("approvedFlag").checked = true;
  $("adminFlag").checked = true;

}

function updateStats(){

  totalPosts.textContent =
    communityPosts.length;

  pinnedPosts.textContent =
    communityPosts.filter(post => post.pinned).length;

  spoilerPosts.textContent =
    communityPosts.filter(post => post.spoiler).length;

}

function exportJSON(){

  const data = JSON.stringify(
    communityPosts,
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
  a.download = "shadow-community-posts.json";

  a.click();

  URL.revokeObjectURL(url);

}

function clearAllPosts(){

  if(!confirm("Delete ALL community posts?")) return;

  communityPosts = [];

  savePosts();
  renderPosts();
  updateStats();

}

function addDemoPosts(){

  const demo = [

    {
      id:`demo_${Date.now()}_1`,
      author:"Shadow Admin",
      category:"announcement",
      title:"Shadow Anime Movie Section Updated",
      content:"New anime movie system has been added with premium streaming support and faster loading.",
      pinned:true,
      spoiler:false,
      approved:true,
      admin:true,
      createdAt:new Date().toLocaleString(),
      likes:230,
      replies:34
    },

    {
      id:`demo_${Date.now()}_2`,
      author:"AnimeFanX",
      category:"theory",
      title:"What if Gojo returns in final battle?",
      content:"I think there are hidden clues showing Gojo may return in the manga ending.",
      pinned:false,
      spoiler:true,
      approved:true,
      admin:false,
      createdAt:new Date().toLocaleString(),
      likes:421,
      replies:88
    },

    {
      id:`demo_${Date.now()}_3`,
      author:"Shadow Community",
      category:"review",
      title:"Solo Leveling Episode Review",
      content:"Animation quality was insane. The fight scenes looked cinematic.",
      pinned:false,
      spoiler:false,
      approved:true,
      admin:true,
      createdAt:new Date().toLocaleString(),
      likes:512,
      replies:64
    }

  ];

  communityPosts.unshift(...demo);

  savePosts();
  renderPosts();
  updateStats();

}

function escapeHTML(text){

  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}