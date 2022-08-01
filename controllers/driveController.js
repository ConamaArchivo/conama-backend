const multer = require('multer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const gm = require('gm');

// Google Drive connection
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});
drive = google.drive({
  version: 'v3',
  auth: oauth2Client,
});

async function uploadPDF(req, res, next) {
  if(!req.file) return next();
  const filePath = path.join(process.cwd(), '/temp/', req.file.filename);
  const readStream = fs.createReadStream(filePath);
  try {
    const response = await drive.files.create({
      requestBody: {
        name: req.file.filename,
        mimeType: 'application/pdf',
        parents: ['1rmHcnjwmk5-SEHKTRtO4bQUxbMDi0ZuN'], // Archive folder ID
      },
      media: {
        mimeType: 'application/pdf',
        body: readStream,
      },
    });
    res.locals.pdfId = response.data.id;
    next();
  } catch (error) {
    next(error);
  }
}

async function getPublicUrl(req, res, next) {
  if(!req.file) return next();
  try {
    await drive.permissions.create({
      fileId: res.locals.pdfId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const result = await drive.files.get({
      fileId: res.locals.pdfId,
      fields: 'webViewLink, webContentLink',
    });
    result.data.webRawLink =
      'https://drive.google.com/uc?id=' + res.locals.pdfId;
    res.locals.pdfUrl = result.data;
    next();
  } catch (error) {
    next(error);
  }
}

function createThumbnail(req, res, next) {
  if(!req.file) return next();
  const inPath = path.join(process.cwd(), '/temp/', req.file.filename);
  thumbnailName = req.file.filename.split('.').slice(0, -1).join('.') + '.jpg';
  gm(inPath + '[0]')
    .setFormat('jpg')
    .resize(10)
    .quality(50)
    .write('temp/' + thumbnailName, (error) => {
      if (!error) {
        console.log('Finished saving JPG');
        (res.locals.pdfThumbnail = fs.readFileSync(
          path.join(process.cwd(), '/temp/', thumbnailName)
        )),
          next();
      } else {
        console.log('There was an error!', error);
      }
    });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'temp');
  },
  filename: (req, file, cb) => {
    console.log(req);
    cb(null, file.fieldname + '-' + Date.now() + '.pdf');
  },
});
upload = multer({ storage: storage });

module.exports = {
  uploadPDF,
  getPublicUrl,
  createThumbnail,
  upload
};
