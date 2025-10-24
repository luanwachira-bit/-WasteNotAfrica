// IoT Simulator for WasteNot Africa
// Generates realistic sensor data and sends it to the backend

const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8000/ws');

// Base values for Kenya's climate
const BASE_TEMP = 25; // °C
const BASE_HUMIDITY = 65; // %

// Random fluctuation within realistic ranges
function getRandomFluctuation(min, max) {
    return Math.random() * (max - min) + min;
}

// Generate sensor data with realistic variations
function generateSensorData() {
    // Temperature varies by ±5°C
    const temperature = BASE_TEMP + getRandomFluctuation(-5, 5);
    
    // Humidity varies by ±15%
    const humidity = BASE_HUMIDITY + getRandomFluctuation(-15, 15);

    return {
        temperature: Math.round(temperature * 10) / 10, // One decimal place
        humidity: Math.round(humidity),
        timestamp: new Date().toISOString()
    };
}

// Send data every 5 seconds
ws.on('open', () => {
    console.log('Connected to backend');
    
    // Immediate first reading
    const data = generateSensorData();
    console.log('📡 Sending:', data);
    ws.send(JSON.stringify(data));

    // Then every 5 seconds
    setInterval(() => {
        const data = generateSensorData();
        console.log('📡 Sending:', data);
        ws.send(JSON.stringify(data));
    }, 5000);
});

ws.on('message', (data) => {
    console.log('Received:', JSON.parse(data));
});

ws.on('error', console.error);

console.log('🚀 IoT Simulator starting...');
