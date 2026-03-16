//TODO: Verificar aqui a forma correta de processar esse serviço, aparentemente terá que ser importado nos controllers antes
//import { PeopleService } from '../service/PeopleService.js';
import 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
import { workerEvents } from '../events/constants.js';

/*
Workers: permite o envio e recebimento de mensagens para o navegador
-A ideia é separar em dois processos, um (thread principal) processará o layout e o outro (worker) irá processar os dados
-Multithreading javascript
*/

//Variáveis globais, que serão reutilizadas em outras etapas do treinamento
let _globalCtx = {};
let _model = null;

//Funções globais para o envio dos eventos para a tela
const handlers = {
    [workerEvents.trainModel]: trainModel,
    [workerEvents.recommend]: recommend,
};

self.onmessage = e => {
    const { action, ...data } = e.data;
    if (handlers[action]) handlers[action](data);
};

//Funções básicas para auxiliar a normalização dos dados
function normalize(value, min, max) {
    //Normalização dos valores para transformar as métricas da rede neural em um range de 0 a 1
    //--Ideia: balancear os dados, para que o treinamento não se perca
    return (value - min) / ((max - min) || 1)
}

function oneHotWeighted(index, length, weight) {
    //Usado para normalizar os itens que possuem apenas uma classificação
    //--No exemplo, o produto pode estar em apenas uma categoria ou ser apenas de uma cor, nunca mais de uma (assim aplicando a técnica one-hot take)
    return tf.oneHot(index, length).cast('float32').mul(weight)
}



//Pesos para cada informação a ser classificada no tensor
//Aqui, a categoria é o item mais importante, levando 40% do peso da indicação
//A cor 30%, preço 20% e idade 10%
const WEIGHTS = {
    category: 0.4,
    color: 0.3,
    price: 0.2,
    age: 0.1
};

function makeContext(books, People) {
    const ages = People.map(u => u.age)
    const prices = books.map(p => p.price)
    const colors = [...
        new Set(
            books.map(p => p.color)
        )
    ]
    const categories = [...
        new Set(
            books.map(p => p.category)
        )
    ]

    const minAge = Math.min(...ages)
    const maxAge = Math.max(...ages)
    
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    const colorsIndex = Object.fromEntries(colors.map((color, index) => {
        return [color, index]
    }))

    const categoriesIndex = Object.fromEntries(categories.map((category, index) => {
        return [category, index]
    }))

    //Computar a média de idades dos compradores por produto
    //--Ajuda a personalizar
    const midAge = (minAge + maxAge) / 2
    const ageSums = {}
    const ageCounts = {}

    People.forEach(person => {
        person.readings.forEach(p => {
            ageSums[p.name] = (ageSums[p.name] || 0) + person.age
            ageCounts[p.name] = (ageCounts[p.name] || 0) + 1
        })
    })

    const bookAverageAgeNormalization = Object.fromEntries(
        books.map(book => {
            //Se existir uma categoria, pegar uma média das idades e dividir pela quantidade de vezes que um produto foi comprado,
            //com o objetivo de saber a média de idade das pessoas que compraram o produto
            const avg = ageCounts[book.name] ? ageSums[book.name] / ageCounts[book.name] : midAge 
        
            //Realiza a normalização dos dados do produto, tendo por base a média de idade dos compradores daquele produto
            return [book.name, normalize(avg, minAge, maxAge)]
        })
    )

    return {
        books, 
        People, 
        colorsIndex,
        categoriesIndex,
        minAge,
        maxAge,
        minPrice,
        maxPrice,
        bookAverageAgeNormalization,
        numCategories: categories.length,
        numColors: colors.length,
        //Preço + idade + categories + colors
        dimensions: 2 + categories.length + colors.length 
    }
}

//Função para realizar a normalização dos dados em cima dos tensores
function encodeBook(book, context) {
    //Normalizando dados para ficar no range de 0 a 1
    //--aplicando também o peso na recomendação
    const price = tf.tensor1d([
        normalize(
            book.price, 
            context.minPrice, 
            context.maxPrice
        ) * WEIGHTS.price
    ])

    const age = tf.tensor1d([
        (context.bookAverageAgeNormalization[book.name] ?? 0.5) * WEIGHTS.age
    ])

    const category = oneHotWeighted(
        context.categoriesIndex[book.category],
        context.numCategories,
        WEIGHTS.category
    )

    const color = oneHotWeighted(
        context.colorsIndex[book.color],
        context.numColors,
        WEIGHTS.color
    )

    return tf.concat1d([
        price, 
        age, 
        category, 
        color
    ])
}

//Retornará o perfil de compras de um usuário específico
function encodeperson(person, context) {
    if (person.readings.length) {
        return tf.stack(
            person.readings.map(book => encodeBook(book, context))
        )
        .mean(0)
        .reshape(
            [
                1, 
                context.dimensions
            ]
        )
    }

    return tf.concat1d(
        [
            tf.zeros([1]), //Preço é ignorado
            tf.tensor1d([
                normalize(person.age, context.minAge, context.maxAge) * WEIGHTS.age
            ]),
            tf.zeros([context.numCategories]), //Categoria ignorada
            tf.zeros([context.numColors]), //Cores ignoradas
        ]
    ).reshape(
        [
            1,
            context.dimensions
        ]
    )
}

//Função que irá criar os dados de treinamento dos usuários na base de dados
function createTrainingData(context) {
    const inputs = []
    const labels = []

    context.People
        .filter(u => u.readings.length)
        .forEach(person => {
            const personVector = encodeperson(person, context).dataSync() 
            context.books.forEach(book => {
                const bookVector = encodeBook(book, context).dataSync()
                const label = person.readings.some(
                    reading => reading.name === book.name ? 1 : 0
                )

                //Combinar usuário e book
                inputs.push([...personVector, ...bookVector])
                labels.push(label)
            })
        })

    return {
        xs: tf.tensor2d(inputs),
        ys: tf.tensor2d(labels, [labels.length, 1]),
        inputDimension: context.dimensions * 2 //Tamanho = personVector + bookVector
    }
}

// ====================================================================
// 📌 Exemplo de como um usuário é ANTES da codificação
// ====================================================================
/*
const exampleperson = {
    id: 201,
    name: 'Rafael Souza',
    age: 27,
    readings: [
        { id: 8, name: 'Boné Estiloso', category: 'acessórios', price: 39.99, color: 'preto' },
        { id: 9, name: 'Mochila Executiva', category: 'acessórios', price: 159.99, color: 'cinza' }
    ]
};
*/
// ====================================================================
// 📌 Após a codificação, o modelo NÃO vê nomes ou palavras.
// Ele vê um VETOR NUMÉRICO (todos normalizados entre 0–1).
// Exemplo: [preço_normalizado, idade_normalizada, cat_one_hot..., cor_one_hot...]
//
// Suponha categorias = ['acessórios', 'eletrônicos', 'vestuário']
// Suponha cores      = ['preto', 'cinza', 'azul']
//
// Para Rafael (idade 27, categoria: acessórios, cores: preto/cinza),
// o vetor poderia ficar assim:
//
// [
//   0.45,            // peso do preço normalizado
//   0.60,            // idade normalizada
//   1, 0, 0,         // one-hot de categoria (acessórios = ativo)
//   1, 0, 0          // one-hot de cores (preto e cinza ativos, azul inativo)
// ]
//
// São esses números que vão para a rede neural.
// ====================================================================
// ====================================================================
// 🧠 Configuração e treinamento da rede neural
// ====================================================================
async function configureNeuralNetworkAndTrain(trainData) {
    const model = tf.sequential()
    
    // Camada de entrada
    // - inputShape: Número de features por exemplo de treino (trainData.inputDim)
    //   Exemplo: Se o vetor produto + usuário = 20 números, então inputDim = 20
    // - units: 128 neurônios (muitos "olhos" para detectar padrões)
    // - activation: 'relu' (mantém apenas sinais positivos, ajuda a aprender padrões não-lineares)
    model.add(
        tf.layers.dense({
            inputShape: [
                trainData.inputDimension
            ],
            units: 128,
            activation: 'relu'
        })
    )

    // Camada oculta 1
    // - 64 neurônios (menos que a primeira camada: começa a comprimir informação)
    // - activation: 'relu' (ainda extraindo combinações relevantes de features)
    model.add(
        tf.layers.dense({
            units: 64,
            activation: 'relu'
        })
    )

    // Camada oculta 2
    // - 32 neurônios (mais estreita de novo, destilando as informações mais importantes)
    //   Exemplo: De muitos sinais, mantém apenas os padrões mais fortes
    // - activation: 'relu'
    model.add(
        tf.layers.dense({
            units: 32,
            activation: 'relu'
        })
    )
    
    // Camada de saída
    // - 1 neurônio porque vamos retornar apenas uma pontuação de recomendação
    // - activation: 'sigmoid' comprime o resultado para o intervalo 0–1
    //   Exemplo: 0.9 = recomendação forte, 0.1 = recomendação fraca
    model.add(
        tf.layers.dense({
            units: 1,
            activation: 'sigmoid'
        })
    )

    model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
    })

    await model.fit(
        trainData.xs, 
        trainData.ys,
        {
            epochs: 100,
            batchSize: 32,
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    postMessage({
                        type: workerEvents.trainingLog,
                        epoch: epoch,
                        loss: logs.loss,
                        accuracy: logs.acc
                    });
                }
            }
        }
    )

    return model
}

async function trainModel({ People }) {
    console.log('Training model with People:', People)
    postMessage({ type: workerEvents.progressUpdate, progress: { progress: 50 } });
    
    //Carregando a base de dados de produtos em memória para realizar a primeira etapa de todas, a normalização dos dados
    const books = await (await fetch('/data/products.json')).json()
    
    //Montando o range de valores para classificação, normalização dos dados e predição
    const context = makeContext(books, People)
    
    context.bookVectors = books.map(book => {
        return {
            name: book.name,
            meta: {
                ...book
            },
            vector: encodeBook(book, context).dataSync()
        }
    })

    //Próxima etapa: transformação do contexto de dados em tensores para treinamento da rede neural
    _globalCtx = context

    const trainData = createTrainingData(context)
    _model = await configureNeuralNetworkAndTrain(trainData)

    postMessage({ type: workerEvents.progressUpdate, progress: { progress: 100 } });
    postMessage({ type: workerEvents.trainingComplete });
}

function recommend({ person }) {
    if (!_model) return;
    const context = _globalCtx

    console.log('will recommend for person:', person)
    
    // 1️⃣ Converta o usuário fornecido no vetor de features codificadas
    // (preço ignorado, idade normalizada, categorias ignoradas)
    // Isso transforma as informações do usuário no mesmo formato numérico
    // que foi usado para treinar o modelo.
    const personVector = encodeperson(person, context).dataSync()
    
    // Em aplicações reais:
    //  Armazene todos os vetores de produtos em um banco de dados vetorial (como Postgres, Neo4j ou Pinecone)
    //  Consulta: Encontre os 200 produtos mais próximos do vetor do usuário
    //  Execute _model.predict() apenas nesses produtos
    // 2️⃣ Crie pares de entrada: para cada produto, concatene o vetor do usuário
    // com o vetor codificado do produto.
    // Por quê? O modelo prevê o "score de compatibilidade" para cada par (usuário, produto).
    const inputs = context.bookVectors.map(({vector}) => {
        return [
            ...personVector,
            ...vector
        ]
    })

    // 3️⃣ Converta todos esses pares (usuário, produto) em um único Tensor.
    //    Formato: [numProdutos, inputDim]
    const inputTensor = tf.tensor2d(inputs)

    // 4️⃣ Rode a rede neural treinada em todos os pares (usuário, produto) de uma vez.
    // O resultado é uma pontuação para cada produto entre 0 e 1.
    // Quanto maior, maior a probabilidade do usuário querer aquele produto.
    const predictions = _model.predict(inputTensor)

    // 5️⃣ Extraia as pontuações para um array JS normal.
    const scores = predictions.dataSync()

    const recommendations = context.bookVectors.map((item, index) => {
        return {
            ...item.meta,
            name: item.name,
            score: scores[index] //Previsão do modelo para este produto
        }
    })

    const sortedItems = recommendations.sort(
        (a, b) => b.score - a.score
    )

    // 8️⃣ Envie a lista ordenada de produtos recomendados
    // para a thread principal (a UI pode exibi-los agora).
    postMessage({
        type: workerEvents.recommend,
        person,
        recommendations: sortedItems
    })
}