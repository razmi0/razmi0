// require("dotenv").config();
// const Mustache = require("mustache");
// const fetch = require("node-fetch");
// const fs = require("fs");
import { config } from "dotenv";
config();
import fetch from "node-fetch";
import Mustache from "mustache";
import fs from "fs";

const MUSTACHE_MAIN_DIR = "./main.mustache";
let DATA = {
  name: "Thomas",
  location: "Toulouse",
  date: new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
    timeZone: "Europe/London",
  }),
};

async function setWeatherInformation() {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${DATA.location}&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=metric`
    );
    const json = await response.json();
    DATA.temperature = json.main.temp;
    DATA.weather = json.weather[0].description;
  } catch (error) {
    console.log(error);
  }
}

function generateReadMe() {
  fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
    if (err) throw err;
    const output = Mustache.render(data.toString(), DATA);
    fs.writeFileSync("README.md", output);
  });
}

async function action() {
  await setWeatherInformation();
  generateReadMe();
}

action();
