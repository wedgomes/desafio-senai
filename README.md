# Desafio Técnico: Gerenciador de Produtos e Descontos

![Badge do NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Badge do Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Badge do React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Badge do TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Badge do Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

## 📖 Sobre o Projeto

Este projeto é uma aplicação web fullstack desenvolvida como solução para o Desafio Técnico de Desenvolvedor Fullstack Júnior do Instituto Senai de Inovação. A aplicação simula um sistema de gerenciamento de produtos e cupons de desconto, com foco em regras de negócio realistas, arquitetura robusta e boas práticas de desenvolvimento.

O objetivo principal foi construir uma API RESTful no backend com NestJS e uma interface de usuário reativa e funcional no frontend com Next.js e React.

---

## ✨ Funcionalidades Principais

-   **Backend (API RESTful)**
    -   CRUD completo para **Produtos**, incluindo soft-delete e restauração.
    -   CRUD completo para **Cupons de Desconto**.
    -   Sistema avançado de **aplicação e remoção de descontos** com lógica transacional.
    -   Validação de dados robusta usando DTOs e `class-validator`.
    -   Listagem de produtos com **filtros complexos**, **paginação** e **ordenação**.
    -   Cálculo dinâmico de preços com desconto, sem persistência do valor calculado.

-   **Frontend (Interface Web)**
    -   Listagem e tabela de produtos com paginação e atualização em tempo real.
    -   Filtros dinâmicos por nome (com debounce) e status de desconto.
    -   Formulários em modal para **criação e edição** de produtos com validação em tempo real.
    -   Modal para aplicação de cupons a um produto específico.
    -   Feedback visual ao usuário através de `toasts` (notificações) para todas as ações.
    -   Design responsivo básico.

---

## 🛠️ Tecnologias Utilizadas

A pilha de tecnologias foi escolhida com base nas sugestões do desafio e nas melhores práticas de mercado para aplicações modernas, escaláveis e de fácil manutenção.

-   **Backend:**
    -   **Node.js**
    -   **NestJS:** Framework progressivo para arquitetura modular e escalável.
    -   **Prisma:** ORM moderno e type-safe para interação com o banco de dados.
    -   **SQLite:** Banco de dados relacional leve e baseado em arquivo.
    -   **TypeScript:** Para um código mais seguro e robusto.
    -   **class-validator / class-transformer:** Para validação de DTOs.

-   **Frontend:**
    -   **Next.js:** Framework React para produção, com excelente estrutura.
    * **React:** Biblioteca para construção de interfaces de usuário.
    -   **TypeScript:** Consistência e segurança de tipos em todo o projeto.
    -   **TailwindCSS:** Framework CSS para estilização rápida e utilitária.
    -   **Shadcn/UI:** Coleção de componentes de UI reutilizáveis e acessíveis.
    -   **Zod & React Hook Form:** Para validação e gerenciamento de formulários.
    -   **Sonner:** Para notificações (toasts).
    -   **Axios:** Cliente HTTP para comunicação com o backend.

---

## 🚀 Como Executar o Projeto

Siga os passos abaixo para executar a aplicação em seu ambiente local.

### Pré-requisitos

-   [Node.js](https://nodejs.org/en/) (versão 18.x ou superior)
-   [npm](https://www.npmjs.com/) (geralmente instalado com o Node.js)

### Passos

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/wedgomes/desafio-senai.git]
    ```

2.  **Configure e execute o Backend:**
    Abra um terminal nesta pasta.
    ```bash
    # Navegue até a pasta do backend
    cd backend

    # Instale as dependências
    npm install

    # Crie o arquivo de ambiente a partir do exemplo
    # (No Windows, use 'copy .env.example .env')
    cp .env.example .env

    # Aplique as migrações para criar o banco de dados SQLite
    npx prisma migrate dev

    # Execute o servidor de desenvolvimento
    npm run start:dev
    ```
    O backend estará rodando em `http://localhost:3001`.

3.  **Configure e execute o Frontend:**
    Abra um **novo terminal** na pasta raiz do projeto.
    ```bash
    # Navegue até a pasta do frontend
    cd frontend

    # Instale as dependências
    npm install

    # Execute o servidor de desenvolvimento
    npm run dev
    ```
    O frontend estará rodando em `http://localhost:3000`.

4.  **Acesse a Aplicação:**
    Abra seu navegador e acesse `http://localhost:3000`.

---

## 🏛️ Arquitetura e Decisões Técnicas

Nesta seção, explico algumas das escolhas arquiteturais feitas durante o desenvolvimento.

#### Backend
-   **NestJS foi escolhido por sua arquitetura opinativa** que promove a separação de responsabilidades (Modules, Controllers, Services), facilitando a manutenção e o escalonamento. A Injeção de Dependência nativa foi fundamental para criar serviços desacoplados, como o `PrismaService`.
-   **Prisma como ORM** simplificou drasticamente o acesso a dados. Sua tipagem automática a partir do schema e a API de transações (`$transaction`) foram cruciais para implementar a lógica de aplicação de descontos de forma segura e atômica.
-   **A validação de dados é feita na borda da API** através de DTOs com `class-validator`. Isso garante que a lógica de negócio nos serviços receba dados já sanitizados e válidos, prevenindo erros.

#### Frontend
-   **Next.js (App Router)** foi utilizado para uma estrutura de projeto organizada e um sistema de roteamento moderno.
-   **A criação de uma camada de serviço (`/services/api.ts`)** para centralizar as chamadas com Axios desacopla os componentes da lógica de acesso à API. Isso torna o código mais limpo e facilita futuras manutenções (como adicionar interceptors para autenticação).
-   **O uso do hook customizado `useDebounce`** no filtro de busca é uma otimização de performance crucial para evitar chamadas excessivas à API, melhorando a experiência do usuário.
-   **Formulários foram construídos com React Hook Form e Zod**, proporcionando validação em tempo real, gerenciamento de estado eficiente e uma experiência de desenvolvimento superior.

---

## ✍️ Autor

**Wédson Rodolfo Lopes Gomes**

-   **LinkedIn:** https://www.linkedin.com/in/wedgomes/
-   **GitHub:** https://github.com/wedgomes
-   **Email:** wedson_mxt@hotmail.com
