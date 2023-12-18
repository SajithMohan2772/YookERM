const express = require ('express');
const { registerUser, loginUser, getUserByID, getAllUsers, logout } = require('../controllers/userController')
const router = express.Router();


router.post('/register', registerUser);
router.post('/login', loginUser);
router.get("/one/:id", getUserByID);
router.get("/logout", logout);
router.get("/", getAllUsers);


module.exports = router;
