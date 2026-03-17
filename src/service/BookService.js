import { Parameters } from "../events/constants.js";

export class BookService {
    async getBooks() {
        const response = await fetch(`${Parameters.API_URL}/livros`)
        return await response.json();
    }

    async getBookById(id) {
        const books = await this.getBooks();
        return books.find(book => book.ID === id);
    }

    async getBooksByIds(ids) {
        const books = await this.getBooks();
        return books.filter(book => ids.includes(book.ID));
    }
}
