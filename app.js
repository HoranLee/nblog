
/**
 * Module dependencies.
 */
var fs = require('fs');
var accessLog = fs.createWriteStream('access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash = require('connect-flash');

var app = express();
var passport = require('passport'),
    GithubStrategy = require('passport-github').Strategy;


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.logger({stream: accessLog}));
//app.use(express.bodyParser({keepExtensions: true, uploadDir: './pulic/images'}));
app.use(express.bodyParser({keepExtensions: true}));
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
    secret: settings.cookieecret,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30//30 days
    },
    url: settings.url
}));

app.use(passport.initialize());//初始化passport
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(err, req, res, next){
    var meta = '[' + new Date() + ']' + req.url + '\n';
    errorLog.write(meta + err.stack + '\n');
    next();
});

passport.use(new GithubStrategy({
    clientID: '39e2a6141bc8a2d9ac10',
    clientSecret: '8bb5264fdc9f093b957182d78a9ae569275cb179',
    callbackURL: 'http://localhost:3000/login/github/callback'
}, function(accessToken, refreshToken, profile, done){
    done(null, profile);
}));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

routes(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
