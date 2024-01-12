// //reel mode
// //video mode
const fs = require("fs");
const https = require('https');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { log } = require("console");

const videoFolderPath = './videos';
const imagesFolderPath = './images';

module.exports = {
    async run(bot, igManager) {
        bot.on(['video', 'forward'], async(msg) => {
            const videoId = msg.video.file_id;;
            const description = msg.caption || '';;

            bot.getFile(videoId).then((video) => {
                const videoPath = `https://api.telegram.org/file/bot${bot.token}/${video.file_path}`;
                const fileName = `video_${Date.now()}.mp4`;
                const coverPhotoName = `cover_${Date.now()}.jpg`;
                const videoFilePath = path.join(videoFolderPath, fileName);
                const coverPhotoPath = path.join(imagesFolderPath, coverPhotoName);

                const videoFile = fs.createWriteStream(videoFilePath);

                https.get(videoPath, (response) => {
                    response.pipe(videoFile);
                    videoFile.on('finish', async() => {
                        videoFile.close(() => {
                            bot.sendMessage(msg.chat.id, `Video saved as ${fileName}. Uploading to Instagram now!`);

                            ffmpeg(videoFilePath)
                                .screenshots({
                                    count: 1,
                                    folder: imagesFolderPath,
                                    filename: coverPhotoName,
                                })
                                .on('end', async() => {
                                    try {
                                        const coverPhotoFile = fs.readFileSync(coverPhotoPath);
                                        const videoFile = fs.readFileSync(videoFilePath);
                                        await igManager.uploadToInstagram(bot, msg, videoFile, description, coverPhotoFile);

                                        fs.unlink(coverPhotoPath, (err) => {
                                            if (err) {
                                                console.error('An error occurred:', err);
                                            } else {
                                                console.log('File deleted successfully');
                                            }
                                        });
                                        fs.unlink(videoFilePath, (err) => {
                                            if (err) {
                                                console.error('An error occurred:', err);
                                            } else {
                                                console.log('File deleted successfully');
                                            }
                                        });

                                    } catch (error) {
                                        console.error('Error uploading to Instagram:', error);
                                        bot.sendMessage(msg.chat.id, 'Sorry, something went wrong while uploading to Instagram.');
                                    }
                                });
                        });
                    });
                }).on('error', (err) => {
                    console.error('Error downloading video:', err);
                    bot.sendMessage(msg.chat.id, 'Sorry, something went wrong while saving the video.');
                });
            }).catch((err) => {
                console.error('Video download error:', err);
                bot.sendMessage(msg.chat.id, 'Sorry, something went wrong while downloading the video.');
            });
        });
    },
};