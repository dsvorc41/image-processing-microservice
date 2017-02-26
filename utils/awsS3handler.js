const AWS = require('aws-sdk');
AWS.config.loadFromPath('awsConfig.json');
const s3 = new AWS.S3();

module.exports = {
  uploadImageToS3: function (imageBuffer, callback) {
    const randomImageName = `Dan-${Math.random().toString().slice(2)}.jpg`;

    const params = {
      Bucket: 'set-image-folder',
      Key: randomImageName,
      Body: imageBuffer
    };

    s3.upload(params, (err, data) => {
      if (data) {
        console.log('Upload Success ', data.Location);
        callback(['success', data.Location]);
      } if (err) {
        console.log('Upload Error ', err);
        callback(['error', err]);
      } 
    }); 
  }
};

