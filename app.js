const express = require('express'), app = express(), index = require('./routes/index'),
    googleAuth = require('google-auth-library'), credentials = require('./client_secret.json'),
    oauth2Client = new (new googleAuth).OAuth2(credentials.installed.client_id,
        credentials.installed.client_secret, credentials.installed.redirect_uris[0]), readline = require('readline');

try {
    oauth2Client.credentials = require('./credentials.json');
    index.auth = oauth2Client;
} catch (e) {
    const authURL = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/drive'
    });
    console.log('Authorize this app by visiting the following URL: ' + authURL);
    const readlineInterface = readline.createInterface(process.stdin, process.stdout);
    readlineInterface.question('Enter the code from that page here: ', function(code) {
        oauth2Client.getToken(code, function(error, token) {
            if (error) {
                console.error(error);
            } else {
                oauth2Client.credentials = token;
                require('fs').writeFileSync('../credentials.json', JSON.stringify(token));
                index.auth = oauth2Client;
            }
        });
        readlineInterface.close();
    });
}

/* Listen on the home path for any request made to the server */
app.use('/', index);

module.exports = app;
