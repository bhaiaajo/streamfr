const fetch = require("node-fetch")

module.exports = async(id, type = "movie") =>{

    if(type === "movie"){

        const s = (await (await fetch("https://vidsrc.xyz/embed/movie?imdb="+id)).status)
        if(s === 200) return "https://vidsrc.xyz/embed/movie?imdb="+id;
        
        return false

    }else if(type === "tvSeries"){

        const s = (await (await fetch("https://vidsrc.xyz/embed/tv?imdb="+id)).status)

        if(s === 200) return "https://vidsrc.xyz/embed/tv?imdb="+id;
        
        return false

    }

}