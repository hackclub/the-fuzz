"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.airGet = exports.airFind = exports.airCreate = exports.airPatch = void 0;

var _bottleneck = _interopRequireDefault(require("bottleneck"));

var _airtable = _interopRequireDefault(require("airtable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

require('dotenv').config();

var bases = {};
bases.moderation = new _airtable["default"]({
  apiKey: process.env.AIRTABLE_KEY
}).base(process.env.MODERATION_BASE);
var airtableRatelimiter = new _bottleneck["default"]({
  // maxConcurrent: 5,
  minTime: 200
});

var airPatch = function airPatch(tableName, recordID, values) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  return airtableRatelimiter.schedule({
    priority: options.priority || 5
  }, function () {
    return new Promise(function (resolve, reject) {
      var timestamp = Date.now(); // console.log(
      //   `I'm asking Airtable to patch ${recordID} record in ${tableName} base at ${timestamp} with the new values: ${JSON.stringify(
      //     values
      //   )}`
      // )

      var base = bases[options.base || 'operations'];
      base(tableName).update(recordID, values, function (err, record) {
        if (err) {
          console.error(err);
          reject(err);
        } // console.log(
        //   `Airtable updated my ${tableName} record from ${timestamp} in ${Date.now() -
        //     timestamp}ms`
        // )


        resolve(record);
      });
    });
  });
};

exports.airPatch = airPatch;

var airCreate = function airCreate(tableName, fields) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return airtableRatelimiter.schedule({
    priority: options.priority || 5
  }, function () {
    return new Promise(function (resolve, reject) {
      var timestamp = Date.now(); // console.log(
      //   `I'm asking Airtable to create a new record in the ${tableName} base at ${timestamp}`
      // )

      var base = bases[options.base || 'moderation'];
      base(tableName).create(fields, function (err, record) {
        if (err) {
          console.error(err);
          reject(err);
        }

        if (!record) {
          reject(new Error('Record not created'));
        } // console.log(
        //   `Airtable saved my ${tableName} record from ${timestamp} in ${Date.now() -
        //     timestamp}ms`
        // )


        resolve(record);
      });
    });
  });
};

exports.airCreate = airCreate;

var airFind =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(tableName, fieldName, value) {
    var options,
        records,
        _args = arguments;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            options = _args.length > 3 && _args[3] !== undefined ? _args[3] : {};
            _context.next = 3;
            return airGet(tableName, fieldName, value, _objectSpread({}, options, {
              selectBy: _objectSpread({}, options.selectBy, {
                maxRecords: 1
              })
            }));

          case 3:
            records = _context.sent;
            return _context.abrupt("return", (records || [])[0]);

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function airFind(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

exports.airFind = airFind;

var airGet = function airGet(tableName) {
  var searchArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var tertiaryArg = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  return airtableRatelimiter.schedule({
    priority: options.priority || 5
  }, function () {
    return new Promise(function (resolve, reject) {
      // usage:
      // for key/value lookup: `airGet('Clubs', 'Slack Channel ID', slackChannelID)`
      // for formula lookup: `airGet('Clubs', '{Slack Channel ID} = BLANK()')`
      // for all records: `airGet('People')`
      var timestamp = Date.now();
      var selectBy = options.selectBy || {};

      if (searchArg === null) {// console.log(
        //   `I'm asking AirTable to send me ALL records in the "${tableName}" base. The timestamp is ${timestamp}`
        // )
      } else {
        if (tertiaryArg) {
          // this is a key/value lookup
          selectBy.filterByFormula = "{".concat(searchArg, "} = \"").concat(tertiaryArg, "\"");
        } else {
          // this is a formula lookup
          selectBy.filterByFormula = searchArg;
        } // console.log(
        //   `I wrote a query & sent it to AirTable with a timestamp of ${timestamp}: BASE=\`${tableName}\` FILTER=\`${selectBy.filterByFormula}\``
        // )

      }

      var base = bases[options.base || 'moderation'];
      base(tableName).select(selectBy).all(function (err, data) {
        if (err) {
          console.error(err);
          reject(err);
        } // console.log(
        //   `AirTable got back to me from my question at ${timestamp} with ${
        //     data.length
        //   } records. The query took ${Date.now() - timestamp}ms`
        // )


        resolve(data);
      });
    });
  });
};

exports.airGet = airGet;
//# sourceMappingURL=airtable-util.js.map