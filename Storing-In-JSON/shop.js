const Product = require("../models/product")
const Cart = require("../models/cart")

exports.getProducts = (req,res,next) => {
    Product.fetchAll(products => {
        res.render("shop/product-list",{prods:products, PageTitle: "Product List",path:"/products"}); //pug template
    });
    // const products = Product.fetchAll();
}
exports.getProduct = (req,res,next) => { // details page.
    const pid = req.params.productId;
    Product.getById(pid,product => {
        // console.log(product);
        res.render('shop/product-detail',{product:product, PageTitle:"Details",path:"/product-detail"})
    })
    // res.redirect("/")
    // const products = Product.fetchAll();
}

exports.getIndex = (req,res,next) => {
    Product.fetchAll(products => {
        res.render("shop/index",{prods:products, PageTitle: "Index",path:"/"}); //pug template
    });
}
exports.getCart = (req,res,next) => {
    Cart.getCart(cart => {
        Product.fetchAll( products => {
            const cartProducts = []
            for(let product of products){
                 const data = cart.products.find(prod => prod.id === product.id)
                if(data){
                    cartProducts.push({productData: product, qty: data.qty});
                }
            }
            res.render("shop/cart",{
                path:"/cart",
                PageTitle:"Your Cart",
                products: cartProducts
            })
        })
    })
}
exports.postCart = (req,res,next) => {
    const pid = req.body.productId;
    Product.getById(pid,product => {
        Cart.addToCart(pid,product.price);
    })
    res.redirect("/cart");
}
exports.postCartDelete = (req,res,next) => {
    const pid = req.body.productId;
    Product.getById(pid,product => {
        Cart.deleteFromCart(pid,product.price);
        res.redirect("/cart");
    })
}

exports.getOrders = (req,res,next) => {
    res.render("shop/orders",{
        path:"/orders",
        PageTitle:"Your orders"
    })
}
exports.getCheckout = (req,res,next) => {
    res.render("shop/checkout",{
        path:"/checkout",
        PageTitle:"Checkout page"
    })
}