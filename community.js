const $ = id => document.getElementById(id);

const communityLoader = $("communityLoader");

const menu = $("menu");
const menuBtn = $("menuBtn");

const createPostBtn = $("createPostBtn");

const postName = $("postName");
const postCategory = $("postCategory");
const postText = $("postText");

const postFeed = $("postFeed");

const feedSearch = $("feedSearch");
const feedFilter = $("feedFilter");

const totalPosts = $("totalPosts");
const totalLikes = $("totalLikes");
const totalReplies = $("totalReplies");

const pollResult = $("pollResult");

let posts = JSON.parse(localStorage.getItem("shadowCommunityPosts") || "[]");

document.addEventListener("DOMContentLoaded", initCommunity);

function initCommunity(){

  bindCommunityUI();

  renderPosts();

  updateCommunityStats();

  setTimeout(()=>{
    communityLoader.style.opacity = "0";
    communityLoader.style.pointerEvents = "none";
  },800);
}

function bindCommunityUI(){

  if(menuBtn && menu){
    menuBtn.onclick = () => {
      menu.classList.toggle("show");
    };
  }

  createPostBtn.onclick = createPost;

  feedSearch.addEventListener("input",renderPosts);
  feedFilter.addEventListener("change",renderPosts);

  document.querySelectorAll(".poll-option").forEach(btn=>{

    btn.onclick = () => {

      const type = btn.dataset.poll;

      let votes =
        JSON.parse(localStorage.getItem("shadowPollVotes") || "{}");

      votes[type] = (votes[type] || 0) + 1;

      localStorage.setItem(
        "shadowPollVotes",
        JSON.stringify(votes)
      );

      renderPoll();
    };
  });

  renderPoll();
}

function createPost(){

  const name =
    postName.value.trim() || "Shadow Fan";

  const category =
    postCategory.value;

  const text =
    postText.value.trim();

  if(!text){
    alert("Write something first.");
    return;
  }

  const post = {
    id:Date.now(),
    name,
    category,
    text,
    likes:0,
    replies:[],
    createdAt:new Date().toLocaleString()
  };

  posts.unshift(post);

  savePosts();

  postText.value = "";

  renderPosts();
  updateCommunityStats();
}

function renderPosts(){

  const keyword =
    feedSearch.value.toLowerCase().trim();

  const filter =
    feedFilter.value;

  const filtered = posts.filter(post=>{

    const text = `
      ${post.name}
      ${post.text}
      ${post.category}
    `.toLowerCase();

    return (
      text.includes(keyword) &&
      (filter === "all" || post.category === filter)
    );
  });

  if(!filtered.length){

    postFeed.innerHTML = `
      <div class="post-card">
        <h2>No posts found</h2>
        <p class="post-text">
          Try another keyword or create a new post.
        </p>
      </div>
    `;

    return;
  }

  postFeed.innerHTML = filtered.map(post=>`
    <article class="post-card
      ${post.category === "spoiler" ? "spoiler-post" : ""}"
      data-id="${post.id}">

      <div class="post-top">

        <div>
          <div class="post-author">
            ${safeText(post.name)}
          </div>

          <small style="color:#8fa9be">
            ${post.createdAt}
          </small>
        </div>

        <div class="post-category">
          ${safeText(post.category)}
        </div>

      </div>

      <div class="post-text">
        ${safeText(post.text)}
      </div>

      <div class="post-actions">

        <button onclick="likePost(${post.id})">
          ❤️ ${post.likes}
        </button>

        <button onclick="toggleReplyBox(${post.id})">
          💬 Reply
        </button>

        <button onclick="deletePost(${post.id})">
          🗑 Delete
        </button>

        ${
          post.category === "spoiler"
          ? `
            <button onclick="revealSpoiler(${post.id})">
              👁 Reveal
            </button>
          `
          : ""
        }

      </div>

      <div class="reply-box" id="replyBox-${post.id}">
        <input
          id="replyInput-${post.id}"
          placeholder="Write reply..."
        >

        <button onclick="addReply(${post.id})">
          Send
        </button>
      </div>

      <div class="replies">
        ${
          post.replies.map(reply=>`
            <div class="reply-item">
              ${safeText(reply)}
            </div>
          `).join("")
        }
      </div>

    </article>
  `).join("");
}

function likePost(id){

  const post = posts.find(p => p.id === id);

  if(!post) return;

  post.likes++;

  savePosts();

  renderPosts();
  updateCommunityStats();
}

function deletePost(id){

  posts = posts.filter(post => post.id !== id);

  savePosts();

  renderPosts();
  updateCommunityStats();
}

function toggleReplyBox(id){

  const box = document.getElementById(`replyBox-${id}`);

  if(box){
    box.classList.toggle("active");
  }
}

function addReply(id){

  const input =
    document.getElementById(`replyInput-${id}`);

  if(!input) return;

  const text =
    input.value.trim();

  if(!text) return;

  const post = posts.find(p => p.id === id);

  if(!post) return;

  post.replies.push(text);

  input.value = "";

  savePosts();

  renderPosts();
  updateCommunityStats();
}

function revealSpoiler(id){

  const card =
    document.querySelector(
      `.post-card[data-id="${id}"]`
    );

  if(card){
    card.classList.toggle("revealed");
  }
}

function updateCommunityStats(){

  totalPosts.innerText =
    posts.length;

  totalLikes.innerText =
    posts.reduce((a,b)=>a + b.likes,0);

  totalReplies.innerText =
    posts.reduce(
      (a,b)=>a + b.replies.length,
      0
    );
}

function renderPoll(){

  const votes =
    JSON.parse(localStorage.getItem("shadowPollVotes") || "{}");

  const entries =
    Object.entries(votes);

  if(!entries.length){

    pollResult.innerHTML =
      "No votes yet.";

    return;
  }

  pollResult.innerHTML =
    entries.map(([name,count])=>`
      <div style="
        margin-top:8px;
        display:flex;
        justify-content:space-between;
      ">
        <span>${safeText(name)}</span>
        <b>${count}</b>
      </div>
    `).join("");
}

function savePosts(){

  localStorage.setItem(
    "shadowCommunityPosts",
    JSON.stringify(posts)
  );
}

function safeText(text){

  return String(text || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}