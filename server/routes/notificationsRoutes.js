const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  markNotificationsAsRead,
} = require("../controllers/notificationsController");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/", authenticateToken, getUserNotifications);
router.post("/mark-all-read", authenticateToken, markNotificationsAsRead);

module.exports = router;
