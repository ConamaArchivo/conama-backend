const path = require('path');
const fs = require('fs');
const gm = require('gm');

function getFormFiles(req, res, next) {
  if (!req.files || Object.keys(req.files).length === 0) {
    console.log('✔', 'There were no files to move');
    return next();
  } else {
    res.locals.fileNames = [];
    const files = Object.values(req.files);
    res.locals.fileIndexes = Object.keys(req.files).map((key) =>
      parseInt(key.split('-')[1], 10)
    );
    for (let i = 0; i < files.length; i++) {
      const fileName = `${Date.now()}-${res.locals.fileIndexes[i]}`;
      files[i].mv(`${process.cwd()}/tmp/${fileName}.pdf`, (err) => {
        if (err) {
          console.log('✗', 'Error moving file', `${fileName}.pdf`, err);
        }
      });
      res.locals.fileNames[res.locals.fileIndexes[i]] = fileName;
      console.log('✔', 'File', `${fileName}.pdf`, 'moved successfully ');
    }
    console.log('\x1b[32m', '✔', 'Completed moving all files', '\x1b[37m');
    return next();
  }
}

function createThumbnails(req, res, next) {
  if (!res.locals.fileNames) return next();
  for (let i = 0; i < res.locals.fileIndexes.length; i++) {
      const pdfPath = `${process.cwd()}/tmp/${res.locals.fileNames[res.locals.fileIndexes[i]]}.pdf`;
      const thumbnailName = res.locals.fileNames[res.locals.fileIndexes[i]] + '.jpg';
      const checkFile = setInterval(() => {
        const exists = fs.existsSync(pdfPath, 'utf8');
        if (exists) {
          gm(pdfPath + '[0]')
            .setFormat('jpg')
            .resize(400)
            .quality(80)
            .write('tmp/' + thumbnailName, (err) => {
              if (err) {
                console.log(
                  '✗',
                  'Error creating thumbnail',
                  thumbnailName,
                  err
                );
              } else {
                console.log(
                  '✔',
                  'Thumbnail',
                  thumbnailName,
                  'created successfully '
                );
              }
            });
          clearInterval(checkFile);
        }
      }, 50);
    
  }
  return next();
}

function removeTmpFiles(req, res, next) {
  if (!res.locals.fileNames) return next();
  fs.readdir(`${process.cwd()}/tmp/`, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      fs.unlink(path.join(`${process.cwd()}/tmp/`, file), (err) => {
        if (err) throw err;
      });
    }
  });
  next();
}

module.exports = {
  getFormFiles,
  createThumbnails,
  removeTmpFiles,
};
