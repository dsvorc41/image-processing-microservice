const mongoHandler = require('../utils/mongoDbHandler');
const headers = require('../utils/headers');
// const uploadImageToS3 = require('../utils/awsS3handler').uploadImageToS3;
const analyzeImageViaGoogleVision = require('../utils/googleVisionHandler');
const sendResponse = require('../utils/sendResponse');

const getImageBuffer = function (imageFromRequestBody) {
  return new Buffer(imageFromRequestBody, 'base64');
};

module.exports = (req, res) => {
    ///////////////////////////////////////////////////////
    ///Response is only sent after google vision success///
    ///////////////////////////////////////////////////////
    console.log(`Serving ${req.method} request for ${req.url} (inside requestHandler.compareImage)`);
    const imageBuffer = getImageBuffer(req.body.imageBuffer);
    const { userImageLatitude, userImageLongitude } = req.body;

    // const newUser = new updateMongo.userData(item);
    const sendToGoogleVision = function (imageId) {
      analyzeImageViaGoogleVision(imageBuffer, (resultLabels) => {
        if (resultLabels[0] === 'error') {
          sendResponse(res, 404, headers, 'Error sending to Google Vision');
        } else {
          mongoHandler.compareImage(
            imageId,  
            resultLabels[1], 
            userImageLatitude, 
            userImageLongitude,
            (statusCode, message) => {
              sendResponse(res, statusCode, headers, message);
            });
        }
      });
    };

    sendToGoogleVision(req.body.referenceImageId);
};
