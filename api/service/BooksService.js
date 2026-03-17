import { getConnection } from "../modules/db.js";

export class BooksService {
    async getBooksUntrainedAsync() {
        try {
            const pool = await getConnection();
            const result = await pool
                .request()
                .query("SELECT * FROM [Livros] WHERE [Embeddings] IS NULL");

            return result.recordset;
        } catch (err) {
            console.error("Erro ao buscar livros:", err);
            throw err;
        }
    }
}