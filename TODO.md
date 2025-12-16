# Trabalho III – API de Enquetes



## APRESENTAÇÃO DO TRABALHO 



**Disciplina:** Programação Web com Node.js

**Formato:** API REST

**Arquitetura:** Clean Architecture + DDD + boas práticas de código limpo



## 1. Contexto Geral



Você deverá desenvolver uma **API de enquetes** em que usuários autenticados podem:



* Criar enquetes com:



  * Data de início e fim **e/ou**

  * Quantidade esperada de votos (limite).

* Definir múltiplas alternativas (mínimo 2 por enquete).

* Acompanhar o resultado parcial das enquetes.

* Definir se a enquete é:



  * **Pública**: qualquer usuário autenticado pode ver resultados parciais.

  * **Privada**: somente o criador vê os resultados parciais.

* Acessar o **histórico**:



  * Enquetes criadas pelo usuário.

  * Enquetes em que o usuário votou.

* Visualizar enquetes com diferentes filtros.



O sistema deve seguir o **padrão de arquitetura apresentado em sala**, aplicando:



* Clean Architecture

* Domain-Driven Design (DDD)

* Boas práticas de código limpo (Clean Code)

* Separação clara de camadas (domain, application/use cases, infrastructure, interface/http, etc.)



---



## 2. Requisitos Funcionais (Obrigatórios – 8 pontos)



### 2.1. Autenticação e Autorização (JWT)



1. **Registro de usuário**



   * Endpoint sugerido: `POST /auth/register`

   * Campos mínimos:



     * `name` (string)

     * `email` (string, único)

     * `password` (string)

   * Regras:



     * Não permitir e-mail duplicado.

     * Senha deve estar **hasheada**.



2. **Login**



   * Endpoint sugerido: `POST /auth/login`

   * Request:



     ```json

     {

       "email": "user@example.com",

       "password": "string"

     }

     ```

   * Response (200):



     ```json

     {

       "accessToken": "jwt-token",

       "user": {

         "id": "uuid",

         "name": "User Name",

         "email": "user@example.com"

       }

     }

     ```

   * Utilizar **JWT** no padrão `Authorization: Bearer <token>`.



3. **Proteção de Rotas**



   * Todos os endpoints de enquetes e votos devem exigir usuário autenticado (exceto se o professor decidir permitir algumas consultas públicas – mas os votos e criação devem ser autenticados).



---



### 2.2. Enquetes



#### 2.2.1. Criar enquete



* Endpoint sugerido: `POST /polls`



* Request (exemplo):



  ```json

  {

    "title": "Qual sua linguagem favorita?",

    "description": "Enquete sobre linguagens de programação.",

    "visibility": "PUBLIC", 

    "startAt": "2025-12-01T09:00:00Z",

    "endAt": "2025-12-10T23:59:59Z",

    "expectedVotes": 100,

    "categories": ["programming", "tech"],

    "options": [

      { "text": "JavaScript" },

      { "text": "Python" },

      { "text": "Java" }

    ]

  }

  ```



* Regras:



  * Mínimo de **2 opções**.

  * A enquete pode definir:



    * Intervalo de datas (`startAt`, `endAt`) **e/ou**

    * `expectedVotes` (quantidade máxima de votos).

  * Se `startAt` não for informado, usar data atual.

  * Se nenhum dos dois for informado (`endAt` nem `expectedVotes`), considerar inválido.



* Response (201):



  ```json

  {

    "id": "uuid",

    "title": "Qual sua linguagem favorita?",

    "visibility": "PUBLIC",

    "status": "OPEN",

    "startAt": "2025-12-01T09:00:00Z",

    "endAt": "2025-12-10T23:59:59Z",

    "expectedVotes": 100,

    "categories": ["programming", "tech"],

    "options": [

      { "id": "uuid-op1", "text": "JavaScript" },

      { "id": "uuid-op2", "text": "Python" },

      { "id": "uuid-op3", "text": "Java" }

    ],

    "createdBy": {

      "id": "user-uuid",

      "name": "User Name"

    }

  }

  ```



#### 2.2.2. Encerrar ou estender enquete



* **Encerrar antes do tempo / antes de atingir expectedVotes**



  * Endpoint sugerido: `POST /polls/:pollId/close`

  * Apenas o criador da enquete pode encerrar.

  * Muda o estado para `CLOSED`.



* **Estender enquete**



  * Endpoint sugerido: `PATCH /polls/:pollId/extend`

  * Request (exemplo):



    ```json

    {

      "endAt": "2025-12-15T23:59:59Z",

      "expectedVotes": 200

    }

    ```

  * Regras:



    * Apenas o criador da enquete pode estender/alterar.

    * Não permitir redução de datas para o passado.



#### 2.2.3. Visualizar detalhes da enquete



* Endpoint sugerido: `GET /polls/:pollId`

* Response deve incluir:



  * Dados básicos da enquete;

  * Opções;

  * Informação se o usuário já votou (se autenticado);

  * **Não é obrigatório** retornar contagem de votos aqui (pode ser outro endpoint).



---



### 2.3. Votos



#### 2.3.1. Votar em uma opção



* Endpoint sugerido: `POST /polls/:pollId/votes`

* Request:



  ```json

  {

    "optionId": "uuid-op1"

  }

  ```

* Regras de negócio:



  * Usuário **só pode votar uma vez por enquete**.

  * Não pode votar:



    * Antes de `startAt`.

    * Após `endAt`.

    * Em enquetes com status `CLOSED`.

    * Se a quantidade de votos já atingiu `expectedVotes` (se definido).

  * O voto deve estar associado ao usuário e à enquete.



#### 2.3.2. Resultado parcial da enquete



* Endpoint sugerido: `GET /polls/:pollId/results`

* Regras:



  * Se a enquete for **PÚBLICA**:



    * Qualquer usuário autenticado pode ver o resultado parcial.

  * Se a enquete for **PRIVADA**:



    * Apenas o criador pode ver o resultado parcial.

  * Response (exemplo):



    ```json

    {

      "pollId": "uuid",

      "title": "Qual sua linguagem favorita?",

      "totalVotes": 75,

      "options": [

        { "id": "uuid-op1", "text": "JavaScript", "votes": 40, "percentage": 53.33 },

        { "id": "uuid-op2", "text": "Python", "votes": 25, "percentage": 33.33 },

        { "id": "uuid-op3", "text": "Java", "votes": 10, "percentage": 13.33 }

      ],

      "status": "OPEN"

    }

    ```



---



### 2.4. Histórico de enquetes do usuário



1. **Enquetes criadas pelo usuário**



   * Endpoint sugerido: `GET /me/polls/created`

   * Suporta paginação (`page`, `limit`).



2. **Enquetes em que o usuário votou**



   * Endpoint sugerido: `GET /me/polls/voted`

   * Deve retornar pelo menos:



     * `pollId`, `title`, `votedAt`, `optionChosen`.

   * Suporta paginação.



---



### 2.5. Listagem e filtros de enquetes



* Endpoint sugerido: `GET /polls`

* Filtros via query params:



  * `category` (ex.: `?category=tech`)

  * `minVotes`, `maxVotes` (ex.: `?minVotes=10&maxVotes=100`)

  * `createdFrom`, `createdTo` (datas)

  * `status` (OPEN, CLOSED)

* Exemplo:



  * `GET /polls?category=tech&status=OPEN&minVotes=5&createdFrom=2025-01-01`

* Response deve retornar:



  * Lista de enquetes + paginação (`page`, `limit`, `total`).



---



## 3. Requisitos de Negócio (Resumo)



* Cada enquete:



  * Tem **mínimo 2 opções**.

  * Tem `status` (OPEN, CLOSED, SCHEDULED se desejar).

* Enquete encerra automaticamente quando:



  * `now > endAt`, ou

  * quantidade de votos >= `expectedVotes` (quando definido).

* Usuário:



  * Só vota uma vez por enquete.

* Resultados parciais:



  * Enquete PÚBLICA → resultados visíveis a qualquer usuário autenticado.

  * Enquete PRIVADA → somente criador vê resultados parciais.



---



## 4. Desafios Extras (cada um vale +2 pontos)



Os alunos devem escolher **1 (um) dos desafios extras** abaixo.

Cada desafio bem implementado adiciona **2 pontos** à nota, totalizando **até 10 pontos**.



### Extra A – Notificação por e-mail ao encerrar a enquete



* Quando uma enquete for **encerrada** (automaticamente ou manualmente):



  * Enviar e-mail ao criador da enquete.

* Conteúdo mínimo:



  * Título da enquete.

  * Data de encerramento.

  * Resumo do resultado (opção vencedora, total de votos).

  



---



### Extra B – Integração com Lista de Exclusão Externa



* Antes de aceitar a submissão de uma enquete, o sistema deve consultar um **serviço externo de exclusão** para verificar se a enquete pode ser criada (termos adultos, bets, etc).

* Exemplo (falso/mock) de chamada:



  * `GET https://external-exclusion-service.com/api/blocked?userId={userId}`



* Regras:

  * A integração pode ser simulada com:



    * Uma URL pública do github com palavras chaves

    * Um serviço em memória, ou

    * Um outro endpoint local que represente a “API externa”.

    * Uma chamada real a um serviço público (se disponível).



---



### Extra C – Acesso por QR Code



* Gerar um **QR Code** para uma enquete específica.

* Endpoint sugerido: `GET /polls/:pollId/qrcode`

* Objetivo:



  * Ao escanear o QR Code, o usuário deve ser direcionado para uma URL (por exemplo, URL de front-end ou caminho da API).

* Implementação mínima aceitável:



  * Gerar a **imagem do QR Code** ou

  * Retornar uma URL que poderia ser codificada em um QR Code (explicar na documentação).



---



### Extra D – Imagens nas enquetes e alternativas



* Adicionar suporte a **imagens**:



  * Na descrição da enquete (ex.: imagem principal).

  * Em cada alternativa.

  * Implementar upload (ex.: `POST /uploads` → retorna `imageUrl`).

* Exemplo de `options` com imagem:



  ```json

  "options": [

    { "text": "Cachorro", "imageUrl": "https://example.com/dog.jpg" },

    { "text": "Gato", "imageUrl": "https://example.com/cat.jpg" }

  ]

  ```



---



## 5. Requisitos Não Funcionais / Arquitetura



* **Tecnologia base:** Node.js. / Também pode usar TypeScript se desejar.

* **Gerenciador de pacotes:** npm / yarn / pnpm.

* **ORM:** Sequelize, TypeORM, Prisma ou outro de sua preferência.

* **Framework http** Express.

* **Clean Architecture / DDD**:



  * Separar claramente:



    * **Domínio:** entidades, agregados, value objects, regras de negócio puras.

    * **Aplicação (use cases):** casos de uso da aplicação (criar enquete, votar, listar, etc.).

    * **Infraestrutura:** banco de dados, ORM, serviços externos (e-mail, blacklist).

    * **Interface / HTTP:** controllers, rotas, serialização de request/response.



* **Boas práticas**:



  * Código organizado por contexto de domínio (ex.: `polls`, `users`, `votes`).

  * Tratamento de erros e retornos HTTP adequados (4xx, 5xx).

  * Validação de entrada (payloads).

  * Uso de `.env` para configurações sensíveis.



* **Banco de dados**:



  * Pode ser SQL ou NoSQL.

  * Deve haver um **modelo consistente** para:



    * Usuários

    * Enquetes

    * Opções

    * Votos



---



## 6. Critérios de Avaliação (sugestão)



* **(6.0) Funcionalidades obrigatórias**



  * Autenticação JWT funcionando.

  * CRUD essencial de enquetes (criar, ver, encerrar/estender).

  * Votos com validação das regras de negócio.

  * Resultado parcial respeitando visibilidade (pública/privada).

  * Histórico de enquetes criadas e votadas.

  * Listagem com filtros.

  

* **(2.0) Desafio extra**



  * Implementação correta de **um** dos extras (A, B, C ou D).



* **(1.0) Qualidade de código e arquitetura**



  * Aderência a Clean Architecture e DDD.

  * Organização de pastas e camadas.

  * Clareza, nomes significativos, ausência de duplicação óbvia.



* **(1.0) Documentação**



  * README explicando:



    * Como rodar o projeto.

    * Endpoints principais (pode ser em Markdown ou OpenAPI/Swagger).

    * Qual extra foi implementado e como testar.


