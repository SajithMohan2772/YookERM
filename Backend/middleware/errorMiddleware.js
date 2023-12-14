const errorHandler= (error , request, response, next) => {
    const statusCode = response.statusCode ?response.statusCode
    : 500;
    response.status(statusCode);

    response.json({
        message: error.message,
        stack : process.env.NODE_ENV === "development" ?
        error.stack : null,
    });

};

module.exports = errorHandler;
