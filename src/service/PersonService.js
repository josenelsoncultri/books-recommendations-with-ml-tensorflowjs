import { Parameters } from "../events/constants.js";
import { ReadingsService } from "./ReadingsService.js";

const readingService = new ReadingsService();
export class PersonService {
    #storageKey = 'ew-academy-People';

    async getDefaultPeople() {
        //const response = await fetch('./data/users.json');
        const response = await fetch(`${Parameters.API_URL}/pessoas`)
        const People = await response.json();

        for (const person of People)
        {
            person.readings = await readingService.getReadingsByPersonIdAsync(person.Id);
        }

        this.#setStorage(People);

        return People;
    }

    async getPeople() {
        const People = this.#getStorage();
        return People;
    }

    async getpersonById(personId) {
        const People = this.#getStorage();
        return People.find(person => person.Id === personId);
    }

    async updateperson(person) {
        const People = this.#getStorage();
        const personIndex = People.findIndex(u => u.Id === person.Id);

        People[personIndex] = { ...People[personIndex], ...person };
        this.#setStorage(People);

        return People[personIndex];
    }

    async addperson(person) {
        const People = this.#getStorage();
        this.#setStorage([person, ...People]);
    }

    #getStorage() {
        const data = sessionStorage.getItem(this.#storageKey);
        return data ? JSON.parse(data) : [];
    }

    #setStorage(data) {
        sessionStorage.setItem(this.#storageKey, JSON.stringify(data));
    }


}
