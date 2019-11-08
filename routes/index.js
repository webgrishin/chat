var checkAuth = require('middleware/checkAuth');
var express = require('express');
var router = express.Router();

router.get('/', require('./frontpage').get);
router.get('/login', require('./login').get);
router.post('/login', require('./login').post);

router.post('/logout', require('./logout').post);

router.get('/chat', checkAuth, require('./chat').get);


module.exports = router;
