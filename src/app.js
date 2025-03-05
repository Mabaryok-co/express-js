const express = require('express');
const helmet = require('helmet').default;
const compression = require('compression');
const cors = require('cors');
const routes = require('./routes/router');
const ws = require("@websocket/ws");
const {config} = require("@config");
const {logHttp} = require("@middleware/logHttp");
const logger = require('@root/library/logger/logger');

const app = express();

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));


// Log HTTP Request & Response
if (config.log.http) {
  app.use(logHttp);
}
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