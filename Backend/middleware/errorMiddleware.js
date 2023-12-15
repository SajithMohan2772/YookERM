const errorHandler= (error , request, response, next) => {
    const statusCode = response.statusCode ? response.statusCode
    : 500;
    response.status(statusCode);

    response.json({
        message: error.message,
        stacks: process.env.NODE_ENV === "development" ?
        error.stack : null,
    });

};

module.exports = errorHandler;
