// require("dotenv").config();
// const Mustache = require("mustache");
// const fetch = require("node-fetch");
// const fs = require("fs");
import { config } from "dotenv";
config();
import fetch from "node-fetch";
import Mustache from "mustache";
import fs from "fs";

const DATE_OPTIONS = {
  weekday: "long",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  timeZoneName: "short",
  timeZone: "Europe/Paris",
};
const MUSTACHE_MAIN_DIR = "./main.mustache";
let DATA = {
  name: "Thomas",
  location: "Toulouse",
  date: new Date().toLocaleDateString("en-EN", DATE_OPTIONS),
};

async function setWeatherInformation() {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${DATA.location}&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=metric`
    );
    const json = await response.json();
    DATA.temperature = json.main.temp;
    DATA.temp_min = json.main.temp_min;
    DATA.temp_max = json.main.temp_max;
    DATA.humidity = json.main.humidity;
    DATA.wind_speed = json.wind.speed;
    DATA.weather = json.weather[0].main;
    DATA.sunrise = new Date(json.sys.sunrise * 1000).toLocaleTimeString("en-EN", {
      timeZone: DATE_OPTIONS.timeZone,
      minute: DATE_OPTIONS.minute,
      hour: DATE_OPTIONS.hour,
      hour12: DATE_OPTIONS.hour12,
    });
    DATA.weather_icon_url = `http://openweathermap.org/img/w/${json.weather[0].icon}.png`;
    DATA.sunset = new Date(json.sys.sunset * 1000).toLocaleTimeString("en-EN", {
      timeZone: DATE_OPTIONS.timeZone,
      minute: DATE_OPTIONS.minute,
      hour: DATE_OPTIONS.hour,
      hour12: DATE_OPTIONS.hour12,
    });
    const time_before_sunset = ((json.sys.sunset * 1000 - Date.now()) / 1000 / 60 / 60).toFixed(2);
    const time_before_friday = Math.floor(getTimeUntilNextFriday18h());
    DATA.time_before_friday =
      time_before_friday < 0
        ? "It's friday night, it's the weekend ! 💪"
        : `${time_before_friday} hour${time_before_friday > 1 ? "s" : ""} before friday night `;
    DATA.time_before_sunset =
      time_before_sunset < 0
        ? "It's night time ! 😴"
        : `${time_before_sunset} hour${time_before_sunset > 1 ? "s" : ""} before sunset`;
  } catch (error) {
    throw error;
  }
}

function generateReadMe() {
  fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
    if (err) throw err;
    const output = Mustache.render(data.toString(), DATA);
    fs.writeFileSync("README.md", output);
  });
}

function getTimeUntilNextFriday18h() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  const nextFriday = new Date(now.getTime() + daysUntilFriday * 24 * 60 * 60 * 1000);
  nextFriday.setHours(18, 0, 0, 0);

  const timeRemainingInMillis = nextFriday.getTime() - now.getTime();
  const timeRemainingInHours = timeRemainingInMillis / (60 * 60 * 1000);

  return timeRemainingInHours;
}

async function action() {
  await setWeatherInformation();
  generateReadMe();
}

action();
