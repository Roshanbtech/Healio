enum HTTP_STATUS_CODE {
    //Success Responses
    OK = 200, //Request was successful
    Created = 201, //Resource was created successfully
    NotModified = 304, // Resource was not modified

    //Redirection Responses
    MovedPermanently = 301, //Resource was moved permanently

    //Client Error Responses
    BadRequest = 400, //Invalid request from client
    Unauthorized = 401, //Authentication required
    Forbidden = 403, //No access to requested resource
    NotFound = 404, //Resource not found
    Conflict = 409, //Resource already exists
    Gone = 410, //Resource no longer exists

    //Server Error Responses
    InternalServerError = 500, //Server error
    ServiceUnavailable = 503, //Service temporarily unavailable

}

export default HTTP_STATUS_CODE;