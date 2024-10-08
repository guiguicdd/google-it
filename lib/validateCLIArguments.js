"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var MISSING_QUERY = 'missing_query';
var OUTPUT_ARG_MUST_BE_STRING = 'output_arg_must_be_string';
var MUST_END_IN_JSON = 'must_end_in_json';
var ONLY_ONE_NOT_BOTH = 'only_one_not_both';
function getError(reason) {
  return {
    valid: false,
    Error: reason
  };
}
var validationMap = _defineProperty(_defineProperty(_defineProperty(_defineProperty({}, MISSING_QUERY, getError('Missing query')), OUTPUT_ARG_MUST_BE_STRING, getError('Output argument must be string')), MUST_END_IN_JSON, getError('Output argument must end in .json')), ONLY_ONE_NOT_BOTH, getError('Can only use --no-display when --output is used as well'));
function getPotentialError(args) {
  var error = null;
  if (!args.query) {
    error = MISSING_QUERY;
  } else if (args.output && typeof args.output !== 'string') {
    error = OUTPUT_ARG_MUST_BE_STRING;
  } else if (args.output && !args.output.endsWith('.json')) {
    error = MUST_END_IN_JSON;
  } else if (args['no-display'] && !args.output) {
    error = ONLY_ONE_NOT_BOTH;
  }
  return validationMap[error];
}
function validateCLIArguments(args) {
  var result = {
    valid: true
  };
  var error = getPotentialError(args);
  return error || result;
}
module.exports = validateCLIArguments;