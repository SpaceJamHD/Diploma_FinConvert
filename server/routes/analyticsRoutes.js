const express = require("express");
const router = express.Router();
const {
  getSpreadLossAnalytics,
  getGoalsDistributionAnalytics,
  getNextMonthForecast,
  getSpreadLossTotalUAH,
} = require("../controllers/analyticsController");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/spread-loss", authenticateToken, getSpreadLossAnalytics);
router.get(
  "/goals-distribution",
  authenticateToken,
  getGoalsDistributionAnalytics
);

router.get("/forecast", authenticateToken, getNextMonthForecast);

router.get("/spread-total-loss-uah", authenticateToken, getSpreadLossTotalUAH);

module.exports = router;
