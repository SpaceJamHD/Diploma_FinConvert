const express = require("express");
const { getLossAnalysisData } = require("../controllers/analyticsController");
const router = express.Router();

router.get("/loss-analysis", getLossAnalysisData);

module.exports = router;
