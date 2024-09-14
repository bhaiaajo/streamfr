const fetch = require("node-fetch")
const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${process.env.tmdbKey}`
    }
  };

async function discoverMovie(){
const url = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc';


const d = await (await fetch(url, options)).json()

return d
}

async function topRated(){
    const url = 'https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1';


const d = await (await fetch(url, options)).json()

return d
}

async function tmdbtoimdb(id, type = "movie" || "tv"){
    const url = `https://api.themoviedb.org/3/${type}/${id}/external_ids`;

const json = await (await fetch(url, options)).json()
    const data = await(await fetch("https://imdb-api.unknownmanishack.workers.dev/title/"+ json.imdb_id)).json()
    return data
}

async function search(term){
    const fetch = require('node-fetch');

const url = `https://api.themoviedb.org/3/search/multi?query=${term}&include_adult=false&language=en-US&page=1`;

const d = await (await fetch(url, options)).json()

    return d
}

async function similar(id, t){
    const fetch = require('node-fetch');
const url = `https://api.themoviedb.org/3/${t}/${id}/similar?language=en-US&page=1`;

const d = await (await fetch(url, options)).json()

    return d
}

async function list(id){
    const fetch = require('node-fetch');

const url = `https://api.themoviedb.org/3/list/${id}?language=en-US&page=1`;

const d = await (await fetch(url, options)).json()

    return d
}
async function tdtid(id,type){
    const fetch = require('node-fetch');

    const url = `https://api.themoviedb.org/3/${type}/${id}/external_ids`;

const d = await (await fetch(url, options)).json()

    return d.imdb_id
}


async function trendingtv(){
    const fetch = require('node-fetch');

const url = `https://api.themoviedb.org/3/trending/tv/week?language=en-US`;

const d = await (await fetch(url, options)).json()

    return d
}
async function trendingMovie(){
    const fetch = require('node-fetch');

const url = `https://api.themoviedb.org/3/trending/movie/week?language=en-US`;

const d = await (await fetch(url, options)).json()

    return d
}
async function keyword(id){
    const fetch = require('node-fetch');

const url = `https://api.themoviedb.org/3/keyword/${id}/movies?include_adult=false&language=en-US&page=1`;

const d = await (await fetch(url, options)).json()

    return d
}
function idToSource(id,tmdbid, type){
    if(type === "movie"){
        return {
            "vidsrc.me": `https://vidsrc.xyz/embed/movie/${id}`,
            "vidsrc.rip": `https://vidsrc.rip/embed/movie/${id}`,
            "autoembed.cc": `https://player.autoembed.cc/embed/movie/${id}`,
            "sdsp.xyz (English and Hindi)": `https://v1.sdsp.xyz/embed/movie/${tmdbid}`,
            "smashystream.com (Multi Lang)": `https://player.smashy.stream/movie/${id}`,
            "superembed.stream": `https://multiembed.mov/directstream.php?video_id=${id}`,
            "2embed.cc": `https://www.2embed.cc/embed/${id}`,
            "vidlink.pro": `https://vidlink.pro/movie/${tmdbid}`,
            "vidsrc.pro": `https://vidsrc.pro/embed/movie/${tmdbid}`,
            "vidsrc.icu": `https://vidsrc.icu/embed/movie/${id}`
            "vidsrc.cc": `https://vidsrc.cc/v2/embed/movie/${tmdbid}`,
            "moviesapi.club": `https://moviesapi.club/movie/${tmdbid}`,
            "moviee.tv": `https://moviee.tv/embed/movie/${tmdbid}`,
            "gomo.to": `https://gomo.to/movie/${id}`
        }
    }else{
        return {
            "vidsrc.me": `https://vidsrc.xyz/embed/tv/${id}`,
            "moviee.tv": `https://moviee.tv/embed/tv/${tmdbid}`,
            "moviesapi.club": `https://moviesapi.club/tv/${tmdbid}`,
            "2embed.cc": `https://www.2embed.cc/embedtvfull/${id}`,
            "vidsrc.pro": `https://vidsrc.pro/embed/movie/${tmdbid}`,
            "vidsrc.cc": `https://vidsrc.cc/v2/embed/tv/${id}`
        }
    }
}

module.exports = {
    discoverMovie,
    topRated,
    tmdbtoimdb,
    search,
    idToSource,
    similar,
    list,
    tdtid,
    trendingMovie,
    trendingtv,
    keyword
}
