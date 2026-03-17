import { View } from './View.js';

export class BookView extends View {
    // DOM elements
    #bookList = document.querySelector('#bookList');

    #buttons;
    // Templates and callbacks
    #bookTemplate;
    #onBuyBook;

    constructor() {
        super();
        this.init();
    }

    async init() {
        this.#bookTemplate = await this.loadTemplate('./src/view/templates/book-card.html');
    }

    onpersonSelected(person) {
        // Enable buttons if a person is selected, otherwise disable them
        this.setButtonsState(person.Id ? false : true);
    }

    registerBuyBookCallback(callback) {
        this.#onBuyBook = callback;
    }

    render(books, disableButtons = true) {
        if (!this.#bookTemplate) return;
        const html = books.map(book => {
            return this.replaceTemplate(this.#bookTemplate, {
                ID: book.ID,
                Titulo: book.Titulo,
                Autor: book.Autor,
                Paginas: book.Paginas,
                Ano: book.Ano,
                book: JSON.stringify(book)
            });
        }).join('');

        this.#bookList.innerHTML = html;
        this.attachBuyButtonListeners();

        // Disable all buttons by default
        this.setButtonsState(disableButtons);
    }

    setButtonsState(disabled) {
        if (!this.#buttons) {
            this.#buttons = document.querySelectorAll('.mark-as-read-btn');
        }
        this.#buttons.forEach(button => {
            button.disabled = disabled;
        });
    }

    attachBuyButtonListeners() {
        this.#buttons = document.querySelectorAll('.mark-as-read-btn');
        this.#buttons.forEach(button => {

            button.addEventListener('click', (event) => {
                const book = JSON.parse(button.dataset.book);
                const originalText = button.innerHTML;

                button.innerHTML = '<i class="bi bi-check-circle-fill"></i> Marked as Read';
                button.classList.remove('btn-primary');
                button.classList.add('btn-success');
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('btn-success');
                    button.classList.add('btn-primary');
                }, 500);
                this.#onBuyBook(book, button);
            });
        });
    }
}
