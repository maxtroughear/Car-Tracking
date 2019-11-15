const config = {};

config.appPort = 3004;

config.mongodb = {
	uri: 'mongodb://mongo:27017/cartracking?retryWrites=true&w=majority'
};

config.session = {
    secret: process.env.SECRET
};

config.adminExists = false;

config.maxLocationCount = process.env.MAXLOCATION;

module.exports = config;