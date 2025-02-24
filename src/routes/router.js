const express = require("express");
const router = express.Router();
const rest = require("@rest/router");
// const graphql = require("./graphql/routes");

router.use("/rest", rest);
// router.use("/graphql", graphql);

module.exports = router;