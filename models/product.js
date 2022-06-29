//with mongoose
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required:true
  },
  imageUrl: {
    type: String,
    required:true
  },
  price: {
    type: String,
    required:true
  },
  description: {
    type: String,
    required:true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref:"User",
    required: true
  }
})

// model name with lowercase and plural is created as the collection in db
//just a way to export mongoose model
module.exports = mongoose.model("Product",productSchema);
// //with mongoDB
// const getDb = require("../utils/database").getDb;
// const mongodb = require("mongodb");

// class Product{
//   constructor(title,imageUrl,price,description,id,userId){
//     this.title = title;
//     this.imageUrl = imageUrl;
//     this.price = price;
//     this.description = description;
//     this._id = id ? new mongodb.ObjectId(id) : null ; // create object only if the id is already passed and not null (in case of product creation).
//     this.userId = userId;
//   }

//   save(){
//     const db = getDb();
//     let op;
//     if(this._id){
//       op = db.collection("product").updateOne({_id:this._id},{$set: this});
//     }
//     else{
//       op = db.collection('product').insertOne(this);
//     }
//     return op.then(result => console.log(result)).catch(err => console.log(err))
//   }

//   static fetchAll(){
//     const db = getDb();
//     return db.collection('product').find().toArray().then(result => {
//       // console.log(result);
//       return result;
//     }).catch(err => console.log(err))
//   }

//   static findById(pid){
//     const db = getDb();
//     return db.collection('product').find({_id: new mongodb.ObjectId(pid)}).next().then(product => {
//       console.log(product);
//       return product;
//     }).catch(err => console.log(err));
//   }

//   static deleteById(pid){
//     const db = getDb();
//     return db.collection("product").deleteOne({_id: new mongodb.ObjectId(pid)}).then(result => {
//       console.log("Deleted");
//     }).catch(Err => console.log(Err));
//   }
// } 
// module.exports = Product;