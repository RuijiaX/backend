const express = require('express'), fs = require('fs'), formidable = require('formidable'),
    google = require('googleapis'), path = require('path'), router = express.Router(), Jimp=require('jimp');

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

function rgb2cmyk (r,g,b) {
     var computedC = 0;
     var computedM = 0;
     var computedY = 0;
     var computedK = 0;

     //remove spaces from input RGB values, convert to int
     var r = parseInt( (''+r).replace(/\s/g,''),10 ); 
     var g = parseInt( (''+g).replace(/\s/g,''),10 ); 
     var b = parseInt( (''+b).replace(/\s/g,''),10 ); 


     // BLACK
     if (r==0 && g==0 && b==0) {
      computedK = 1;
      return [0,0,0,1];
     }

     computedC = 1 - (r/255);
     computedM = 1 - (g/255);
     computedY = 1 - (b/255);

     var minCMY = Math.min(computedC,
                  Math.min(computedM,computedY));
     computedC = (computedC - minCMY) / (1 - minCMY) ;
     computedM = (computedM - minCMY) / (1 - minCMY) ;
     computedY = (computedY - minCMY) / (1 - minCMY) ;
     computedK = minCMY;

     return [computedC,computedM,computedY,computedK];
}

router.post('*/price', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const incomingForm = new formidable.IncomingForm();
    incomingForm.keepExtensions = true;
    incomingForm.uploadDir = './public/';
    incomingForm.parse(req, function(error, fields, files) {
        var percentInk = 0;
        Jimp.read(files.file.path, function (err, image) {
            if (err) throw err;
            var count = 0;
            var area = image.bitmap.width * image.bitmap.width;
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                // x, y is the position of this pixel on the image 
                // idx is the position start position of this rgba tuple in the bitmap Buffer 
                // this is the image 
             
                var red   = this.bitmap.data[ idx + 0 ];
                var green = this.bitmap.data[ idx + 1 ];
                var blue  = this.bitmap.data[ idx + 2 ];
                var alpha = this.bitmap.data[ idx + 3 ];
                
                var cmyk = rgb2cmyk (red,green,blue);
                count += cmyk[0],cmyk[1],cmyk[2],cmyk[3]

                // rgba values run from 0 - 255 
                // e.g. this.bitmap.data[idx] = 0; // removes red from this pixel 
            });
            percentInk=count/area;
        });
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
