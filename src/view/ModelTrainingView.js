import { View } from './View.js';

export class ModelView extends View {
    #trainModelBtn = document.querySelector('#trainModelBtn');
    #readingsArrow = document.querySelector('#readingsArrow');
    #readingsDiv = document.querySelector('#readingsDiv');
    #allPeopleReadingsList = document.querySelector('#allPeopleReadingsList');
    #runRecommendationBtn = document.querySelector('#runRecommendationBtn');
    #onTrainModel;
    #onRunRecommendation;

    constructor() {
        super();
        this.attachEventListeners();
    }

    registerTrainModelCallback(callback) {
        this.#onTrainModel = callback;
    }
    registerRunRecommendationCallback(callback) {
        this.#onRunRecommendation = callback;
    }

    attachEventListeners() {
        this.#trainModelBtn.addEventListener('click', () => {
            this.#onTrainModel();
        });
        this.#runRecommendationBtn.addEventListener('click', () => {
            this.#onRunRecommendation();
        });

        this.#readingsDiv.addEventListener('click', () => {
            const readingsList = this.#allPeopleReadingsList;

            const isHidden = window.getComputedStyle(readingsList).display === 'none';

            if (isHidden) {
                readingsList.style.display = 'block';
                this.#readingsArrow.classList.remove('bi-chevron-down');
                this.#readingsArrow.classList.add('bi-chevron-up');
            } else {
                readingsList.style.display = 'none';
                this.#readingsArrow.classList.remove('bi-chevron-up');
                this.#readingsArrow.classList.add('bi-chevron-down');
            }
        });

    }
    enableRecommendButton() {
        this.#runRecommendationBtn.disabled = false;
    }
    updateTrainingProgress(progress) {
        this.#trainModelBtn.disabled = true;
        this.#trainModelBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Training...';

        if (progress.progress === 100) {
            this.#trainModelBtn.disabled = false;
            this.#trainModelBtn.innerHTML = 'Train Recommendation Model';
        }
    }

    async renderAllPeopleReadingsAsync(People) {
        const html = People.map(person => {
            const readingsHtml = person.readings.map(reading => {
                return `<span class="badge bg-light text-dark me-1 mb-1">${reading.NomeLivro}</span>`;
            }).join('');

            return `
                <div class="person-reading-summary">
                    <h6>${person.Nome} (Idade: ${person.Idade})</h6>
                    <div class="readings-badges">
                        ${readingsHtml || '<span class="text-muted">No readings</span>'}
                    </div>
                </div>
            `;
        }).join('');

        this.#allPeopleReadingsList.innerHTML = html;
    }
}
