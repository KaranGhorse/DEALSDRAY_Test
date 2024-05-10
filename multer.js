
const multer = require('multer');

// for admins
const storageForAdmin = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("multer file me hu");
        cb(null , './public/assets');
    },
    filename: function (req, file, cb) {
        
        cb(null, `${Date.now()}-${file.originalname}`);
    }
})
const upload = multer({storage: storageForAdmin});


module.exports = {
    upload,
};
