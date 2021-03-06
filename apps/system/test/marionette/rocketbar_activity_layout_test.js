'use strict';

var Bookmark = require('./lib/bookmark');
var EmeServer = require(
  '../../../../shared/test/integration/eme_server/parent');
var Rocketbar = require('./lib/rocketbar');

marionette('Rocketbar - Opened Activity From Search', function() {

  var client = marionette.client({
    prefs: {
      'focusmanager.testmode': true,
      'dom.w3c_touch_events.enabled': 1
    },
    settings: {
      'ftu.manifestURL': null,
      'lockscreen.enabled': false
    }
  });
  var actions, bookmark, home, rocketbar, search, server, system;

  suiteSetup(function(done) {
    EmeServer(client, function(err, _server) {
      server = _server;
      done(err);
    });
  });

  suiteTeardown(function(done) {
    server.close(done);
  });

  setup(function() {
    actions = client.loader.getActions();
    bookmark = new Bookmark(client);
    home = client.loader.getAppClass('verticalhome');
    rocketbar = new Rocketbar(client);
    search = client.loader.getAppClass('search');
    system = client.loader.getAppClass('system');
    system.waitForStartup();

    search.removeGeolocationPermission();
    EmeServer.setServerURL(client, server);
  });

  test('has proper layout', function() {
    var resultIdentifier = 'mozilla1.org/';

    rocketbar.homescreenFocus();
    rocketbar.enterText('mozilla');
    search.goToResults();
    var result = search.checkResult(resultIdentifier, 'Mozilla');
    actions.longPress(result, 1).perform();
    client.switchToFrame();

    client.helper.waitForElement('#search .contextmenu-list button').click();
    client.switchToFrame(bookmark.currentTabFrame);
    bookmark.bookmarkTitle.click();
    client.switchToFrame();
    var lastHeight;
    client.waitFor(function() {
      var newHeight = bookmark.currentTabFrame.size().height;
      var matches = newHeight === lastHeight;
      lastHeight = newHeight;
      var keyboardHeight = client.executeScript(function() {
        return window.wrappedJSObject.inputWindowManager.getHeight();
      });
      var frameRect = bookmark.currentTabFrame.scriptWith(function(el) {
        return el.getBoundingClientRect();
      });
      return matches && frameRect.bottom >= keyboardHeight;
    });
  });
});
