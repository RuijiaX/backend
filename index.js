const formidable = require('formidable'), fs = require('fs'), auth = require(__dirname + '\\google-spreadsheet'),
    http = require('http'), readline = require('readline'), googleapis = require('googleapis');

const PRICING = {
    "18x24": {
        BW: {
            NORMAL: 3,
            BOND: 6,
            GLOSS: 9,
            VINYL: 15,
            VINYL_ADHESIVE: 18
        },
        COLOR: {
            NORMAL: 6,
            BOND: 9,
            GLOSS: 12,
            VINYL: 18,
            VINYL_ADHESIVE: 21
        }
    },
    "22x28": {
        BW: {
            NORMAL: 4.28,
            BOND: 8.56,
            GLOSS: 12.83,
            VINYL: 21.39,
            VINYL_ADHESIVE: 25.67
        },
        COLOR: {
            NORMAL: 8.56,
            BOND: 12.83,
            GLOSS: 17.11,
            VINYL: 25.67,
            VINYL_ADHESIVE: 29.94
        }
    },
    "24x36": {
        BW: {
            NORMAL: 6,
            BOND: 12,
            GLOSS: 18,
            VINYL: 30,
            VINYL_ADHESIVE: 36
        },
        COLOR: {
            NORMAL: 12,
            BOND: 18,
            GLOSS: 24,
            VINYL: 36,
            VINYL_ADHESIVE: 42
        }
    },
    "36x48": {
        BW: {
            NORMAL: 12,
            BOND: 24,
            GLOSS: 36,
            VINYL: 60,
            VINYL_ADHESIVE: 72
        },
        COLOR: {
            NORMAL: 24,
            BOND: 36,
            GLOSS: 48,
            VINYL: 72,
            VINYL_ADHESIVE: 84
        }
    },
};

http.createServer((req, res) => {
    if (req.url === '/submit-order' && req.method.toUpperCase() === 'POST') {
        const form = formidable.IncomingForm();
        form.uploadDir = __dirname + '/temp/';
        form.keepExtensions = true;
        form.parse(req, (error, fields, files) => {
            googleapis.sheets('v4').spreadsheets.values.update()
        });
    } else {
        fs.readFile('./frontend/' + req.url, (error, data) => {
            res.end(data);
        });
    }
}).listen(process.env.PORT || 80);