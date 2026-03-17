import 'dotenv/config';
import express from 'express';
import { PeopleService } from './service/PeopleService.js';
import { BooksService } from './service/BooksService.js';
import { ReadingsService } from './service/ReadingsService.js';
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

//Middleware to parse JSON request bodies
app.use(express.json());

//Middleware para CORS
app.use(
    cors({ 
        origin: "http://localhost:3000" 
    })
);

const peopleService = new PeopleService();
const booksService = new BooksService();
const readingsService = new ReadingsService();

// Define a GET API endpoint
app.get('/pessoas', async (req, res) => {
    res.status(200).json(
        await peopleService.getPeopleUntrainedAsync()
    );
});

app.get('/livros', async (req, res) => {
    res.status(200).json(
        await booksService.getBooksUntrainedAsync()
    );
});

app.get('/lista-leitura/:personId', async (req, res) => {
    const personId = req.params.personId;

    res.status(200).json(
        await readingsService.getUntrainedReadingListByPersonAsync(personId)
    );
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
