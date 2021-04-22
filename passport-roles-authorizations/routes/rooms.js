const router = require("express").Router();
const Room = require('../models/Room');
const { loginCheck } = require('./middlewares');


router.get('/', (req, res, next) => {
  // i want to see only my rooms
  // if you use node-basic-auth: req.session.user._id
  // Room.find({ owner: req.user._id })
  //   .then(rooms => {
  //     res.render('rooms/index', { roomList: rooms });
  //   })
  //   .catch(err => {
  //     next(err);
  //   })

  Room.find()
    .then(rooms => {
      res.render('rooms/index', { roomList: rooms });
    })
    .catch(err => {
      next(err);
    })
});

router.get('/add', (req, res, next) => {
  res.render('rooms/add');
});

router.post('/', loginCheck(), (req, res, next) => {
  console.log(req.user._id);
  // if (!req.isAuthenticated()) {
  //   res.redirect('/login');
  // }
  const { name, price } = req.body;
  Room.create({
    name,
    price,
    owner: req.user._id
  })
    .then(() => {
      res.redirect('/rooms');
    })
    .catch(err => {
      next(err);
    })
});

router.get('/:id/delete', (req, res, next) => {
  // if the logged in user that wants to delete this room is an admin 
  // they can delete any room, if the user is a 'user' then they only can  
  // can delete their own rooms
  const query = { _id: req.params.id };
  if (req.user.role !== 'admin') {
    query.owner = req.user._id;
  }
  console.log(query); // -> {_id: <idOfTheRoom>, owner: <idOfTheLoggedInUser>}
  Room.findOneAndDelete(query)
    .then(() => {
      res.redirect('/rooms');
    })
    .catch(err => {
      next(err);
    })
});



module.exports = router;