const logger = require("@logger");

const world = (req, res) => {
    logger.info("Hello World!");
    logger.debug("Hello World!");
    logger.error("Hello World!");
    logger.warn("Hello World!");
    try {
        throw new Error("this is error");
    } catch (error) {
        logger.error(error);
    }
    res.status(200).send("Hello World!");
};

module.exports = {
    world,
}
