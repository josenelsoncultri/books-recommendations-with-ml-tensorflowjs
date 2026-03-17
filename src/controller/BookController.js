export class BookController {
    #bookView;
    #currentperson = null;
    #events;
    #bookService;
    constructor({
        bookView,
        events,
        bookService
    }) {
        this.#bookView = bookView;
        this.#bookService = bookService;
        this.#events = events;
        this.init();
    }

    static init(deps) {
        return new BookController(deps);
    }

    async init() {
        this.setupCallbacks();
        this.setupEventListeners();
        const books = await this.#bookService.getBooks();
        this.#bookView.render(books, true);
    }

    setupEventListeners() {
        this.#events.onpersonSelected((person) => {
            this.#currentperson = person;
            this.#bookView.onpersonSelected(person);
            this.#events.dispatchRecommend(person)
        })

        this.#events.onRecommendationsReady(({ recommendations }) => {
            this.#bookView.render(recommendations, false);
        });
    }

    setupCallbacks() {
        this.#bookView.registerBuyBookCallback(this.handleBuyBook.bind(this));
    }

    async handleBuyBook(book) {
        const person = this.#currentperson;
        this.#events.dispatchReadingAdded({ person, book });
    }

}
