const fs = require("fs");
const path = require("path");
const Order = require("../models/order");
const Product = require("../models/product");
const stripe = require("stripe")("sk_test_51LBZzaSCGY2MLdIfLH6OwS0PjTrAeZIjFhSVLZ9jluSOhIW0ZSDnzM4fvKNKjIGUYsDkfGtlgHUH3sayr4G1krRw003v6cxhma")
const ITEMS_PER_PAGE = 2

const pdfDoc = require("pdfkit")


exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find().countDocuments().then(cnt => {
    totalItems = cnt;
    return Product.find().skip((page-1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)
  }).then((product) => {
      res.render("shop/product-list", {
        prods: product,
        PageTitle: "Product List",
        path: "/products",
        currPage: page,
        totalProducts:totalItems,
        hasNextPage:ITEMS_PER_PAGE*page< totalItems,
        hasPrevPage: page>1,
        prevPage:page-1,
        nextPage:page+1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    }).catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// details page.
exports.getProduct = (req, res, next) => {
  const pid = req.params.productId;
  Product.findById(pid)
    .then((product) => {
      // console.log(rows)
      res.render("shop/product-detail", {
        product: product,
        PageTitle: product.title,
        path: "/product-detail",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find().countDocuments().then(cnt => {
    totalItems = cnt;
    return Product.find().skip((page-1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)
  }).then((product) => {
      res.render("shop/index", {
        prods: product,
        PageTitle: "Index",
        path: "/",
        currPage: page,
        totalProducts:totalItems,
        hasNextPage:ITEMS_PER_PAGE*page< totalItems,
        hasPrevPage: page>1,
        prevPage:page-1,
        nextPage:page+1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  // Product.fetchAll().then(([rows,info]) => {
  //     res.render("shop/index",{prods:rows, PageTitle: "Index",path:"/"});    // simple SQL2 fetching.
  // }).catch(err => console.log(err));
};

//here req.session.user is not used because the session cannot store the method comes with the user model.
exports.getCart = (req, res, next) => {
  // console.log(req.user)
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        PageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const pid = req.body.productId;
  Product.findById(pid)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDelete = (req, res, next) => {
  const pid = req.body.productId;
  console.log(pid);
  req.user
    .deleteFromCart(pid)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  // to fetch all the related products with the orders
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        PageTitle: "Your orders",
        orders: orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrders = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return {
          quantity: i.quantity,
          product: { ...i.productId._doc }, // to store all the product data rather than just the id.
        };
      });
      const order = new Order({
        products: products,
        user: {
          email: req.user.email,
          userId: req.user,
        },
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then((result) => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  let totalSum;
  let products;
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      products = user.cart.items;
      totalSum = 0;
      products.forEach(p => {
        totalSum += p.quantity * parseFloat(p.productId.price);
      })
      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map(p => {
          return {
            name: p.productId.title,
            description: p.productId.description,
            amount: parseFloat(p.productId.price) * 100,
            currency: 'usd',
            quantity: p.quantity
          }
        }),
        success_url: req.protocol + "://"+ req.get("host")+"/checkout/success",
        cancel_url: req.protocol + "://"+ req.get("host")+"/checkout/cancel"
      });
    })
    .then(session => {
        res.render("shop/checkout", {
          path: "/checkout",
          PageTitle: "Checkout",
          products: products,
          totalSum: totalSum,
          sessionId:session.id
        });
      })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  //just to prevent unauthorised access to invoice
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found!"));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorised"));
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);
      
      const pdf = new pdfDoc();
      //to open directly in the browser itself
      res.setHeader("Content-Type", "application/pdf");
      //how file will be downloaded from the browser
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      pdf.pipe(fs.createWriteStream(invoicePath));
      pdf.pipe(res)
      
      pdf.fontSize(26).text("Invoice")
      pdf.text("---------")
      let total = 0;
      order.products.forEach(p => {
        let price = parseFloat(p.product.price);
        total+=p.quantity * price;
        pdf.fontSize(20).text(p.product.title + " - ("+ p.quantity + ") x $" +price)
      });

      pdf.text("--------")
      pdf.text("Total Price: $"+ total);
      pdf.end()
      // fs.readFile(invoicePath, (e, data) => {
      //   if (e) {
      //     return next(e);
      //   }
      //   //to open directly in the browser itself
      //   res.setHeader("Content-Type", "application/pdf");
      //   //how file will be downloaded from the browser
      //   res.setHeader(
      //     "Content-Disposition",
      //     'inline; filename="' + invoiceName + '"'
      //   );
      //   res.send(data);
      // });

      
      // //stream the data instead of loading it entirely in the memory
      // const file = fs.createReadStream(invoicePath);

      // file.pipe(res)
    })
    .catch((err) => {
      next(err);
    });
};

//post cart with sequel:
// let fetchedCart;
// let qty = 1;
// req.user.getCart().then(cart => {
//     fetchedCart = cart;
//     return cart.getProducts({where:{id:pid}});
// }).then(products => {
//     let product;
//     if(products.length > 0){
//         product = products[0];
//     }
//     if(product){
//         qty = product.cartItem.quantity + 1;
//       return fetchedCart.addProduct(product,{through:{quantity:qty}});
//     }
//     return Product.findByPk(pid).then(product => {
//       return fetchedCart.addProduct(product,{through:{quantity: qty}});
//     }).catch(err => console.log(err))
// }).then(result => {
//     res.redirect("/cart");
// }).catch(err => console.log(err))
