const express = require ('express');
const { registerUser, loginUser, getUser, logout, loginStatus, updateUser, changePassword, forgotPassword } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();


router.post('/register', registerUser);
router.post('/login', loginUser);
router.get("/logout", logout);
router.get("/getuser", protect, getUser);
router.get("/loggedin", loginStatus);
router.patch("/updateuser", protect, updateUser);
router.patch("/changepassword", protect, changePassword);
router.post("/forgotpassword", forgotPassword);

module.exports = router;
