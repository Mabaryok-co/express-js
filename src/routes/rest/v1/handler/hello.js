const express = require("express");
const router = express.Router();
const hello = require("@handler/hello");

router.get("/world", hello.world);

module.exports = router;