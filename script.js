const userTab = document.querySelector("[user-weather]");
const searchTab = document.querySelector("[search-weather]");
const weatherContainer = document.querySelector(".weather-container");

const grantLoc = document.querySelector("[grant-loc]");
const searchForm = document.querySelector("[search-form]");
const loadScreen = document.querySelector(".loading-container");
const weatherInfo = document.querySelector(".weather-info-container");
const error_404 = document.querySelector(".error-404");

// variable
let currTab = userTab;
const API_KEY = "b24a734d222b7151a541b2ec1ed260c8";
currTab.classList.add("curr-tab");


function switchTab(clickedTab){
    // do nothing if clicked on same tab
    if(clickedTab != currTab){
        currTab.classList.remove("curr-tab");
        currTab = clickedTab;
        currTab.classList.add("curr-tab");
        
        if(!searchForm.classList.contains("active")){
            error_404.classList.remove("active");
            weatherInfo.classList.remove("active");
            grantLoc.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{   // search tab is active
            error_404.classList.remove("active");
            searchForm.classList.remove("active");
            // active user-weather-info
            weatherInfo.classList.remove("active");

            // your weather tab is active
            // check for coordinates in session storage
            getCoordinates();
        }
    }
}

// add Event Listener to switch tab
userTab.addEventListener("click", () => {
    // pass clicked tab as input
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    // pass clicked tab as input
    switchTab(searchTab);
});

// check coordinates if 
function getCoordinates(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){  // location access is not granted
        grantLoc.classList.add("active");
    }
    else{
        const coordinates = JSON.parse(localCoordinates);
        fetchWeather(coordinates);
    }
}

// fetch weather by API
async function fetchWeather(coordinates){
    let {lat, lon} = coordinates;
    grantLoc.classList.remove("active");
    // make loader visible
    loadScreen.classList.add("active");

    // API call
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        loadScreen.classList.remove("active");
        weatherInfo.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err){
        console.log("Error occured", err);
    }
}


// show data fetched by API on screen
function renderWeatherInfo(data){
    // fetch elements
    const cityName = document.querySelector("[city-name]");
    const countryFlag = document.querySelector("[country-flag]");
    const desc = document.querySelector("[weather-desc]");
    const weatherIcon = document.querySelector("[weather-icon]");
    const temp = document.querySelector("[temperature-data]");
    const windSpeed = document.querySelector("[wind-speed]");
    const humidity = document.querySelector("[humidity]");
    const cloudiness = document.querySelector("[cloudiness]");

    // fetch value from wetherInfo and put in UI elements
    cityName.innerText = data?.name;
    countryFlag.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
    desc.innerText = data?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
    temp.innerText = `${data?.main?.temp}°C`;
    windSpeed.innerText = `${data?.wind?.speed}m/s`;
    humidity.innerText = `${data?.main?.humidity}%`;
    cloudiness.innerText = `${data?.clouds?.all}%`;

}

// get location from Grant Access button and show weather
function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        console.log("No geolocation");
    }
}

function showPosition(position){
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };
    
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));    // convert userCoordinates into string and save in session storage as user-coordinates
    fetchWeather(userCoordinates);
}

const grantAccessBtn = document.querySelector("[grant-access-btn]");
grantAccessBtn.addEventListener("click", getLocation);

// search city in search bar
const searchInput = document.querySelector("[search-input]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();     // avoid default function fo form
    let cityName = searchInput.value;

    if(cityName === "") return;
    else{
        fetchWeatherbyCity(cityName);
    }
});

async function fetchWeatherbyCity(city){
    loadScreen.classList.add("active");
    error_404.classList.remove("active");
    weatherInfo.classList.remove("active");
    // hide grant location page
    grantLoc.classList.remove("active");

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        console.log(data?.message);
        if(data?.message == "city not found"){
            loadScreen.classList.remove("active");
            error_404.classList.add("active");
            weatherInfo.classList.remove("active");
        }
        else{
            error_404.classList.remove("active");
            loadScreen.classList.remove("active");
            weatherInfo.classList.add("active");
            renderWeatherInfo(data);
        }
    }
    catch(err){
        console.log("Error occured", err);
    }
}



