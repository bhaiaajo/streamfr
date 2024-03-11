window.onload = () =>{

fetch("/s.json").then(g => g.json()).then(g =>{

    g.forEach(x =>{
    const div = document.createElement("div") 
    div.className = "float-child"
    const img = document.createElement("img")
    img.src = x.img
    const anchor = document.createElement("a")
    anchor.href = "/play/"+x.imdb
    anchor.appendChild(img)
    div.appendChild(anchor)
    document.getElementsByClassName("float-container")[0].appendChild(div)
})

}
