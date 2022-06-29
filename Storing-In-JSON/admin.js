
const Product = require("../models/product")

// routes for add-Product page.
exports.getAddProduct=(req,res,next) => { 
    // res.send("<form action='/admin/add-product' method='POST'><input type='text' name='title'><button type='submit'>Press to visit product.</button></form>")
    // res.sendFile(path.join(__dirname,"../views/add-product.html"));
    res.render("admin/edit-product",{PageTitle:"Add Products", path:"/admin/add-product", editing:false}) // pug template
}
exports.postAddProducts = (req,res,next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;

    const product = new Product(null,title,imageUrl,price,description)
    // products.push({title : req.body.title});
    product.save();
    res.redirect("/");
}

// routes for edit-Product page.
exports.getEditProduct=(req,res,next) => { 
    const editMode = req.query.edit;
    if(!editMode){
        return res.redirect("/")
    }
    const pid = req.params.productId;
    Product.getById(pid, product => {
        res.render("admin/edit-product",{PageTitle:"Add Products", path:"/admin/edit-product",editing: editMode, product: product}) // pug template
    })
}

exports.postEditProduct = (req,res,next)=>{
    console.log(req.body)
    const pid = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDesc = req.body.description;
    const updatedProductsList = new Product(pid,updatedTitle,updatedUrl,updatedPrice,updatedDesc);
    updatedProductsList.save();
    res.redirect("/admin/products");
}

exports.postDeleteProduct = (req,res,next) => {
    const pid = req.body.productId;
    Product.deleteById(pid);
    res.redirect("/admin/products");
}
exports.getProducts = (req,res,next) => {
    Product.fetchAll(products => {
        res.render("admin/products",{prods:products, PageTitle: "Admin Products",path:"/admin/products"}); //pug template
    });
}
