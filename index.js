const express = require("express")
const fs = require("fs")
const fetch = require("node-fetch")
const app = express()

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

const s = require("./s.json")

const imdb = require("./utils/imdb-api")
const streamfetch = require("./utils/streamfetch")

app.use("/css",express.static(__dirname + "/css"))
app.use("/js",express.static(__dirname + "/js"))

app.use(express.json())

app.get("/", (req,res) =>{

    res.sendFile(__dirname + "/public/index.html")

})

app.get("/s.json", (req,res) => {

    res.send(shuffle(s))

})

app.get("/api/search",async (req, res) =>{


    let arr = []

    const q = req.query.q
    if(!q) return res.send({'error': "No Query Found"});

    const got = await imdb.search(q)
    if(!got?.results) return res.send({"error": "No results found"});

        for (const g of got?.results) {
            const  url  = await streamfetch(g.id, g.stream)
            g.url = url
            arr.push(g);
        }

       res.send(arr)
      

})

app.get("/api/title/:id", (req,res) =>{

    const id = req.params.id
    if(!id) return res.send({error: 'ImDB ID Missing'})
    if(!id.toLowerCase().startsWith("tt")) return res.send({error: "ImDB ID not matching RegEx"})

    imdb.title(id).then(x =>{
        res.send(x)
    })

})
   
app.get("/search", async(req,res) =>{
    const data = fs.readFileSync("./public/search.html", "utf-8")

    if(!req.query.q) return res.sendStatus(400)

    const g = (await(await fetch("http://localhost:8080/api/search?q=" + req.query.q)).json())
    let code = ""

    g.forEach(x => {
    code += `<div class="float-child">
            <a href="/play/${x.id}"> 
                <img src="${x.image_large}" alt="${x.title}-img" height="480" width="330">
                <h1>${x.title.substring(0,20)}</h1>
            </a>
        </div>`
    })

    const f =data.replace(/{data}/g, code)

    res.setHeader('Content-Type', 'text/html')
    res.send(f)

})

app.get("/play/:id", async(req,res) =>{


    const id = req.params.id

    if(!id) return res.sendStatus(400)

    const fa = await imdb.title(id)
    const stream = await streamfetch(fa.id, fa.contentType)
    const d = fs.readFileSync("./public/watch.html", "utf-8")
    const msg = `${fa.rating.star}⭐ ${fa.contentRating} ${fa.runtime} ${fa.title} ${fa.releaseDetailed.year}<br>${fa.genre.map(x => x).join(", ")}<br><br>${fa.plot}`
    const fi = d.replace(/{url}/g, stream).replace(/{imgurl}/g, fa.image).replace(/{title}/g, fa.title).replace(/{id}/g , fa.id).replace(/{msg}/g, msg).replace(/{desc}/g, fa.plot)
    res.setHeader("Content-Type", 'text/html')
    res.send(fi)

})

app.listen(8080, x => console.log("http://localhost:8080"))