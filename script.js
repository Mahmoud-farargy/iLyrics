
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

 const apiURL = 'https://api.lyrics.ovh';
 const apiURL2 = 'https://www.theaudiodb.com/api/v1/json/1/search.php?s=';

 //Search by song or artist
 async function searchSongs(term){ //fetch data from api
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

    const data = await response.json();             //convert these data into json format

    showData(data);    //passing data into showData function
 }
 //show lyrics in the DOM
 function showData(data){
    console.log(data);
     result.innerHTML =
     ` <div class="songs">
     ${data.data.map((song, index) =>

        `<li>
            <span><strong class="text-primary">${song.artist.name}</strong> - ${song.title}</span>
            <button class="lyricsBtns" data-artist="${song.artist.name}" data-songtitle="${song.title}" data-album="${song.album.title}" data-playSample="${song.preview}" data-songDeezer="${song.link}" data-artistDeezer="${song.artist.link}">Get lyrics</button>
        </li>`
        
            ).join("")}
        </div>
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
            const resp = await fetch(`${apiURL}/v1/${artist}/${songTitle}`);    //get lyrics 
            const data = await resp.json();

            const artistInfo = await fetch(`${apiURL2}${artist}`);
            const artistReceivedData = await artistInfo.json();
            const artistArray = artistReceivedData.artists;
            
            if(data.error){        //if there is any error
                result.innerHTML =` 
                <div class="alert alert-danger text-center p-1 mt-5" style="width:90%; margin: 0 auto;">
                    <h6>${data.error}</h6> 
                </div>
                 `   //then show this error
            }else{      //else, show the lyrics
                const lyrics = data.lyrics;
                result.innerHTML = `
                <div style="padding:14px;" id="results">
                       <strong class="song-title">${songTitle}</strong>
                       <h4 class="artist-name"><span>${artist}</span></h4>
                        <h5>Album/Single Song Title: "${album}"</h5>
                        <div class="deezer"><span class="mr-2"><a href="${songDeezer}" target="_blank">Check song on Deezer</a> <i class="fas fa-external-link-alt fa-sm"></i></span> <span>  <a href="${artistDeezer}" target="_blank">${artist} on Deezer</a> <i class="fas fa-external-link-alt fa-sm"></i></span></div>
                        <audio controls id="playSample" style="outline: 0;">
                            <source src="${play}" type="audio/mp3">
                            <source src="${play}" type="audio/ogg">
                            <source src="${play}" type="audio/mpeg">
                        </audio>
                        <br><br>
                       <p class="lyrics-style mt-2">${lyrics}</p>
                        <br><hr>
               </div>
                `;

            // get artist
                  
                
                if(artistArray != null && window.innerWidth >= 700){ //permit only if it's not a null value
                    artistArray.map((e)=>{
                        if(e.strArtist == artist) //making sure to pick the right artist

                        artistDOM.innerHTML = `
                    <div id="accordion" class="accordion">
                        <div class="card" style="box-shadow: 0 3px 15px 0 rgba(0,0,0,0.1);">   
                            <div class="card-header py-2" >
                                <h5 style="font-weight:600;">Artist Information</h5>
                            </div>
                            
                            <img src="${e.strArtistThumb}" class="card-img-top img-responsive img-fluid" alt="${artist} picture">
                            <a data-toggle="collapse" onclick="isShowBtnClicked()"  data-parent="#accordion" href="#showCard"  class="btn btn-block text-dark; py-2 showMore-LessBtn"><i class="fas fa-arrow-down fa-lg mr-2 rotate-icon"></i><span class="btnText">Show More..</span></a>
                            <div class="card-body text-left collapse" id="showCard" style="background-color:rgba(28, 74, 92,0.1);">
                                <article >
                                    <img class="hideIfNotExist" src="${e.strArtistLogo != "" ? e.strArtistLogo : ""}" style="width:100px; height:auto; marign-left:0; margin-top:5px;">
                                    <p class="text-left text-dark m-0" style="font-size:17px;">${e.strArtistAlternate ? "Alternate Name: "+ e.strArtistAlternate : ""}</p>
                                    <p class="text-left text-dark m-0" style="font-size:17px;">${e.strGenre ? "Genre: "+ e.strGenre : ""}</p>
                                    <p class="text-left text-dark m-0" style="font-size:17px;">${e.strStyle ? "Style: "+ e.strStyle : ""}</p>
                                    <p class="text-left text-dark m-0" style="font-size:17px;">${e.strCountry ? "Country: "+ e.strCountry : ""}</p>
                                    <p class="text-left text-dark m-0" style="font-size:17px;">${e.intFormedYear ? "Formed Year: "+ e.intFormedYear : ""}</p>
                                
                                <h6  class="bio mt-4">Biography</h6>
                                    ${e.strBiographyEN}

                                    <div class="socials">
                                        <a class="links" href="${e.strTwitter ? "https://"+e.strTwitter : ""}" target="_blank"><i class="fab fa-twitter" title="Twitter"  style="color:#0084b4;" ></i></a>
                                        <a class="links" href="${e.strFacebook ? "https://"+e.strFacebook : ""}" target="_blank"><i class="fab fa-facebook-square" style="color:#3b5998;" title="Facebook"></i></a>
                                        <a class="links" href="${e.strLastFMChart ? "https://"+e.strLastFMChart : ""}" target="_blank"><i class="fab fa-lastfm" style="color:#d51007;" title="Last.fm"></i></a>
                                        <a class="links" href="${e.strWebsite ? "https://"+e.strWebsite : ""}" target="_blank"><i class="fas fa-external-link-square-alt text-dark" title="Website"></i></a>
                                    </div>
                                <article>
                            </div>
                        </div>

                    </div>
                    `
  
                    if(artistArray != null){
                        imgSrc= document.querySelector(".hideIfNotExist").getAttribute("src");
                        if(imgSrc == "null" || imgSrc == ""){
                            document.querySelector(".hideIfNotExist").style.display = "none"; //hide image if it's not exist on the API
                        }else{
                            document.querySelector(".hideIfNotExist").style.display = "block";
                        }
                    }
                        
                        
                        if(e.strBiographyEN == "" || e.strBiographyEN ==  null){  //hide biograpgy title if the biography text is not exist
                            document.querySelector(".bio").style.display="none";
                        }else{
                            document.querySelector(".bio").style.display="block";
                        }

                        $(".links").each(function(el){ //loop through each link and remove the ones that have empty href
                            
                            if($(this).attr("href") == "null" || $(this).attr("href") == "" ){
                                $(this).css("display","none");
                            }else{
                                $(this).css("display","flex");
                            }
                        });
                        
                    });
                       
                }    
                    
                
            }
             more.innerHTML = ""; //empty by default
            
             
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

        getLyrics(artist, songTitle, album, play, songDeezer, artistDeezer)
    }
 });

 searchInput.addEventListener("input", function(){ //listens to any input change and update the result list
    const searchTerm = searchInput.value.trim();       //trim used here to delete unwanted spaces
    artistDOM.innerHTML= ""
    searchSongs(searchTerm);
    
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


async function newApi(){
    $.ajax({
        type: "GET",
        // data: {
        //     api_key: "c97bb1d27fa8605e3980c6ad761e0648",
        //     // q_track: "justin_bieber", //queries by song name
        //     format: "jsonp",
        //     callback: "jsonp_callback",
        //     artist: "justin_bieber",
        //     page_size: 10, //returns the first 100 results
        //     s_artist_rating: "DESC", //sorts by popularity of artist
        //     country: "US"

        // },

        url: "https://ws.audioscrobbler.com/2.0/?method=artist.search&artist=cher&api_key=c97bb1d27fa8605e3980c6ad761e0648&format=json",
        dataType: "jsonp",
        jsonpCallback: 'jsonp_callback',
        contentType: 'application/json',
        success: function(data) {
            console.log(data);
        }
    });
    

}