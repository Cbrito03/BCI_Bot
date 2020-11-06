"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var axios = require('axios').default;
/**
 * @author Joshi Yogesh
 * @param {string} url - URL mentioned in the wsdl {endpoints to hit the soap-request}
 * @param {string} data - XML data which need to be sent to web service
 * @param {object} headers - Header which need to be sent to request
 * @param {object} proxy - Proxy Object with Proxy configuration of Proxy server host name and port number {host : "127.0.0.1",port : 3000, auth : {username : "joshiyogesh" password : "imduffer"}}
 * @param {number} timeout - Specify the number of milliseconds before request timesout, if request take more than specify time out it will be aborted,
 * timeout - 0 specify no timeout
 * @param {number} maxContentLength - max permissable content length that should be pass, by default Infinity
 * @param {object} extraOptions - Any Extra Options which is supported by axios.
 *
 * @return {object} -- {
 *  response : {
 *      message : "SOAP_WEB_CLIENT_SOAP_REQUEST_SUCCESS" or "SOAP_WEB_CLIENT_REQUEST_FAILURE",
 *      data : "In case of Promise Rejection",
 *      body : "In Case of Succesfull Promise",
 *      headers : "In Case of Succesfull Promise",
 *      "status" : "In Case of Succesfull Prmoise"
 *  }
 * }
 */
var soaprequest = function (_a) {
    var _b = _a.url, url = _b === void 0 ? '' : _b, _c = _a.headers, headers = _c === void 0 ? {} : _c, _d = _a.data, data = _d === void 0 ? '' : _d, _e = _a.timeout, timeout = _e === void 0 ? 0 : _e, _f = _a.proxy, proxy = _f === void 0 ? {} : _f, _g = _a.maxContentLength, maxContentLength = _g === void 0 ? Infinity : _g, _h = _a.extraOptions, extraOptions = _h === void 0 ? {} : _h;
    return new Promise(function (resolve, reject) {
        axios(__assign({ method: 'post', url: url,
            headers: headers,
            data: data,
            timeout: timeout,
            proxy: proxy,
            maxContentLength: maxContentLength }, extraOptions)).then(function (response) {
            resolve({
                response: {
                    headers: response.headers,
                    body: response.data,
                    status: response.status,
                    message: 'SOAP_WEB_CLIENT_SOAP_REQUEST_SUCCESS'
                }
            });
        }).catch(function (error) {
            if (error.response) {
                reject({
                    response: {
                        message: 'SOAP_WEB_CLIENT_SOAP_REQUEST_FAILURE',
                        data: error.response.data
                    }
                });
            }
            else {
                reject({
                    response: {
                        message: 'SOAP_WEB_CLIENT_REQUEST_FAILURE',
                        data: error
                    }
                });
            }
        });
    });
};
module.exports = soaprequest;
