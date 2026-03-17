export class PersonController {
    #personService;
    #personView;
    #events;
    constructor({
        personView,
        personService,
        events,
    }) {
        this.#personView = personView;
        this.#personService = personService;
        this.#events = events;
    }

    static init(deps) {
        return new PersonController(deps);
    }

    async renderPeople(nonTrainedperson) {
        const People = await this.#personService.getDefaultPeople();

        this.#personService.addperson(nonTrainedperson);
        const defaultAndNonTrained = [nonTrainedperson, ...People];

        this.#personView.renderpersonOptions(defaultAndNonTrained);
        this.setupCallbacks();
        this.setupReadingObserver();

        this.#events.dispatchPeopleUpdated({ People: defaultAndNonTrained });

    }

    setupCallbacks() {
        this.#personView.registerpersonSelectCallback(this.handlepersonSelect.bind(this));
        this.#personView.registerReadingRemoveCallback(this.handleReadingRemove.bind(this));
    }

    setupReadingObserver() {
        this.#events.onReadingAdded(
            async (...data) => {
                return this.handleReadingAdded(...data);
            }
        );
    }

    async handlepersonSelect(personId) {
        const person = await this.#personService.getpersonById(personId);
        this.#events.dispatchpersonSelected(person);
        return this.displaypersonDetails(person);
    }

    async handleReadingAdded({ person, book }) {
        const updatedperson = await this.#personService.getpersonById(person.Id);
        updatedperson.readings.push({
            ...book,
            NomeLivro: book.Titulo
        })

        await this.#personService.updateperson(updatedperson);

        const lastReading = updatedperson.readings[updatedperson.readings.length - 1];
        this.#personView.addPastReading(lastReading);
        this.#events.dispatchPeopleUpdated({ People: await this.#personService.getPeople() });
    }

    async handleReadingRemove({ personId, book }) {
        const person = await this.#personService.getpersonById(personId);
        const index = person.readings.findIndex(item => item.id === book.id);

        if (index !== -1) {
            person.readings.splice(index, 1); // directly remove one item at the found index
            await this.#personService.updateperson(person);

            const updatedPeople = await this.#personService.getPeople();
            this.#events.dispatchPeopleUpdated({ People: updatedPeople });
        }
    }

    async displaypersonDetails(person) {
        this.#personView.renderpersonDetails(person);
        this.#personView.renderPastReadings(person.readings);
    }

    getSelectedpersonId() {
        return this.#personView.getSelectedpersonId();
    }
}
