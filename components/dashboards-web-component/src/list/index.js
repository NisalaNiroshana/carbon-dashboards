import axios from 'axios';

let instance = axios.create({
    baseURL: 'http://localhost:8082/app',
    timeout: 2000,
    headers: {'Content-type': 'application/json'}
});

Object.defineProperty(exports, "__esModule", {
    value: true
});

instance.get('/widgetinfo').then(function (response) {
    console.log(response.data);
    for (let widget of response.data) {
        console.log(widget.widgetName);
        var _App2 = require("./"+widget.widgetName);
        var App = widget.widgetName;
        var _App3 = _interopRequireDefault(_App2);
        function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
        exports[App] = _App3.default;
    }

}).catch(function (error) {
    console.log(error);
});



// //exports.App = undefined;
//
// var _App2 = require("./App");
//
// var _App3 = _interopRequireDefault(_App2);
//
// function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//
// exports.App = _App3.default;