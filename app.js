const express = require('express');
const morgan = require('morgan');
const routes = require('./routes/index');
const errorController = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

// 1) Global MIDDLEWARES
app.use(helmet())

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Limit number of request per IP
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 *1000,
    message: 'Too many request form this IP, Please try again in an hour!'
});

app.use('/api', limiter);

// body Parser, reading data form body into req.body
app.use(express.json({limit: '10kb'}));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against xss
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));

// Serving static files
app.use(express.static(`${__dirname}/public`));

// 2) ROUTES
app.use(routes);

// 3) Error Handling
app.use(errorController); 

module.exports = app;
