// working with the data
const path = require("path");
const fs = require("fs");
const Cart = require("./cart");
// const products = []
const p = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "products.json"
);
module.exports = class Products {
  constructor(id, title, imageUrl, price, description) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
  }

  save() {
    fs.readFile(p, (err, fileContent) => {
      let products = [];
      if (!err) {
        products = JSON.parse(fileContent);
      }
      if (this.id) {
        const existingProductId = products.findIndex(
          (prod) => prod.id === this.id
        );
        const newProductList = [...products];
        newProductList[existingProductId] = this;
        console.log(newProductList);
        fs.writeFile(p, JSON.stringify(newProductList), (err) => {
          console.log(err);
        });
      } else {
        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), (err) => {
          console.log(err);
        });
      }
    });
    // products.push(this);
  }

  static deleteById(id) {
    fs.readFile(p, (err, fileContent) => {
      let products = [];
      if (!err) {
        products = JSON.parse(fileContent);
      }
      const product = products.find(prod => prod.id === id)
      const newList = products.filter((prod) => prod.id !== id);
      fs.writeFile(p, JSON.stringify(newList), (err) => {
        Cart.deleteFromCart(id,product.price)
      });
    });
  }

  static fetchAll(cb) {
    // dont need to create an object, can use this function directly
    fs.readFile(p, (err, content) => {
      if (err) {
        cb([]);
      }
      cb(JSON.parse(content));
    });
    // return products;
  }

  static getById(id, cb) {
    fs.readFile(p, (err, content) => {
      if (err) {
        cb([]);
      }
      let products = JSON.parse(content);
      const product = products.find((pr) => pr.id === id);
      cb(product);
    });
  }
};
