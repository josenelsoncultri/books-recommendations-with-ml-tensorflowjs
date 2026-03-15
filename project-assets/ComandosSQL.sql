--Processando dataset encontrado no Kaggle
SELECT book.*
FROM OPENROWSET(
    BULK 'D:\Projetos\Pessoais_UNIPDS\books-recommendations-with-ml-tensorflowjs\livros.json',
    SINGLE_NCLOB
) AS j
CROSS APPLY OPENJSON(BulkColumn) WITH (
    titulo NVARCHAR(100),
    autor NVARCHAR(100),
    isbn NVARCHAR(30),
    paginas INT,
    ano SMALLINT
) AS book;
--- Aqui diversos livros foram encontrados sem paginação, sem ano, sem autor ou sem ISBN. Esses dados foram limpos do dataset para que não sejam um problema na etapa de treinamento


--Criando tabela de pessoas
CREATE TABLE Pessoas (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nome NVARCHAR(100) NOT NULL,
    Idade INT NOT NULL,
    Sexo CHAR(1) NOT NULL,
    DataCadastro DATETIME2 DEFAULT GETDATE() -- Prática recomendada em versões recentes
);
GO

--Inserindo pessoas aleatórias
INSERT INTO Pessoas (Nome, Idade, Sexo) VALUES
(N'Ana Silva', 28, 'F'), (N'João Pereira', 45, 'M'), (N'Carlos Oliveira', 32, 'M'), (N'Maria Santos', 39, 'F'), (N'Ricardo Souza', 50, 'M'),
(N'Fernanda Lima', 26, 'F'), (N'Roberto Costa', 41, 'M'), (N'Juliana Alves', 34, 'F'), (N'Marcelo Dias', 47, 'M'), (N'Beatriz Rocha', 29, 'F'),
(N'Lucas Martins', 31, 'M'), (N'Camila Gomes', 37, 'F'), (N'Bruno Carvalho', 43, 'M'), (N'Amanda Nunes', 25, 'F'), (N'Diego Ferreira', 48, 'M'),
(N'Larissa Melo', 30, 'F'), (N'Felipe Barbosa', 36, 'M'), (N'Patrícia Ribeiro', 42, 'F'), (N'Gustavo Xavier', 49, 'M'), (N'Letícia Castro', 27, 'F'),
(N'André Almeida', 33, 'M'), (N'Vanessa Pires', 46, 'F'), (N'Tiago Mendes', 35, 'M'), (N'Tatiane Cardoso', 40, 'F'), (N'Rodrigo Ramos', 50, 'M'),
(N'Aline Vieira', 28, 'F'), (N'Sérgio Machado', 44, 'M'), (N'Priscila Cavalcanti', 31, 'F'), (N'Leandro Lima', 38, 'M'), (N'Bianca Farias', 26, 'F'),
(N'Eduardo Cunha', 47, 'M'), (N'Daniela Guimarães', 32, 'F'), (N'Vitor Soares', 29, 'M'), (N'Monique Lopes', 41, 'F'), (N'Hugo Bernardes', 34, 'M'),
(N'Jéssica Moreira', 39, 'F'), (N'Murilo Assis', 45, 'M'), (N'Sabrina Paiva', 27, 'F'), (N'Igor Nascimento', 30, 'M'), (N'Renata Silveira', 43, 'F'),
(N'Caio Borges', 36, 'M'), (N'Karina Neves', 48, 'F'), (N'Renato Garcia', 25, 'M'), (N'Gisele Porto', 50, 'F'), (N'Fábio Teixeira', 33, 'M'),
(N'Mônica Salazar', 37, 'F'), (N'Samuel Viana', 42, 'M'), (N'Erika Azevedo', 31, 'F'), (N'Danilo Braga', 46, 'M'), (N'Paula Medeiros', 29, 'F');
GO

--Criando tabela de lista de leitura
CREATE TABLE ListaLeitura (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    PessoaId INT NOT NULL,
    LivroId INT NOT NULL,
    DataLeitura DATETIME2 DEFAULT GETDATE(),
    NotaPretendida INT, -- Ex: 1 a 5 (útil para modelos de regressão/classificação)
    
    CONSTRAINT FK_Pessoa FOREIGN KEY (PessoaId) REFERENCES Pessoas(Id),
    CONSTRAINT FK_Livro FOREIGN KEY (LivroId) REFERENCES Livros(Id)
);
GO

--Gerando dados aleatórios de leitura
INSERT INTO ListaLeitura (PessoaId, LivroId, NotaPretendida)
SELECT TOP 300 
    P.Id AS PessoaId, 
    L.Id AS LivroId,
    (ABS(CHECKSUM(NEWID())) % 5) + 1 AS Nota -- Gera nota aleatória entre 1 e 5
FROM Pessoas P
CROSS JOIN Livros L
ORDER BY NEWID();
GO