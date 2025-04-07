const apiKey = "f41e34e15a1142f9cf0d83de9c9f532f";
const map = L.map('map').setView([20, 0], 2);
let markers = [];
let savedLocations = JSON.parse(localStorage.getItem("savedLocations")) || [];

// Add Map Tile Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to Fetch Weather Data
async function getWeather(lat, lon, cityName = null) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    try {
        let response = await fetch(url);
        let data = await response.json();
        
        document.getElementById("location-name").innerText = cityName || data.name || "Onbekende locatie";
        document.getElementById("temperature").innerText = Math.round(data.main.temp);
        document.getElementById("humidity").innerText = data.main.humidity;
        document.getElementById("wind-speed").innerText = data.wind.speed;
        document.getElementById("weather-desc").innerText = data.weather[0].description;

        applyWeatherEffects(data.weather[0].icon);

    } catch (error) {
        console.error("Weather API error:", error);
    }
}

// Add Click Event to the Map
map.on('click', function(event) {
    const { lat, lng } = event.latlng;
    getWeather(lat, lng);

    let marker = L.marker([lat, lng]).addTo(map)
        .bindPopup(`Weer Informatie hier...`)
        .openPopup();
    markers.push(marker);
});

// 🌍 Auto Detect Light/Dark Mode on Load
function checkMode() {
    if (localStorage.getItem("lightMode") === "true") {
        document.body.classList.add("light-mode");
    }
}

// 🔍 Search City Function
async function searchCityWeather() {
    const city = document.getElementById("citySearch").value;
    if (!city) return alert("Voer een stad in!");

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    try {
        let response = await fetch(url);
        let data = await response.json();

        if (data.cod !== 200) {
            alert("Stad niet gevonden!");
            return;
        }

        const lat = data.coord.lat;
        const lon = data.coord.lon;

        map.setView([lat, lon], 8);
        getWeather(lat, lon, city);

        let marker = L.marker([lat, lon]).addTo(map)
            .bindPopup(`${city}`)
            .openPopup();
        markers.push(marker);

    } catch (error) {
        console.error("Search Error:", error);
    }
}

// ⭐ Save Location
function saveLocation() {
    const location = document.getElementById("location-name").innerText;
    if (location === "Klik op een plek op de kaart" || location === "Onbekende locatie") return;

    if (!savedLocations.includes(location)) {
        savedLocations.push(location);
        localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
        updateSavedLocations();
    }
}

// 📌 Update Saved Locations List & Make Them Clickable
function updateSavedLocations() {
    let list = document.getElementById("locations-list");
    list.innerHTML = "";
    savedLocations.forEach((location, index) => {
        let item = document.createElement("li");
        item.innerHTML = `
            <span onclick="loadSavedLocation('${location}')">${location}</span> 
            <button class="delete-location" onclick="deleteSavedLocation(${index})">🗑</button>
        `;
        list.appendChild(item);
    });
}

// 🗑 Delete a Specific Saved Location
function deleteSavedLocation(index) {
    savedLocations.splice(index, 1); // Remove from array
    localStorage.setItem("savedLocations", JSON.stringify(savedLocations)); // Update storage
    updateSavedLocations(); // Refresh the list
}

// 📍 Load Saved Location on Map When Clicked
async function loadSavedLocation(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    try {
        let response = await fetch(url);
        let data = await response.json();

        if (data.cod !== 200) {
            alert("Locatie niet gevonden!");
            return;
        }

        const lat = data.coord.lat;
        const lon = data.coord.lon;

        map.setView([lat, lon], 8);
        getWeather(lat, lon, city);

        let marker = L.marker([lat, lon]).addTo(map)
            .bindPopup(`${city}`)
            .openPopup();
        markers.push(marker);

    } catch (error) {
        console.error("Error loading saved location:", error);
    }
}

// 🗑 Reset Map Pins
function resetMapPins() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

// 🗑 Remove All Saved Locations
function clearSavedLocations() {
    savedLocations = [];
    localStorage.removeItem("savedLocations");
    updateSavedLocations();
}

// 🌧️❄️ Apply Weather Effects (Rain/Snow)
function applyWeatherEffects(iconCode) {
    document.body.classList.remove("rainy", "snowy");

    if (iconCode.includes("09") || iconCode.includes("10")) {
        document.body.classList.add("rainy"); // Rain effect
    }
    if (iconCode.includes("13")) {
        document.body.classList.add("snowy"); // Snow effect
    }
}

// Load Saved Locations on Page Load
document.addEventListener("DOMContentLoaded", updateSavedLocations);
