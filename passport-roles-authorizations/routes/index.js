const router = require("express").Router();

const loginCheck = () => {
  return (req, res, next) => {
    // check if the user is logged in 
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect('/login');
    }
  }
}

/* GET home page */
router.get("/", (req, res, next) => {
  // this is the passport way of accessing the logged in user
  const currentUser = req.user;
  console.log(req.user);
  res.render("index", { user: currentUser });
});

router.get("/profile", loginCheck(), (req, res, next) => {
  res.render("profile");
});


module.exports = router;
