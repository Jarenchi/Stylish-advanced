require('dotenv').config();
const crypto = require('crypto');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const port = process.env.PORT;
const User = require('../server/models/user_model');
const {TOKEN_SECRET} = process.env;
const jwt = require('jsonwebtoken');
const { promisify } = require('util'); // util from native nodejs library

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const productId = req.body.product_id;
            const imagePath = path.join(__dirname, `../public/assets/${productId}`);
            if (!fs.existsSync(imagePath)) {
                fs.mkdirSync(imagePath);
            }
            cb(null, imagePath);
        },
        filename: (req, file, cb) => {
            const customFileName = crypto.randomBytes(18).toString('hex').substr(0, 8);
            const fileExtension = file.mimetype.split('/')[1]; // get file extension from original file name
            cb(null, customFileName + '.' + fileExtension);
        }
    })
});

const uploadUserImage = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const userId = req.body.id;
            const imagePath = path.join(__dirname, `../public/assets/${userId}`);
            if (fs.existsSync(imagePath)) {
                // delete all files in the folder
                const files = fs.readdirSync(imagePath);
                files.forEach((file) => {
                    const filePath = path.join(imagePath, file);
                    fs.unlinkSync(filePath);
                });
            } else {
                fs.mkdirSync(imagePath);
            }
            cb(null, imagePath);
        },
        filename: (req, file, cb) => {
            const customFileName = crypto.randomBytes(18).toString('hex').substr(0, 8);
            const fileExtension = file.mimetype.split('/')[1]; // get file extension from original file name
            cb(null, customFileName + '.' + fileExtension);
        }
    })
})

const getImagePath = (protocol, hostname, productId) => {
    if (protocol == 'http') {
        return protocol + '://' + hostname + ':' + port + '/assets/' + productId + '/';
    } else {
        return protocol + '://' + hostname + '/assets/' + productId + '/';
    }
};

const getUserImagePath = (protocol, hostname, userId) => {
    if (protocol == 'http') {
        return protocol + '://' + hostname + ':' + port + '/assets/' + userId + '/';
    } else {
        return protocol + '://' + hostname + '/assets/' + userId + '/';
    }
};

// reference: https://thecodebarbarian.com/80-20-guide-to-express-error-handling
const wrapAsync = (fn) => {
    return function(req, res, next) {
        // Make sure to `.catch()` any errors and pass them along to the `next()`
        // middleware in the chain, in this case the error handler.
        fn(req, res, next).catch(next);
    };
};

const authentication = (roleId) => {
    return async function (req, res, next) {
        let accessToken = req.get('Authorization');
        if (!accessToken) {
            res.status(401).send({error: 'Unauthorized'});
            return;
        }

        accessToken = accessToken.replace('Bearer ', '');
        if (accessToken == 'null') {
            res.status(401).send({error: 'Unauthorized'});
            return;
        }

        try {
            const user = await promisify(jwt.verify)(accessToken, TOKEN_SECRET);
            req.user = user;
            if (roleId == null) {
                next();
            } else {
                let userDetail;
                if (roleId == User.USER_ROLE.ALL) {
                    userDetail = await User.getUserDetail(user.email);
                } else {
                    userDetail = await User.getUserDetail(user.email, roleId);
                }
                if (!userDetail) {
                    res.status(403).send({error: 'Forbidden'});
                } else {
                    req.user.id = userDetail.id;
                    req.user.role_id = userDetail.role_id;
                    next();
                }
            }
            return;
        } catch(err) {
            res.status(403).send({error: 'Forbidden'});
            return;
        }
    };
};

module.exports = {
    upload,
    uploadUserImage,
    getImagePath,
    getUserImagePath,
    wrapAsync,
    authentication
};