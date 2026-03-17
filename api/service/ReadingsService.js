import { getConnection } from "../modules/db.js";

export class ReadingsService {
    async getUntrainedReadingListByPersonAsync(personId) {
        try {
            const pool = await getConnection();
            const result = await pool
                .request()
                .input("personId", personId)
                .query("SELECT LL.Id, LL.PessoaId, LL.LivroId, L.Titulo AS NomeLivro, L.Autor, L.Paginas, L.Ano FROM [ListaLeitura] LL " + 
                    "INNER JOIN [Livros] L ON ([L].[ID] = [LL].[LivroId]) WHERE [PessoaId] = @personId");

            return result.recordset;
        } catch (err) {
            console.error("Erro ao buscar pessoas:", err);
            throw err;
        }
    }
}