import { events } from "./constants.js";

export default class Events {


    static onTrainingComplete(callback) {
        document.addEventListener(events.trainingComplete, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchTrainingComplete(data) {
        const event = new CustomEvent(events.trainingComplete, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onRecommend(callback) {
        document.addEventListener(events.recommend, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchRecommend(data) {
        const event = new CustomEvent(events.recommend, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onRecommendationsReady(callback) {
        document.addEventListener(events.recommendationsReady, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchRecommendationsReady(data) {
        const event = new CustomEvent(events.recommendationsReady, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onTrainModel(callback) {
        document.addEventListener(events.modelTrain, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchTrainModel(data) {
        const event = new CustomEvent(events.modelTrain, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onTFVisLogs(callback) {
        document.addEventListener(events.tfvisLogs, (event) => {
            return callback(event.detail);
        });
    }

    static dispatchTFVisLogs(data) {
        const event = new CustomEvent(events.tfvisLogs, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onTFVisorData(callback) {
        document.addEventListener(events.tfvisData, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchTFVisorData(data) {
        const event = new CustomEvent(events.tfvisData, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onProgressUpdate(callback) {
        document.addEventListener(events.modelProgressUpdate, (event) => {
            return callback(event.detail);
        });
    }

    static dispatchProgressUpdate(progressData) {
        const event = new CustomEvent(events.modelProgressUpdate, {
            detail: progressData
        });
        document.dispatchEvent(event);
    }


    static onpersonSelected(callback) {
        document.addEventListener(events.personSelected, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchpersonSelected(data) {
        const event = new CustomEvent(events.personSelected, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onPeopleUpdated(callback) {
        document.addEventListener(events.PeopleUpdated, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchPeopleUpdated(data) {
        const event = new CustomEvent(events.PeopleUpdated, {
            detail: data
        });
        document.dispatchEvent(event);
    }


    static onReadingAdded(callback) {
        document.addEventListener(events.readingAdded, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchReadingAdded(data) {
        const event = new CustomEvent(events.readingAdded, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onReadingRemoved(callback) {
        document.addEventListener(events.readingRemoved, (event) => {
            return callback(event.detail);
        });
    }

    static dispatchEventReadingRemoved(data) {
        const event = new CustomEvent(events.readingRemoved, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onProgressUpdate(callback) {
        document.addEventListener(events.modelProgressUpdate, (event) => {
            return callback(event.detail);
        });
    }
}