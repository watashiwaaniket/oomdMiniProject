function getWeather(lat, lon) {
    axios.get(`/api/weather?lat=${lat}&lon=${lon}`)
        .then(response => {
            const weather = response.data;
            updateWeatherWidget(weather);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            document.getElementById('weather-data').innerHTML = '<p>Unable to retrieve weather data.</p>';
        });
}

function updateWeatherWidget(weather) {
    const weatherWidget = document.getElementById('weather-data');
    weatherWidget.innerHTML = `
        <h2>${weather.name} Weather</h2>
        <p><strong>Description:</strong> ${weather.weather[0].description}</p>
        <p><strong>Temperature:</strong> ${weather.main.temp}°C</p>
        <p><strong>Humidity:</strong> ${weather.main.humidity}%</p>
        <p><strong>Wind Speed:</strong> ${weather.wind.speed} m/s</p>
    `;
}

function subscribe(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const lat = document.getElementById('lat').value;
    const lon = document.getElementById('lon').value;

    axios.post('/api/subscribe', { email, lat, lon })
        .then(response => {
            alert('Subscription successful!');
            getWeather(lat, lon);
        })
        .catch(error => {
            console.error('Error subscribing:', error);
            alert('Failed to subscribe. Please try again.');
        });
}

document.getElementById('subscribe-form').addEventListener('submit', subscribe);

// Fetch weather data on page load if lat and lon are available in URL params
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lon = urlParams.get('lon');
    if (lat && lon) {
        document.getElementById('lat').value = lat;
        document.getElementById('lon').value = lon;
        getWeather(lat, lon);
    }
});
