const fs = require('fs');

const getAllFiles = (directoryPath, filesArray=[]) => {

    let files = fs.readdirSync(directoryPath);
    files.forEach(file => {
        let filePath = directoryPath + "/" + file;

        if (fs.statSync(filePath).isDirectory()) {
            filesArray = getAllFiles(filePath, filesArray);
        
        } else if(file.endsWith('.js')){
            filesArray.push(filePath);
        
        }
    });

    return filesArray;
}

const formatSongDuration = (durationObject) => {
    const duration = `${durationObject.hours ? (durationObject.hours + ':') : ''}${
        durationObject.minutes ? durationObject.minutes : '00'
    }:${
        (durationObject.seconds < 10)
        ? ('0' + durationObject.seconds)
        : (durationObject.seconds
        ? durationObject.seconds
        : '00')
    }`;

    return duration;
}

const clearInvalidCommand = (msg, sentMsg, msgTimeout=6000, sentTimeout=10000) => {
    msg.delete({timeout: msgTimeout});
    sentMsg.delete({timeout: sentTimeout});
}

const convertSecondsToTimeString = (seconds) => {
    return new Date(seconds * 1e3).toISOString().slice(-13, -5);
}

module.exports = {
    getAllFiles,
    convertSecondsToTimeString,
    formatSongDuration,
    clearInvalidCommand
}