const express = require("express")
const router = express.Router()
const {body} = require("express-validator")
const adminController = require("../controller/admin")

const auth = require("../middleware/is-auth");

// /admin/add-product  - get
router.get("/add-product",auth,adminController.getAddProduct)

// /admin/add-product  - post
router.post("/add-product",[
    body("title").trim().isLength({min:3}),
    body("price").isFloat(),
    body("description").isLength({min:5, max:400}).trim()
],auth, adminController.postAddProducts)

// //editing product routes
router.get("/edit-product/:productId",auth, adminController.getEditProduct)
router.post("/edit-product" ,
[
    body("title").trim().isLength({min:3}),
    body("price").isFloat(),
    body("description").isLength({min:5, max:400}).trim()
],auth, adminController.postEditProduct)

// router.post("/delete-product",auth, adminController.postDeleteProduct)
router.delete("/products/:productId",auth, adminController.deleteProduct)

// // /admin/products  - get
router.get("/products",auth, adminController.getProducts)

module.exports.routes = router;
