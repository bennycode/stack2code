// http://sourcemaps.info/
// https://github.com/bugsnag/sourcemaps.info
// https://github.com/janekp/mapstrace
// https://github.com/mozilla/source-map
// https://raygun.com/validatesourcemaps

var fs = require('fs');
var sourceMap = require('source-map');
var URI = require('urijs');

// Stacktrace
var stack = "Cannot read property 'split' of undefined\n"
  + "\tat https://app.wire.com/min/wire-app.min.js?2016-06-06-15-36-prod:15:25804\n"
  + "\tat Array.filter (native)\n"
  + "\tat .callback (https://app.wire.com/min/wire-app.min.js?2016-06-06-15-36-prod:15:25754)\n"
  + "\tat Function.v.notifySubscribers (https://app.wire.com/min/wire-vendor.min.js?2016-06-06-15-36-prod:6:20552)\n"
  + "\tat Function.x.valueHasMutated (https://app.wire.com/min/wire-vendor.min.js?2016-06-06-15-36-prod:6:23441)\n"
  + "\tat Function.s.observableArray.fn.(anonymous function) [as sort] (https://app.wire.com/min/wire-vendor.min.js?2016-06-06-15-36-prod:6:26106)\n"
  + "\tat https://app.wire.com/min/wire-app.min.js?2016-06-06-15-36-prod:11:13213";

var uriObjects = [];
var uris = stack.match(URI.find_uri_expression);
uris.forEach(function (uri) {
  var queryIndex = uri.indexOf('?');
  var path = uri.substr(0, queryIndex);

  var columnIndex = uri.lastIndexOf(':');
  var column = uri.substr(columnIndex + 1);

  var temp = uri.substr(0, columnIndex);
  var lineIndex = temp.lastIndexOf(':');
  var line = temp.substr(lineIndex + 1);

  var uriObject = {
    column: parseInt(column, 10),
    line: parseInt(line, 10),
    path: path,
    uri: uri
  };

  uriObjects.push(uriObject);
});

var rawSourceMap = fs.readFileSync('./secret/wire-app.min.js.map', 'utf8');
var consumer = new sourceMap.SourceMapConsumer(rawSourceMap);

uriObjects.forEach(function (uriObject) {
  var position = consumer.originalPositionFor({
    line: uriObject.line,
    column: uriObject.column
  });

  console.log(position);
});

function parseSourceMappingURL(data, sourcePath) {
  var sourceMapPath = undefined;
  var FIND_SOURCE_MAP_URL = new RegExp('(?:\/\/|\/\*) *# *sourceMappingURL *= *([^ ]*)');

  data.split("\n").forEach(function (line) {
    var match = line.match(FIND_SOURCE_MAP_URL);
    if (match) {
      sourceMapPath = URI(match[1]).absoluteTo(sourcePath).toString();
    }
  });

  return sourceMapPath;
}

function getSourceMapFromSource(sourcePath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(sourcePath, 'utf8', function (error, data) {
      if (error) reject(error);
      resolve(parseSourceMappingURL(data, sourcePath));
    });
  });
}

getSourceMapFromSource('./secret/wire-app.min.js').then(function (sourceMapPath) {
  console.log('Parsing source map: ' + sourceMapPath);
});