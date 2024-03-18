const fs = require("fs");

let data = JSON.parse(fs.readFileSync("./data_us.json"));

let books = [];

for (let i = 0; i < data.old.length; i++) {
	const elem = data.old[i];

	let b = books.find(
		(v) =>
			v.title == elem.title &&
			v.subtitle == elem.subtitle &&
			v.author == elem.author
	);
	if (!b) {
		books.push(elem);
		continue;
	}

	let s = [];

	elem.ids.forEach((id) => {
		if (!s.findIndex((e) => e == id)) s.add(id);
	});

	if (s.length > 0) {
		elem.ids = s;
		books.push(elem);
	}
}

fs.writeFileSync(
	"./out_data_us.json",
	JSON.stringify({
		version: data.version,
		old: books,
		bnew: data.bnew,
	})
);
