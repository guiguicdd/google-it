"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.display = display;
exports.errorTryingToOpen = errorTryingToOpen;
exports.getResponse = getResponse;
exports.getResults = getResults;
exports.getSnippet = getSnippet;
exports.openInBrowser = openInBrowser;
exports.parseGoogleSearchResultUrl = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/* eslint-disable no-console */
/* eslint-disable array-callback-return */
var axios = require("axios");
var fs = require("fs");
var querystring = require("querystring");
var cheerio = require("cheerio");
require("colors");
var _require = require("child_process"),
  exec = _require.exec;
var _require2 = require("./utils"),
  getDefaultRequestOptions = _require2.getDefaultRequestOptions,
  getTitleSelector = _require2.getTitleSelector,
  getLinkSelector = _require2.getLinkSelector,
  getSnippetSelector = _require2.getSnippetSelector,
  getResultStatsSelector = _require2.getResultStatsSelector,
  getResultCursorSelector = _require2.getResultCursorSelector,
  logIt = _require2.logIt,
  saveToFile = _require2.saveToFile,
  saveResponse = _require2.saveResponse,
  titlefinder = _require2.titlefinder;
function errorTryingToOpen(error, stdout, stderr) {
  if (error) {
    console.log("Error trying to open link in browser: ".concat(error));
    console.log("stdout: ".concat(stdout));
    console.log("stderr: ".concat(stderr));
  }
}
function openInBrowser(open, results) {
  if (open !== undefined) {
    // open is the first X number of links to open
    results.slice(0, open).forEach(function (result) {
      exec("open ".concat(result.link), errorTryingToOpen);
    });
  }
}
function getSnippet(elem) {
  // recursive function to get "all" the returned data from Google
  function findData(child) {
    if (!child.data) {
      return child.children.map(function (c) {
        return c.data || findData(c);
      });
    }
    return child.data;
  }

  // Issue with linter wanting "new" before "Array"
  // in this case, the casting is legit, we don't want a new array
  // eslint-disable-next-line unicorn/new-for-builtins
  return elem.children && elem.children.length > 0 ? elem.children.map(function (child) {
    return Array(findData(child)).join("");
  }).join("") : "";
}
function display(results, disableConsole, onlyUrls) {
  logIt("\n", disableConsole);
  results.forEach(function (result) {
    if (onlyUrls) {
      logIt(result.link.green, disableConsole);
    } else if (result.title) {
      logIt(result.title.blue, disableConsole);
      logIt(result.link.green, disableConsole);
      logIt(result.snippet, disableConsole);
      logIt("\n", disableConsole);
    } else {
      logIt("Result title is undefined.");
    }
  });
}
var parseGoogleSearchResultUrl = exports.parseGoogleSearchResultUrl = function parseGoogleSearchResultUrl(url) {
  if (!url) {
    return undefined;
  }
  if (url.charAt(0) === "/") {
    return querystring.parse(url).url;
  }
  return url;
};
function getResults(_ref) {
  var data = _ref.data,
    noDisplay = _ref.noDisplay,
    disableConsole = _ref.disableConsole,
    onlyUrls = _ref.onlyUrls,
    titleSelector = _ref.titleSelector,
    linkSelector = _ref.linkSelector,
    snippetSelector = _ref.snippetSelector,
    resultStatsSelector = _ref.resultStatsSelector,
    cursorSelector = _ref.cursorSelector;
  var $ = cheerio.load(data);
  var results = [];
  var titles = $(getTitleSelector(titleSelector)).find(titlefinder);
  titles.each(function (index, elem) {
    if (elem.children[0].data) {
      results.push({
        title: elem.children[0].data
      });
    } else {
      results.push({
        title: elem.children[0].data
      });
    }
  });
  $(getLinkSelector(linkSelector)).map(function (index, elem) {
    if (index < results.length) {
      results[index] = Object.assign(results[index], {
        link: parseGoogleSearchResultUrl(elem.attribs.href)
      });
    }
  });
  $(getSnippetSelector(snippetSelector)).map(function (index, elem) {
    if (index < results.length) {
      results[index] = Object.assign(results[index], {
        snippet: getSnippet(elem)
      });
    }
  });
  if (onlyUrls) {
    results = results.map(function (r) {
      return {
        link: r.link
      };
    });
  }
  if (!noDisplay) {
    display(results, disableConsole, onlyUrls);
  }
  var resultStats = $(getResultStatsSelector(resultStatsSelector)).html() || "";
  var approximateResults = ((resultStats.split(" results") || [""])[0].split("About ")[1] || "").replace(",", "");
  var seconds = parseFloat((resultStats.split(" (")[1] || "").split(" seconds")[0]);
  var cursor = $(getResultCursorSelector(cursorSelector)).html() || "";
  var page = parseInt(cursor.split("</span>")[1], 10);
  var stats = {
    page: page,
    approximateResults: approximateResults,
    seconds: seconds
  };
  return {
    results: results,
    stats: stats
  };
}
function getResponse(_ref2) {
  var filePath = _ref2.fromFile,
    fromString = _ref2.fromString,
    options = _ref2.options,
    htmlFileOutputPath = _ref2.htmlFileOutputPath,
    query = _ref2.query,
    limit = _ref2.limit,
    userAgent = _ref2.userAgent,
    start = _ref2.start,
    includeSites = _ref2.includeSites,
    excludeSites = _ref2.excludeSites;
  // eslint-disable-next-line consistent-return
  return new Promise(function (resolve, reject) {
    if (filePath) {
      fs.readFile(filePath, function (err, data) {
        if (err) {
          return reject(new Error("Erorr accessing file at ".concat(filePath, ": ").concat(err)));
        }
        return resolve({
          body: data
        });
      });
    } else if (fromString) {
      return resolve({
        body: fromString
      });
    }
    var defaultOptions = getDefaultRequestOptions({
      limit: limit,
      query: query,
      userAgent: userAgent,
      start: start,
      includeSites: includeSites,
      excludeSites: excludeSites
    });
    axios(_objectSpread(_objectSpread({}, defaultOptions), options), function (error, response, body) {
      if (error) {
        return reject(new Error("Error making web request: ".concat(error)));
      }
      saveResponse(response, htmlFileOutputPath);
      return resolve({
        body: body,
        response: response
      });
    });
  });
}
function googleIt(config) {
  var output = config.output,
    open = config.open,
    returnHtmlBody = config.returnHtmlBody,
    titleSelector = config.titleSelector,
    linkSelector = config.linkSelector,
    snippetSelector = config.snippetSelector,
    resultStatsSelector = config.resultStatsSelector,
    cursorSelector = config.cursorSelector,
    start = config.start,
    diagnostics = config.diagnostics;
  return new Promise(function (resolve, reject) {
    getResponse(config).then(function (_ref3) {
      var body = _ref3.body,
        response = _ref3.response;
      var _getResults = getResults({
          data: body,
          noDisplay: config["no-display"],
          disableConsole: config.disableConsole,
          onlyUrls: config["only-urls"],
          titleSelector: titleSelector,
          linkSelector: linkSelector,
          snippetSelector: snippetSelector,
          resultStatsSelector: resultStatsSelector,
          cursorSelector: cursorSelector,
          start: start
        }),
        results = _getResults.results,
        stats = _getResults.stats;
      var statusCode = response.statusCode;
      if (results.length === 0 && statusCode !== 200 && !diagnostics) {
        reject(new Error("Error in response: statusCode ".concat(statusCode, ". To see the raw response object, please include the 'diagnostics: true' as part of the options object (or -d if using command line)")));
      }
      saveToFile(output, results);
      openInBrowser(open, results);
      if (returnHtmlBody || diagnostics) {
        return resolve({
          results: results,
          body: body,
          response: response,
          stats: stats
        });
      }
      return resolve(results);
    }).catch(reject);
  });
}
var _default = exports.default = googleIt;