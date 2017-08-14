(function (){
  var Chat = function(params){
    // var {host, port, uid, nickname, channelID, channelToken, queryEntryRoute, enterChatroomRoute, leaveChatroomRoute} = params;
    if (params.host &&
      params.port &&
      params.uid &&
      params.nickname &&
      params.channelID &&
      params.channelToken &&
      params.queryEntryRoute &&
      params.enterChatroomRoute &&
      params.leaveChatroomRoute){
      this.init(params);
    }else{
      console.error("缺少参数");
      return null;
    }
  };
  Chat.prototype.pomelo = window.pomelo;
  Chat.prototype.on = window.pomelo.on;

  /*初始化直播房间
   * @param {Object} params include host,port,uid,nickname,channelID, channelToken,queryEntryRoute and enterStudioRoute
   * @param {Function} callback
   */

  Chat.prototype.init = function (params, cb) {
    this.params = params;
    this.queryEntry(params.host, params.port, params.queryEntryRoute, params.uid, function (host, port, userID) {
      this.pomelo.init({ /*连接connector服务器*/
        host: host,
        port: port,
        log: true
      }, function () {
        this.enterChatroom(params.enterChatroomRoute, userID, params.nickname, params.channelID, params.channelToken, cb);
      });
    });
  };
  /*请求gate为用户分配connector服务器
   * @param {String} request route ps:"gate.gateHandler.queryEntry"
   * @param {String} userID
   * @param {Function} callback
   */

  Chat.prototype.queryEntry = function (host, port, route, uid, callback) {
    this.pomelo.init({
      host: host,
      port: port,
      log: true
    }, function () {
      this.pomelo.request(route, {uid: uid}, function (data) {
        this.pomelo.disconnect(); //断开gate服务器
        if (data.code !== 500) {
          callback(data.host, data.port, data.userID);
        }
      });
    });
  };

  /*进入直播房间
   * @param {String} request route ps:"connector.entryHandler.entry"
   * @param {String} userID
   * @param {String} nickname
   * @param {String} channelID
   * @param {String} channelToken
   * @param {Function} callback
   */

  Chat.prototype.enterChatroom = function (route, userID, nickname, channelID, channelToken, cb) {
    switch (arguments.length){
      case 5:
        cb = channelToken;
        channelToken = channelID;
        channelID = nickname;
        nickname = userID;
        userID = route;
        route = this.params.enterChatroomRoute;
        break;
      case 6:
        break;
      default:
        return;
    }
    this.pomelo.request(route, {
      userID: userID,
      nickname: nickname,
      channelToken: channelToken,
      channelID: channelID
    }, cb);
  };

  /*发送聊天消息
   * @param {String} request route ps:"Chat.ChatHandler.publicSend"
   * @param {Object} params include content and target
   * @param {Function} callback
   */

  Chat.prototype.sendMessage = function (route, obj, cb) {
    if (typeof route !== "string") {
      obj = route;
      route = obj.route;
    }
    this.pomelo.request(route, {
      content: obj.content,
      target: obj.target
    }, cb);
  };

  /*退出房间
   * @param {String} request route ps:"connector.entryHandler.leave"
   * @param {Function} callback
   */

  Chat.prototype.leaveChatroom = function (route, cb) {
    switch (arguments.length){
      case 1:
        cb = route;
        route = this.params.leaveChatroomRoute;
        break;
      case 2:
        break;
      default:
        return;
    }
    this.pomelo.request(route, cb);
  };

  module.exports = Chat;
})();