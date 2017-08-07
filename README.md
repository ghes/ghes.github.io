# ghes.github.io

Github Enhancement Suite website

## Using https://ghes.github.io/api/oauth/

The GitHub Enhancement Suite website features a page for extensions to use to
acquire GitHub API tokens.

To engage with this page's API, you must have access to its page context's
`window`. If your script includes `@grant none` in its [metadata block][], it
will run in the page's context, and this will just be exposed to it as
`window`; however, if the script uses `@grant` with any other value, it will
need to also add `@grant unsafeWindow`, where the page's window context will be
provided as `unsafeWindow`.

[metadata block]: https://wiki.greasespot.net/Metadata_Block

`requestAuth(scopes,name,callback)`

`name` can be an object with `name` and `purpose` properties, where `purpose`
is an object with scopes as keys and descriptions of what those scopes are used
for in your script. The `name` property is mandatory; the `purpose` property is
optional.

All three of these properties will not be used in the same page load; when the
page is loaded initially, the `scopes` list will be used (with `name` and
`purpose`) to list the scopes that will be requested in authorization, and the
`callback` will go unused. When the page is loaded in response to an
authorization on GitHub, the `scopes` list will be ignored (as the user will
already have been prompted with them), the `callback` function will be called
with the token (including the scopes it grants), and `acknowledge` function,
and the `name` will be used as the header for messages your script passes back
via `acknowledge`.

`callback(token,acknowledge)`

This callback will be called with the resulting token from an authorization.
Note that there is no guarantee that the given token will have all the scopes
you requested attached: the user may opt to not grant the requested scopes to
GitHub Enhancement Suite, in which case your script will need to acknowledge
that the given token is insufficient accordingly.

The token is provided to all scripts that call `requestAuth`, regardless of
whether or not it includes any or all of the scopes requested by the script, so
that the script may choose how to handle a token based on which scopes are
present; it may be enough for the script to use a given token, but with reduced
functionality.

`acknowledge` is a function that takes a string that serves as a message
representing the state of your extension in handling the token. It can be
called as many times as necessary to update the progress of your extension's
response to the given token (including a message of the token being ignored, if
the given scopes were insufficient). Once your script has fully processed and
stored the token, it should call `acknowledge` with the string `OK`.

Unlike the strings passed to `requestToken`, messages passed to `acknowledge`
are interpreted and presented **as HTML**, so you will need to escape `&gt;`,
`&lt;`, and `&amp;` accordingly.

It is recommended that, after getting the token, your userscript should use it
to request https://api.github.com/user and then save the token (via
`GM_setValue` or whatever storage solution your script employs) in a key that
pairs the token to (at least) the authorized user's `login`, as it's possible
for a script to be used by different logged-in GitHub users who are not
guaranteed to have separate storage contexts (eg. a user who logs out as
themselves and logs in with the user account of a bot that they manage).
