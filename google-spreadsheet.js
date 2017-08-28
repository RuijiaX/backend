const fs = require('fs'), oAuth = require('google-auth-library'),
    readline = require('readline'), SCOPES = ['https://www.googleapis.com/auth/spreadsheets'],
    TOKEN_PATH = __dirname + '\\credentials.json';

let credentials = JSON.parse(fs.readFileSync(__dirname + '\\client_secret.json')), token = null;

const clientSecret = credentials.installed.client_secret, clientID = credentials.installed.client_id,
    redirectURL = credentials.installed.redirect_uris[0],
    auth = new (new oAuth()).OAuth2(clientID, clientSecret, redirectURL);

/* Check for a previously stored token */
try {
    token = fs.readFileSync(TOKEN_PATH);
    auth.credentials = JSON.parse(token);
} catch (e) {
    const authUrl = auth.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize the app by visiting this url: ' + authUrl);
    const tokenReader = readline.createInterface(process.stdin, process.stdout);
    tokenReader.question('Enter the code from that page here: ', (code) => {
        tokenReader.close();
        auth.getToken(code, (error, token) => {
            if (error) {
                console.error('Error while trying to retrieve access token');
                return;
            }
            auth.credentials = token;
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), () => {
                console.log('Wrote ' + JSON.stringify(token) + ' to ' + TOKEN_PATH);
            });
        });
    });
}
module.exports = auth;
