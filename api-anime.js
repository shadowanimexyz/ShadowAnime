const ANILIST_URL = "https://graphql.anilist.co";

async function fetchAniListAnime(search = "", page = 1) {
  const query = `
    query ($page: Int, $search: String) {
      Page(page: $page, perPage: 30) {
        media(type: ANIME, search: $search, sort: POPULARITY_DESC) {
          id
          title { romaji english }
          coverImage { large }
          bannerImage
          description(asHtml: false)
          genres
          averageScore
          episodes
          seasonYear
          status
          siteUrl
          trailer { id site }
        }
      }
    }
  `;

  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { page, search: search || null }
    })
  });

  const data = await res.json();
  return data.data.Page.media.map(anime => ({
    title: anime.title.english || anime.title.romaji,
    image: anime.coverImage.large,
    banner: anime.bannerImage,
    description: anime.description || "",
    genre: anime.genres.join(", "),
    rating: anime.averageScore ? anime.averageScore / 10 : "N/A",
    episodes: anime.episodes || "Unknown",
    year: anime.seasonYear || "Unknown",
    status: anime.status,
    link: anime.siteUrl,
    trailer: anime.trailer?.id
      ? `https://www.youtube.com/watch?v=${anime.trailer.id}`
      : "",
    type: "Anime",
    trending: true,
    popular: true
  }));
}