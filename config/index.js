const config = {};

config.appPort = 3004;

config.mongodb = {
    uri: 'mongodb+srv://admin:pZlVuvhCVRY5oVoS@cluster0-vztbn.mongodb.net/cartracking?retryWrites=true&w=majority'
    // uri: 'mongodb://localhost/cartracking?retryWrites=true&w=majority',
    // uri2: 'mongodb+srv://admin:pZlVuvhCVRY5oVoS@cluster0-vztbn.mongodb.net/cartracking?retryWrites=true&w=majority'
};

config.session = {
    secret: 'oifdnJ@ij(*HRT*#h8&*^765^&V%cv$#%^&V78b^RctUYT'
};

config.maxLocationCount = 10;

module.exports = config;