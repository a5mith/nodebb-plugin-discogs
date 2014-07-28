var	request = require('request'),
    async = module.parent.require('async'),
    winston = module.parent.require('winston'),
    S = module.parent.require('string'),
    meta = module.parent.require('./meta'),

    discogsRegex = /dc#\w+/gm,
    Embed = {},
    cache, defaultRepo, tokenString, appModule;

Embed.init = function(app, middleware, controllers) {
    function render(req, res, next) {
        res.render('admin/plugins/discogs-embed', {});
    }

    appModule = app;
    app.get('/admin/plugins/discogs-embed', middleware.admin.buildHeader, render);
    app.get('/api/admin/plugins/discogs-embed', render);
};

Embed.buildMenu = function(custom_header, callback) {
    custom_header.plugins.push({
        "route": '/plugins/discogs-embed',
        "icon": 'fa-info',
        "name": 'Discogs Embed'
    });

    callback(null, custom_header);
};

Embed.parse = function(raw, callback) {
    var discogsKeys = [],
        ltrimRegex = /^\s+/,
        matches, cleanedText;

    cleanedText = S(raw.replace(/<blockquote>[\s\S]+?<\/blockquote>/g, '')).stripTags().s;
    matches = cleanedText.match(discogsRegex);

    if (matches && matches.length) {
        matches.forEach(function(match) {
            match = match.replace(ltrimRegex, '');

            if (match.slice(0, 2).toLowerCase() === 'dc' && defaultRepo !== undefined) {
                match = defaultRepo + match.slice(2);
            }

            if (discogsKeys.indexOf(match) === -1) {
                discogsKeys.push(match);
            }
        });
    }

    async.map(discogsKeys, function(discogsKey, next) {
        if (cache.has(discogsKey)) {
            next(null, cache.get(discogsKey));
        } else {
            getDiscogsData(discogsKey, function(err, discogsObj) {
                if (err) {
                    return next(err);
                }

                cache.set(discogsKey, discogsObj);
                next(err, discogsObj);
            });
        }
    }, function(err, discogs) {
        if (!err) {
            // Filter out non-existant issues
            discogs = discogs.filter(function(discogs) {
                return discogs;
            });

            appModule.render('partials/discog-block', {
                discogs: discogs
            }, function(err, cardHTML) {
                callback(null, raw += cardHTML);
            });
        } else {
            winston.warn('Encountered an error parsing Discogs Embed Code, not continuing');
            callback(null, raw);
        }
    });
};

var getDiscogsData = function(discogsKey, callback) {
    var discogsData = discogsKey.split('#'),
        repo = discogsData[0],
        discogNum = discogsData[1];

    request.get({
        url: 'http://api.discogs.com/database/search?catno=' + discogNum + '&type=release&per_page=1',
        headers: {
            'User-Agent': '35hzMusicDiscogs/1.0 +http://35hz.co.uk'
        }
    }, function(err, response, body) {
        if (response.statusCode === 200) {
            var results = JSON.parse(body),
                returnData = {
                    results: {
                        uri: results[0].uri,
                        thumbnail: results[0].thumb,
                        catno: results[0].catno,
                        title: results[0].title,
                        style: results[0].style,
                        label: results[0].label,
                        year: results[0].year
                    }
                };

            callback(null, returnData);
        } else {
            callback(err);
        }
    });
};

// Initial setup
meta.settings.get('discogs-embed', function(err, settings) {

    cache = require('lru-cache')({
        maxAge: 1000*60*60*(settings.cacheHours || 24),
        max: 100
    });

    if (settings.clientId && settings.clientSecret) {
        tokenString = '?client_id=' + settings.clientId + '&client_secret=' + settings.clientSecret;
    }
});

module.exports = Embed;