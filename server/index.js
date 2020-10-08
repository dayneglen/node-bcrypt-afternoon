require('dotenv').config();
const express = require('express'),
    session = require('express-session'),
    massive = require('massive'),
    { CONNECTION_STRING, SESSION_SECRET } = process.env,
    authCtrl = require('./controllers/authController'),
    treasureCtrl = require('./controllers/treasureController'),
    auth = require('./middleware/authMiddleware'),
    PORT = 4000,
    app = express()
    
app.use(express.json());
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    cookie: { maxage: 1000 * 60 * 60 * 24}
}));

massive({
    connectionString: CONNECTION_STRING,
    ssl: { rejectUnauthorized: false}
}).then(db => {
    app.set('db', db);
    console.log('db connected')
})

// Auth endpoints
app.post('/auth/register', authCtrl.register);
app.post('/auth/login', authCtrl.login);
app.get('/auth/logout', authCtrl.logout);

// Treasure endpoints
app.get('/api/treasure/dragon', treasureCtrl.dragonTreasure);
app.get('/api/treasure/user', auth.usersOnly, treasureCtrl.getUserTreasure);
app.post('/api/treasure/user', auth.usersOnly, treasureCtrl.addUserTreasure);
app.get('/api/treasure/all', auth.usersOnly, auth.adminsOnly, treasureCtrl.getAllTreasure);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));