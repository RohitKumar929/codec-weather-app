# SkyCast Weather App

A responsive college project made with plain HTML, CSS, and JavaScript. It uses the free Open-Meteo APIs and does not require an API key.

## Features
- Search for a city worldwide
- Current temperature and weather condition
- Feels-like temperature, humidity, wind speed, UV index, sunrise, high/low, and rain chance
- Five-day forecast
- Celsius/Fahrenheit toggle
- Refresh button and responsive mobile layout
- Error messages for unknown cities or network issues

## Run it
1. Extract `SkyCast-Weather-App.zip`.
2. Open the `weather-app` folder in VS Code.
3. Open `index.html` in a browser. For best results, use VS Code's Live Server extension and click **Go Live**.
4. Make sure you have an internet connection because city search and weather data come from Open-Meteo.

## Files
- `index.html` — page structure
- `style.css` — design and responsive layout
- `script.js` — city search, API calls, rendering, and unit conversion

## APIs used
- Geocoding: https://geocoding-api.open-meteo.com/v1/search
- Forecast: https://api.open-meteo.com/v1/forecast
- Weather data by Open-Meteo: https://open-meteo.com/

## Project explanation
When a user searches for a city, JavaScript sends the city name to the Open-Meteo geocoding API. It uses the returned latitude and longitude to request current weather and daily forecast data. The page then updates the weather cards dynamically. The temperature toggle converts Celsius values to Fahrenheit in the browser.

This is a frontend-only project; it does not store personal data and does not need a backend or API key.
