var DataBase = function(nodeMongojs) {

    // default to a 'localhost' configuration:
    var connectionString = '127.0.0.1:27017/open';
    // if OPENSHIFT env variables are present, use the available connection info:
    if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
        connectionString = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
        process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
        process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
        process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
        process.env.OPENSHIFT_APP_NAME;
    }

    var db = nodeMongojs(connectionString, ['users']);

    db.users.findOne({'id':'test'}, function(e) {
        if (e) {

            // Assume there is no mongo server running.
            // Falling back to nedb.

            console.log("No mongodb server!");
            throw e;
        }
    });

    var save = function(doc, callback) {

        db.users.save(doc, function(err, user) {

            if (err) {
                console.log(err);
                throw new Error(err);
            }

            if (callback) callback(user);

        });

    };

    var remove = function(doc, callback) {

        db.users.remove(doc);

    };

    var find = function(doc, callback) {

        db.users.findOne(doc, function(err, user) {

            if (err) {
                console.log(err);
                throw new Error(err);
            }

            if (callback) callback(user);

        });

    };

    return {
        'save': save,
        'find': find,
        'remove': remove
    };
};

if (typeof module !== 'undefined') {
    module.exports = {
        'DataBase': DataBase
    };
}