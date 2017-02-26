const sendResponse = function (res, statusCode, headersSent, responseMessage) {
  console.log('HEEEEEEEEY', responseMessage);
  res.writeHead(statusCode, headersSent);
  res.end(responseMessage);
};

module.exports = sendResponse;
