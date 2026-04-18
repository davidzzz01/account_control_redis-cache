# Account Control API - Implementação Modular

Este projeto foi refatorado e aprimorado para adotar uma arquitetura modular moderna e escalável, integrando ferramentas robustas como Redis, Zod e Jest.

## 🚀 Tecnologias Utilizadas

- **Node.js + Express**: Servidor e roteamento web.
- **Redis (ioredis)**: Sistema de Cache em memória.
- **Zod**: Declaração e validação de schemas (payloads).
- **Jest**: Framework para testes unitários.
- **File System (fs.promises)**: Persistência de dados baseada em arquivo (`users.json`).

---

## 🏗️ Arquitetura Modular

A aplicação foi reestruturada seguindo o padrão Controller-Service-Model para melhor separação de responsabilidades:

1. **Models (`src/models/userModel.js`)**
   - Responsável estritamente por manipular a fonte de dados (arquivo `users.json`).
   - Funções: Ler arquivo, adicionar itens, editar, buscar e remover.
   
2. **Services (`src/services/userService.js`)**
   - Coração das regras de negócio.
   - Aplica as validações usando o Zod.
   - Interage com o Redis para armazenar ou invalidar o cache.
   - Lança Exceções Personalizadas (`UserError`) caso algo dê errado ou o usuário informe dados inválidos.

3. **Controllers (`src/controllers/userController.js`)**
   - Camada de comunicação com a web.
   - Captura dados de `req.body`, `req.params` e `req.query`, invoca os Services apropriados e retorna os status corretos (200, 201, 204) via JSON.

4. **Rotas (`src/routes/userRoutes.js`)**
   - Declara explicitamente os caminhos e invoca o Controller.

5. **Middlewares (`src/middlewares/errorHandler.js`)**
   - Interceptador global para capturar exceções da aplicação (erros do Zod, UserError, etc) e devolver as mensagens de erro padronizadas aos clientes, evitando vazamento de stack traces e "crashes" da aplicação.

---

## ⚡ Estratégia de Cache com Redis

Para escalar as leituras e melhorar a performance de consultas constantes, introduzimos o **Redis** na camada de serviço.

- **Leituras (GET)**: Ao buscar a lista de todos os usuários ou um usuário por ID, o sistema primeiro verifica se o dado existe no cache (`redis.get()`). Se existir, o JSON é devolvido quase instantaneamente sem precisar acessar o disco rígido. Se não existir, ele vai no Model, salva a resposta no Redis por 1 hora e a devolve ao cliente.
- **Invalidações (POST, PUT, DELETE)**: Quando há qualquer alteração na base de dados (cadastro de novo usuário, deleção ou atualização), o `userService` dispara o comando para limpar todas as chaves iniciadas por `users*` (Invalidar Cache). Assim evitamos retornar dados desatualizados.

> **Importante**: Nos ambientes de teste, onde a massa de dados muda de forma abrupta sem passar pela API, a variável ambiente `DISABLE_CACHE=true` é utilizada para contornar o uso do Redis temporariamente.

---

## 🛡️ Validações com Zod

Implementamos schemas rigorosos para capturar bad-requests antes de poluírem o banco de dados.
- Arquivo `src/validations/userSchemas.js`.
- O Zod cuida da obrigatoriedade, tamanho mínimo, limite de idade, formatos de e-mail e converte erros automaticamente utilizando um ErrorMap global mapeado para o formato do projeto.

---

## 🚦 Exceções Personalizadas (UserError)

Foi implementada a hierarquia de erros com `AppError` e `UserError`.
O `UserError` possui mensagens pré-definidas da aplicação:
```javascript
throw UserError.notFound(); // Retorna 404 e "Usuário não encontrado"
throw UserError.invalidCredentials(); // Retorna 401 e "Email ou senha incorretos"
```
Assim todo erro intencional do sistema pode ser facilmente capturado e retornado de modo bonito no `errorHandler.js`.

---

## 🧪 Testes Unitários com Jest

Adicionamos a suíte de testes em `src/services/__tests__/userService.test.js`.
- Os testes validam o comportamento do Service, sem a necessidade da Web (Express) ou do Banco (Arquivo).
- Usamos `jest.mock()` para falsear as respostas do Model e do Redis, de forma que o sistema prova matematicamente que o Cache é apagado ao criar um novo usuário e que as exceções corretas são atiradas para o ambiente.
