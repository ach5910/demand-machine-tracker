"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

(function (w, d) {
  var regex = {
    any: /fname|firstname|lname|lastname|name|full|fullname|mobile|phone|^number$|tel|email|street|address|city|zip/,
    firstName: /(fname|firstname)/,
    lastName: /(lname|lastname)/,
    fullName: /^(name|full|fullname)$/,
    phoneNumber: /(mobile|phone|^number$|tel)/,
    email: /(email)/,
    streetAddress: /(street|address)/,
    city: /(city)/,
    zip: /(zip)/
  };
  var dm = w["dm"];
  var apiKey = dm.q;
  if (!apiKey) return;
  fetch("https://app.demandmachine.com/tracker/".concat(apiKey)).then(function (r) {
    return r.json();
  }).then(function (tracker) {
    addFormSubmitListener(tracker);
  })["catch"](function () {
    addFormSubmitListener({
      formIndex: 0
    });
  });

  function getFormInput(field, value, payload) {
    field = field.replaceAll(/_|\*/g, "").toLowerCase();
    value.trim();
    if (!regex.any.test(field)) return;

    if (regex.firstName.test(field)) {
      payload.firstName = value;
    } else if (regex.lastName.test(field)) {
      payload.lastName = value;
    } else if (regex.fullName.test(field)) {
      var _value$split = value.split(/\s\+/),
          _value$split2 = _slicedToArray(_value$split, 2),
          firstName = _value$split2[0],
          lastName = _value$split2[1];

      payload.firstName = firstName;
      payload.lastName = lastName;
    } else if (regex.phoneNumber.test(field)) {
      payload.phoneNumber = value;
    } else if (regex.email.test(field)) {
      payload.email = value;
    } else if (regex.streetAddress.test(field)) {
      payload.streetAddress = value;
    } else if (regex.city.test(field)) {
      payload.city = value;
    } else if (regex.zip.test(field)) {
      payload.zip = value;
    }
  }

  function appendFormDataToPayload(formData) {
    var properties = {};

    var _iterator = _createForOfIteratorHelper(formData),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _step$value = _slicedToArray(_step.value, 2),
            field = _step$value[0],
            value = _step$value[1];

        getFormInput(field, value, properties);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    return properties;
  }

  function addFormSubmitListener(tracker) {
    var _getTrackerQueryParam = getTrackerQueryParam(),
        _getTrackerQueryParam2 = _slicedToArray(_getTrackerQueryParam, 2),
        trackerKey = _getTrackerQueryParam2[0],
        trackerId = _getTrackerQueryParam2[1];

    if (trackerKey && trackerId) {
      var form = tracker.formId ? d.getElementById(formId) : d.getElementsByTagName("form").item(tracker.formIndex || 0);
      form.addEventListener("submit", function () {
        var formData = new FormData(form);
        handleFormSubmit(trackerKey, trackerId, formData);
        return true;
      }, {
        capture: true
      });
    }
  }

  function handleFormSubmit(trackerKey, trackerId, formData) {
    var payload = _defineProperty({}, trackerKey, trackerId);

    payload.properties = appendFormDataToPayload(formData);

    if (Object.keys(payload.properties).length) {
      fetch("https://app.demandmachine.com/tracker/".concat(apiKey, "/contact"), {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(payload)
      }).then(function (res) {
        return res.json();
      }).then(function (data) {
        console.log(data);
      })["catch"](function (err) {
        console.error("Error creating Hubspot contact", err);
      });
    }
  }

  function getTrackerQueryParam() {
    var query = w.location.search.substring(1);
    var params = query.split("&");
    var trackerParams = params.find(function (param) {
      return /^(gclid|fbclid)=.*/.test(param);
    });

    if (trackerParams) {
      return trackerParams.split("=");
    }

    return [null, null];
  }
})(window, document); //https://unpkg.com/bembo@0.0.3/dist/index.js