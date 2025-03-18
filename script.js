const apiKey = "66318db72d6d46e8cc8f08cb4e59300a"; // Your API Key
const city = "Amsterdam"; // Change to your preferred city
const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

async function fetchWeather() {
    try {
        let response = await fetch(url);
        let data = await response.json();

        if (data.cod !== "200") {
            console.error("Error fetching weather:", data.message);
            return;
        }

        // Get today's temperature (First entry)
        let todayTemp = Math.round(data.list[0].main.temp);

        // Get tomorrow's temperature (24 hours later = 8th entry)
        let tomorrowTemp = Math.round(data.list[8].main.temp);

        // Update HTML elements
        document.getElementById("todayTemp").textContent = `${todayTemp}°`;
        document.getElementById("tomorrowTemp").textContent = `${tomorrowTemp}°`;

    } catch (error) {
        console.error("Weather API error:", error);
    }
}

// Run function when page loads
fetchWeather();
