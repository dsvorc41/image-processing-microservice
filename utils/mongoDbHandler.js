const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/test');

const usersSchema = new Schema({
  s3ImageLocation: String,
  GoogleVisionResultLabels: String,
  targetImageLatitude: String,
  targetImageLongitude: String,
  targetImageAllowedDistance: String
}, { collection: 'img' });

const compareImageLabels = function (referenceImageFromDBLabels, newImageLabels) {
  referenceImageFromDBLabels = JSON.parse(referenceImageFromDBLabels);
  const comaprisonObjectFilter = {};
  let similarityScore = 0;

  referenceImageFromDBLabels.forEach((label) => {
    comaprisonObjectFilter[label] = true;
  });

  newImageLabels.forEach((label) => {
    if (comaprisonObjectFilter[label]) {
      similarityScore += 1;
    }
  });
  return similarityScore / referenceImageFromDBLabels.length >= 0.5;
};

const model = mongoose.model('UserData', usersSchema);

const compareImageCoordinates = function (targetImgLat, targetImgLon, userImgLat, userImgLon) {
  //add + in front of values to convert them from strings to numbers
  const toRad = function (value) {
    return (value * Math.PI) / 180;
  };

  const EquirectangularDistance = function () {
    const R = 6371; // Earth radius in km
    const x = (toRad(+userImgLon) - toRad(+targetImgLon)) *
              Math.cos((toRad(+targetImgLat) + toRad(+userImgLat)) / 2);
    const y = (toRad(+userImgLat) - toRad(+targetImgLat));
    return Math.sqrt((x * x) + (y * y)) * R;
  };

  const result = EquirectangularDistance();
  return result;
};

module.exports = {
  userData: model,

  setImage: (s3ImageLocation, GoogleVisionResultLabels, targetImageLatitude, targetImageLongitude, targetImageAllowedDistance, respond) => {
    const update = { 
      s3ImageLocation: JSON.stringify(s3ImageLocation), 
      GoogleVisionResultLabels: JSON.stringify(GoogleVisionResultLabels),
      targetImageLatitude: JSON.stringify(targetImageLatitude),
      targetImageLongitude: JSON.stringify(targetImageLongitude), 
      targetImageAllowedDistance: JSON.stringify(targetImageAllowedDistance) 
    };

    const newImage = new model(update);
    newImage.save((err, savedEntry) => {
      if (err && respond) {
        respond(404, 'Error saving the image!');
      } else if (respond) {
        const responseData = {
          imageMongoId: savedEntry.id,
          s3ImageLocation: savedEntry.s3ImageLocation
        };
        respond(201, JSON.stringify(responseData));
      }
    });
    ///////////////////////////////////////////
    // Find the document
    // model.findOneAndUpdate(query, update, options, (error, result) => {
    //     // console.log('RESULT', result);
    //     result = result || new model(query);
        
    //     result.save((error, savedEntry) => {
    //       if (error && respond) {
    //         respond(404, 'Error saving the image!');
    //       } else if (respond) {
    //         respond(201, savedEntry.id);
    //       }
    //     });
    // });
    //////////////////////////////////////////
  },

  compareImage: (comparisonImageId, googleImageLabelsToCompare, userImageLatitude, userImageLongitude, respond) => {
    const query = { _id: comparisonImageId };
    model.findOne(query, {}, (err, imageFromDB) => {
      if (err || !imageFromDB) {
        respond(201, 'Error finding the image!');
      } else if (imageFromDB) {
        const coordinatesComparison = compareImageCoordinates(
          imageFromDB.targetImageLatitude, 
          imageFromDB.targetImageLongitude, 
          userImageLatitude,
          userImageLongitude
        );

        const labelComparison = compareImageLabels(
          imageFromDB.GoogleVisionResultLabels, 
          googleImageLabelsToCompare
        );

        ///////////////////////////////////////////
        ///HARDCODED DISTANCE < 1km//////////
        ///MODIFY THIS TO ACCEPT DYNAMIC DISTANCE///
        ///////////////////////////////////////////

        const withinDistance = coordinatesComparison <= (+imageFromDB.targetImageAllowedDistance);

        if (labelComparison && withinDistance) {
          respond(201, 'Images are the same!');
        } else if (labelComparison && !withinDistance) {
          respond(201, `You need to get within ${+imageFromDB.targetImageAllowedDistance}km \
                        and then take the picture!`);
        } else {
          respond(201, 'Images are not the same!');
        }
      } else {
          respond(201, 'Images not found in the database!');
      }
    });
  }
};

