SELECT book.*
FROM OPENROWSET(
    BULK 'D:\UNIPDS\livros.json',
    SINGLE_NCLOB
) AS j
CROSS APPLY OPENJSON(BulkColumn) WITH (
    titulo NVARCHAR(100),
    autor NVARCHAR(100),
    isbn NVARCHAR(30),
    paginas INT,
    ano SMALLINT
) AS book;