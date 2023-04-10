const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser')
const adminRoutes = require('./routes/admin')
const userRoutes = require('./routes/user')
const authRoutes = require('./routes/auth');
const visitorRoutes = require('./routes/visitor');
const db = require("./models")
const { expressjwt: jwt } = require('express-jwt');
var guard = require('express-jwt-permissions')()

//initial configs
require('dotenv').config();
const app = express()
db.sequelize.sync()
    .then(() => {
        console.log("Synced db.");
    })
    .catch((err) => {
        console.log("Failed to sync db: " + err.message);
    });

app.use(cors({
    origin: process.env.FRONTENDORIGIN
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ extended: false }));


//route middlewares
app.use(authRoutes)
app.use('/visitor', visitorRoutes)
app.use('/', jwt({ secret: process.env.JWT_SECRET, algorithms: ["HS256"] }),
    function (req, res, next) {
        req.user = req.auth.user
        next()
    })
app.use('/admin', guard.check('admin'), adminRoutes)
app.use('/user', userRoutes)

app.listen(3000);


