const multer = require('multer');

// set storage
var storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, 'uploads');
    },
    filename: function (req, file, cb){
        var ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
        cb(null, file.fieldname + '-' + Date.now() + ext);
    },
});

var upload = multer({ storage: storage });

var multiple = upload.fields([{name: 'audio-file'}, {name: 'language-type'}]);


module.exports = store = multiple;