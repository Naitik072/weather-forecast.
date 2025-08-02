const cityInput = document.getElementById("city_input");
const searchButton = document.getElementById("search_button");
const apiKey = "6d0b3ad7eeeaeb5cf70d7ee2e60200bc"; // Insert your API key here

const currentWeatherCard = document.querySelector(".weather-left .card");
const forecastContainer = document.querySelector(".day-forecast");

const humidityVal = document.getElementById("humidityVal");
const pressureVal = document.getElementById("pressureVal");
const visibilityVal = document.getElementById("visibilityVal");
const windspeedVal = document.getElementById("windspeedVal");

const sunriseVal = document.querySelector(".sunrise-sunset .item:nth-child(1) h2");
const sunsetVal = document.querySelector(".sunrise-sunset .item:nth-child(2) h2");

const aqiIndex = document.querySelector(".air-index");
const pm25Val = document.querySelector(".air-indices .item:nth-child(2) h2");
const pm10Val = document.querySelector(".air-indices .item:nth-child(3) h2");
const so2Val = document.querySelector(".air-indices .item:nth-child(4) h2");
const coVal = document.querySelector(".air-indices .item:nth-child(5) h2");
const noVal = document.querySelector(".air-indices .item:nth-child(6) h2");

const hourlyForecastContainer = document.getElementById("hourly-forecast"); // Make sure you add this in HTML

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];

searchButton.addEventListener("click", getCityCoordinates);
window.addEventListener("load", getCurrentLocation);

// ---------- Location Handlers ----------
function getCityCoordinates() {
    const cityName = cityInput.value.trim();
    if (!cityName) return alert("Enter a city name.");
    cityInput.value = "";

    const GEO_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;
    fetch(GEO_URL)
        .then(res => res.json())
        .then(data => {
            if (!data[0]) return alert("City not found.");
            const { name, lat, lon, country } = data[0];
            getWeatherDetails(name, lat, lon, country);
        })
        .catch(() => alert("Error fetching coordinates."));
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                reverseGeocode(lat, lon);
            },
            () => alert("Failed to get your location.")
        );
    } else {
        alert("Geolocation not supported.");
    }
}

function reverseGeocode(lat, lon) {
    const REVERSE_GEO_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
    fetch(REVERSE_GEO_URL)
        .then(res => res.json())
        .then(data => {
            const { name, country } = data[0];
            getWeatherDetails(name, lat, lon, country);
        });
}

// ---------- Main Weather Function ----------
function getWeatherDetails(name, lat, lon, country) {
    const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const AQI_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    // Current Weather
    fetch(WEATHER_URL)
        .then(res => res.json())
        .then(data => {
            const tempC = (data.main.temp - 273.15).toFixed(1);
            const description = data.weather[0].description;
            const icon = data.weather[0].icon;
            const date = new Date();

            currentWeatherCard.innerHTML = `
                <div class="current-weather">
                    <div class="details">
                        <p>Now</p>
                        <h2>${tempC}&deg;C</h2>
                        <p>${description}</p>
                    </div>
                    <div class="weather-icon">
                        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="">
                    </div>
                </div>
                <hr>
                <div class="card-footer">
                    <p><i class="fa-solid fa-calendar"></i> ${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}</p>
                    <p><i class="fa-solid fa-location-dot"></i> ${name}, ${country}</p>
                </div>`;

            humidityVal.innerText = `${data.main.humidity}%`;
            pressureVal.innerText = `${data.main.pressure} hPa`;
            visibilityVal.innerText = `${(data.visibility / 1000).toFixed(1)} km`;
            windspeedVal.innerText = `${data.wind.speed} m/s`;

            const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
            const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();

            sunriseVal.innerText = sunrise;
            sunsetVal.innerText = sunset;
        });

    // Forecast (Daily + Hourly)
    fetch(FORECAST_URL)
        .then(res => res.json())
        .then(data => {
            // Daily Forecast (5 days)
            const daily = {};
            data.list.forEach(entry => {
                const date = new Date(entry.dt_txt);
                const day = date.toDateString();
                if (!daily[day] && date.getHours() === 12) {
                    daily[day] = entry;
                }
            });

            forecastContainer.innerHTML = "";
            Object.values(daily).slice(0, 5).forEach(forecast => {
                const date = new Date(forecast.dt_txt);
                const icon = forecast.weather[0].icon;
                const tempC = (forecast.main.temp - 273.15).toFixed(1);
                forecastContainer.innerHTML += `
                    <div class="forecast-item">
                        <div class="icon-wrapper">
                            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="">
                            <span>${tempC}&deg;C</span>
                        </div>
                        <p>${date.getDate()} ${months[date.getMonth()]}</p>
                        <p>${days[date.getDay()]}</p>
                    </div>`;
            });

            // Hourly Forecast (next 6 entries)
            hourlyForecastContainer.innerHTML = "";
            data.list.slice(0, 6).forEach(hour => {
                const time = new Date(hour.dt_txt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const icon = hour.weather[0].icon;
                const tempC = (hour.main.temp - 273.15).toFixed(1);
                hourlyForecastContainer.innerHTML += `
                    <div class="forecast-item">
                        <div class="icon-wrapper">
                            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="">
                            <span>${tempC}&deg;C</span>
                        </div>
                        <p>${time}</p>
                    </div>`;
            });
        });

    // AQI
    fetch(AQI_URL)
        .then(res => res.json())
        .then(data => {
            const aqi = data.list[0].main.aqi;
            const components = data.list[0].components;

            let aqiText = ["Good", "Fair", "Moderate", "Poor", "Very Poor"][aqi - 1];
            aqiIndex.innerText = aqiText;
            aqiIndex.className = `air-index aqi-${aqi}`;

            pm25Val.innerText = `${components.pm2_5}`;
            pm10Val.innerText = `${components.pm10}`;
            so2Val.innerText = `${components.so2}`;
            coVal.innerText = `${components.co}`;
            noVal.innerText = `${components.no}`;
        });
}
