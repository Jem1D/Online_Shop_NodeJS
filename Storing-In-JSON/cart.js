const fs = require("fs")
const path = require("path");
const p = path.join(
    path.dirname(process.mainModule.filename),
    "data",
    "cart.json"
  );
module.exports = class Cart {
    static addToCart(id,productPrice){
        fs.readFile(p,(err,fileContent)=>{
            let cart = {products:[], totalPrice: 0};
            if(!err){
                cart = JSON.parse(fileContent);
            }
            const currentProductIndex = cart.products.findIndex(prod => prod.id === id);
            const currentProduct = cart.products[currentProductIndex]
            let newProduct;
            if(currentProduct){ 
                newProduct = {...currentProduct}
                newProduct.qty += 1
                cart.products = [...cart.products]
                cart.products[currentProductIndex]= newProduct;
                // currentProduct.qty += 1;
            }
            else{
                newProduct = { id : id, qty : 1};
                cart.products= [...cart.products, newProduct]
            }
            cart.totalPrice = parseInt(cart.totalPrice) + parseInt(productPrice);
            fs.writeFile(p,JSON.stringify(cart),err =>{
                console.log(err);
            })
        })
    }

    static deleteFromCart(id, prodPrice){
        fs.readFile(p,(err, fileContent) => {
            if(err){
                return;
            }
            let cart = JSON.parse(fileContent);
            const updatedCart = {...cart};
            const prod = updatedCart.products.find(pr => pr.id === id);
            if(!prod){
                return;
            }
            const prodQty = prod.qty;
            updatedCart.products = updatedCart.products.filter(pr => pr.id !== id);
            updatedCart.totalPrice = parseInt(updatedCart.totalPrice) - parseInt(prodPrice) * parseInt(prodQty);
            fs.writeFile(p,JSON.stringify(updatedCart),err =>{
                console.log(err);
            })
        })
    }
    static getCart(cb) {
        // dont need to create an object, can use this function directly
        fs.readFile(p, (err, content) => {
          if (err) {
            cb([]);
          }
          cb(JSON.parse(content));
        });
        // return products;
      }
}