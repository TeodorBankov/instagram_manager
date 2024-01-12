module.exports = {
    async run(bot) {
        bot.on("/help", (msg) => {
            msg.reply.text(
                "/start - Start the bot.\n/start_cve_feed - Start the bot's feed updates, giving you the latest CVE Vulnerabilities\n/stop_cve_feed - Stop the CVE feed updates.\n/start_exploitdb_feed - Start the bot's feed updates, giving you the latest ExploitDB Vulnerabilities\n/stop_exploitdb_feed - Stop the ExploitDB feed updates\n/help - Display this message."
            );
        });
        bot.on("/start", (msg) => {
            msg.reply.text(
                "Hello! 👋\n I am the CVE and Vulnerabilites main bot. I have many functionalities such as updating you about the latest CVEs and more! See all my commands with the /help command."
            );
        });
    },
};