const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/test');

const usersSchema = new Schema({
  s3ImageLocation: String,
  GoogleVisionResultLabels: String,
}, { collection: 'img' });

const compareImageLabels = function (referenceImageFromDBLabels, newImageLabels) {
  referenceImageFromDBLabels = JSON.parse(referenceImageFromDBLabels);
  // newImageLabels = JSON.parse(newImageLabels);
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
  console.log('Similarity Score: ', similarityScore / referenceImageFromDBLabels.length);
  return similarityScore / referenceImageFromDBLabels.length >= 0.5;
};
const model = mongoose.model('UserData', usersSchema);

module.exports = {
  userData: model,

  setImage: (s3ImageLocation, GoogleVisionResultLabels, respond) => {
    console.log('ANALYZE', respond);
    const query = {};
    const update = { s3ImageLocation: JSON.stringify(s3ImageLocation), GoogleVisionResultLabels: JSON.stringify(GoogleVisionResultLabels) };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };

    const newImage = new model(update);

    newImage.save((err, savedEntry) => {
      if (err && respond) {
        respond(404, 'Error saving the image!');
      } else if (respond) {
        respond(201, savedEntry.id);
      }
    })
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

  compareImage: (comparisonImageId, googleImageLabelsToCompare, respond) => {
    const query = { _id: comparisonImageId };
    model.findOne(query, {}, (err, imageFromDB) => {
      if (err || !imageFromDB) {
        console.log('Error finding the image', err);
        respond(201, 'Error finding the image!');
      } else if (imageFromDB) {
        console.log(imageFromDB);
        const comparison = compareImageLabels(imageFromDB.GoogleVisionResultLabels, googleImageLabelsToCompare);
        if (comparison) {
          respond(201, 'Images are the same!');
        } else {
          respond(201, 'Images are not the same!');
        }
      } else {
          respond(201, 'Images not found in the database!');
      }
    });
  }
};

