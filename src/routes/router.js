const express = require("express");
const router = express.Router();
const rest = require("./rest/routes");
const graphql = require("./graphql/routes");
const ws = require("./websocket/ws");

router.use("/rest", rest);
router.use("/graphql", graphql);
router.use("/ws", ws);

module.exports = router;