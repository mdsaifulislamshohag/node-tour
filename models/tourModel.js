const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
		name: {
			type: String,
			required: [true, 'A tour must have a name'],
			unique: true,
			trim: true,
			maxlength: [40, 'A tour name must have less or equal then 40 characters'],
			minlength: [5, 'A tour name must have more or equal then 10 characters']
			// validate: [validator.isAlpha, 'Tour name must only contain characters']
		},
		slug: String,
		duration: {
			type: Number,
			required: [true, 'A tour must have a duration']
		},
		maxGroupSize: {
			type: Number,
			required: [true, 'A tour must have a group size']
		},
		difficulty: {
			type: String,
			required: [true, 'A tour must have a difficulty'],
			enum: {
				values: ['easy', 'medium', 'difficult'],
				message: 'Difficulty is either: easy, medium, difficult'
			}
		},
		ratingsAverage: {
			type: Number,
			default: 4.5,
			min: [1, 'Rating must be above 1.0'],
			max: [5, 'Rating must be below 5.0']
		},
		ratingsQuantity: {
			type: Number,
			default: 0
		},
		price: {
			type: Number,
			required: [true, 'A tour must have a price']
		},
		priceDiscount: {
			type: Number,
			validate: {
				validator: function (val) {
					// this only points to current doc on NEW document creation
					return val < this.price;
				},
				message: 'Discount price ({VALUE}) should be below regular price'
			}
		},
		summary: {
			type: String,
			trim: true,
			required: [true, 'A tour must have a description']
		},
		description: {
			type: String,
			trim: true
		},
		imageCover: {
			type: String,
			required: [true, 'A tour must have a cover image']
		},
		images: [String],
		createdAt: {
			type: Date,
			default: Date.now(),
			// select: true
		},
		startDates: [Date],
		secretTour: {
			type: Boolean,
			default: false
		},
		startLocation: {
			// GeoJSON
			type: {
				type: String,
				default: 'Point',
				enum: ['Point']
			},
			coordinates: [Number],
			address: String,
			description: String
		},
		locations: [
			{
				type: {
					type: String,
					default: 'Point',
					enum: ['Point']
				},
				coordinates: [Number],
				address: String,
				description: String,
				day: Number
			}
		],
		guides: [
			{
			  type: mongoose.Schema.ObjectId,
			  ref: 'User'
			}
		]
	}, {
		toJSON: { virtuals: true },
		toObject: {virtuals: true }
	}
);

tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({slug: 1});
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function() {
	return this.duration / 7;
})

// Virtual populate
tourSchema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'tour',
	localField: '_id'
});

// Document Middleware: runs before .save() and .create()
tourSchema.pre('save', function(next) {
	this.slug = slugify(this.name, {lower: true});
	next();
})

// tourSchema.pre('save', async function(next) {
// 	const guidesPromises = this.guides.map(async id => await User.findById(id));
// 	this.guides = await Promise.all(guidesPromises);
// 	next();
// })

// Query Middleware
// tourSchema.pre('find', function(next) { // default 
tourSchema.pre(/^find/, function(next) { // regular expression to get all methods starting with find, i.e. find/findOne/..
	this.find({secretTour: { $ne: true }});
	this.start = Date.now();
	next();
})


// Populate guides with all tours
tourSchema.pre(/^find/, function(next) {
	this.populate({
		path: 'guides',
		select: '-__v -passwordChangedAt'
	});
	next();
})

tourSchema.post(/^find/, function(docs, next) {
	console.log(`Query took ${Date.now() - this.start} miliseconds`)
	this.start = Date.now();
	// console.log(docs);
	next();
})

// Aggregation middleware
// tourSchema.pre('aggregate', function(next) {
// 	this.pipeline().unshift({ $match: { secretTour: { $ne: true }}});
// 	console.log(this.pipeline());
// 	next();
// })

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;