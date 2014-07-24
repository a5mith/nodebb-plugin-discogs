/* jshint indent: 4 */

var	request = require('request'),
    async = module.parent.require('async'),
    winston = module.parent.require('winston'),
    S = module.parent.require('string'),
    meta = module.parent.require('./meta'),

    discogsRegex = /dc#\w+/gm,
    Embed = {},
    cache, appModule;

Embed.init = function(app, middleware, controllers, callback) {
    appModule = app;

    callback();
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
            getDiscog(discogsKey, function(err, discogsObj) {
                if (err) {
                    return next(err);
                }

                cache.set(discogsKey, discogsObj);
                next(err, discogsObj);
            });
        }
    }, function(err, discoginfo) {
        if (!err) {
            // Filter
            discoginfo = discoginfo.filter(function(issue) {
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
        url: 'http://api.discogs.com/database/search?catno=' + discogNum + '&type=release&per_page=1',
        headers: {
            'User-Agent': '35hz'
        }
    }, function(err, response, body) {
        if (response.statusCode === 200) {
            var results = JSON.parse(body),
                returnData = {
                    uri: results.uri,
                    thumbnail: results.thumb,
                    catno: results.catno,
                    title: results.title,
                    state: results.style,
                    label: results.label,
                    year: results.year
                };

            callback(null, returnData);
        } else {
            console.log(err, response);
        }
    });
};

// Initial setup
cache = require('lru-cache')({
    maxAge: 1000*60*60*24,
    max: 100
});

module.exports = Embed;