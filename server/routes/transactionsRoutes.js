const express = require("express");
const router = express.Router();
const {
  getTransactionsByGoalId,
} = require("../controllers/transactionsController");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/:goalId", authenticateToken, getTransactionsByGoalId);

module.exports = router;
