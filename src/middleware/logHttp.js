const logger = require('@logger').child({label: "LOGHTTP"});
const util = require('util');

const logHttp = function (req, res, next) {
    logger.info(util.inspect(req.body, { depth: null }));
    logger.info(res);
    next()
}
  
module.exports = { logHttp };
