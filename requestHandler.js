const sendResponse = require('./utils/sendResponse')
const setImageHandler = require('./imageHandler/setImage');
const compareImageHandler = require('./imageHandler/compareImage');

module.exports = {
  landing: (req, res) => { 
    console.log(`Serving ${req.method} request for ${req.url} (inside requestHandler.landing)`);
    sendResponse(res, 200, '', 'Welcome the image service for Crustaceans thesis project!');
  },

  setImage: (req, res) => {
    setImageHandler(req, res);
  },

  compareImage: (req, res) => {
    compareImageHandler(req, res);
  }
};

