async function get_api_suggestions(cur)
{
	let search = cur.title + " " + cur.subtitle;

	const response = await fetch(
		"https://www.googleapis.com/books/v1/volumes?" +
			new URLSearchParams(
				{
					q: search
				}
			));

	const json = await response.json();

	return json.items.map(item => {
		const isbn10 = item.volumeInfo.industryIdentifiers.find(el => el.type == "ISBN_10");
		const isbn13 = item.volumeInfo.industryIdentifiers.find(el => el.type == "ISBN_13");

		return {
			title: item.volumeInfo.title,
			subtitle: "",
			author: item.volumeInfo.authors != null ?
				item.volumeInfo.authors.join(", ") : "",
			publisher: item.volumeInfo.publisher != null ?
				item.volumeInfo.publisher : "",
			year: item.volumeInfo.publishedDate != null ?
				parseInt(item.volumeInfo.publishedDate.split("-")[0]) : -1,
			isbn: isbn13 != null ? isbn13.identifier : isbn10.identifier,
			pages: item.volumeInfo.pageCount != null ?
				item.volumeInfo.pageCount : -1,
			description: item.volumeInfo.description != null ?
				item.volumeInfo.description : "",
			image: item.volumeInfo.imageLinks != null ?
				item.volumeInfo.imageLinks.thumbnail : null
		}});
}
