const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
	console.log("UNCAUGHT REJECTION 💥 Shutting Down ...");
	console.log(err.name, err.message);
	process.exit(1); // 0 for success, 1 for uncaught exception
})

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DB_ATLAS.replace('<password>', process.env.DB_PASSWORD);

mongoose.connect(DB, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	useUnifiedTopology: true
})
.then(con => { console.log('DB Connected'); });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
	console.log('Server: ', process.env.NODE_ENV);
    console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
	console.log("UNHANDLED REJECTION! 💥 Shutting down...");
	console.log(err.name, err.message);
	// console.log(err);
	server.close(() => {
		process.exit(1); // 0 for success, 1 for uncaught exception
	})
})