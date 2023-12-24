const dotenv = require ('dotenv').config();
const express = require ('express');
const mongoose = require ('mongoose');
const bodyParser = require ('body-parser');
const cors = require ('cors');
const userRoute = require('./routes/userRoute');
const errorHandler = require("./middleware/errorMiddleware");
const cookieParser = require("cookie-parser");

const app = express ();


// middleWares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(cors());

// Routes middleWare
app.use('/api/users', userRoute);

// Routes
app.get("/", (request, response) => {
    response.send("Home Page")
})

// error Middleware
app.use(errorHandler);

// connect to DB and start server
const PORT = process.env.PORT || 5000;

// mongoose
//         .connect(process.env.MONGO_URI)
//         .then(() => {
//             app.listen(PORT, () => {
//                 console.log(`Server Runnning on port ${PORT}`)
//             })
//         })
//         .catch((error) => console.log(error))

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server Running on port ${PORT}`);
    });
  })
  .catch((error) => console.error(error));