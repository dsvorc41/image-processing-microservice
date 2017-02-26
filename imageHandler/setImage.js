const mongoHandler = require('../utils/mongoDbHandler');
const headers = require('../utils/headers');
const uploadImageToS3 = require('../utils/awsS3handler').uploadImageToS3;
const analyzeImageViaGoogleVision = require('../utils/googleVisionHandler');
const sendResponse = require('../utils/sendResponse.js');

const getImageBuffer = function (imageFromRequestBody) {
  return new Buffer(imageFromRequestBody, 'base64');
};

module.exports = (req, res) => {
    console.log(`Serving ${req.method} request for ${req.url} (inside requestHandler.postImage)`);
    const imageBuffer = getImageBuffer(req.body.imageBuffer);

    const sendToGoogleVision = function(s3ImageLocation) {
      analyzeImageViaGoogleVision(imageBuffer, (googleImageLabels) => {
        if (googleImageLabels[0] === 'error') {

          console.log('Error analyzing with Google', googleImageLabels[1]);
        } else {
         mongoHandler.setImage(
          s3ImageLocation, 
          googleImageLabels[1],
          (statusCode, message) => {
            console.log('ANALYZE');
            console.log(sendResponse);
            sendResponse(res, statusCode, headers, message);
          });
        }
      });
    };
    
    // const newUser = new updateMongo.userData(item);
    uploadImageToS3(imageBuffer, (s3ImageLocation) => {
      console.log('LOCATION!', s3ImageLocation)
      if (s3ImageLocation[0] === 'error') {
        console.log('Error storing to S3');
      } else {
        sendToGoogleVision(s3ImageLocation[1]);
      }
    });
};
