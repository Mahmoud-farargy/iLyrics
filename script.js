
 $(document).ready(function(){
    $(window).scroll(function(){
        var scroll = $(window).scrollTop();
        if(scroll >=230){
            $(".lyrics-search").addClass("fixedSearchbar");
            $(".lyrics-search input").addClass("fixedSearchbarInput");
            $(".lyrics-search button").addClass("fixedSearchbarButton");
        }else{
            $(".lyrics-search").removeClass("fixedSearchbar");
            $(".lyrics-search input").removeClass("fixedSearchbarInput");
            $(".lyrics-search button").removeClass("fixedSearchbarButton");
        }
        });


        $(window).scroll(function(){
            var scroll = $(window).scrollTop();
            if(scroll >=1500){
                $(".arrow-up").css("display","block");
            }else{
                $(".arrow-up").css("display","none");
            }
        });


        $("#arrowUp").on("click",function(event){
            if(this.hash != ""){
                event.preventDefault(); //prevent the default action

                const hash = this.hash;
                
                $("html, body").animate({ //custom settings
                            scrollTop: $(hash).offset().top
                            
                },1100, function(){
                    window.location.hash = hash;
                });   
            }
                
        });
    });


 //reference elements
 const form = document.getElementById("lyricsForm");
 const result = document.getElementById("search-result")
 const searchInput = document.getElementById("lyricsInput");
 const more = document.getElementById("moreLyrics");
 const artistDOM = document.getElementById("search-artist");
 const topTracks = document.getElementById("topTracks");
 const topTracksBtn = document.getElementById("topTracksBtn");
 var albumTracks = "";
 var textToCopy = "";
 var apiKeys = "747119c2578b31fb3609be06f4bb3d06";
 var tryCount = 2;

 const apiURL = 'https://api.lyrics.ovh';



 //Search by song or artist
 async function searchSongs(term){ //fetch data from api
    result.innerHTML = `
        <div id="loading">
            <div class="loading-div">
                <div class="loading-div">
                    <div class="loading-div">
                        <div class="loading-div">
                        
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    more.innerHTML= '';
    const response = await fetch(`${apiURL}/suggest/${term}`).catch(error=>{ //catch any error
        result.innerHTML= `
            <div class="alert alert-danger text-center" style="width:90%; margin: 0 auto;"> 
                <h6>${error}.<h6>
                <p>This error may occurred due to: <br>
                1- An internet connection issue. If this is the case, try checking network cables or reconnecting to Wi-Fi.<br>
                2- API is not responding. This might be temporarily or permanently.</p>
                *Note: The app will automatically reload once you are back online.
            </div>
        `
        if(!navigator.onLine){
                var interval = setInterval(()=>{
                if(navigator.onLine){ //if the user is offline

                     location.reload();
                    clearInterval(interval);        //then refresh page when getting back online
                    alert("You are now back online.");
                }
            }, 3000);
        }
    }); 

    const data = await response.json();             //converting these data into json format
    
    showData(data);    //passing data into showData function
 }
 //showing lyrics in the DOM
 function showData(data){
     topTracks.innerHTML= "";
     artistDOM.innerHTML= "";
     result.innerHTML =
     ` <div class="songs">
     ${data.data.map((song, index) =>

        `<li>
            <span><strong class="text-primary">${song.artist.name}</strong> - ${song.title}</span>
            <button class="lyricsBtns" data-artist="${song.artist.name}" data-songtitle="${song.title}" data-album="${song.album.title}" data-songDeezer="${song.link}" data-artistDeezer="${song.artist.link}">Get lyrics</button>
        </li>`
        
            ).join("")}
        </div>
        
    `;  
    topTracksBtn.innerHTML= `
                        <a class="mt-2 backBtn" onclick="backToMenu()" style="background-color:#ff6050;">Top 15 songs</a>
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
            if(!res || res === undefined || res === null){
                console.log("An error occurred");
            }
            showData(data);
            
            
        }

        //getting lyrics for song
        async function getLyrics(artist, songTitle, album, play, songDeezer, artistDeezer){
            result.innerHTML = `
                    <div id="loading">
                        <div class="loading-div">
                            <div class="loading-div">
                                <div class="loading-div">
                                    <div class="loading-div">
                                
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            more.innerHTML= '';
            const resp = await fetch(`${apiURL}/v1/${artist}/${songTitle}`);   
            const data = await resp.json();
            if(data.error){        //if there is any error,
                
                $.ajax({            //transfer data to musixmatch's API
                    type: "GET",
                    data: {
                        apikey: apiKeys,
                            format: "jsonp",
                            q_track: songTitle,
                            q_artist: artist,
                            s_artist_rating: "DESC", //sorts by popularity of artist
            
                    },
            
                    url: "https://api.musixmatch.com/ws/1.1/matcher.lyrics.get?q_track=sexy%20and%20i%20know%20it&q_artist=lmfao",
                    dataType: "jsonp",
                    contentType: 'application/json',
                    success: function(ly) {
                        if(ly.message.body === "" || ly.message.body == []){
                            
                            tryAgain();
                        }else if(ly.message.body.lyrics){
                            textToCopy = ly.message.body.lyrics.lyrics_body;
                            result.innerHTML = `
                            <div style="padding:14px;" id="results">
                                <strong class="song-title">${songTitle}</strong>
                                <h4 class="artist-name"><span>${artist}</span></h4>
                                <a title="Copy lyrics" class="copyBtn" onclick="copyLyrics()"><i class="far fa-copy"></i></a>
                                    <h5>Album/Single Song Title: "${album}"</h5>
                                    
                                <br>
                                <p class="lyrics-style mt-2">${ly.message.body.lyrics.lyrics_body}</p>
                               
                                    
                            </div>
                            `;
                            topTracksBtn.innerHTML= `
                            <a class="my-2 backBtn" onclick="backToMenu()" style="background-color:#ff6050;">Top 15 songs</a>
                            `;
                        }
                        
                    },
                    error: function(){      //then show this error
                        result.innerHTML =
                                ` 
                                <div class="alert alert-danger text-center p-1 mt-5" style="width:90%; margin: 0 auto;">
                                    <h6>${data.error}</h6> 
                                </div>
                                `;
                    }

                });
                result.innerHTML =
                                ` 
                                <div class="alert alert-warning text-center p-1 mt-5" style="width:90%; margin: 0 auto;">
                                    <h6>Sorry, no lyrics found.</h6> 
                                </div>
                 `;
                 
                 
                
            }else{      //else, show the lyrics
                $.ajax({  //TESTING
                    type: "GET",
                    url: `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=c97bb1d27fa8605e3980c6ad761e0648&artist=${artist}&album=${album}&format=json`,
                    dataType: "jsonp",
                    contentType: 'application/json',
                    success: function(data) {   
                            if(data.album){
                                albumTracks = data.album.tracks.track;
                                console.log(albumTracks);
                            }
                        
                    }
                });
                const lyrics = data.lyrics;
                textToCopy = data.lyrics;

                topTracks.innerHTML= ""; //hiding top song list & render results instead
                result.innerHTML = `
                <div style="padding:14px;" id="results">
                       <strong class="song-title">${songTitle}</strong>
                       <h4 class="artist-name"><span>${artist}</span></h4>
                        <h5>Album/Single Song Title: "${album}"</h5>
                        <a title="Copy lyrics" class="copyBtn" onclick="copyLyrics()"><i class="far fa-copy"></i></a>
                        <div class="deezer"><span class="mr-2"><a href="${songDeezer}" target="_blank">Check song on Deezer</a> <i class="fas fa-external-link-alt fa-sm"></i></span> <span>  <a href="${artistDeezer}" target="_blank">${artist} on Deezer</a> <i class="fas fa-external-link-alt fa-sm"></i></span></div>
                       
                        
                        <br><br>
                       <p class="lyrics-style mt-2 mb-0 mp-0">${lyrics}</p>
                    
                   
                    
               </div>
                `;
                    //  <audio controls id="playSample" style="outline: 0;">
                    //         <source src="${play}" type="audio/mp3">
                    //         <source src="${play}" type="audio/ogg">
                    //         <source src="${play}" type="audio/mpeg">
                    //     </audio>
                console.log(albumTracks);
                topTracksBtn.innerHTML= `
                        <a class="mb-4 backBtn" onclick="backToMenu()" style="background-color:#ff6050;">Top 15 songs</a>
                        `;
                
                    //loading card
                    
                    artistDOM.innerHTML = `
                    <div id="accordion" class="loading-accordion" >
                        <div class="card loading-card" style="width:100% !important; max-width:290px;  box-shadow: 0 3px 15px 0 rgba(0,0,0,0.1); cursor: not-allowed;">   
                            <div class="card-header py-2">
                                <h5 style="font-weight:600;" class="albumHeader" >Album Information</h5>
                            </div>
                            
                        <div class="loading-card-inner" style=" background-color:rgba(28, 74, 20,0.1);  width:100% !important; height:300px; ">
                            <div id="loading">
                                <div class="loading-div">
                                    <div class="loading-div">
                                        <div class="loading-div">
                                            <div class="loading-div">
                                            
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card-footer p-0">
                           <a class="btn btn-block text-dark; py-2 showMore-LessBtn" style="rgb(107, 91, 148) !important; cursor: not-allowed !important; opacity:0.6; border-top-left-radius:0px !important; border-top-right-radius:0px !important;"><i class="fas fa-arrow-down fa-lg mr-2"></i><span class="btnText">Show More..</span></a>
                        </div>
                   
                        </div>

                    </div>
                    `;
                // geting artist info
                    //last.fm API
            $.ajax({
                type: "GET",
                url: `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=c97bb1d27fa8605e3980c6ad761e0648&artist=${artist}&album=${album}&format=json`,
                dataType: "jsonp",
                contentType: 'application/json',
                success: function(data) {   
                    var albumInfo = data.album;
                    
                    if(albumInfo === undefined){
                        artistDOM.innerHTML = "";
        
                    }else{
                        if(albumInfo.listeners){
                        var  listenersNumFormatted = parseFloat(albumInfo.listeners).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
                        }
                        if(albumInfo.playcount){
                            var playCountFormatted = parseFloat(albumInfo.playcount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
                        }
                    }
                    
                    
                    if(!data.error){ // avoids dealing with data if there is any error
                        artistDOM.innerHTML = `
                    <div id="accordion">
                        <div class="card" style="box-shadow: 0 3px 15px 0 rgba(0,0,0,0.1);">   
                            <div class="card-header py-2" >
                                <h5 style="font-weight:600;" class="albumHeader" >Album Information</h5>
                            </div>
                            
                            <img src="${albumInfo.image[4]["#text"] ? albumInfo.image[4]["#text"] : 'defaultImg-min.png'}" class="card-img-top img-responsive img-fluid" id="cardImg" alt="${artist} picture">
                            <a data-toggle="collapse" onclick="isShowBtnClicked()"  data-parent="#accordion" href="#showCard"  class="btn btn-block text-white; py-2 showMore-LessBtn" style="background-color:#6B5B95 !important; color:#fff !important; border-top-left-radius:0px !important; border-top-right-radius:0px !important; outline= none !important;"><i class="fas fa-arrow-down fa-lg mr-2 rotate-icon"></i><span class="btnText">Show More..</span></a>
                            <div class="card-body text-left collapse" id="showCard" style="background-color:rgba(28, 74, 92,0.1);">
                                <article >
                                <p class="text-left text-dark m-0" style="font-size:17px;">${albumInfo.wiki ? "<span style='font-size:15px; font-weight:bold;'>Released in </span> " +albumInfo.wiki.published : "" }</p>
                                <p class="text-left text-dark m-0" style="font-size:17px;" style="white-space:pre-line;">${albumInfo.listeners ? "<span style='font-size:15px; font-weight:bold;'>Listeners on Last.fm:</span> " + listenersNumFormatted : "" }</p>
                                <p class="text-left text-dark m-0" style="font-size:17px;" style="white-space:pre-line;">${albumInfo.playcount ? "<span style='font-size:15px; font-weight:bold;'> play Count: </span>" + playCountFormatted: "" }</p>
                                
                                <div class="mt-2">
                                ${albumInfo.tags.tag.map(item=>
                                    
                                    `
                                    <li>
                                        <a href="${item.url}" target="_blank">${item.name ? "#"+item.name : ""}</a>
                                    <li>
                                    `
                                    
                                    ).join("")
                                }
                                </div>

                            <h6  class="bio mt-4">Content</h6>
                                ${albumInfo.wiki ? albumInfo.wiki.content : ""}

                                <div class="socials">
                                    <a class="links" href="${albumInfo.url}" target="_blank"><i class="fab fa-lastfm" style="color:#d51007;" title="Last.fm"></i></a>
                                </div>
                                <article>
                            </div>
                        </div>

                    </div>
                    `
                    if(albumInfo.wiki !== undefined){
                        document.querySelector(".bio").style.display="block"
                    }else{
                        document.querySelector(".bio").style.display="none";
                    }   


                    }
                },
                error: function(){
                    artistDOM.innerHTML = "";
                }
                
            });
            
                 
                    // if(play === undefined || play === null || play === ""){
                    //     document.getElementById("playSample").style.display="none";
                    // }else{
                    //     document.getElementById("playSample").style.display="block";
                    // }
                
            }
             more.innerHTML = ""; //"more" buttons are hidden by default
    }
            //self explanatory
   function copyLyrics(){
                var $body = document.getElementsByTagName("body")[0]; 
                var $tempInput = document.createElement("INPUT");
                $body.appendChild($tempInput);
                $tempInput.setAttribute("value", textToCopy);
                $tempInput.select();
                $tempInput.setSelectionRange(0,99999);
                document.execCommand("copy");
                $body.removeChild($tempInput);
                alert("Copied to clipboard.");
    }
             
    
    

    function getSongImages(artistName,songName){ //WORKING ON IT
        $.ajax({
            type: "GET",
            url: `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=c97bb1d27fa8605e3980c6ad761e0648&artist=${artistName}&track=${songName}&format=json`,
            dataType: "jsonp",
            jsonpCallback: 'jsonp_callback',
            contentType: 'application/json',
            success: function(data) {
                console.log(data);
            }
        });
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
    artistDOM.innerHTML= "";
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
        
        getLyrics(artist, songTitle, album, play, songDeezer, artistDeezer);
    }
 });


 topTracks.addEventListener("click", k =>{
       
       const clickedBtn2 =  k.target;
       
       if(clickedBtn2.tagName === "BUTTON"){
           const artist = clickedBtn2.getAttribute("data-menu-artist");
           const songTitle = clickedBtn2.getAttribute("data-menu-song");
           const album = clickedBtn2.getAttribute("data-menu-album");
   
            getLyrics(artist, songTitle, album);
            artistDOM.innerHTML= "";
            topTracks.innerHTML= "";
    } 
 });

 searchInput.addEventListener("input", function(){ //listens to any input change and update the result list
    const searchTerm = searchInput.value.trim();      //trim used here to delete unwanted spaces
    artistDOM.innerHTML= "";
    searchSongs(searchTerm);
    if(searchTerm === ""){
        result.innerHTML= `
            <div>
                <p style="text-align:center; font-size:17px; margin-top:20px; color:rgb(90, 53, 177);">Results will be displayed here</p>
            </div>
        
        `
    }
 });
    //rotate icon when button is clicked
 function isShowBtnClicked(){
     var icon = document.querySelector(".rotate-icon");
     var btnText = document.querySelector(".btnText");

    if(btnText.innerHTML== "Show More.."){
        icon.style.transform="rotateZ(180deg)";
        btnText.innerHTML= "Show Less";
        
    }else{
        icon.style.transform="rotateZ(0deg)";
        btnText.innerHTML= "Show More..";
    }
 }
function backToMenu(){
    

    //Get top tracks using musixmatch API
    $.ajax({
        type: "GET",
        data: {
            apikey: apiKeys,
                format: "jsonp",
               
                page_size: 15, //returns the first 12 results
                country: "US",
                s_artist_rating: "DESC", //sorts by popularity of artist

        },

        url: "https://api.musixmatch.com/ws/1.1/chart.tracks.get?chart_name=top&page=1&page_size=5&country=us&f_has_lyrics=1",
        dataType: "jsonp",

        contentType: 'application/json',
        success: function(data) {
            console.log(data);
            if(data.message.body !== ""){
                window.clearInterval(mainInterval);

                    result.innerHTML = "";
                    artistDOM.innerHTML ="";
                    topTracksBtn.innerHTML = "";
                    more.innerHTML="";
                //last.fm
    
            //render to the DOM
                
                // data.message.body.track_list.map(item =>{

                //     var arti = item.track.artist_name;
                //     var trackname =item.track.track_name;
                //     console.log(arti, trackname);

                //     $.ajax({
                //         type: "GET",
                //         url: `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=c97bb1d27fa8605e3980c6ad761e0648&artist=justin_bieber&album=believe&format=json`,
                //         dataType: "jsonp",
                //         jsonpCallback: 'jsonp_callback',
                //         contentType: 'application/json',
                //         success: function(data2) {  
                //             console.log(data2);
                //         }
                //     });
                // });
                    topTracks.innerHTML=`
                <h3 class="text-dark text-center my-2">This week's top 15 lyrics</h3>

                    <div>
                        <div class="top-tracks-inner mt-3">
                            <div class="row topTContainer">
                    ${data.message.body.track_list.map( el =>
                        
                        `<li class="col-lg-3  m-2">
                            
                            <div class="card myCard">
                            
                            <img src="defaultImg-min.png" class="card-img-top img-responsive img-fluid menu-img-card" style="width:100%;"></img>
                                <div class="card-body py-1" style="box-shadow:0 2px 8px rgba(0,0,0,.15);">
                                    <span>${el.track.track_name}</span>
                                    <h6 class="text-muted">${el.track.artist_name}</h6>
                                    <p class="rating-bottom"><span class="mr-2" style="font-size:13px;"> ${el.track.num_favourite ? `<i style="color:yellow;"class="fas fa-star fa-lg"></i> `+ el.track.num_favourite : ""}</span>  <span class="text-muted" style="font-size:13px;">${el.track.track_rating ? "Rating: "+ el.track.track_rating+"%" : ""}</span></p>
                                </div>
                                <div class="card-footer d-flex m-0 p-1">
                                    <button class="btn btn-block" data-menu-artist="${el.track.artist_name}" data-menu-song="${el.track.track_name}" data-menu-album="${el.track.album_name}" data-menu-genre="${el.track.primary_genres.music_genre_list}" style="z-index:10000;">Get Lyrics</button>
                                </div>
                                
            
                        </li>`
                    
                    ).join("") }
                        
            
                        
            
                        </div>
                        </div>
            
                            
                        </div>
            
                        </div>
                        ` 
            }else{
               
               tryAgain();
            }
                    
        

        }
    });
}


backToMenu();  //Calling this function once the page loads

   
async function newApi(){
    $.ajax({
        type: "GET",
        data: {
            Authorization: "b009bbe253374a6891e99c92b4fc3322" ,
               
        },

        url: "https://api.spotify.com/v1/tracks/11dFghVXANMlKmJXsNCbNl",
        dataType: "jsonp",
        success: function(data) {
            console.log(data);
        }
    });
    

}
function tryAgain (){
    if(tryCount<=0){
        window.clearInterval(mainInterval);
    }
}

var mainInterval = setInterval(()=>{
    tryCount--;
        apiKeys = "16099f064260947071709a4bc6421891"; //add 1 at the end  
        backToMenu();
        tryAgain();
}, 1000);

