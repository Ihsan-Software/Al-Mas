const express = require('express');
const path = require('path');
const morgan = require('morgan');


// utils requires

const ApiError = require("./utils/apiError");
const globalError = require('./middlewares/errorMiddleware')

const userRouter = require("./routes/userRoute");
const authRouter = require("./routes/authRoute");
const tenantRouter = require("./routes/tenantRoute");
const carRouter = require("./routes/carRoute");
const contractRouter = require("./routes/contractRoute");
const bookingRouter = require("./routes/bookingRoute");
const finesRoute = require("./routes/finesRoute");
const exportRoute = require("./routes/exportRoute");
const app = express();


// Middleware to parse JSON and form data if needed
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());
app.use(express.static(path.join(__dirname,'uploads')));
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.get("/", (req, res) => {
  res.send("Hi Again,dear...");
});

app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/tenant', tenantRouter);
app.use('/car', carRouter);
app.use('/contract', contractRouter);
app.use('/booking', bookingRouter);
app.use('/fines', finesRoute);
app.use('/export', exportRoute);

app.all('/*splat', (req, res, next) => {
  next(new ApiError(`can't find this route: ${req.originalUrl}`, 400));
})

// Global Error Handle Middleware For Express
app.use(globalError);
module.exports = app;
