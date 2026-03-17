export class ModelController {
    #modelView;
    #personService;
    #events;
    #currentperson = null;
    #alreadyTrained = false;
    constructor({
        modelView,
        personService,
        events,
    }) {
        this.#modelView = modelView;
        this.#personService = personService;
        this.#events = events;

        this.init();
    }

    static init(deps) {
        return new ModelController(deps);
    }

    async init() {
        this.setupCallbacks();
    }

    setupCallbacks() {
        this.#modelView.registerTrainModelCallback(this.handleTrainModel.bind(this));
        this.#modelView.registerRunRecommendationCallback(this.handleRunRecommendation.bind(this));

        this.#events.onpersonSelected((person) => {
            this.#currentperson = person;
            if (!this.#alreadyTrained) return
            this.#modelView.enableRecommendButton();
        });

        this.#events.onTrainingComplete(() => {
            this.#alreadyTrained = true;
            if (!this.#currentperson) return
            this.#modelView.enableRecommendButton();
        })

        this.#events.onPeopleUpdated(
            async (...data) => {
                return this.refreshPeopleReadingData(...data);
            }
        );
        this.#events.onProgressUpdate(
            (progress) => {
                this.handleTrainingProgressUpdate(progress);
            }
        );

    }


    async handleTrainModel() {
        const People = await this.#personService.getPeople();

        this.#events.dispatchTrainModel(People);
    }

    handleTrainingProgressUpdate(progress) {
        this.#modelView.updateTrainingProgress(progress);
    }
    async handleRunRecommendation() {
        const currentperson = this.#currentperson;
        const updatedperson = await this.#personService.getpersonById(currentperson.Id);
        this.#events.dispatchRecommend(updatedperson);
    }

    async refreshPeopleReadingData({ People }) {
        await this.#modelView.renderAllPeopleReadingsAsync(People);
    }
}
