const mongoHandler = require('../utils/mongoDbHandler');
const headers = require('../utils/headers');
const uploadImageToS3 = require('../utils/awsS3handler').uploadImageToS3;
const sendResponse = require('../utils/sendResponse');

const getImageBuffer = function (imageFromRequestBody) {
  return new Buffer(imageFromRequestBody, 'base64');
};

module.exports = (req, res) => {
    console.log(`Serving ${req.method} request for ${req.url} (inside requestHandler.postProfilePic)`);
    const imageBuffer = getImageBuffer(req.body.imageBuffer);
    const userEmail = req.body.email;
    console.log('userEmail: ', userEmail);
    uploadImageToS3(imageBuffer, (s3ImageLocation) => {
      console.log('LOCATION!', s3ImageLocation);
      sendResponse(res, 201, headers, `user profile pic saved at: ${s3ImageLocation}`);
    }, 'user-profile-pics1', userEmail);
};
