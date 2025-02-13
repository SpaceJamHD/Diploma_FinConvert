const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const {
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userController");
const pool = require("../models/userModel");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "Доступ открыт", user: req.user });
});

router.get("/validate/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

    if (user.rows.length > 0) {
      res.status(200).json({ valid: true });
    } else {
      res.status(404).json({ valid: false });
    }
  } catch (error) {
    console.error("Ошибка проверки пользователя:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/profile", authenticateToken, getUserProfile);

router.put("/profile", authenticateToken, updateUserProfile);

module.exports = router;
