const express = require("express");
const fs = require("fs")
require("dotenv").config()
const app = express(); // a basic request handler

const bodyParser = require("body-parser"); // for only text encoding in the header
const multer = require("multer") // for multiitype data encoding 
const path = require("path");
const errorConstroller = require("./controller/error");
const csrf = require("csurf");
const flash = require("connect-flash");
const helmet = require("helmet")
const compression = require("compression")
const morgan = require("morgan")

const mongoose = require("mongoose");
const session = require("express-session");
const mongoUri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.PASSWORD}@nodecluster-1.wgzop.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;
const sessionStore = require("connect-mongodb-session")(session) // to store session in db
const store = new sessionStore({
  uri: mongoUri,
  collection: 'session'
})
//where and how to store the images
const fileStorage = multer.diskStorage({
  destination: (req,file,cb) => {
    cb(null,"images");
  },
  filename: (req,file,cb) => {
    cb(null,file.originalname)
  }
})
//filtering the unwanted file types.
const fileFilter = (req,file,cb) => {
  if(file.mimetype === 'image/png' ||
  file.mimetype === 'image/jpg' ||
  file.mimetype === 'image/jpeg'){
    cb(null,true)
  } else{
    cb(null,false)
  }
}

const accessLog = fs.createWriteStream(path.join(__dirname,"access.log"),{flags:'a'})
// to ensure the sessions dont get stolen.
// const csrfProtection = csrf(); // every non-get request will need a csrf token.
const adminData = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(morgan("combined",{stream:accessLog}))
app.use(helmet())
app.use(compression())

const User = require("./models/user");

// templating engine to use to render dynamic pages
// app.engine("handlebars", expressHbs.engine({defaultLayout: false})); // used only for handlebars

app.set("view engine", "ejs"); // pug or handlebars to be used as template.
app.set("views", "views"); // pages to be rendered by pug.


//serving the public folder to be directly accessed through http request
app.use(express.static(path.join(__dirname, "public")));
app.use("/images",express.static(path.join(__dirname, "images")));

//parsing the incoming data buffer
app.use(bodyParser.urlencoded({ extended: false }));

//multer file reader, stores all kind of data like: buffer,type,name,encoding type.
app.use(multer({storage:fileStorage, fileFilter:fileFilter}).single("image"))

//session middleware:
app.use(session({secret:"My secret", resave:false, saveUninitialized: false, store:store}))

app.use(csrf());// adds req.csrfToken() method.
app.use(flash()); // stored in the database session deleted once used.

//to pass the mentioned arguments in the all the rendered pages
//hence, all forms need a csrf token to be rendered
app.use((req,res,next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken()
  next();
})

// the req.user is used only in the following request cycles and no further.
app.use((req, res, next) => {
  if(!req.session.user){
    return next();
  }
  //this is done to make the mongoose methods available with the mongodb data.
  User.findById(req.session.user._id)
    .then((user) => {
      if(!user){ // further error handling.
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      // throw new Error(err); //this throw will not lead to the final error handler as it in the async functions
      next(new Error(err))
    });
});



// go to this middleware only if the url has '/admin' in it
app.use("/admin", adminData.routes);
app.use(shopRoutes);
app.use(authRoutes);

// app.use("/500",errorConstroller.get500);

// //to handle requestes that are not found
app.use(errorConstroller.get404);

//handle all the errors passed through next.
// app.use((error,req,res,next) => {
//   res.status(500)
//     .render("500", {
//       PageTitle: "Error!",
//       path: "/500",
//       isAuthenticated: true
//     });
// })
mongoose.connect(
  mongoUri
).then(result => {
  app.listen(process.env.PORT || 3000)
  console.log("Connected to the database")
}).catch(err => {
  console.log(err)
})