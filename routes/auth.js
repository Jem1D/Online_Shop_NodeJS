const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { check, body } = require("express-validator");

const authController = require("../controller/auth");

router.get("/login", authController.getLogin);

router.post("/login",
[
  body('email').isEmail().withMessage("Enter valid Email!").normalizeEmail(),
  body('password',"Enter valid password").isLength({min:4}).trim()
], authController.postLogin);

router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignup);

//will store errors if found in the post signup info.
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter valid Email.")
      .custom((val, { req }) => {
        return User.findOne({ email: val })
            .then((userDoc) => {
                console.log(userDoc);
                if (userDoc) {
                    return Promise.reject("This E-mail already exists!")
                }
            })
      }).normalizeEmail(),
    //checks only for body passed fields
    body(
      "password",
      "Please enter a password with length more than 4."
    ).trim().isLength({ min: 4 }),
    body("confirmPassword").custom((val, {req}) => {
        if(val !== req.body.password){
            throw new Error("Passwords have to be same!");
        }
        return true;
    }).trim()
  ],
  authController.postSignup
);

module.exports = router;
