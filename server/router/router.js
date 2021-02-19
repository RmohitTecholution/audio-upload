const route = require('express').Router();
const controller = require('../controller/controller');
const store = require('../middleware/multer');

route.get('/', controller.home);

route.post('/upload', store, controller.upload);

route.get('/id=:id', controller.data);

module.exports = route;