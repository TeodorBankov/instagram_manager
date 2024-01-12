require("dotenv").config();
const fs = require("fs");
const telebot = require("telebot");
const { join } = require("path");
const Instagram = require('instagram-private-api');
const InstagramManager = require('./instagramManager');

const bot = new telebot({ token: process.env.TELEGRAM_TOKEN });
const ig = new Instagram.IgApiClient();
ig.state.generateDevice(process.env.IG_USERNAME);

const igManager = new InstagramManager(ig);

fs.readdir("commands", (_, files) => {
    let commandFiles = files.filter((f) => f.endsWith(".js"));
    commandFiles.forEach((commandFile) => {
        let command = require(join(__dirname, "commands", commandFile));
        try {
            command.run(bot, igManager);
        } catch (e) {
            console.error(e);
        }
    });
});

async function firstRun() {

    console.log("Checking whether some required folders exist...");

    const videoPath = './videos';
    const imagePath = './images';

    if (!fs.existsSync(videoPath)) {
        fs.mkdirSync(videoPath);
    }
    if (!fs.existsSync(imagePath)) {
        fs.mkdirSync(imagePath);
    }

    try {
        await ig.simulate.preLoginFlow();
        await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
        console.log(`Logged in as ${ig.state.cookieUserId}`);
    } catch (error) {
        console.error('Error logging in to Instagram:', error);
        bot.sendMessage(bot.chat.id, 'Sorry, something went wrong while logging in to Instagram.');
    }
}

firstRun();
bot.start();