use serde::Deserialize;
use serde::Serialize;
use std::{env, error::Error, process};
use std::fs::File;
use std::io::BufWriter;
use std::io::Write;

#[derive(Debug, Deserialize)]
struct InputMedium {
	MNUMMER: String,
	TITEL: String,
	UTITEL: String,
	AUTOR: String,
	VERLAG: String,
	ISBN: String,
	EJAHR: String
}

#[derive(Debug, Serialize)]
struct OutputMedium {
	title: String,
	subtitle: String,
	author: String,
	publisher: String,
	isbn: String,
	year: i32,
	ids: Vec<i32>
}

fn convert_data(m: &InputMedium) -> Option<OutputMedium> {
	match m.MNUMMER.parse::<i32>()
	{
		Ok(id) => Some(OutputMedium {
			title: m.TITEL.clone(),
			subtitle: m.UTITEL.clone(),
			author: m.AUTOR.clone(),
			publisher: m.VERLAG.clone(),
			isbn: m.ISBN.clone(),
			year: m.EJAHR.parse::<i32>().unwrap_or(-1),
			ids: vec![ id ]
		}),
		Err(_) => None
	}
}

fn compare_media(m1: &InputMedium, m2: &OutputMedium) -> bool {
	return m1.TITEL == m2.title && m1.UTITEL == m2.subtitle &&
		m1.AUTOR == m2.author;
}

fn load_csv(fname: &String) -> Result<(), Box<dyn Error>>
{
	let mut records: Vec<InputMedium> = Vec::with_capacity(5000);
	let mut reader = csv::Reader::from_path(fname)?;
	for result in reader.deserialize()
	{
		let record: InputMedium = result?;
		records.push(record);
		// println!("{:?}", record);
	}

	parse_input(&records);

	Ok(())
}

fn main() {
	let args: Vec<String> = env::args().collect();

	if args.len() < 2 {
		println!("Usage: ./bookjoiner `csv-file`");
		return;
	}

	if let Err(err) = load_csv(&args[1]) {
		println!("-- Error reading file --\n{}", err);
		process::exit(1);
	}
}

fn parse_json(json: &str) {
	match serde_json::from_str::<Vec<InputMedium>>(json) {
		Ok(data) => parse_input(&data),
		Err(msg) => {
			println!("JSON was not well-formatted");
			println!("{}", msg);
		}
	}
}

fn parse_input(input: &Vec<InputMedium>) {
	let mut output: Vec<OutputMedium> = Vec::with_capacity(input.len());

	println!("Number of input books: {}", input.len());

	for book_input in input {
		for book_output in &mut output {
			if compare_media(&book_input, &book_output) {
				match book_input.MNUMMER.parse::<i32>() {
					Ok(id) => {
						book_output.ids.push(id);
					},
					Err(msg) => {
						println!("Ungueltige Medienummer: {}", book_input.MNUMMER);
					}
				}
				break;
			}
		}

		match convert_data(book_input)
		{
			Some(book) => output.push(book),
			None => println!("Ungueltige Medienummer: {}", book_input.MNUMMER)
		}
	}

	let mut numdupl = 0;
	for book_output in &mut output {
		let count = book_output.ids.len();
		if count > 1
		{
			println!("COUNT {} ==> {:?}", count, book_output);
			numdupl += 1;
		}
	}

	println!("Anzahl Books mit mehr als 1 Exemplar {}", numdupl);

	let file = File::create("out.json").unwrap();
	let mut writer = BufWriter::new(file);
	serde_json::to_writer(&mut writer, &output).unwrap();
	writer.flush().unwrap();
}