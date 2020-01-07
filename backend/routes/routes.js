const fs = require('fs');

module.exports = function (app) {

	// Get obsts
	app.get('/api/obsts', (req, res) => {

		// read local file
		fs.readFile('example/obsts.json', (err, data) => {
			// TODO: perform error handling
			if (err) throw err;

			let obsts = JSON.parse(data);
			result = {
				meta: {
					status: 'success',
					from: '...',
					details: ['Getting obst geometry']
				},
				data: {
					vertices: obsts.vertices,
					normals: obsts.normals,
					colors: obsts.colors,
					indices: obsts.indices
				}
			}
			res.send(result)
		});

	});

	// Get slices
	app.get('/api/slices', (req, res) => {
		// read local file
		fs.readFile('example/slices.json', (err, data) => {
			// TODO: perform error handling
			if (err) throw err;

			let slice = JSON.parse(data);
			result = {
				meta: {
					status: 'success',
					from: '...',
					details: ['Getting slice']
				},
				data: {
					vertices: slice.vertices,
					indices: slice.indices,
					texData: slice.texData,
					blank: slice.blank
				}
			}
			res.send(result)
		});

	});

}
