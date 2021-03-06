exports.get404 = (req, res, next) => {
  res
    .status(404)
    .render("404", {
      PageTitle: "Page not found",
      path: "/404",
      isAuthenticated: req.session.isLoggedIn
    });
};
exports.get500 = (req, res, next) => {
  res
    .status(500)
    .render("500", {
      PageTitle: "Page not found",
      path: "/500",
      isAuthenticated: req.session.isLoggedIn
    });
};
