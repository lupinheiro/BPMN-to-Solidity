"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const logger = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require('mongoose');
const models_controller_1 = require("./models/models.controller");
var favicon = require('serve-favicon');
const app = require('express')();
app.use(favicon(__dirname + '/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', models_controller_1.default);
// catch 404 and forward to error handler
/*app.use((req, res, next) => {
    var err = new Error('Not Found');
    err['status'] = 404;
    next(err);
});
*/


// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((error, req, res, next) => {
        console.log(error);
        res.status(error['status'] || 500);
        res.json({
            message: error.message,
            error
        });
    });
}
// production error handler
// no stacktraces leaked to user
app.use((error, req, res, next) => {
    res.status(error['status'] || 500);
    res.json({
        message: error.message,
        error: {}
    });
    return null;
});

var promise = mongoose.connect('mongodb://localhost:27017/ProjetoIV',function (error) {
  useMongoClient: true;
  if (error) {
    throw error;
}
else {
    console.log('Conectado a MongoDB');
}
});

exports.default = app;
//# sourceMappingURL=app.js.map