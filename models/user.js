const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  cart: {
    items: [{
      productId : {
        type: Schema.Types.ObjectId,
        ref:"Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true
      }
    }]
  }
});

userSchema.methods.addToCart = function(product) {
      const cartProductIndex = this.cart.items.findIndex((cp) => {
      return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({ productId: product._id, quantity: newQuantity });
    }

    const updatedCart = { items: updatedCartItems };
    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.deleteFromCart = function(pid) {
  const updatedItems = this.cart.items.filter((item) => {
    return item._id.toString() !== pid.toString();
  });
  this.cart.items = updatedItems;
  return this.save();
}

userSchema.methods.clearCart = function() {
  this.cart = {items: []};
  return this.save();
}

module.exports = mongoose.model("User", userSchema);

// const getDb = require("../utils/database").getDb;
// const mongodb = require("mongodb");

// class User {
//   constructor(username, email, cart, id) {
//     this.username = username;
//     this.email = email;
//     this.cart = cart; // {items:[]}
//     this._id = id;
//   }

//   save() {
//     const db = getDb();
//     return db.collection("user").insertOne(this);
//   }

//   addToCart(product) {
//     const cartProductIndex = this.cart.items.findIndex((cp) => {
//       return cp.productId.toString() === product._id.toString();
//     });
//     let newQuantity = 1;
//     const updatedCartItems = [...this.cart.items];
//     if (cartProductIndex >= 0) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({ productId: product._id, quantity: newQuantity });
//     }

//     const updatedCart = { items: updatedCartItems };
//     const db = getDb();
//     return db
//       .collection("user")
//       .updateOne(
//         { _id: new mongodb.ObjectId(this._id) },
//         { $set: { cart: updatedCart } }
//       );
//   }

//   getCart() {
//     const db = getDb();
//     // to return only the product ids from the cart
//     const idStored = this.cart.items.map((i) => {
//       return i.productId;
//     });
//     //find products with the ids mapped.
//     // {product details with quantity included quantity}
//     return db
//       .collection("product")
//       .find({ _id: { $in: idStored } })
//       .toArray()
//       .then((products) => {
//         return products.map((p) => {
//           return {
//             ...p,
//             quantity: this.cart.items.find((i) => {
//               return i.productId.toString() === p._id.toString();
//             }).quantity,
//           };
//         });
//       });
//   }

//   deleteFromCart(pid) {
//     const updatedItems = this.cart.items.filter((item) => {
//       return item.productId.toString() !== pid.toString();
//     });
//     const db = getDb();
//     return db
//       .collection("user")
//       .updateOne(
//         { _id: new mongodb.ObjectId(this._id) },
//         { $set: { cart: { items: updatedItems } } }
//       );
//   }

//   addOrder() {
//     const db = getDb();
//     return this.getCart()
//       .then((products) => {
//         const order = {
//           items: products,
//           user: {
//             _id: new mongodb.ObjectId(this._id),
//             username: this.username,
//           },
//         };
//         return db.collection("order").insertOne(order);
//       })
//       .then((result) => {
//         this.cart = { items: [] };
//         return db
//           .collection("user")
//           .updateOne(
//             { _id: new mongodb.ObjectId(this._id) },
//             { $set: { cart: { items: [] } } }
//           );
//       });
//   }

//   getOrders(){
//     const db = getDb();
//     return db.collection("order").find({"user._id":new mongodb.ObjectId(this._id)}).toArray();
//   }
//   static findById(uid) {
//     const db = getDb();
//     return db
//       .collection("user")
//       .find({ _id: new mongodb.ObjectId(uid) })
//       .next();
//   }
// }

// module.exports = User;
