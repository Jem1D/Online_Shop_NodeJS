//with mongoDB as the storage server.
const Product = require("../models/product");
const {validationResult} = require("express-validator")
const fileHelper = require("../utils/file");
// routes for add-Product page.
exports.getAddProduct = (req, res, next) => {
    // console.log(req.user);
  // res.send("<form action='/admin/add-product' method='POST'><input type='text' name='title'><button type='submit'>Press to visit product.</button></form>")
  // res.sendFile(path.join(__dirname,"../views/add-product.html"));
  res.render("admin/edit-product", {
    PageTitle: "Add Products",
    path: "/admin/add-product",
    editing: false,
    hasError:false,
    errMsg:null,
    validationErrors:[]
  }); // pug template
};
exports.postAddProducts = (req, res, next) => {
  // console.log(req.session)
  const title = req.body.title;
  // const imageUrl = req.body.imageUrl;
  const image = req.file; // image object 
  const price = req.body.price;
  const description = req.body.description;
  // console.log(imageUrl);
  const errors = validationResult(req);
  if(!image){
    return res.status(422).render("admin/edit-product", {
      PageTitle: "Add Products",
      path: "/admin/add-product",
      editing: false,
      hasError:true,
      product: {
        title:title,
        imageUrl:null,
        price:price,
        description:description,
      },
      errMsg:"The attached file isn't an image!",
      validationErrors:[]
    });
  }
  const imageUrl = image.path;
  if(!errors.isEmpty()){
    return res.status(422).render("admin/edit-product", {
      PageTitle: "Add Products",
      path: "/admin/add-product",
      editing: false,
      hasError:true,
      product: {
        title:title,
        imageUrl:imageUrl,
        price:price,
        description:description,
      },
      errMsg:errors.array()[0].msg,
      validationErrors:errors.array()
    });
  }
  
  
  const product = new Product({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// routes for edit-Product page.
//getting user specific product editing mode through req.user.
exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const pid = req.params.productId;
  Product.findById(pid)
    // Product.findByPk(pid)
    .then((rows) => {
      res.render("admin/edit-product", {
        PageTitle: "Edit Products",
        path: "/admin/edit-product",
        editing: editMode,
        product: rows,
        hasError:false,
        errMsg:null,
        validationErrors:[]
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  // console.log(req.body)
  const pid = req.body.productId;
  const updatedTitle = req.body.title;
  const image = req.file;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).render("admin/edit-product", {
      PageTitle: "Edit Products",
      path: "/admin/edit-product",
      editing: true,
      hasError:true,
      product: {
        title:updatedTitle,
        price:updatedPrice,
        description:updatedDesc,
        _id:pid,
      },
      errMsg:errors.array()[0].msg,
      validationErrors:errors.array()
    });
  }

  Product.findById(pid).then(product => {
      product.title = updatedTitle;
      if(image){
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.save()
  }).then((result) => {
      console.log("Database updated");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const pid = req.params.productId;
  Product.findById(pid).then(product => {
    if(!product){
      return next(new Error("Product not found!"))
    }
    fileHelper.deleteFile(product.imageUrl);
    return Product.findByIdAndRemove(pid)
  }).then((result) => {
      console.log("Product deleted");
      // res.redirect("/admin/products");
      res.status(200).json({message:"Product Deleted!"})
    })
    .catch((err) => {
      // const error = new Error(err);
      // error.httpStatusCode = 500;
      // return next(error);
      res.status(500).json({message:"REquest to delete failed!"})
    });
};

//getting user specific products through req.user.
exports.getProducts = (req, res, next) => {
  Product.find()
//   .select(" title price -_id")
//   .populate("userId")
    .then((rows) => {
      res.render("admin/products", {
        prods: rows,
        PageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
