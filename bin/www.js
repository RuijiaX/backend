const app = require('../app');

app.listen(process.env.PORT || 80, function() {
    console.log('Listening on Port ' + (process.env.PORT || 80));
});