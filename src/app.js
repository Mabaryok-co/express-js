const express = require('express');
const helmet = require('helmet').default;
const compression = require('compression');
const cors = require('cors');
const routes = require('./routes/router');
const ws = require("@websocket/ws");

const app = express();

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
// Sanitize xss
// Sanitize sqlinjection

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

//api routes
app.use("/api",routes);
app.use("/ws", ws);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new Error('Not Found'));
});


module.exports = app;