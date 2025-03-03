const express = require("express");
const router = express.Router();
const {
  getGoals,
  addGoal,
  updateGoal,
  deleteGoal,
  addBalanceToGoal,
  withdrawFromGoal,
  withdrawFullGoal,
  getGoalById,
} = require("../controllers/goalsController");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/", authenticateToken, getGoals);
router.post("/", authenticateToken, addGoal);
router.put("/:id", authenticateToken, updateGoal);
router.delete("/:id", authenticateToken, deleteGoal);
router.post("/:id/add-balance", authenticateToken, addBalanceToGoal);
router.post("/:id/withdraw", authenticateToken, withdrawFromGoal);

router.post("/:id/withdraw-balance", authenticateToken, withdrawFromGoal);

router.get("/:id", authenticateToken, getGoalById);

router.post("/:id/withdraw-full", authenticateToken, withdrawFullGoal);

module.exports = router;
