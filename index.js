const express = require("express");
const fs = require("fs");
const morgan = require("morgan");
const NodeCache = require("node-cache");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const utils = require("./utils");
const tmdb = require("./utils");

const app = express();
const PORT = process.env.PORT || 8080;
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

// Middleware
app.use(express.json());
app.use(morgan("combined"));
app.use("/css", express.static(__dirname + "/css"));

// Rate Limiting for API requests
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: "Too many requests, please try again later." }
});
app.use("/api", apiLimiter);

// Utility function to handle errors
function handleError(res, message = "An error occurred", status = 500) {
    res.status(status).json({ error: message });
}

// Convert seconds to HH:MM:SS format
function secondsToHms(d) {
    d = Number(d);
    const h = Math.floor(d / 3600);
    const m = Math.floor((d % 3600) / 60);
    const s = Math.floor(d % 3600 % 60);
    return `${h > 0 ? h + " hours, " : ""}${m > 0 ? m + " minutes, " : ""}${s > 0 ? s + " seconds" : ""}`;
}

// Route Handlers
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// Discover and Top Rated Movies with Caching
app.get("/api/discover", (req, res) => {
    const cacheKey = "discoverMovies";
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.send(cachedData);

    utils.discoverMovies()
        .then((data) => {
            cache.set(cacheKey, data);
            res.send(data);
        })
        .catch(() => handleError(res, "Failed to fetch discover movies"));
});

app.get("/api/toprated", (req, res) => {
    const cacheKey = "topRatedMovies";
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.send(cachedData);

    utils.getTopRatedMovies()
        .then((data) => {
            cache.set(cacheKey, data);
            res.send(data);
        })
        .catch(() => handleError(res, "Failed to fetch top-rated movies"));
});

// Consolidate content retrieval by type
app.get("/api/list/:id", (req, res) => {
    const id = req.params.id;
    if (!id) return handleError(res, "Missing ID", 400);

    utils.getList(id).then(x => res.send(x.items))
});
app.get("/api/keyword/:id", (req, res) => {
    const id = req.params.id;
    if (!id) return handleError(res, "Missing ID", 400);

    utils.getMoviesByKeyword(id).then(x => res.send(x?.results || {'error': 'No data found'}))
});

app.get("/api/similar/:id/:type", async(req,res) =>{
    const { id,type  } = req.params;
    const d = await utils.getSimilar(id, type) 
    res.send(d)
})      

// Play Route with IMDb and TMDb Data
app.get("/play/:id", async (req, res) => {
    const { id } = req.params;
    const isSeries = req.query.series === "1";
    if (!id) return handleError(res, "Missing ID", 400);

    try {
        const imdbData = await utils.tmdbToImdb(id, isSeries ? "tv" : "movie");
        const sources = await utils.generateWatchSources(imdbData.id, id, isSeries ? "tv" : "movie");

        const file = fs.readFileSync("./public/watch.html", "utf-8");
        const replacedContent = file
            .replace(/{name}/g, imdbData.title)
            .replace(/{id}/g, imdbData.id)
            .replace(/{streamurl}/g, sources["vidsrc.me"])
            .replace(/{imgurl}/g, imdbData.image)
            .replace(/{text}/g, formatDetails(imdbData))
            .replace(/{ddcode}/g, generateSourceOptions(sources))
            .replace(/{type}/g, isSeries ? "tv" : "movie")
            .replace(/{tmdbid}/g, id)
            .replace(/{q}/g, isSeries ? "?series=1" : "")
            .replace(/{season}/g, imdbData.all_seasons ? imdbData.all_seasons.length : "");

        res.setHeader("Content-Type", "text/html");
        res.send(replacedContent);
    } catch {
        handleError(res, "Failed to play content", 500);
    }
});

// Search Route
app.get("/search", async (req, res) => {
    const { q } = req.query;
    if (!q) return handleError(res, "Missing Query", 400);

    try {
        const data = await utils.searchTMDB(q);
        if (!data?.results) return handleError(res, "No results found", 404);

        const file = fs.readFileSync("./public/search.html", "utf-8");
        const searchContent = data.results.map(x =>
            `
<div class="result" onclick="handleCardClick('${x.id}', '${x.media_type === "tv" ? "tv" : "movie"}')">
    <!--<a href="/play/${x.id}${x.media_type === "tv" ? "?series=1" : ""}">!-->
        <img src="https://image.tmdb.org/t/p/w200${x.poster_path}" alt="${x.title || x.name}">
        <p style="margin: 5px 0; color: white;">${x.title || x.name} (${x.release_date? x.release_date?.split("-")[0]:"No Data" || x.first_air_date? x.first_air_date?.split("-")[0]: "No Data"})</p>
    <!--</a>!-->
</div>
`
        ).join("");
        const final = file.replace(/{term}/g, q).replace(/{code}/g, searchContent);
        res.setHeader("Content-Type", "text/html");
        res.send(final);    
    } catch (err) {
        console.log(err)
        handleError(res, "Search failed", 500);
    }
});

// Privacy Policy
app.get("/privacypolicy", (req, res) => {
    res.sendFile(__dirname + "/public/pp.html");
});

// New Movies and Suggestions
app.get("/api/trending", (req, res) => {
    utils.getTrending()
        .then(data => res.send(data))
        .catch(() => handleError(res, "Failed to load new movies"));
});

app.get("/api/trendingtv", (req,res) =>{
    utils.getTrending("tv")
    .then(data => res.send(data))
    .catch(() => handleError(res, "Failed to load new movies"));
})

app.get("/api/recommendations/:id/:type", (req,res) =>{
    utils.recommendations(req.params.id, req.params.type)
    .then(data => res.send(data))
    .catch(() => handleError(res, "Failed to load new movies"));
})

app.get("/api/movies/top-rated", async (req, res) => {
    const { page = 1 } = req.query;
    const data = await tmdb.getTopRatedMovies(page);
    data ? res.json(data) : handleError(res, "Failed to fetch top-rated movies.");
});

app.get("/api/movie/:movieId", async (req, res) => {
    const movieId = req.params.movieId;

    try {
        // Fetch movie details from TMDB API
        const response = await utils.getMovie(movieId)
        // Send back the movie data as JSON
        res.json(response);
    } catch (error) {
        console.error("Error fetching movie details:", error.message);
        res.status(500).json({ error: "Failed to fetch movie details" });
    }
});

app.get("/api/tv/:tvId", async (req, res) => {
    const tvId = req.params.tvId;

    try {
        const response = await utils.getTV(tvId)
        res.json(response);
    } catch (error) {
        console.error("Error fetching movie details:", error.message);
        res.status(500).json({ error: "Failed to fetch tvshow details" });
    }
});

app.get("/dmca", (req,res) => res.sendFile(__dirname + "/public/dmca.html"))
app.get('/docs', (req,res) => res.sendFile(__dirname + "/public/apidocs.html"))

app.get("/api/player/:id", async (req, res) => {
    const { id } = req.params;
    const isSeries = req.query.series === "1";

    if (!id) return handleError(res, "Missing ID", 400);

    try {
        // Fetch IMDb data based on whether it's a movie or TV series
        const imdbData = await utils.tmdbToImdb(id, isSeries ? "tv" : "movie");
        const sources = await utils.generateWatchSources(imdbData.id, id, isSeries ? "tv" : "movie");

        // Read player HTML file
        const file = fs.readFileSync("./public/player.html", "utf-8");

        // Replace placeholders in HTML file with fetched data
        const replacedContent = file
            .replace(/{id}/g, imdbData.id)
            .replace(/{name}/g, imdbData.title)
            .replace(/{streamurl}/g, sources["vidsrc.me"] || "")
            .replace(/{ddcode}/g, generateSourceOptions(sources))
            .replace(/{type}/g, isSeries ? "tv" : "movie");

        // Send the modified HTML content as the response
        res.setHeader("Content-Type", "text/html");
        res.send(replacedContent);
    } catch (error) {
        console.error("Error fetching player data:", error.message);
        handleError(res, "Failed to retrieve player data", 500);
    }
});

app.get("/customcursor.png", (req,res) =>{
    res.sendFile(__dirname+"/customcursor.png")
})

// Helper Function for Generating Source Options in HTML
function generateSourceOptions(sources) {
    return Object.entries(sources)
        .map(([name, url]) => `<option value="${url}">${name}</option>`)
        .join("\n");
}

app.get("/1138894.txt", (req, res) =>{
    res.setHeader("Content-Type", "text/txt")
    res.send("1138894")
})

app.get("/1269518.sw.js", (req,res)=>{
      res.setHeader("Content-Type", "text/javascript")
        res.send("self.opts = {zoneID: 1269518,swDomain: \"push-sdk.com\",}\nimportScripts('https://push-sdk.com/f/sw.js')")  
})
// Basic error handling for undefined routes
app.use((req, res) => res.status(404).sendFile(__dirname + "/public/404.html"));

// Start Server
app.listen(8080, () => {
        (`Server running on port ${PORT}`);
});

// Helper Functions
function formatDetails(imdb) {
    return `<h2>${imdb.title}&nbsp</h2> <br>${imdb.year}, ${imdb.rating?.star} ⭐<br>${secondsToHms(imdb.runtimeSeconds)}<br>${imdb.spokenLanguages?.map(x => x.language).join(", ")}<br>${imdb.genre?.join(", ")}<br>Director(s): ${imdb.directors?.join(", ")}<br>Actors: ${imdb.actors?.join(", ")}<br><br>${imdb.plot}`;
}

function generateSourceOptions(sources) {
    return Object.entries(sources).map(([name, url]) => `<option value="${url}">${name}</option>`).join("\n");
}
