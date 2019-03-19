var express = require('express');
var axios = require('axios');
var router = express.Router();
var ip = require('./ip.js');

active = 1;

post = [
  '/register',
  '/creategroup',
  '/joingroup',
  '/exitgroup',
  '/leavegroup',
  '/sendm',
  '/sendread',
  '/setread'
];

get = [
  '/getuserinformation',
  '/getgroup',
  '/getm',
  '/getunreadm',
  '/viewunreadm',
  '/getmessageorder',
];

post.map(path => {
  router.post(path, function (req, res, next) {
    // primary backend
    axios.post(ip.primary + path, req.body)
      .then(function (response) {
        if (active === 2) {
          console.log("primary backend is back and taking over the system");
          active = 1;
        }
        if (path === '/sendm') {
          io.emit('chat', response.data);
          console.log(response.data);
        }
        console.log('From: primary backend');
        res.send(response.data);
      })
      .catch(function (err) {

        // secondary backend
        axios.post(ip.secondary + path, req.body)
          .then(function (response) {
            if (active === 1) {
              console.log("primary backend is inactived");
              console.log("secondary backend is taking over the system");
              active = 2;
            }
            if (path === '/sendm') io.emit('chat', response.data);
            console.log('From: secondary backend');
            res.send(response.data);
          })
          .catch(function (err) {
            console.error(err);
            res.send('ERROR');
          });
      });
  });
});

get.map(path => {
  router.get(path, function (req, res, next) {
    // primary backend
    axios.get(ip.primary + path, { params: req.query })
      .then(function (response) {
        if (active === 2) {
          console.log("primary backend is back and taking over the system");
          active = 1;
        }
        console.log('From: primary backend');
        res.send(response.data);
        console.log(response.data);
      })
      .catch(function (err) {

        // secondary backend
        axios.get(ip.secondary + path, { params: req.query })
          .then(function (response) {
            if (active === 1) {
              console.log("primary backend is inactived");
              console.log("secondary backend is taking over the system");
              active = 2;
            }
            console.log('From: secondary backend');
            res.send(response.data);
          })
          .catch(function (err) {
            console.error(err);
            res.send('ERROR');
          });
      });
  });
});

module.exports = router;