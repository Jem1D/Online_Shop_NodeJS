const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
//sessions are usable across requests but not shared among the users.
//stored on the server side.
exports.getLogin = (req, res, next) => {
  // console.log(req.get("Cookie"));
  // const isLoggedIn = req.get("Cookie").split("=")[1] === "true";
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    PageTitle: "Login page",
    errMsg: message,
    oldInput: {
      email:'',
      password:'',
    },
    validationErrors:[]
  });
};

exports.postLogin = (req, res, next) => {
  //sessions cookie: data stored in the browser for a single session.
  // res.setHeader("Set-Cookie","loggedIn=true; HttpOnly")// this data is sent with every request
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    // console.log(errors.array().find(e => e.param=== 'email'));
    return res.status(422).render("auth/login", {
      path: "/login",
      PageTitle: "Login page",
      errMsg: errors.array()[0].msg,
      oldInput: {
        email:email,
        password:password,
      },
      validationErrors: errors.array()
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          path: "/login",
          PageTitle: "Login page",
          errMsg: "No user found!",
          oldInput: {
            email:email,
            password:password,
          },
          validationErrors: []
        });
      }
      return bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            return req.session.save((err) => {
              console.log(err);
              return res.redirect("/");
            });
          }
          return res.status(422).render("auth/login", {
            path: "/login",
            PageTitle: "Login page",
            errMsg: "Invalid Password",
            oldInput: {
              email:email,
              password:password,
            },
            validationErrors: []
          });
        })
        .catch((err) => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.postLogout = (req, res, next) => {
  //sessions cookie: data stored in the browser for a single session.
  // res.setHeader("Set-Cookie","loggedIn=true; HttpOnly")// this data is sent with every request
  req.session.destroy((e) => {
    res.redirect("/");
  })
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    PageTitle: "Signup page",
    errMsg: message,
    oldInput: {
      email:'',
      password:'',
    },
    validationErrors: []
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  //if any errors found in the check middleware.
  if (!errors.isEmpty()) {
    // console.log(errors.array().find(e => e.param=== 'email'));
    return res.status(422).render("auth/signup", {
      path: "/signup",
      PageTitle: "Signup page",
      errMsg: errors.array()[0].msg,
      oldInput: {
        email:email,
        password:password,
      },
      validationErrors: errors.array()
    });
  }
  bcrypt
    .hash(password, 12)
    .then((encrypted) => {
      const user = new User({
        email: email,
        password: encrypted,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");
    }).catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
