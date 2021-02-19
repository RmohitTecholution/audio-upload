const express = require('express');
const app = express();

const hbs = require('express-handlebars');
const path = require('path');

app.use(express.json());

//connect mongodb database
require('./server/database/database')();

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

//setup view engine
app.set('view engine', 'hbs');
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultView: 'default',
    layoutsDir: path.join(__dirname, 'views'),
    partialsDir: path.join(__dirname, 'views/partials'),
}));

//calling routes
app.use('/', require('./server/router/router'));

const PORT = proess.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server Listening on port ${PORT}...`);
});

