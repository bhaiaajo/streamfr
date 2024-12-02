const fetch = require("node-fetch");

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.tmdbKey}`
  }
};

const fetchData = async (url) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Failed to fetch from TMDB: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Discover Movies
async function discoverMovies(page = 1) {
  const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc`;
  return await fetchData(url);
}

// Top Rated Movies
async function getTopRatedMovies(page = 1) {
  const url = `https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=${page}`;
  return await fetchData(url);
}

// Convert TMDB ID to IMDb ID
async function tmdbToImdb(id, type = "movie" || "tv"){
  const url = `https://api.themoviedb.org/3/${type}/${id}/external_ids`;

const json = await (await fetch(url, options)).json()
  const data = await(await fetch("https://imdb-api.unknownmanishack.workers.dev/title/"+ json.imdb_id)).json()
  return data
}

// Search for Movies, TV Shows, or People
async function searchTMDB(term, page = 1) {
  const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(term)}&include_adult=false&language=en-US&page=${page}`;
  return await fetchData(url);
}

// Similar Movies or TV Shows
async function getSimilar(id, type = "movie") {
  const url = `https://api.themoviedb.org/3/${type}/${id}/similar?language=en-US&page=1`;
  return await fetchData(url);
}

// Movie or TV Show Details with Cast Information
async function getDetailsWithCast(id, type = "movie") {
  const url = `https://api.themoviedb.org/3/${type}/${id}?language=en-US&append_to_response=credits`;
  return await fetchData(url);
}

// Trending Movies or TV Shows
async function getTrending(type = "movie", period = "week") {
  const url = `https://api.themoviedb.org/3/trending/${type}/${period}?language=en-US`;
  return await fetchData(url);
}

// Popular Movies or TV Shows
async function getPopular(type = "movie", page = 1) {
  const url = `https://api.themoviedb.org/3/${type}/popular?language=en-US&page=${page}`;
  return await fetchData(url);
}

// Get Movies by Keyword ID
async function getList(id, page = 1) {
  const url = `https://api.themoviedb.org/3/list/${id}?language=en-US&page=1`;
  return await fetchData(url);
}
async function getMoviesByKeyword(keywordId, page = 1) {
  const url = `https://api.themoviedb.org/3/keyword/${keywordId}/movie?include_adult=false&language=en-US&page=${page}`;
  return await fetchData(url);
}

// Generate Watch Sources for Movies or TV Shows
function generateWatchSources(id,tmdbid, type){
    if(type === "movie"){
        return {
            "vidsrc.me": `https://vidsrc.xyz/embed/movie/${id}`,
            "autoembed.cc (Ads)": `https://player.autoembed.cc/embed/movie/${id}`,
            "sdsp.xyz (English and Hindi)": `https://v1.sdsp.xyz/embed/movie/${tmdbid}`,
            "smashystream.com (Multi Lang)": `https://player.smashy.stream/movie/${id}`,
            "2embed.cc": `https://www.2embed.cc/embed/${id}`,
            "vidlink.pro": `https://vidlink.pro/movie/${tmdbid}`,
            "vidsrc.pro": `https://vidsrc.pro/embed/movie/${tmdbid}`,
            "vidsrc.icu": `https://vidsrc.icu/embed/movie/${id}`,
            "vidsrc.cc": `https://vidsrc.cc/v2/embed/movie/${tmdbid}`,
            "moviesapi.club": `https://moviesapi.club/movie/${tmdbid}`,
            "vidsrc.nl":`https://player.vidsrc.nl/embed/movie/${tmdbid}`,
            "moviee.tv": `https://moviee.tv/embed/movie/${tmdbid}`,
            "gomo.to": `https://gomo.to/movie/${id}`,
            "vidbinge.dev":`vidbinge.dev/embed/movie/${tmdbid}`,
            "vidbinge.com": `https://www.vidbinge.com/media/tmdb-movie-${tmdbid}`,
            "nontongo.win (Ads)":`https://nontongo.win/embed/movie/${tmdbid}`,
            "multiembed.mov (Ads)":`https://multiembed.mov/directstream.php/?tmdb=1&video_id=${tmdbid}`,
            "multiembed.mov (VIP) (Ads)": `https://multiembed.mov/directstream.php?video_id=${id}&check=1`,
            "vidsrc.rip (May or May not Work)": `https://vidsrc.rip/embed/movie/${id}`,
        }
    }else{
        return {
            "vidsrc.me": `https://vidsrc.xyz/embed/tv/${id}`,
            "vidbinge.dev": `vidbinge.dev/embed/tv/${tmdbid}`
            "moviee.tv": `https://moviee.tv/embed/tv/${tmdbid}`,
            "moviesapi.club": `https://moviesapi.club/tv/${tmdbid}`,
            "2embed.cc": `https://www.2embed.cc/embedtvfull/${id}`,
            "vidsrc.pro": `https://vidsrc.pro/embed/movie/${tmdbid}`,
            "vidsrc.cc": `https://vidsrc.cc/v2/embed/tv/${id}`,
            "vidbinge.com": `https://www.vidbinge.com/media/tmdb-tv-${tmdbid}`
        }
    }
}

async function getMovie(id){
  return await fetchData(`https://api.themoviedb.org/3/movie/${id}`)
}
async function getTV(id){
  return await fetchData(`https://api.themoviedb.org/3/tv/${id}?language=en-US`)
}

async function recommendations(id, type){
  return await fetchData(`https://api.themoviedb.org/3/${type}/${id}/recommendations?language=en-US&page=1`)
}

module.exports = {
  discoverMovies,
  getTopRatedMovies,
  tmdbToImdb,
  searchTMDB,
  getSimilar,
  getDetailsWithCast,
  getTrending,
  getPopular,
  getMoviesByKeyword,
  generateWatchSources,
  getMovie,
  getTV,
  getList,
  recommendations
};
