const API_BASE = "https://api.open-meteo.com/v1/forecast";
const GEO_BASE = "https://geocoding-api.open-meteo.com/v1/search";

const els = {
  form: document.getElementById("searchForm"),
  input: document.getElementById("cityInput"),
  searchButton: document.getElementById("searchButton"),
  status: document.getElementById("status"),
  cityName: document.getElementById("cityName"),
  currentDate: document.getElementById("currentDate"),
  currentIcon: document.getElementById("currentIcon"),
  temperature: document.getElementById("temperature"),
  condition: document.getElementById("condition"),
  feelsLike: document.getElementById("feelsLike"),
  highLow: document.getElementById("highLow"),
  uvIndex: document.getElementById("uvIndex"),
  sunrise: document.getElementById("sunrise"),
  humidity: document.getElementById("humidity"),
  humidityMeter: document.getElementById("humidityMeter"),
  wind: document.getElementById("wind"),
  detailFeels: document.getElementById("detailFeels"),
  rainChance: document.getElementById("rainChance"),
  forecastGrid: document.getElementById("forecastGrid"),
  unitToggle: document.getElementById("unitToggle"),
  refreshButton: document.getElementById("refreshButton")
};

let unit = "C";
let latestWeather = null;
let latestPlace = null;

const weatherCodes = {
  0: ["Clear sky", "☀️"], 1: ["Mainly clear", "🌤️"], 2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"], 45: ["Foggy", "🌫️"], 48: ["Rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"], 53: ["Drizzle", "🌦️"], 55: ["Heavy drizzle", "🌧️"],
  56: ["Freezing drizzle", "🌧️"], 57: ["Freezing drizzle", "🌧️"],
  61: ["Light rain", "🌦️"], 63: ["Rain", "🌧️"], 65: ["Heavy rain", "🌧️"],
  66: ["Freezing rain", "🌧️"], 67: ["Heavy freezing rain", "🌧️"],
  71: ["Light snow", "🌨️"], 73: ["Snow", "🌨️"], 75: ["Heavy snow", "❄️"],
  77: ["Snow grains", "🌨️"], 80: ["Rain showers", "🌦️"], 81: ["Rain showers", "🌧️"],
  82: ["Heavy showers", "⛈️"], 85: ["Snow showers", "🌨️"], 86: ["Heavy snow showers", "❄️"],
  95: ["Thunderstorm", "⛈️"], 96: ["Thunderstorm with hail", "⛈️"], 99: ["Thunderstorm with hail", "⛈️"]
};

function weatherInfo(code) {
  return weatherCodes[code] || ["Weather unavailable", "🌡️"];
}
function round(value) {
  return Math.round(value);
}
function displayTemp(celsius) {
  const value = unit === "C" ? celsius : (celsius * 9 / 5) + 32;
  return `${round(value)}°`;
}
function setStatus(message, isError = false) {
  els.status.textContent = message;
  els.status.classList.toggle("error", isError);
}
function formatTime(iso) {
  if (!iso) return "--:--";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
}
function formatDate(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });
}
function getCityLabel(place) {
  return [place.name, place.admin1, place.country_code].filter((value, index, arr) => value && arr.indexOf(value) === index).slice(0, 3).join(", ");
}
async function findCity(name) {
  const url = `${GEO_BASE}?name=${encodeURIComponent(name)}&count=1&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not search for this city. Please try again.");
  const data = await response.json();
  if (!data.results || data.results.length === 0) throw new Error("City not found. Check the spelling and try again.");
  return data.results[0];
}
async function getWeather(place) {
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "6"
  });
  const response = await fetch(`${API_BASE}?${params}`);
  if (!response.ok) throw new Error("Weather data could not be loaded. Please try again.");
  return response.json();
}
function renderWeather(place, data) {
  latestPlace = place;
  latestWeather = data;
  const current = data.current;
  const daily = data.daily;
  const info = weatherInfo(current.weather_code);
  const todayInfo = weatherInfo(daily.weather_code[0]);

  els.cityName.textContent = getCityLabel(place);
  els.currentDate.textContent = formatDate(current.time.slice(0, 10));
  els.currentIcon.textContent = info[1];
  els.temperature.innerHTML = `${displayTemp(current.temperature_2m)}<span>°${unit}</span>`;
  els.condition.textContent = info[0];
  els.feelsLike.textContent = `Feels like ${displayTemp(current.apparent_temperature)}`;
  els.highLow.textContent = `${displayTemp(daily.temperature_2m_max[0])} / ${displayTemp(daily.temperature_2m_min[0])}`;
  els.uvIndex.textContent = Number(daily.uv_index_max[0]).toFixed(1);
  els.sunrise.textContent = formatTime(daily.sunrise[0]);
  els.humidity.innerHTML = `${round(current.relative_humidity_2m)}<small>%</small>`;
  els.humidityMeter.style.width = `${Math.max(0, Math.min(100, current.relative_humidity_2m))}%`;
  els.wind.innerHTML = `${round(current.wind_speed_10m)}<small> km/h</small>`;
  els.detailFeels.innerHTML = `${displayTemp(current.apparent_temperature)}<small></small>`;
  els.rainChance.innerHTML = `${daily.precipitation_probability_max[0] ?? 0}<small>%</small>`;

  els.forecastGrid.innerHTML = "";
  // Show the next five days, starting today.
  daily.time.slice(0, 5).forEach((date, index) => {
    const forecastInfo = weatherInfo(daily.weather_code[index]);
    const dayName = index === 0 ? "Today" : new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short" });
    const dateLabel = new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const card = document.createElement("article");
    card.className = "forecast-day";
    card.innerHTML = `
      <div class="day-name">${dayName}</div>
      <div class="day-date">${dateLabel}</div>
      <div class="day-icon" aria-hidden="true">${forecastInfo[1]}</div>
      <div class="day-condition">${forecastInfo[0]}</div>
      <div class="forecast-temps"><span>${displayTemp(daily.temperature_2m_max[index])}</span><span class="low">${displayTemp(daily.temperature_2m_min[index])}</span></div>`;
    els.forecastGrid.appendChild(card);
  });
  setStatus(`Updated just now · Local time ${formatTime(current.time)}`);
}
async function loadCity(cityName) {
  const name = cityName.trim();
  if (!name) {
    setStatus("Please enter a city name.", true);
    return;
  }
  els.searchButton.disabled = true;
  els.searchButton.textContent = "Loading…";
  setStatus(`Finding weather for ${name}…`);
  try {
    const place = await findCity(name);
    const data = await getWeather(place);
    renderWeather(place, data);
    els.input.value = "";
  } catch (error) {
    setStatus(error.message || "Something went wrong. Please try again.", true);
  } finally {
    els.searchButton.disabled = false;
    els.searchButton.innerHTML = 'Search <span>→</span>';
  }
}
function redrawUnits() {
  if (latestWeather && latestPlace) renderWeather(latestPlace, latestWeather);
  els.unitToggle.innerHTML = `<span class="${unit === "C" ? "active-unit" : ""}">°C</span> / <span class="${unit === "F" ? "active-unit" : ""}">°F</span>`;
  els.unitToggle.setAttribute("aria-label", `Current unit Celsius. Click to switch to ${unit === "C" ? "Fahrenheit" : "Celsius"}`);
}
els.form.addEventListener("submit", event => {
  event.preventDefault();
  loadCity(els.input.value);
});
els.unitToggle.addEventListener("click", () => {
  unit = unit === "C" ? "F" : "C";
  redrawUnits();
});
els.refreshButton.addEventListener("click", () => {
  if (latestPlace) {
    getWeather(latestPlace).then(data => {
      renderWeather(latestPlace, data);
      setStatus(`Weather refreshed · Local time ${formatTime(data.current.time)}`);
    }).catch(error => setStatus(error.message, true));
  } else {
    loadCity("New Delhi");
  }
});
redrawUnits();
loadCity("New Delhi");
