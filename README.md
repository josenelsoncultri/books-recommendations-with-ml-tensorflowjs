# books-recommendations-with-ml-tensorflowjs

Projeto para expandir o conhecimento adquirido no módulo 03 da pós de Engenharia de IA Aplicada da UNIPDS

### Ideia para treinamento

- Classificar o modelo para recomendar livros para uma pessoa, relacionado as informações de idade e sexo com autores, livros antigos/novos e tamanho dos mesmos

### Primeira etapa: Geração do Dataset

- Utilizei o Kaggle para obter uma lista de livros e suas informações (Título, Autor, ISBN, Quantidade de Páginas e Ano de Publicação) e importei dentro do SQL Server 2025, que traz recursos nativos para buscas vetoriais. Meu objetivo, além de implementar o treinamento de redes neurais e fixar melhor o aprendizado do curso, é testar os novos recursos disponibilizados na ferramenta da Microsoft.

- Modelo do Kaggle utilizado: https://www.kaggle.com/datasets/diegomariano/tabela-de-livros?select=livros.json

- Versão do SQL Server utilizada: SQL Server 2025 Developer Enterprise Edition (gratuita para testes e desenvolvimento)

- Em seguida gerei uma lista de 50 pessoas (Nome, Idade e Sexo) com o Gemini, pedindo a ele também que gerasse uma tabela de listagem de leituras, gerando uma massa de dados aleatória e uma possível nota de 1 a 5 que o pessoas deu para aquela leitura.

### Construção da API de conexão com o SQL Server

- API criada para servir de interface de conexão com o SQL Server 2025, uma vez que o processamento acontecerá dentro do browser, e o mesmo não terá a capacidade de se conectar diretamente ao SQL Server  

# How to Run
- API
`node index.js`

- Webapp
`npm start`


# Next Steps
- API
  - [ ] Implementar Autenticação