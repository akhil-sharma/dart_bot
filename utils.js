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

module.exports = {
    getAllFiles
};