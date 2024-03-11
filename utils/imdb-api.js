const fetch = require("node-fetch")
const baseURL = "https://imdb-api.unknownmanishack.workers.dev/"

async function search(term){

    return (await fetch(baseURL + "search?query=" + term).then(x => x.json()))

}

async function title(id){
    
    const g = (await fetch(baseURL + "title/" + id).then(x => x.json()))

        return g


}

module.exports = {
    search,
    title
}