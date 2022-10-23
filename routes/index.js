const app = require('express')();
const AppError = require('./../utils/appError');
const indexRouter = require('./indexRoutes');
const tourRouter = require('./tourRoutes');
const userRouter = require('./userRoutes');
const reviewRoutes = require('./reviewRoutes');

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// Routes
app.use(indexRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRoutes);

// For all undefined routes
app.all('*', (req, res, next) => {
    next(new AppError( `Can't find ${req.originalUrl}`, 404));
})

module.exports = app;
