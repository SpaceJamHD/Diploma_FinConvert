const express = require("express");
const router = express.Router();
const {
  getSpreadLossAnalytics,
  getGoalsDistributionAnalytics,
  getNextMonthForecast,
  getSpreadLossTotalUAH,
  getConversionDirectionsAnalytics,
  getAllGoalIncomeTransactions,
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

router.get(
  "/conversion-directions",
  authenticateToken,
  getConversionDirectionsAnalytics
);

router.get(
  "/all-goal-income-transactions",
  authenticateToken,
  getAllGoalIncomeTransactions
);

module.exports = router;
