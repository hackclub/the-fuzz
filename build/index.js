"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

require("@babel/polyfill");

var util = _interopRequireWildcard(require("./util"));

var chrono = _interopRequireWildcard(require("chrono-node"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// pull ENV variables
require('dotenv').config();

var _require = require('@slack/events-api'),
    createEventAdapter = _require.createEventAdapter;

var slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
var slackEvents = createEventAdapter(slackSigningSecret);
var port = process.env.PORT || 3000;
slackEvents.on('channel_created', /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(event) {
    var channelId;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            channelId = event.channel.id; // bot should be in every public channel

            _context.next = 3;
            return util.joinChannel(channelId);

          case 3:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());
slackEvents.on('channel_left', /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(event) {
    var channelId;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            channelId = event.channel; // the bot is everpresent and is not allowed to leave channels

            _context2.next = 3;
            return util.joinChannel(channelId);

          case 3:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x2) {
    return _ref2.apply(this, arguments);
  };
}());
slackEvents.on('member_joined_channel', /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(event) {
    var punishments;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return util.getActivePunishmentsForSlackUser(event.user, 'channel_ban');

          case 2:
            punishments = _context4.sent;

            if (!(punishments.length == 0)) {
              _context4.next = 5;
              break;
            }

            return _context4.abrupt("return");

          case 5:
            punishments.forEach( /*#__PURE__*/function () {
              var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(p) {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        // punishment is valid
                        if (event.channel == p.fields['Channel ID']) {
                          util.removeUserFromChannel(event.user, event.channel); // we should send a message here as to why the removal
                        }

                      case 1:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3);
              }));

              return function (_x4) {
                return _ref4.apply(this, arguments);
              };
            }());

          case 6:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function (_x3) {
    return _ref3.apply(this, arguments);
  };
}()); // handles mutes and removal of messages from people who try to get small bits of text out when banned

slackEvents.on('message', /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(event) {
    var isAdmin, message, user, time, reason, _user, channel, _time, _reason, _user2, _channel, _time2, _reason2, punishments;

    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            if (!(event.user == undefined)) {
              _context6.next = 2;
              break;
            }

            return _context6.abrupt("return");

          case 2:
            if (!(event.channel_type == 'im')) {
              _context6.next = 11;
              break;
            }

            _context6.next = 5;
            return util.slackUserIsAdmin(event.user);

          case 5:
            isAdmin = _context6.sent;

            if (isAdmin) {
              _context6.next = 9;
              break;
            }

            util.sendPm(event.user, '🕶️');
            return _context6.abrupt("return");

          case 9:
            message = event.text;

            if (message.startsWith('mute')) {
              // mute @name for 20 minutes because they were being a jerk
              user = new RegExp(/(?<=mute\s).*.+?(?=\sfor)/).exec(message)[0].replace('<@', '').replace('>', '');
              time = new RegExp(/(?<=for\s).*.+?(?=\sbecause)/).exec(message)[0];
              reason = new RegExp(/(?<=because\s).*/).exec(message)[0];
              util.sendPm(event.user, 'Muting <@' + user + '> globally for ' + time + ' because ' + reason + '...');
              util.muteUserInSlack(event.user, user, reason, time);
              util.sendPm(event.user, '<@' + user + '>' + ' has been muted globally!');
              util.sendPm(user, 'You have been muted globally for reason: ' + reason + ". Please contact someone in <!subteam^S0DJXPY14|staff> if you have any questions. You'll be good to go again in " + time);
            } else if (message.startsWith('channel mute')) {
              // channel mute @name in #channel for 20 minutes because they were being a jerk
              _user = new RegExp(/(?<=mute\s).*.+?(?=\sin)/).exec(message)[0].replace('<@', '').replace('>', '');
              channel = new RegExp(/(?<=in\s).*.+?(?=\sfor)/).exec(message)[0].match(/(?<=\#)(.*?)(?=\|)/)[0];
              _time = new RegExp(/(?<=for\s).*.+?(?=\sbecause)/).exec(message)[0];
              _reason = new RegExp(/(?<=because\s).*/).exec(message)[0];
              util.sendPm(event.user, 'Muting <@' + _user + '> in <#' + channel + '> for ' + _time + ' because ' + _reason + '...');
              util.muteUserInChannel(event.user, _user, channel, _reason, _time);
              util.sendPm(event.user, '<@' + _user + '> has been muted for ' + _time + ' in <#' + channel + '>!');
              util.sendPm(_user, 'You have been muted in <#' + channel + '> for ' + _time + ' for reason: ' + _reason + ". Please contact someone in <!subteam^S0DJXPY14|staff> if you have any questions. You'll be good to go again in " + _time);
            } else if (message.startsWith('ban')) {
              // ban @name from #channel for 20 minutes because they were a jerk
              _user2 = new RegExp(/(?<=ban\s).*.+?(?=\sfrom)/).exec(message)[0].replace('<@', '').replace('>', '');
              _channel = new RegExp(/(?<=from\s).*.+?(?=\sfor)/).exec(message)[0].match(/(?<=\#)(.*?)(?=\|)/)[0];
              _time2 = new RegExp(/(?<=for\s).*.+?(?=\sbecause)/).exec(message)[0];
              _reason2 = new RegExp(/(?<=because\s).*/).exec(message)[0];
              util.sendPm(event.user, 'Banning <@' + _user2 + '> from <#' + _channel + '> for ' + _time2 + ' because ' + _reason2 + '...');
              util.removeUserFromChannel(_user2, _channel);
              util.banUserFromChannel(event.user, _user2, _channel, _reason2, _time2);
              util.sendPm('<@' + _user2 + '> has been banned from <#' + _channel + '> for ' + _time2 + '!');
              util.sendPm(_user2, 'You have been banned from <#' + _channel + '> for ' + _time2 + ' for reason: ' + _reason2 + ". Please contact someone in <!subteam^S0DJXPY14|staff> if you have any questions. You'll be good to go again in " + _time2);
            }

          case 11:
            if (!(event.subtype == 'message_deleted' || event.subtype == 'message_changed')) {
              _context6.next = 13;
              break;
            }

            return _context6.abrupt("return");

          case 13:
            _context6.next = 15;
            return util.getActivePunishmentsForSlackUser(event.user, 'all');

          case 15:
            punishments = _context6.sent;

            if (!(punishments.length == 0)) {
              _context6.next = 18;
              break;
            }

            return _context6.abrupt("return");

          case 18:
            punishments.forEach( /*#__PURE__*/function () {
              var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(p) {
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        if ((p.fields['Type'] == 'channel_ban' || p.fields['Type'] == 'channel_mute') && event.channel == p.fields['Channel ID']) {
                          util.deleteMessage(event.channel, event.ts);
                        }

                        if (p.fields['Type'] == 'full_mute') {
                          util.deleteMessage(event.channel, event.ts);
                        }

                      case 2:
                      case "end":
                        return _context5.stop();
                    }
                  }
                }, _callee5);
              }));

              return function (_x6) {
                return _ref6.apply(this, arguments);
              };
            }());

          case 19:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function (_x5) {
    return _ref5.apply(this, arguments);
  };
}());

_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
  var server;
  return regeneratorRuntime.wrap(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return slackEvents.start(port);

        case 2:
          server = _context7.sent;
          console.log("Listening for events on ".concat(server.address().port)); // let punishments = await util.getActivePunishmentsForSlackUser('UE8DH0UHM', 'channel_ban')
          // console.log(punishments)

        case 4:
        case "end":
          return _context7.stop();
      }
    }
  }, _callee7);
}))();
//# sourceMappingURL=index.js.map