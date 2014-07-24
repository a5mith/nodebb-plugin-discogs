/* jshint indent: 4 */

var	request = require('request'),
    async = module.parent.require('async'),
    winston = module.parent.require('winston'),
    S = module.parent.require('string'),
    meta = module.parent.require('./meta'),

    discogsRegex = /dc#\d+/gm,
    Embed = {},
    cache, appModule;

Embed.init = function(app, middleware, controllers) {
    appModule = app;
};

Embed.parse = function(raw, callback) {
    var discogsKeys = [],
        matches, cleanedText;

    cleanedText = S(raw).stripTags().s;
    matches = cleanedText.match(discogsRegex);

    if (matches && matches.length) {
        matches.forEach(function(match) {
            if (discogsKeys.indexOf(match) === -1) {
                discogsKeys.push(match);
            }
        });
    }

    async.map(discogsKeys, function(discogsKey, next) {
        if (cache.has(discogsKey)) {
            next(null, cache.get(discogsKey));
        } else {
            getComic(discogsKey, function(err, discogsObj) {
                if (err) {
                    return next(err);
                }

                cache.set(discogsKey, discogsObj);
                next(err, discogsObj);
            });
        }
    }, function(err, discoginfo) {
        if (!err) {
            // Filter out non-existant comics
            discogsinfo = discogsinfo.filter(function(issue) {
                return issue;
            });

            appModule.render('partials/discog-block', {
                discoginfo: discoginfo
            }, function(err, html) {
                callback(null, raw += html);
            });
        } else {
            winston.warn('Encountered an error parsing discog embed code, not continuing');
            callback(null, raw);
        }
    });
};

var getDiscog = function(discogsKey, callback) {
    var discogNum = discogsKey.split('#')[1];
    console.log('getting discog info', discogNum);

    request.get({
        url: 'http://api.discogs.com/database/search?catno=' + discogNum + '&type=release'
    }, function(err, response, body) {
        if (response.statusCode === 200) {
            callback(null, JSON.parse(body));
        } else {
            callback(err);
        }
    });
};

// Initial setup
cache = require('lru-cache')({
    maxAge: 1000*60*60*24,
    max: 100
});

module.exports = Embed;