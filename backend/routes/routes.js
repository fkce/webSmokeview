
module.exports = function (app) {

	// Test route
	app.get('/api/test', (req, res) => {

		result = {
			meta: {
				status: 'success',
				from: 'test',
				details: ['Getting obst geometry']
			},
			data: null
		}
		res.send(result)
	})

	// Other routes ...

}
