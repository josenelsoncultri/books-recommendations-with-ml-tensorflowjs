import { Parameters } from "../events/constants.js";

export class ReadingsService {
    async getReadingsByPersonIdAsync(personId) {
        const response = await fetch(`${Parameters.API_URL}/lista-leitura/${personId}`)
        const json = await response.json();
        return json;
    }
}