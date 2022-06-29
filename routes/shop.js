const express = require("express")
const router = express.Router()
const auth = require("../middleware/is-auth");
const shopController = require("../controller/shop")
// any path starting with '/' will be redirected here
router.get("/", shopController.getIndex)

router.get("/products",shopController.getProducts)

router.get("/products/:productId",shopController.getProduct)

router.get("/cart",auth,shopController.getCart)
router.post("/cart",auth,shopController.postCart)
router.post("/cart-delete-item",auth, shopController.postCartDelete)

router.get("/orders",auth,shopController.getOrders)
router.get("/orders/:orderId",auth,shopController.getInvoice)

// router.post("/create-order",auth,shopController.postOrders)

router.get("/checkout",auth,shopController.getCheckout)
router.get("/checkout/success",shopController.postOrders)
router.get("/checkout/cancel",shopController.getCheckout)

module.exports = router;