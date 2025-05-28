const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const errorContainer = document.querySelector(".error-container");
let currentTab = userTab; 
const API_KEY = "8b3a0c9572acb57c16797ba7003b99e3";
currentTab.classList.add("current-tab");
getfromSessionStorage();



function switchTab(clickedTab){
    if(clickedTab != currentTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");
        
    }
    if(!searchForm.classList.contains("active")){
        userInfoContainer.classList.remove("active");
        grantAccessContainer.classList.remove("active");
        searchForm.classList.add("active");
    }
    else{
        // main pehle search wale tab par tha , ab your weather tab visible karna h
        searchForm.classList.remove("active");
        userInfoContainer.classList.remove("active");
        // ab main your weather tab mein aa gaya hu mtlb weather bhi show karna padega , so lets check local storage for coordinates
        getfromSessionStorage();
        
    }
    
}

userTab.addEventListener("click" , ()=>{
    // pass clicked tab as input parameter
    switchTab(userTab);

});
searchTab.addEventListener("click" , ()=>{
    // pass clicked tab as input parameter
    switchTab(searchTab);

});

// checks is coordinates are already present in session storage
function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        // agr local coordinates nahi mile mtlb location ka access nahi diya user ne , to grant acess wali window ho show hogi user ko
        grantAccessContainer.classList.add("active");
    }
    else{
        // converts json sting to json object
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates){
    const {lat , lon} = coordinates;
    // make grant container invisible and loader container visible then call api
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");
    
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data =  await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (error) {
            loadingScreen.classList.remove("active");
            errorContainer.classList.add("active");
    }
}

function renderWeatherInfo(weatherInfo){
    // firstly we have to fetch the element
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windSpeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const clouds = document.querySelector("[data-cloudiness]");

    // fetch values from weatherInfo object and put it in UI elements
    cityName.innerText = weatherInfo?.name ;
    // since countryIcon is an image , we can access src propery , which has url
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} ℃`;
    windSpeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    clouds.innerText = `${weatherInfo?.clouds?.all} %` ;
}

const grantAccessBtn = document.querySelector("[data-grantAccess]");
grantAccessBtn.addEventListener("click",getLocation);

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        // hw show an alert for no geolocation support
        alert("Cannot determine location");
    }
}

function showPosition(position){
    const userCoordinates = {
        lat :position.coords.latitude,
        lon :position.coords.longitude,
    }
    // JSON.stringify coverts JSON object to strings
    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}
    let searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit",(e) =>{
    e.preventDefault();
    if(searchInput.value === "") return;
    else{
        fetchSearchWeatherInfo(searchInput.value);
    }
})

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    errorContainer.classList.remove("active");
    try{

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        if(data.cod == "404" || !data.name){
            throw new Error("City not found");
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(e){
        loadingScreen.classList.remove("active");
        searchForm.classList.remove("active");
        errorContainer.classList.add("active");
    }
}