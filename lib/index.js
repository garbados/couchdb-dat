// based on https://github.com/calvinmetcalf/pouch-dat/blob/master/index.js

var follow = require('follow');
var through = require('through2').obj;
var dat = require('dat');
var xtend = require('xtend');

module.exports = function (dat_url, couchdb_url, opts) {  
  opts = opts || {};
  opts = xtend({
    include_docs: true
  }, opts);
  
  var dat_db = dat(dat_url);
  var feed = new follow.Feed(couchdb_url, opts);
  var out = through(function (change, encoding, next) {
    var doc = change.doc;
    dat_db.get(doc._id, function (err, dat_doc) {
      if (!err && dat_doc) {
        doc.version = dat_doc.version + 1;
      }
      return next(null, doc);
    });
  }).pipe(dat_db.createWriteStream({
    primary: '_id'
  }));

  feed.on('change', function (change) {
    console.log('hello!');
    var doc = change.doc;
    out.push(doc);
  });
  
  out.cancel = function () {
    return feed.stop();
  };

  return out;
};
