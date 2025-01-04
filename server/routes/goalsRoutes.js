const express = require("express");
const router = express.Router();
const {
  getGoals,
  addGoal,
  updateGoal,
  deleteGoal,
  addBalanceToGoal,
} = require("../controllers/goalsController");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/", authenticateToken, getGoals);
router.post("/", authenticateToken, addGoal);
router.put("/:id", authenticateToken, updateGoal);
router.delete("/:id", authenticateToken, deleteGoal);
router.post("/:id/add-balance", authenticateToken, addBalanceToGoal);

module.exports = router;
