class ApiFeatures {
	constructor(query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}

	filter() { // Filtering

		const queryObj = {...this.queryString };
		const excludeFields = ['page', 'sort', 'limit', 'fields'];
		excludeFields.forEach(el => delete queryObj[el]);

		// Advanced Filtering
		let queryStr = JSON.stringify(queryObj);
		queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

		this.query = this.query.find(JSON.parse(queryStr));

		return this;
	}

	sort() { // http://localhost:3000/api/v1/tours?sort=price,averageRating

		if(this.queryString.sort){
			const sortBy = this.queryString.sort.split(',').join(' ');
			this.query = this.query.sort(sortBy)
		} else {
			this.query = this.query.sort('-createdAt');
		}

		return this;
	}

	limitFields() { // http://localhost:3000/api/v1/tours?fields=name,duration,price

		if(this.queryString.fields){
			const fields = this.queryString.fields.split(',').join(' ');
			this.query = this.query.select(fields)
		} else {
			this.query = this.query.select('-__v');
		}

		return this;
	}

	paginate() { // http://localhost:3000/api/v1/tours?page=3&limit=3

		const page = this.queryString.page * 1 || 1;
		const limit = this.queryString.limit * 1 || 100;
		const skip = (page - 1) * limit;

		this.query.skip(skip).limit(limit);

		// if(this.queryString.page){
		// 	const numTours = await this.query.countDocuments();
		// 	if(skip >= numTours) throw new Error ('Page not exist!')
		// }

		return this;
	}
}

module.exports = ApiFeatures;