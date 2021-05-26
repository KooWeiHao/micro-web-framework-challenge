const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const consoleStamp = require("console-stamp");
const db = require("./models");
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

const app = express();

//read environment file
const env = dotenv.config();
dotenvExpand(env);

// test simple service
app.get("/", (req, res) => {
    res.json({message: "Welcome to Service Rocket's technical assessment, Micro-Web Framework Challenge"});
});

// enable cors
app.use(cors({
    origin: process.env.FRONTEND_DOMAIN
}));

//parse requests of content-type - application/json
app.use(bodyParser.json());

//parse request of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

//parse request of content-type - multipart/form-data, for file uploading
app.use(fileUpload({
    debug: true
}));

//show log with time-stamp
consoleStamp(console, {
    format: ':date(yyyy-mm-dd HH:MM:ss.l) :label'
});

//create tables automatically
db.sequelize.sync().then(()=>{
    console.log("All models have been created successfully");
});

require("./routes/image.route")(app);

const PORT = process.env.PORT || 8081;
const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN || `http://localhost:${PORT}`;
app.listen(PORT, ()=>{
    console.log(`ExpressJS backend server listening at ${BACKEND_DOMAIN}`);
});

module.exports = app;
