const express = require("express");
const router = express.Router()
const hello = require("./handler/hello")

router.use("/hello",hello)

module.exports = router;
