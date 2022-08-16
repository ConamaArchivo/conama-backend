const { google } = require('googleapis');
const fs = require('fs');

// Google Drive connection
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});
drive = google.drive({
  version: 'v3',
  auth: oauth2Client,
});

async function uploadFilesToDrive(req, res, next) {
  if (!res.locals.fileNames) return next();
  const { authors } = res.locals.parsedBody;
  res.locals.fileIds = [];
  for (let i = 0; i < res.locals.fileIndexes.length; i++) {
    const pdfPath = `${process.cwd()}/tmp/${
      res.locals.fileNames[res.locals.fileIndexes[i]]
    }.pdf`;
    const readStream = fs.createReadStream(pdfPath);
    const authorsNames = [];
    authors.forEach((author) => {
      if (author.surname && author.name) {
        authorsNames.push(`${author.surname}, ${author.name}`);
      }
    });
    const authorsNamesString = authorsNames.join(' - ');
    try {
      const response = await drive.files.create({
        requestBody: {
          name: `${res.locals.parsedBody.title}${
            authorsNamesString ? ` - ${authorsNamesString}` : ''
          }${
            res.locals.fileIndexes.length > 1
              ? ` (${res.locals.fileIndexes[i] + 1})`
              : ''
          }`,
          mimeType: 'application/pdf',
          // parents: ['1rmHcnjwmk5-SEHKTRtO4bQUxbMDi0ZuN'], // Archive folder ID
          parents: ['1zjQXdxhEL1G0NjlWZq_X-2FxwJDBDkAx'], // Test folder ID
        },
        media: {
          mimeType: 'application/pdf',
          body: readStream,
        },
      });
      res.locals.fileIds[res.locals.fileIndexes[i]] = response.data.id;
      console.log(
        '✔',
        'File',
        `${res.locals.fileNames[i]}.pdf`,
        'uploaded successfully to Google Drive '
      );
    } catch (err) {
      console.log(
        '✗',
        'Error uploading file',
        `${res.locals.fileNames[i]}.pdf`,
        'to Google Drive',
        err
      );
      next(err);
    }
  }

  console.log(
    '\x1b[32m',
    '✔ Completed uploading all files to Google Drive',
    '\x1b[37m'
  );
  next();
}

async function getDrivePublicUrls(req, res, next) {
  if (!res.locals.fileNames) return next();
  res.locals.fileUrls = [];
  for (let i = 0; i < res.locals.fileIndexes.length; i++) {
    const fileID = res.locals.fileIds[res.locals.fileIndexes[i]];
    try {
      await drive.permissions.create({
        fileId: fileID,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
      const response = await drive.files.get({
        fileId: fileID,
        fields: 'webViewLink, webContentLink',
      });
      response.data.webRawLink = 'https://drive.google.com/uc?id=' + fileID;
      response.data.id = fileID;
      res.locals.fileUrls[res.locals.fileIndexes[i]] = response.data;
      console.log(
        '✔',
        'Got public url from file',
        `${res.locals.fileNames[i]}.pdf`,
        'successfully'
      );
    } catch (err) {
      console.log(
        '✗',
        'Error getting public url from file',
        `${res.locals.fileNames[i]}.pdf`,
        err
      );
      next(err);
    }
  }
  console.log('\x1b[32m', '✔ Completed getting all public urls', '\x1b[37m');
  next();
}

module.exports = {
  uploadFilesToDrive,
  getDrivePublicUrls,
};
