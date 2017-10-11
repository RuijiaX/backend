const express = require('express'), fs = require('fs'), formidable = require('formidable'),
    google = require('googleapis'), path = require('path'), router = express.Router();

const folderToUploadTo = '0Bwli6qQBG4T8RVNOU2E3N1NZVXM';

router.get('*', function(req, res) {
    fs.readFile(path.join('public/', req.url), function(error, data) {
        if (error) {
            res.send('An error occurred while reading the requested resource: ' + req.hostname + req.url);
        } else {
            res.send(data);
        }
    });
});

router.post('*', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const incomingForm = new formidable.IncomingForm();
    incomingForm.keepExtensions = true;
    incomingForm.uploadDir = './public/';
    incomingForm.parse(req, function(error, fields, files) {
        let response = '';
        if (error) {
            res.send('An error occurred while evaluating the incoming form: ' + error);
        } else {
            if (router.auth === null) {
                res.send('The server was unable to authenticate with Sheets');
                return;
            }
            google.drive('v3').files.create({
                auth: router.auth,
                resource: {
                    name: files.file.path.split('/').pop(),
                    parents: [folderToUploadTo]
                },
                media: {
                    mimeType: 'image/' + files.file.path.split('.').pop(),
                    body: fs.createReadStream(files.file.path)
                },
                fields: 'id'
            }, (error, file) => {
                if (error) {
                    res.send('Failed to upload your order. Please try again');
                    return;
                }
                google.sheets('v4').spreadsheets.values.append({
                    auth: router.auth,
                    valueInputOption: 'USER_ENTERED',
                    spreadsheetId: '174Dfg4pCnRZjQoJi5kw-pFkAaaBxNwR4g0apOTW34uk',
                    range: 'A1:Z1',
                    resource: {
                        values: [
                            [
                                fields.name,
                                fields.email,
                                fields.phone,
                                files.file.path.split('/').pop(),
                                fields.date,
                                fields.size,
                                fields.quantity,
                                fields.paper,
                                fields.grommets === 'on' ? 'Yes' : 'No'
                            ]
                        ]
                    }
                }, function(error) {
                    if (error) {
                        res.send('The Drive API returned an error: ' + error);
                    } else {
                        res.send('Order sent to Sheets successfully');
                    }
                });
            });
        }
    });
});

module.exports = router;
