const fs = require('fs');
const path = require('path');

const location = process.argv[process.argv.length - 1];

const writeLocation = path.join(__dirname, '..');

const bodyRegex = /<body[^>*]*>((.|\n)*?)<\/body>/i;

//this is better for unexpected path data like: "/weird.folder/somefolder"
function getExt(path){
	return (path.match(/(?:.+..+[^\/]+$)/ig) != null) ? path.split('.').slice(-1): 'null';
}

function processDir(dir) {
	fs.readdir(dir, (err, files) => {
		console.log('reading directory ' + dir);
		if (err) {
			return console.log('Unable to scan dir ' + dir);
		}
		
		files.forEach((file) => {
			if (fs.statSync(path.join(dir, file)).isDirectory()) {
				processDir(path.join(dir, file));
			}
			
			if (getExt(file)[0] === 'html') {
				console.log('processing: ' + path.join(dir, file));
				
				// manipulate file
				fs.readFile(path.join(dir, file), (err, buf) => {
					// get inside the 1st group for inside body tags
					const strippedHTML = buf.toString().match(bodyRegex)[1];
					
					const filename = file.substr(0, file.lastIndexOf('.'));
					const filePath = path.join(writeLocation, filename) + '.hbs';
					
					fs.writeFile(filePath, strippedHTML, (err) => {
						if (err) {
							console.log(err);
						}
						console.log('processed: ' + filePath);
					});
				});
				
				
			}
		});
	});
}

processDir(__dirname);