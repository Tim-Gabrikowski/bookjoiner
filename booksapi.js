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
		const isbn10 = item.volumeInfo.industryIdentifers.find(el => el.type == "ISBN_10");
		const isbn13 = item.volumeInfo.industryIdentifers.find(el => el.type == "ISBN_13");

		return {
			title: item.volumeInfo.title,
			subtitle: "",
			author: item.volumeInfo.authors.join(", "),
			published: item.volumeInfo.publisher,
			year: item.volumeInfo.publishedDate.split("-")[0],
			isbn: isbn13 != null ? isbn13 : isbn10,
			pages: item.volumeInfo.pageCount,
			description: item.volumeInfo.description,
			image: item.volumeInfo.imageLinks.thumbnail
		}});
}
