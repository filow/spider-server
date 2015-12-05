'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _cliColor = require('cli-color');

var _cliColor2 = _interopRequireDefault(_cliColor);

var color = {
  error: _cliColor2['default'].red.bold,
  warn: _cliColor2['default'].yellow,
  info: _cliColor2['default'].blue,
  success: _cliColor2['default'].green
};
function log(type, key, props) {
  var arr = [color[type]('[' + key.toUpperCase() + ']')].concat(props);
  console.log.apply(console, arr);
}
exports['default'] = {

  info: function info(key) {
    for (var _len = arguments.length, props = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      props[_key - 1] = arguments[_key];
    }

    log('info', key, props);
  },
  success: function success(key) {
    for (var _len2 = arguments.length, props = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      props[_key2 - 1] = arguments[_key2];
    }

    log('success', key, props);
  },
  warning: function warning(key) {
    for (var _len3 = arguments.length, props = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      props[_key3 - 1] = arguments[_key3];
    }

    log('warning', key, props);
  },
  error: function error(key) {
    for (var _len4 = arguments.length, props = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      props[_key4 - 1] = arguments[_key4];
    }

    log('error', key, props);
  }

};
module.exports = exports['default'];