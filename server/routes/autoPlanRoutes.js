const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const {
  createAutoPlan,
  getUserAutoPlans,
  deleteAutoPlan,
  runAutoPlansNow,
  updateAutoPlan,
} = require("../controllers/autoPlanController");

router.post("/", authenticateToken, createAutoPlan);
router.get("/", authenticateToken, getUserAutoPlans);
router.delete("/:id", authenticateToken, deleteAutoPlan);
router.post("/run", authenticateToken, runAutoPlansNow);
router.put("/:id", authenticateToken, updateAutoPlan);

module.exports = router;
