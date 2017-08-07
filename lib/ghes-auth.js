/* global location fetch cre */

(function(){
  // Lousy hack to enforce HTTPS in GitHub Pages.
  if (location.protocol == 'http:') {
    location.protocol = 'https:';
  }
  // Another lousy redirect hack to enforce URL regularity.
  if (location.pathname == '/api/oauth/index.html') {
    location.pathname == '/api/oauth/';
  }

  var ghesGatekeeper = 'https://ghes-gatekeeper.glitch.me/authenticate/';
  var githubApiClientId = '89ddd80aec31ee7adddd';

  var requestedScopeLists = new Map();

  var tokenFetchPromise;

  var scopeSection;

  function goToGitHubAuthPage() {
    var scopeList = encodeURIComponent(requestedScopeLists.keys().join(' '));
    location.href = 'https://github.com/login/oauth/authorize?client_id=' +
      githubApiClientId + '&scope=' + scopeList;
  }

  function setupScopes() {
    var authButton = cre('button', {type: 'button'}, 'Authorize');
    var introSection = document.getElementById('intro');
    scopeSection = cre('#scopes');
    authButton.addEventListener('click', goToGitHubAuthPage);
    document.body.insertBefore(cre('div',[
      cre('p', 'GitHub Enhancement Suite scripts will request the following API scopes:'),
      scopeSection,
      authButton
    ]), introSection);
    document.body.removeChild(introSection);
  }

  function addScopeHeading(scope) {
    var scopeList = cre('ul');
    scopeSection.appendChild(cre([
      cre('h2', scope), scopeList
    ]));
    requestedScopeLists.set(scope, scopeList);
    return scopeList;
  }

  function addScopeRequest(scope, name, purpose) {
    var scopeList = requestedScopeLists.get(scope);
    if (!scopeList) scopeList = addScopeHeading(scope);
    var listItems = [cre('b', name)];
    if (purpose) listItems.push(': ' + purpose);
    scopeList.appendChild(cre('li', listItems));
  }

  window.requestAuth = function requestAuth(scopes, name, callback) {
    if (typeof name == "string") {
      name = {name: name};
    }
    if (typeof name.purpose != 'object') {
      name.purpose = {};
    }

    if (tokenFetchPromise) {
      // TODO: add item for reporting progress in UI
      tokenFetchPromise.then(function(token) {
        callback(token, function(message) {
          // TODO: Use aforementioned item for reporting progress in UI
          console.log(name.name + ': ' + message);
        });
      });
    } else {
      if (!scopeSection) setupScopes();
      for (var i = 0; i < scopes.length; ++i) {
        addScopeRequest(scopes[i], name.name, name.purpose[scopes[i]]);
      }
    }
  };

  // If this appears to be the GitHub auth response
  if (location.query && location.query.code) {
    // Request the token and put the page into "token response mode"
    tokenFetchPromise = fetch(ghesGatekeeper + location.query.code)
      .then(function (res) {return res.json()})
      // TODO: handle error case
      .then(function (body) {return body.token});
  }
  // else do nothing; we'll start populating UI on the first requestAuth call

})();
