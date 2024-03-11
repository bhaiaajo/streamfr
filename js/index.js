window.onload = () =>{
    document.getElementById("submit").onclick = () =>{

        if(!document.getElementById("textbox").value) return alert("Please enter a search term")
        location.href = "#load"
        location.href = "/search?q=" + document.getElementById("textbox").value

    }

    document.addEventListener("keypress", (e) =>{
        if(e.keyCode === 13){
            const searchTerm = document.getElementById("textbox").value
    
            if(!searchTerm) return alert("Please enter a search term")
    
            window.open("/search?q="+ searchTerm)
            location.href = "#load"
            document.getElementById("textbox").value = ""
        }
    })
}