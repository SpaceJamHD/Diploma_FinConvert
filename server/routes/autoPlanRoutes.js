const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const {
  createAutoPlan,
  getUserAutoPlans,
  deleteAutoPlan,
  runAutoPlansNow,
} = require("../controllers/autoPlanController");

router.post("/", authenticateToken, createAutoPlan);
router.get("/", authenticateToken, getUserAutoPlans);
router.delete("/:id", authenticateToken, deleteAutoPlan);
router.post("/run", authenticateToken, runAutoPlansNow);

module.exports = router;
