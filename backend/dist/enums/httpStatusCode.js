"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HTTP_STATUS_CODE;
(function (HTTP_STATUS_CODE) {
    //Success Responses
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["OK"] = 200] = "OK";
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["Created"] = 201] = "Created";
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["NotModified"] = 304] = "NotModified";
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["Accepted"] = 202] = "Accepted";
    //Redirection Responses
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["MovedPermanently"] = 301] = "MovedPermanently";
    //Client Error Responses
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["BadRequest"] = 400] = "BadRequest";
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["Unauthorized"] = 401] = "Unauthorized";
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["Forbidden"] = 403] = "Forbidden";
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["NotFound"] = 404] = "NotFound";
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["Conflict"] = 409] = "Conflict";
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["Gone"] = 410] = "Gone";
    //Server Error Responses
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["InternalServerError"] = 500] = "InternalServerError";
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["ServiceUnavailable"] = 503] = "ServiceUnavailable";
})(HTTP_STATUS_CODE || (HTTP_STATUS_CODE = {}));
exports.default = HTTP_STATUS_CODE;
