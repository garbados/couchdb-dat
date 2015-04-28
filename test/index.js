var nano = require('nano');
var assert = require('assert');
var dat = require('dat');
var path = require('path');

var lib;
if (process.env.COVERAGE) {
  lib = require('../lib-cov');
} else {
  lib = require('../lib');
}

describe('couchdb-dat', function () {
  before(function (done) {
    this.couch_url = 'http://localhost:5984';
    this.couch_name = 'couchdb-dat-test';
    
    this.couch = nano(this.couch_url);

    this.test_doc = {
      _id: 'garbados',
      name: 'diana dinosaur'
    };

    this.couch.db.create(this.couch_name, done);
  });

  before(function (done) {
    this.dat_url = ['.tmp', this.couch_name].join(path.sep);
    this.dat = dat(this.dat_url, {
      storage: false
    }, done);
  });

  after(function (done) {
    this.couch.db.destroy(this.couch_name, done);
  });

  it('should sync data between CouchDB and dat', function (done) {
    var self = this;
    var stream = lib(this.dat_url, this.couch_url);

    this.couch.use(this.couch_name).insert(this.test_doc, function (err) {
      if (err) return done(err);
      // TODO wait until the change is reflected in dat
      done();
    });
  });
});
