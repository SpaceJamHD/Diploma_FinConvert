const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const {
  getAllUsers,
  deleteUser,
  banUser,
  unbanUser,
  sendMessageToUser,
} = require("../controllers/adminController");

const checkAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Доступ заборонено: тільки для адміністратора." });
  }
  next();
};

router.use(authenticateToken, checkAdmin);

router.get("/users", getAllUsers);

router.delete("/users/:id", deleteUser);

router.post("/users/:id/ban", banUser);

router.post("/users/:id/unban", authenticateToken, unbanUser);

router.post("/users/:id/message", sendMessageToUser);

module.exports = router;
