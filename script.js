function _min(d0, d1, d2, bx, ay) {
	return d0 < d1 || d2 < d1
		? d0 > d2
			? d2 + 1
			: d0 + 1
		: bx === ay
		? d1
		: d1 + 1;
}

function levenshtein(a, b) {
	if (a === b) {
		return 0;
	}

	if (a.length > b.length) {
		var tmp = a;
		a = b;
		b = tmp;
	}

	var la = a.length;
	var lb = b.length;

	while (la > 0 && a.charCodeAt(la - 1) === b.charCodeAt(lb - 1)) {
		la--;
		lb--;
	}

	var offset = 0;

	while (offset < la && a.charCodeAt(offset) === b.charCodeAt(offset)) {
		offset++;
	}

	la -= offset;
	lb -= offset;

	if (la === 0 || lb < 3) {
		return lb;
	}

	var x = 0;
	var y;
	var d0;
	var d1;
	var d2;
	var d3;
	var dd;
	var dy;
	var ay;
	var bx0;
	var bx1;
	var bx2;
	var bx3;

	var vector = [];

	for (y = 0; y < la; y++) {
		vector.push(y + 1);
		vector.push(a.charCodeAt(offset + y));
	}

	var len = vector.length - 1;

	for (; x < lb - 3; ) {
		bx0 = b.charCodeAt(offset + (d0 = x));
		bx1 = b.charCodeAt(offset + (d1 = x + 1));
		bx2 = b.charCodeAt(offset + (d2 = x + 2));
		bx3 = b.charCodeAt(offset + (d3 = x + 3));
		dd = x += 4;
		for (y = 0; y < len; y += 2) {
			dy = vector[y];
			ay = vector[y + 1];
			d0 = _min(dy, d0, d1, bx0, ay);
			d1 = _min(d0, d1, d2, bx1, ay);
			d2 = _min(d1, d2, d3, bx2, ay);
			dd = _min(d2, d3, dd, bx3, ay);
			vector[y] = dd;
			d3 = d2;
			d2 = d1;
			d1 = d0;
			d0 = dy;
		}
	}

	for (; x < lb; ) {
		bx0 = b.charCodeAt(offset + (d0 = x));
		dd = ++x;
		for (y = 0; y < len; y += 2) {
			dy = vector[y];
			vector[y] = dd = _min(dy, d0, dd, bx0, vector[y + 1]);
			d0 = dy;
		}
	}

	return dd;
}

const cont_file_upload = elem("#cont_file_upload");
const cont_cur_book_data = elem("#cont_cur_book_data");
const btn_upload = elem("#btn_upload");
const file_sel = elem("#file_sel");
const btn_new = elem("#btn_new");
const btn_save = elem("#btn_save");
const cont_congratulations = elem("#cont_congratulations");

const fld_title = elem("#fld_title");
const fld_subtitle = elem("#fld_subtitle");
const fld_author = elem("#fld_author");
const fld_publisher = elem("#fld_publisher");
const fld_isbn = elem("#fld_isbn");
const fld_year = elem("#fld_year");
const fld_ids = elem("#fld_ids");
const btn_reset = elem("#btn_reset");
const btn_skip = elem("#btn_skip");
const fld_progress = elem("#fld_progress");
const cont_suggestions = elem("#cont_suggestions");

let data = null;

function elem(id) {
	let elem = document.querySelector(id);
	if (elem == null) console.log("INVALID ID: " + id);
	return elem;
}

function hide(el) {
	el.style.display = "none";
}

function show(el) {
	el.style.display = "block";
}

function fillin_fields(obj) {
	fld_title.value = obj.title;
	fld_subtitle.value = obj.subtitle;
	fld_author.value = obj.author;
	fld_publisher.value = obj.publisher;
	fld_isbn.value = obj.isbn;
	fld_year.value = obj.year;
	fld_ids.innerText = "Mediennummern: " + obj.ids.join(", ");
}

function update_suggestions(list) {
	let str =
		"<tr>" +
		"<th>LS</th>" +
		"<th>Titel</th>" +
		"<th>UTitel</th>" +
		"<th>Autor</th>" +
		"<th>Verlag</th>" +
		"<th>ISBN</th>" +
		"<th>EJahr</th>" +
		"<th>MNummern</th>" +
		"</tr>";

	list.forEach((item) => {
		str +=
			"<tr>" +
			"<td>" +
			item.ldist +
			"</td>" +
			"<td>" +
			item.title +
			"</td>" +
			"<td>" +
			item.subtitle +
			"</td>" +
			"<td>" +
			item.author +
			"</td>" +
			"<td>" +
			item.publisher +
			"</td>" +
			"<td>" +
			item.isbn +
			"</td>" +
			"<td>" +
			item.year +
			"</td>" +
			"<td>" +
			item.ids.join(", ") +
			"</td>" +
			"</tr>";
	});

	cont_suggestions.innerHTML = str;
}

function is_suggestion(cur, obj) {
	obj.ldist = 0;
	return true;
}

function get_suggestions(cur) {
	return data.bnew
		.filter((item) => is_suggestion(cur, item))
		.sort((a, b) => a.ldist < b.ldist);
}

function action_skip() {
	data.old.push(data.old.shift());
	first_book();
}

function action_new() {
	let obj = {
		title: fld_title.value,
		subtitle: fld_subtitle.value,
		author: fld_author.value,
		publisher: fld_publisher.value,
		isbn: fld_isbn.value,
		year: parseInt(fld_year.value),
		ids: data.old[0].ids,
	};

	data.old.shift();
	data.bnew.push(obj);
	first_book();
}

function merge_books(idx)
{
	let obj = data.bnew[idx];
	obj.ids = obj.ids.concat(data.old[0].ids);
	data.old.shift();
	first_book();
}

function first_book() {
	if (data.old.length == 0) {
		show(cont_congratulations);
		hide(cont_cur_book_data);
		action_save();
	} else {
		fld_progress.innerText =
			"TODO: " + data.old.length + " - DONE: " + data.bnew.length;
		show(cont_cur_book_data);
		let obj = data.old[0];
		fillin_fields(obj);
		update_suggestions(get_suggestions(obj));
		update_g_suggestions(obj);
	}
}

function parse_json(json) {
	data = json;
	first_book();
	hide(cont_file_upload);
}

function read_file(file) {
	const reader = new FileReader();
	reader.onload = function (event) {
		parse_json(JSON.parse(event.target.result));
	};

	reader.readAsText(file);
}

function padToFour(number) {
	if (number <= 9999) {
		number = ("000" + number).slice(-4);
	}
	return number;
}

function action_save() {
	data.version += 1;

	const link = document.createElement("a");
	const content = JSON.stringify(data);
	const file = new Blob([content], { type: "text/plain" });
	link.href = URL.createObjectURL(file);
	link.download = "bookdata_" + padToFour(data.version) + ".json";
	link.click();
	URL.revokeObjectURL(link.href);
}

file_sel.onchange = function () {
	show(btn_upload);
};

btn_upload.onclick = function () {
	const file = file_sel.files[0];
	read_file(file);
};

btn_save.onclick = action_save;
btn_reset.onclick = first_book;
btn_skip.onclick = action_skip;
btn_new.onclick = action_new;

hide(btn_upload);
hide(cont_cur_book_data);
hide(cont_congratulations);

const s_title = elem("#s_title");
const s_subtitle = elem("#s_subtitle");
const s_author = elem("#s_author");
const s_publisher = elem("#s_publisher");
const s_isbn = elem("#s_isbn");
const s_year = elem("#s_year");
const s_img = elem("#s_img");

const btn_s_last = elem("#btn_s_last");
const btn_s_next = elem("#btn_s_next");
const btn_s_take = elem("#btn_s_take");

async function update_g_suggestions(cur) {
	// get data

	let suggs = await get_api_suggestions(cur);

	// render data
	render_g_suggestions(suggs);
}

function render_g_suggestions(suggs) {
	let curS = 0;
	render_g_suggestion(suggs[curS], curS, suggs.length);

	btn_s_next.onclick = () => {
		curS++;
		render_g_suggestion(suggs[curS], curS, suggs.length);
	};
	btn_s_last.onclick = () => {
		curS--;
		render_g_suggestion(suggs[curS], curS, suggs.length);
	};
	btn_s_take.onclick = () => {
		fillin_suggestion(suggs[curS]);
	};
}
function fillin_suggestion(obj) {
	fld_title.value = obj.title;
	fld_subtitle.value = obj.subtitle;
	fld_author.value = obj.author;
	fld_publisher.value = obj.publisher;
	fld_isbn.value = obj.isbn;
	fld_year.value = obj.year;
}
function render_g_suggestion(sugg, curS, suggs_cnt) {
	btn_s_last.disabled = false;
	btn_s_next.disabled = false;

	if (curS == 0) {
		btn_s_last.disabled = true;
	}
	if (curS >= suggs_cnt - 1) {
		btn_s_next.disabled = true;
	}

	s_title.value = sugg.title;
	s_subtitle.value = sugg.subtitle;
	s_author.value = sugg.author;
	s_publisher.value = sugg.publisher;
	s_isbn.value = sugg.isbn;
	s_year.value = sugg.year;
	s_img.src = sugg.image;
}
