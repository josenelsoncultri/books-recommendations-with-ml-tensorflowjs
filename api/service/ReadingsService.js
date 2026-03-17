import { getConnection } from "../modules/db.js";

export class ReadingsService {
    async getUntrainedReadingListByPersonAsync(personId) {
        try {
            const pool = await getConnection();
            const result = await pool
                .request()
                .input("personId", personId)
                .query("SELECT * FROM [ListaLeitura] WHERE [Embeddings] IS NULL AND [PessoaId] = @personId");

            return result.recordset;
        } catch (err) {
            console.error("Erro ao buscar pessoas:", err);
            throw err;
        }
    }
}