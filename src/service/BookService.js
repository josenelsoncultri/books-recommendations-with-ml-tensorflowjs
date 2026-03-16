export class BookService {
    async getBooks() {
        const response = await fetch('./data/products.json');
        return await response.json();
    }

    async getBookById(id) {
        const books = await this.getBooks();
        return books.find(book => book.id === id);
    }

    async getBooksByIds(ids) {
        const books = await this.getBooks();
        return books.filter(book => ids.includes(book.id));
    }
}
