const fs = require('fs');
const path = require('path');
const exe = require('child_process').execSync;
const root = exe('npm root -g').toString().trim();
if (!fs.existsSync(root + '/@angular/cli')) {
	console.log("You should install '@angular/cli' global. 'npm i -g @angular/cli'");
	process.exit(0);
}

module.exports = async waw => {
	console.log(waw.base, waw.component, waw.fileName, waw.argv[2]);
	process.exit(1);

	try {
		exe('ng g m ' + waw.component);
	} catch (error) {
		console.log('\x1b[33m%s\x1b[0m', "You probably should install or re-install node modules, try:");
		console.log('\x1b[36m%s\x1b[0m', 'npm install');
		process.exit(0);
	}
	exe('ng g c ' + waw.component);

	fs.mkdirSync(waw.base, {
		recursive: true
	});

	waw.base = path.join(waw.base, waw.fileName);

	let html = fs.readFileSync(waw.template + '/component.html', 'utf8');
	html = html.split('CNAME').join(waw.Name);
	html = html.split('NAME').join(waw.name);
	fs.writeFileSync(waw.base + '.component.html', html, 'utf8');

	let scss = fs.readFileSync(waw.template + '/component.scss', 'utf8');
	scss = scss.split('CNAME').join(waw.Name);
	scss = scss.split('NAME').join(waw.name);
	fs.writeFileSync(waw.base + '.component.scss', scss, 'utf8');

	let ts = fs.readFileSync(waw.template + '/component.ts', 'utf8');
	ts = ts.split('CNAME').join(waw.Name);
	ts = ts.split('NAME').join(waw.name);
	fs.writeFileSync(waw.base + '.component.ts', ts, 'utf8');

	waw.add_code({
		file: process.cwd() + '/src/app/app.module.ts',
		search: '/* alerts */',
		replace: "/* alerts */\n\t\t\t\t\t" + waw.name + ": " + waw.Name + "Component,"
	});

	waw.add_code({
		file: process.cwd() + '/src/app/app.module.ts',
		search: '/* ' + waw.argv[2].split('/')[2] + ' */',
		replace: '/* ' + waw.argv[2].split('/')[2] + " */{\n\t\tpath: '" + waw.name + "',\n\t\tcanActivate: [MetaGuard],\n\t\tdata: {\n\t\t\tmeta: {\n\t\t\t\ttitle: '" + waw.Name + "'\n\t\t\t}\n\t\t},\n\t\tloadChildren: () => import('./" + waw.path + '/' + waw.name + ".module').then(m => m." + waw.Name + "Module)\n\t}, "
	});

	console.log('Alert has been created');

	process.exit(1);
}
