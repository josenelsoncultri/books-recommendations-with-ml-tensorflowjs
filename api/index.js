import 'dotenv/config';
import express from 'express';
import { PeopleService } from './service/PeopleService.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

const peopleService = new PeopleService();

// Define a GET API endpoint
app.get('/pessoas', async (req, res) => {
    res.status(200).json(
        await peopleService.getPeopleAsync()
    );
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
