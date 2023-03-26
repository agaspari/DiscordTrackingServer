const mysql = require('mysql');

const con = mysql.createConnection({
    host: "",
    user: "",
    password: "",
    database: "DiscordTracking",
    charset : 'utf8mb4',
    supportBigNumbers: true // To support BIGINT database values
});

export function initalizeConnection() {
    con.connect(function(err) {
        if (err) throw err;
        console.log("Database Connection Initialized.");
    });
}

export function fetchQuery(query, params, callback) {
    console.log("Debug: ", query, params);
    con.query(query, params, function (err, result) {
        if (err) throw err;

        callback(result);
    });
}

export function executeQuery(query, params, callback) {
    console.log(query, params);
    con.query(query, [[ params ]], function (err, result) {
        if (err) throw err;
        
        if (callback) callback(result);
    });
}

export function updateQuery(query, params, callback) {
    console.log(query, params);
    con.query(query, params, function (err, result) {
        if (err) throw err;
        
        if (callback) callback(result);
    });
}