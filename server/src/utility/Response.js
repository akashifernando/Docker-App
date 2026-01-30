class Response {
    static ok(data, message = "OK") {
        return {
            success: true,
            statusCode: 200,
            message,
            data
        };
    }

    static created(data, message = "Created") {
        return {
            success: true,
            statusCode: 201,
            message,
            data
        };
    }

    static error(statusCode, message) {
        return {
            success: false,
            statusCode,
            message,
            data: null // Consistency
        };
    }
}

module.exports = Response;
