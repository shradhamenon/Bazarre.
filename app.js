var express = require("express");
var getJSON = require('get-json');
var authRoutes = require('./routes/auth-routes');
var passportSetup = require('./config/passport-setup');
var mongoose = require('mongoose');
var cookieSession = require('cookie-session');
var passport = require('passport');
var app = express();
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20');
var User = require('./config/models/user-model');


app.use(express.static(__dirname + '/public'));


app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: ['bazarrecookie']
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb+srv://shradhamenon:horrorland@bazarre-ck1dv.gcp.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true }, () => {
    console.log('db connected');
})

app.use('/auth', authRoutes);

app.get("/", function (req, res) {
    res.render("home.ejs");
});

app.get("/website", function (req, res) {
    app.set('fullname', req.user.fullname);
    app.set('id', req.user.id);
    app.set('googleID', req.user.googleID);
    app.set('bookmarks', req.user.bookmarks);
    res.render("website_pick.ejs", {fullname: req.user.fullname, id: req.user.id, googleID: req.user.googleID, bookmarks: req.user.bookmarks});
});


app.get("/item", function (req, res) {
    var fullname = app.get('fullname');
    var id = app.get('id');
    var googleID = app.get('googleID');
    var bookmarks = app.get('bookmarks');

    var web1 = req.query.web1;
    var web2 = req.query.web2;
    var web3 = req.query.web3;

    if (web2 == undefined) {
        web2 = '';
    }

    if (web3 == undefined) {
        web3 = '';
    }

    app.set('web1', web1);
    app.set('web2', web2);
    app.set('web3', web3);

    res.render("item_pick.ejs", {fullname: fullname, id: id, googleID: googleID, bookmarks: bookmarks});
});

app.get("/display", function (req, res) {
    var item = req.query.item;

    var fullname = app.get('fullname');
    var id = app.get('id');
    var googleID = app.get('googleID');
    var bookmarks = app.get('bookmarks');

    app.set('item', item);

    var web1 = app.get('web1');
    var web2 = app.get('web2');
    var web3 = app.get('web3');

    var item_split = item.split(" ");
    var item_join = item_split.join('+');

    var results_1 = [];
    var results_2 = [];
    var results_3 = [];
    var promises = [];

    for (var i = 0; i < 10; ++i) {
        var result_page = 1 + (10 * i);

        var result1_url = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyBYNIX9fQ2730Bs9OSxqNnw8yasVUcfH9c&cx=016991028233952270186:saqsw3bd9nq&num=10&siteSearch=' + web1 + '&siteSearchFilter=i&q=' + item_join + '&start=' + result_page;
        var result2_url = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyBYNIX9fQ2730Bs9OSxqNnw8yasVUcfH9c&cx=016991028233952270186:saqsw3bd9nq&num=10&siteSearch=' + web2 + '&siteSearchFilter=i&q=' + item_join + '&start=' + result_page;
        var result3_url = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyBYNIX9fQ2730Bs9OSxqNnw8yasVUcfH9c&cx=016991028233952270186:saqsw3bd9nq&num=10&siteSearch=' + web3 + '&siteSearchFilter=i&q=' + item_join + '&start=' + result_page;

        try {
            promises.push(new Promise(function (resolve, reject) {
                getJSON(result1_url, function (error, response) {
                    if (error) {
                        reject(error);
                    }
                    for (var j = 0; j < 10; ++j) {
                        try {
                            var result_item = response['items'][j];
                            results_1.push([result_item['title'], result_item['link'], result_item['pagemap']['cse_image'][0]['src']]);
                        } catch (error) {
                            continue;
                        }
                    }
                    resolve('done');
                });
            }));
        } catch (error) {
            continue;
        }

        if (web2 != '') {
            try {

                promises.push(new Promise(function (resolve, reject) {
                    getJSON(result2_url, function (error, response) {
                        if (error) {
                            reject(error);
                        }
                        for (var j = 0; j < 10; ++j) {
                            try {
                                var result_item = response['items'][j];
                                results_2.push([result_item['title'], result_item['link'], result_item['pagemap']['cse_image'][0]['src']]);
                            } catch (error) {
                                continue;
                            }
                        }
                        resolve('done');
                    });
                }));
            } catch (error) {
                continue;
            }
        }

        if (web3 != '') {

            try {

                promises.push(new Promise(function (resolve, reject) {
                    getJSON(result3_url, function (error, response) {
                        if (error) {
                            reject(error);
                        }
                        for (var j = 0; j < 10; ++j) {
                            try {
                                var result_item = response['items'][j];
                                results_3.push([result_item['title'], result_item['link'], result_item['pagemap']['cse_image'][0]['src']]);
                            } catch (error) {
                                continue;
                            }
                        }
                        resolve('done');
                    });
                }));
            } catch (error) {
                continue;
            }
        }
    }


    Promise.all(promises)
        .then(function () {
            res.render("display.ejs", {web1: web1, web2: web2, web3: web3, results_1: results_1, results_2: results_2, results_3: results_3, fullname: fullname, id: id, googleID: googleID, bookmarks: bookmarks});
        })
        .catch(function (error) {
            console.log(error);
        })
});

app.get("/update-bookmarks", function (req, res) {
    var fullname = app.get('fullname');
    var id = app.get('id');
    var googleID_got = app.get('googleID');
    try {
        var bookmarks_string = req.query.bookmark_list;
        var bookmarks_flat = bookmarks_string.split(',');
        var bookmarks_list = [];
        for(var i = 0; i < (bookmarks_flat.length / 3); ++i) {
            bookmarks_list.push([bookmarks_flat[i*3], bookmarks_flat[(i*3) + 1], bookmarks_flat[(i*3) + 2]]);
        }
        app.set('bookmarks', bookmarks_list);
    } catch (error) {
        var bookmarks_list = app.get('bookmarks');
    }

    console.log(bookmarks_list);
    
    User.findOneAndUpdate({ googleID: googleID_got }, { $set: { bookmarks: bookmarks_list}}, {
        new: true
    }, function (error, result) {
        console.log('done');
    });
    
    res.redirect("/bookmarks");   
});

app.get("/bookmarks", function (req, res) {
    var fullname = app.get('fullname');
    var id = app.get('id');
    var googleID_got = app.get('googleID');
    try {
        var bookmarks_string = req.query.bookmark_list;
        var bookmarks_flat = bookmarks_string.split(',');
        var bookmarks_list = [];
        for(var i = 0; i < (bookmarks_flat.length / 3); ++i) {
            bookmarks_list.push([bookmarks_flat[i*3], bookmarks_flat[(i*3) + 1], bookmarks_flat[(i*3) + 2]]);
        }
        app.set('bookmarks', bookmarks_list);
    } catch (error) {
        var bookmarks_list = app.get('bookmarks');
    }

    User.findOneAndUpdate({ googleID: googleID_got }, { $set: { bookmarks: bookmarks_list}}, {
        new: true
    }, function (error, result) {
        console.log('done');
    });
    res.render("bookmarks.ejs", {fullname: fullname, id: id, googleID: googleID_got, bookmarks: bookmarks_list});    
});

app.listen(5000);