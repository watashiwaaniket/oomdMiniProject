const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const axios = require('axios');
const cron = require('node-cron');
const path = require('path');
require('dotenv').config(); // Load environment variables

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

let subscribers = [];

app.post('/subscribe', (req, res) => {
    const { email, lat, lon } = req.body;
    sendConfirmationEmail(email);
    res.json({ message: 'Subscription successful' });
});

app.get('/weather', async (req, res) => {
    const { lat, lon } = req.query;
    try {
        const weatherData = await getWeather(lat, lon);
        res.json(weatherData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});


// Function to send confirmation email
function sendConfirmationEmail(email) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER, // Use environment variable
            pass: process.env.GMAIL_PASS,   // Use environment variable
        },
    });

    const mailOptions = {
        from: process.env.GMAIL_USER, // Use environment variable
        to: email,
        subject: 'Subscription Confirmation',
        text: `Thank you for subscribing to our Rain Alerts! You will receive daily weather updates.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending confirmation email:', error);
        } else {
            console.log('Confirmation email sent:', info.response);
        }
    });
}

// Subscribe endpoint
app.post('/subscribe', (req, res) => {
    const { email } = req.body;
    if (email) {
        subscribers.push(email);
        sendConfirmationEmail(email); // Send confirmation email
        res.json({ message: 'Subscribed successfully!' });
    } else {
        res.status(400).json({ message: 'Email is required' });
    }
});

// Fetch weather data
function getWeather(lat, lon) {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY; // Use environment variable
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    return axios.get(url).then(res => res.data).catch(err => console.error(err));
}

// Send email function
function sendWeatherEmail(email, weatherData) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER, // Use environment variable
            pass: process.env.GMAIL_PASS,   // Use environment variable
        },
    });

    const mailOptions = {
        from: process.env.GMAIL_USER, // Use environment variable
        to: email,
        subject: 'Today’s Weather Alert',
        text: `Hello! Here's the weather update: ${weatherData.name}: ${weatherData.weather[0].description}, ${weatherData.main.temp}°C.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

// Schedule daily emails (8 AM)
cron.schedule('0 8 * * *', () => {
    const lat = process.env.USER_DEFAULT_LATITUDE; // Use environment variable
    const lon = process.env.USER_DEFAULT_LONGITUDE; // Use environment variable

    getWeather(lat, lon).then(weatherData => {
        subscribers.forEach(email => {
            sendWeatherEmail(email, weatherData);
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
