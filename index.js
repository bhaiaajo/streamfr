const express = require("express")
const app = express()
const utils = require("./utils")

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay; 
}

app.use("/css",express.static(__dirname+"/css"))
app.use(express.json())
app.get("/", (req,res) =>{

    res.sendFile(__dirname+"/public/index.html")

})

app.get("/api/discover", (req,res) =>{
    utils.discoverMovie().then(x =>{
        res.send(x)
    })
})
app.get("/api/toprated", (req,res) =>{
    utils.topRated().then(x =>{
        res.send(x)
    })
})

app.get("/api/list/:id", (req,res)=>{
    if(!req.params.id) return res.send({error: "Missing Term"})
    utils.list(req.params.id).then(x =>{
res.send(x)})
})

app.get("/api/similar/:id/:type", (req,res)=>{
    if(!req.params.id || !req.params.type) return res.send({error: "Missing Term"})
    utils.similar(req.params.id, req.params.type).then(x =>{
res.send(x)})
})

app.get("/play/:id", async(req,res) =>{

    if(!req.params.id) return res.send({error: "Missing ID"})
    let sources = "";
    let imdb = "";
    let type = ""
    let q = ""
    if(req.query.series === "1"){
        imdb = (await utils.tmdbtoimdb(req.params.id, "tv"))
        type ="tv"
        sources = utils.idToSource(imdb.id,req.params.id,"tv")
        q = "?series=1"
    }else{
        imdb = (await utils.tmdbtoimdb(req.params.id, "movie"))
        type ="movie"
        sources = utils.idToSource(imdb.id,req.params.id,"movie")
    }
    const fs = require("fs")
    const file = fs.readFileSync("./public/watch.html", "utf-8")
    const msg = `${imdb.title} (${imdb.year}) ${imdb.rating?.star} ⭐<br>${secondsToHms(imdb.runtimeSeconds)} ${imdb.spokenLanguages?.map(x => x.language).join(", ")} ${imdb.genre?.map(x=>x).join(", ")}<br>Director(s): ${imdb.directors?.map(x=>x).join(", ")}<br>Actors: ${imdb.actors?.map(x=>x).join(", ")}<br><br>${imdb.plot} `
    const sourceName = Object.keys(sources)
    const sourceURL = Object.values(sources)
    let i = 0
    let txt = ""
    while(i !== sourceName.length){
        txt += `<option value="${sourceURL[i]}">${sourceName[i]}</option>\n`
        i++
    }

    const re = file.replace(/{name}/g, imdb.title).replace(/{id}/g, imdb.id).replace(/{streamurl}/g, sources["vidsrc.me"]).replace(/{imgurl}/g, imdb.image).replace(/{text}/g, msg).replace(/{ddcode}/g, txt).replace(/{type}/g, type).replace(/{tmdbid}/g, req.params.id).replace(/{q}/g, q)

    res.setHeader("Content-Type", "text/html")
    res.send(re)

})

app.get("/search", async(req,res) =>{

    if(!req.query.q) res.send({error: "Missing Query"})
    const data = await utils.search(req.query.q)
    if(!data?.results) return res.send({"error": "No results found"});
    let txt = ""
    data.results.forEach(x =>{
        let url = ""
        if(x.media_type === "tv"){
            url = `/play/${x.id}?series=1`
        }else{
            url = `/play/${x.id}`
        }

        txt += `<a href="${url}"><img src="https://image.tmdb.org/t/p/original${x.poster_path}"></a>`

    })
    const fs = require("fs")
    const file = fs.readFileSync("./public/search.html", "utf-8")
    const final = file.replace(/{term}/g, req.query.q).replace(/{code}/g, txt)
    res.setHeader("Content-Type", "text/html")
    res.send(final)
})

app.get("/api/trending/tv", (req,res) =>{
    utils.trendingtv().then(g=>res.send(g))
})

app.get("/api/trending/movie", (req,res) =>{
    utils.trendingMovie().then(g=>res.send(g))
})

app.listen(8080)
