import { View } from './View.js';

export class PersonView extends View {
    #personSelect = document.querySelector('#personSelect');
    #personAge = document.querySelector('#personAge');
    #pastReadingsList = document.querySelector('#pastReadingsList');

    #readingTemplate;
    #onpersonSelect;
    #onReadingRemove;
    #pastReadingElements = [];

    constructor() {
        super();
        this.init();
    }

    async init() {
        this.#readingTemplate = await this.loadTemplate('./src/view/templates/past-reading.html');
        this.attachpersonSelectListener();
    }

    registerpersonSelectCallback(callback) {
        this.#onpersonSelect = callback;
    }

    registerReadingRemoveCallback(callback) {
        this.#onReadingRemove = callback;
    }

    renderpersonOptions(People) {
        const options = People.map(person => {
            return `<option value="${person.Id}">${person.Nome}</option>`;
        }).join('');

        this.#personSelect.innerHTML += options;
    }

    renderpersonDetails(person) {
        this.#personAge.value = person.Idade;
    }

    renderPastReadings(pastReadings) {
        if (!this.#readingTemplate) return;

        if (!pastReadings || pastReadings.length === 0) {
            this.#pastReadingsList.innerHTML = '<p>No past readings found.</p>';
            return;
        }

        const html = pastReadings.map(book => {
            return this.replaceTemplate(this.#readingTemplate, {
                ...book,
                book: JSON.stringify(book)
            });
        }).join('');

        this.#pastReadingsList.innerHTML = html;
        this.attachReadingClickHandlers();
    }

    addPastReading(book) {

        if (this.#pastReadingsList.innerHTML.includes('No past readings found')) {
            this.#pastReadingsList.innerHTML = '';
        }

        const readingHtml = this.replaceTemplate(this.#readingTemplate, {
            ...book,
            book: JSON.stringify(book)
        });

        this.#pastReadingsList.insertAdjacentHTML('afterbegin', readingHtml);

        const newReading = this.#pastReadingsList.firstElementChild.querySelector('.past-reading');
        newReading.classList.add('past-reading-highlight');

        setTimeout(() => {
            newReading.classList.remove('past-reading-highlight');
        }, 1000);

        this.attachReadingClickHandlers();
    }

    attachpersonSelectListener() {
        this.#personSelect.addEventListener('change', (event) => {
            const personId = event.target.value ? Number(event.target.value) : null;

            if (personId) {
                if (this.#onpersonSelect) {
                    this.#onpersonSelect(personId);
                }
            } else {
                this.#personAge.value = '';
                this.#pastReadingsList.innerHTML = '';
            }
        });
    }

    attachReadingClickHandlers() {
        this.#pastReadingElements = [];

        const readingElements = document.querySelectorAll('.past-reading');

        readingElements.forEach(readingElement => {
            this.#pastReadingElements.push(readingElement);

            readingElement.onclick = (event) => {

                const book = JSON.parse(readingElement.dataset.book);
                const personId = this.getSelectedpersonId();
                const element = readingElement.closest('.col-md-6');

                this.#onReadingRemove({ element, personId, book });

                element.style.transition = 'opacity 0.5s ease';
                element.style.opacity = '0';

                setTimeout(() => {
                    element.remove();

                    if (document.querySelectorAll('.past-reading').length === 0) {
                        this.renderPastReadings([]);
                    }
                }, 500);

            }
        });
    }

    getSelectedpersonId() {
        return this.#personSelect.value ? Number(this.#personSelect.value) : null;
    }
}
