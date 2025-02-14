const logger = require("@logger");

const world = (req, res) => {
    logger.info("Hello World!");
    logger.debug("Hello World!");
    logger.error("Hello World!");
    logger.warn("Hello World!");
    res.status(200).send("Hello World!");
};

module.exports = {
    world,
}
