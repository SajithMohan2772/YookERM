const express = require ('express');
const { registerUser, loginUser, getUser, logout } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();


router.post('/register', registerUser);
router.post('/login', loginUser);
router.get("/logout", logout);
router.get("/getuser", protect, getUser);
// router.get("/", getAllUsers);


module.exports = router;
