
 $(document).ready(function(){
    $(window).scroll(function(){
        var scroll = $(window).scrollTop();
        if(scroll >=300){
            $(".lyrics-search").addClass("fixedSearchbar");
            $(".lyrics-search input").addClass("fixedSearchbarInput");
            $(".lyrics-search button").addClass("fixedSearchbarButton");
        }else{
            $(".lyrics-search").removeClass("fixedSearchbar");
            $(".lyrics-search input").removeClass("fixedSearchbarInput");
            $(".lyrics-search button").removeClass("fixedSearchbarButton");
        }
        });
    });
 
 //reference elements
 const form = document.getElementById("lyricsForm");
 const result = document.getElementById("search-result")
 const searchInput = document.getElementById("lyricsInput");
 const more = document.getElementById("moreLyrics");

 const apiURL = 'https://api.lyrics.ovh';

 //Search by song or artist
 async function searchSongs(term){
    const response = await fetch(`${apiURL}/suggest/${term}`);  //fetch data from api
    const data = await response.json();             //convert these data into json format

    showData(data);    //passing data into showData function
 }
 //show lyrics in the DOM
 function showData(data){
    console.log(data)
     result.innerHTML =
     ` <ul class="songs">
     ${data.data.map((song, index) =>
       
        `<li>
            <span><strong>${song.artist.name}</strong> - ${song.title}</span>
            <button class="lyricsBtns" data-artist="${song.artist.name}" data-songtitle="${song.title}" data-album="${song.album.title}" data-playSample="${song.preview}" data-songDeezer="${song.link}" data-artistDeezer="${song.artist.link}">Get lyrics</button>
        </li>`
        
            ).join("")}
        </ul>
    `;  
    if(data.prev || data.next){
     more.innerHTML =`
     ${
         data.prev 
       ? `<button class="lyricsBtns" onclick="getMoreLyrics('${data.prev}')"><i class="fas fa-angle-double-left"></i> Prev</button>`
       : ""
        } 
    ${
        data.next 
        ? `<button class="lyricsBtns" onclick="getMoreLyrics('${data.next}')">Next <i class="fas fa-angle-double-right"></i></button>`
        : ""
        }
     `;
    }else{
        more.innerHTML =  "";
    }
    
 }

 async function getMoreLyrics(url){
    const res = await fetch(`https://cors-anywhere.herokuapp.com/${url}`);
    const data = await res.json();
    console.log(res);
    showData(data);
 }
        //get lyrics for song
        async function getLyrics(artist, songTitle, album, play, songDeezer, artistDeezer){
            const resp = await fetch(`${apiURL}/v1/${artist}/${songTitle}`);
            const data = await resp.json();
            console.log(songDeezer, artistDeezer);
            if(data.error){        //if there is any error
                result.innerHTML = data.error      //then show this error
            }else{
                const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, `<br>`);
                
                result.innerHTML = `
                <div style="padding:14px;">
                       <h2><strong>${artist}</strong> - ${songTitle}</h2>
                        <h3>Album/Single Song Title: "${album}"</h3>
                        <span class="deezer"><span><a href="${songDeezer}" target="_blank">Check song on Deezer</a> <i class="fas fa-external-link-alt fa-sm" style="color:rgb(27, 27, 27); margin-right:8px;"></i></span>  <span><a href="${artistDeezer}" target="_blank">${artist} on Deezer</a> <i class="fas fa-external-link-alt fa-sm" style="color:rgb(27, 27, 27);"></i></span></span>
                        <audio controls id="playSample">
                            <source src="${play}" type="audio/mp3">
                            <source src="${play}" type="audio/ogg">
                            <source src="${play}" type="audio/mpeg">
                        </audio>
                        <br><br>
                       <span>${lyrics}</span>
               </div>
                `
            }
             more.innerHTML = "";
    }



        //add event listeners
 form.addEventListener("submit",e=>{
    e.preventDefault();     //to not refresh the page

    const searchTerm = searchInput.value.trim();       //trim used here to delete unwanted spaces

    if(!searchTerm){        //if the inserted term is not available
        alert("Please type in a search term.");
    }else{                  //if the inserted term is available
        searchSongs(searchTerm);
    }
 });

        //get lyrics when button clicked
 result.addEventListener("click", e =>{
    const clickedBtn = e.target;

    if(clickedBtn.tagName === "BUTTON"){
        const artist = clickedBtn.getAttribute('data-artist');
        const songTitle = clickedBtn.getAttribute('data-songtitle');
        const album = clickedBtn.getAttribute('data-album');
        const play = clickedBtn.getAttribute('data-playSample');
        const songDeezer = clickedBtn.getAttribute('data-songDeezer');
        const artistDeezer = clickedBtn.getAttribute('data-artistDeezer');

        getLyrics(artist, songTitle, album, play, songDeezer, artistDeezer)
    }
 });

 searchInput.addEventListener("input", function(){ //listens to any input change and update the result list
    const searchTerm = searchInput.value.trim();       //trim used here to delete unwanted spaces

    searchSongs(searchTerm);
    
 });