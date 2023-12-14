const registerUser =  async (request, response) => {
    if (!request.body.email){
        response.status(400);
        throw new Error("Please add an email");
    }
    response.send('Register User');
};

module.exports ={
    registerUser,
};