"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.joinChannel = joinChannel;
exports.joinEveryChannel = joinEveryChannel;
exports.getNameFromSlackUser = getNameFromSlackUser;
exports.getAirtableRecordForSlackUser = getAirtableRecordForSlackUser;
exports.banUserFromChannel = banUserFromChannel;
exports.muteUserInChannel = muteUserInChannel;
exports.muteUserInSlack = muteUserInSlack;
exports.getActivePunishmentsForSlackUser = getActivePunishmentsForSlackUser;
exports.removeUserFromChannel = removeUserFromChannel;
exports.deleteMessage = deleteMessage;
exports.slackUserIsAdmin = slackUserIsAdmin;
exports.sendPm = sendPm;

var _webApi = require("@slack/web-api");

var airtable = _interopRequireWildcard(require("./airtable-util"));

var chrono = _interopRequireWildcard(require("chrono-node"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _asyncIterator(iterable) { var method; if (typeof Symbol !== "undefined") { if (Symbol.asyncIterator) { method = iterable[Symbol.asyncIterator]; if (method != null) return method.call(iterable); } if (Symbol.iterator) { method = iterable[Symbol.iterator]; if (method != null) return method.call(iterable); } } throw new TypeError("Object is not async iterable"); }

var token = process.env.SLACK_TOKEN;
var web = new _webApi.WebClient(token, {
  maxRequestConcurrency: 2
});
var web_admin = new _webApi.WebClient(process.env.SLACK_LEGACY_TOKEN);

function joinChannel(_x) {
  return _joinChannel.apply(this, arguments);
}

function _joinChannel() {
  _joinChannel = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(channelId) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return web.conversations.join({
              channel: channelId
            });

          case 2:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _joinChannel.apply(this, arguments);
}

function joinEveryChannel() {
  return _joinEveryChannel.apply(this, arguments);
}

function _joinEveryChannel() {
  _joinEveryChannel = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3() {
    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, page;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _context3.prev = 2;
            _iterator = _asyncIterator(web.paginate('conversations.list', {
              types: 'public_channel',
              exclude_archived: true
            }));

          case 4:
            _context3.next = 6;
            return _iterator.next();

          case 6:
            _step = _context3.sent;
            _iteratorNormalCompletion = _step.done;
            _context3.next = 10;
            return _step.value;

          case 10:
            _value = _context3.sent;

            if (_iteratorNormalCompletion) {
              _context3.next = 17;
              break;
            }

            page = _value;
            page.channels.filter(function (c) {
              return c.num_members > 0 && c.is_member == false;
            }).forEach(
            /*#__PURE__*/
            function () {
              var _ref = _asyncToGenerator(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee2(c) {
                var id;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        id = c.id;
                        _context2.next = 3;
                        return joinChannel(id);

                      case 3:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2);
              }));

              return function (_x27) {
                return _ref.apply(this, arguments);
              };
            }());

          case 14:
            _iteratorNormalCompletion = true;
            _context3.next = 4;
            break;

          case 17:
            _context3.next = 23;
            break;

          case 19:
            _context3.prev = 19;
            _context3.t0 = _context3["catch"](2);
            _didIteratorError = true;
            _iteratorError = _context3.t0;

          case 23:
            _context3.prev = 23;
            _context3.prev = 24;

            if (!(!_iteratorNormalCompletion && _iterator["return"] != null)) {
              _context3.next = 28;
              break;
            }

            _context3.next = 28;
            return _iterator["return"]();

          case 28:
            _context3.prev = 28;

            if (!_didIteratorError) {
              _context3.next = 31;
              break;
            }

            throw _iteratorError;

          case 31:
            return _context3.finish(28);

          case 32:
            return _context3.finish(23);

          case 33:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[2, 19, 23, 33], [24,, 28, 32]]);
  }));
  return _joinEveryChannel.apply(this, arguments);
}

function getNameFromSlackUser(_x2) {
  return _getNameFromSlackUser.apply(this, arguments);
}

function _getNameFromSlackUser() {
  _getNameFromSlackUser = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4(userId) {
    var user;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return web.users.info({
              user: userId
            });

          case 2:
            user = _context4.sent;
            return _context4.abrupt("return", user.user.real_name);

          case 4:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _getNameFromSlackUser.apply(this, arguments);
}

function getAirtableRecordForSlackUser(_x3) {
  return _getAirtableRecordForSlackUser.apply(this, arguments);
}

function _getAirtableRecordForSlackUser() {
  _getAirtableRecordForSlackUser = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee5(userId) {
    var result, user, givenName, record;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return airtable.airFind('Users', 'Slack ID', userId);

          case 2:
            result = _context5.sent;

            if (result) {
              _context5.next = 14;
              break;
            }

            _context5.next = 6;
            return web.users.info({
              user: userId
            });

          case 6:
            user = _context5.sent;
            givenName = user.user.real_name;
            _context5.next = 10;
            return airtable.airCreate('Users', {
              'Slack ID': userId,
              'Given Name': givenName
            });

          case 10:
            record = _context5.sent;
            return _context5.abrupt("return", record);

          case 14:
            return _context5.abrupt("return", result);

          case 15:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _getAirtableRecordForSlackUser.apply(this, arguments);
}

function banUserFromChannel(_x4, _x5, _x6, _x7, _x8) {
  return _banUserFromChannel.apply(this, arguments);
}

function _banUserFromChannel() {
  _banUserFromChannel = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee6(modUserId, userId, channelId, reason, time) {
    var user, modName, record;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return getAirtableRecordForSlackUser(userId);

          case 2:
            user = _context6.sent;
            _context6.next = 5;
            return getNameFromSlackUser(modUserId);

          case 5:
            modName = _context6.sent;
            _context6.next = 8;
            return airtable.airCreate('Punishments', {
              For: [user.id],
              Type: 'channel_ban',
              'Channel ID': channelId,
              'Given At': Date.now(),
              'Valid Until': chrono.parseDate(time + ' from now'),
              Reason: reason,
              'Moderator Name': modName
            });

          case 8:
            record = _context6.sent;
            return _context6.abrupt("return", record);

          case 10:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _banUserFromChannel.apply(this, arguments);
}

function muteUserInChannel(_x9, _x10, _x11, _x12, _x13) {
  return _muteUserInChannel.apply(this, arguments);
}

function _muteUserInChannel() {
  _muteUserInChannel = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee7(modUserId, userId, channelId, reason, time) {
    var user, modName, record;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return getAirtableRecordForSlackUser(userId);

          case 2:
            user = _context7.sent;
            _context7.next = 5;
            return getNameFromSlackUser(modUserId);

          case 5:
            modName = _context7.sent;
            _context7.next = 8;
            return airtable.airCreate('Punishments', {
              For: [user.id],
              Type: 'channel_mute',
              'Channel ID': channelId,
              'Given At': Date.now(),
              'Valid Until': chrono.parseDate(time + ' from now'),
              Reason: reason,
              'Moderator Name': modName
            });

          case 8:
            record = _context7.sent;
            return _context7.abrupt("return", record);

          case 10:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));
  return _muteUserInChannel.apply(this, arguments);
}

function muteUserInSlack(_x14, _x15, _x16, _x17) {
  return _muteUserInSlack.apply(this, arguments);
}

function _muteUserInSlack() {
  _muteUserInSlack = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee8(modUserId, userId, reason, time) {
    var user, modName, record;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return getAirtableRecordForSlackUser(userId);

          case 2:
            user = _context8.sent;
            _context8.next = 5;
            return getNameFromSlackUser(modUserId);

          case 5:
            modName = _context8.sent;
            _context8.next = 8;
            return airtable.airCreate('Punishments', {
              For: [user.id],
              Type: 'full_mute',
              'Given At': Date.now(),
              'Valid Until': chrono.parseDate(time + ' from now'),
              Reason: reason,
              'Moderator Name': modName
            });

          case 8:
            record = _context8.sent;
            return _context8.abrupt("return", record);

          case 10:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));
  return _muteUserInSlack.apply(this, arguments);
}

function getActivePunishmentsForSlackUser(_x18, _x19) {
  return _getActivePunishmentsForSlackUser.apply(this, arguments);
}

function _getActivePunishmentsForSlackUser() {
  _getActivePunishmentsForSlackUser = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee9(userId, type) {
    var airtableUser, records;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return getAirtableRecordForSlackUser(userId);

          case 2:
            airtableUser = _context9.sent;
            _context9.t0 = type;
            _context9.next = _context9.t0 === 'channel_ban' ? 6 : _context9.t0 === 'channel_mute' ? 10 : _context9.t0 === 'full_mute' ? 14 : 18;
            break;

          case 6:
            _context9.next = 8;
            return airtable.airGet('Punishments', 'AND({For} = "' + userId + '", {Type} = "channel_ban", IS_AFTER({Valid Until}, NOW()) = 1)');

          case 8:
            records = _context9.sent;
            return _context9.abrupt("break", 21);

          case 10:
            _context9.next = 12;
            return airtable.airGet('Punishments', 'AND({For} = "' + userId + '", {Type} = "channel_mute", IS_AFTER({Valid Until}, NOW()) = 1)');

          case 12:
            records = _context9.sent;
            return _context9.abrupt("break", 21);

          case 14:
            _context9.next = 16;
            return airtable.airGet('Punishments', 'AND({For} = "' + userId + '", {Type} = "full_mute", IS_AFTER({Valid Until}, NOW()) = 1)');

          case 16:
            records = _context9.sent;
            return _context9.abrupt("break", 21);

          case 18:
            _context9.next = 20;
            return airtable.airGet('Punishments', 'AND({For} = "' + userId + '", IS_AFTER({Valid Until}, NOW()) = 1)');

          case 20:
            records = _context9.sent;

          case 21:
            return _context9.abrupt("return", records);

          case 22:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));
  return _getActivePunishmentsForSlackUser.apply(this, arguments);
}

function removeUserFromChannel(_x20, _x21) {
  return _removeUserFromChannel.apply(this, arguments);
}

function _removeUserFromChannel() {
  _removeUserFromChannel = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee10(userId, channelId) {
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return web_admin.conversations.kick({
              channel: channelId,
              user: userId
            });

          case 2:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));
  return _removeUserFromChannel.apply(this, arguments);
}

function deleteMessage(_x22, _x23) {
  return _deleteMessage.apply(this, arguments);
}

function _deleteMessage() {
  _deleteMessage = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee11(channelId, messageTs) {
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.next = 2;
            return web_admin.chat["delete"]({
              channel: channelId,
              ts: messageTs
            });

          case 2:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));
  return _deleteMessage.apply(this, arguments);
}

function slackUserIsAdmin(_x24) {
  return _slackUserIsAdmin.apply(this, arguments);
}

function _slackUserIsAdmin() {
  _slackUserIsAdmin = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee12(userId) {
    var response;
    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            _context12.next = 2;
            return web.users.info({
              user: userId
            });

          case 2:
            response = _context12.sent;
            return _context12.abrupt("return", response.user.is_admin);

          case 4:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12);
  }));
  return _slackUserIsAdmin.apply(this, arguments);
}

function sendPm(_x25, _x26) {
  return _sendPm.apply(this, arguments);
}

function _sendPm() {
  _sendPm = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee13(userId, message) {
    var response;
    return regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _context13.next = 2;
            return web.conversations.open({
              users: userId
            });

          case 2:
            response = _context13.sent;
            _context13.next = 5;
            return web.chat.postMessage({
              channel: response.channel.id,
              text: message
            });

          case 5:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13);
  }));
  return _sendPm.apply(this, arguments);
}
//# sourceMappingURL=util.js.map