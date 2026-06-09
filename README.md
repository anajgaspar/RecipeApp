# Receita na Mão 👐🍲
>✔️Concluído

O **Receita na Mão** é um aplicativo mobile desenvolvido com foco em simplificar a rotina de quem gosta de cozinhar, permitindo descobrir, organizar e executar receitas de forma prática. A proposta da plataforma é unir planejamento alimentar, gestão de ingredientes e apoio no preparo em uma experiência única e intuitiva.

Com o aplicativo, o usuário pode cadastrar e gerenciar suas próprias receitas, explorar sugestões personalizadas em um feed, realizar buscas com filtros e consultar detalhes completos de cada preparo.

Entre as funcionalidades principais do produto, destacam-se:

- Cadastro e organização de receitas próprias.
- Feed com sugestões de receitas baseadas em preferências.
- Busca de receitas por palavras-chave e filtros.
- Visualização detalhada de receitas, com informações de preparo.
- Planejamento semanal e suporte a lista de compras.

<div align=center>
<a href ="#sprints"> Sprints </a> | <a href ="#tecnologias"> Tecnologias </a> | 
<a href ="#backlog"> Backlog do Produto </a> | <a href ="#instalacao"> Manual de Instalação </a>
</div>

---
<span id="sprints">

## 📊 Sprints:
Sprint | Previsão | Status | Documentação |
|------|----------|--------|--------------|
|01| 16/03/2026 - 12/04/2026 |✔️ Concluído| [Ver Documento](./docs/sprint1.md) |
|02|  13/04/2026 - 10/05/2026 |✔️ Concluído| [Ver Documento](./docs/sprint2.md) |
|03| 11/05/2026 - 07/06/2026 |✔️ Concluído| [Ver Documento](./docs/sprint3.md) |

---
<span id="tecnologias">

## 🔧 Tecnologias Utilizadas:

![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-a08021?style=for-the-badge&logo=firebase&logoColor=ffcd34)
![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

---
<span id="backlog">

## 📜 Backlog do Produto:

|  ID  | Prioridade | User Story                                                                                                                                                  | Sprint |
| :--: | :--------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------- | :----: |
| 01 |    Alta    | Como usuário, quero cadastrar minhas próprias receitas, para organizar e acessar minhas receitas favoritas no aplicativo.     |    1   |
| 02 |    Alta    | Como usuário, quero visualizar um feed de receitas sugeridas, baseado nas minhas preferências, para descobrir novas receitas relevantes para mim. |    1   |
| 03 |    Alta    | Como usuário, quero buscar receitas utilizando palavras-chave, voz e aplicar filtros, para encontrar facilmente receitas que atendam às minhas preferências. |    1   |
| 04 |    Alta    | Como usuário, quero visualizar os detalhes de uma receita, para entender os ingredientes, modo de preparo e outras informações necessárias antes de prepará-la. |    1   |
| 05 |    Média    | Como usuário, quero marcar receitas como favoritas, para acessá-las facilmente sempre que quiser prepará-las novamente.                 |    1   |
| 06 |    Alta    | Como usuário, quero visualizar o modo de preparo da receita em passos, iniciar temporizadores quando necessário e adicionar anotações pessoais, para acompanhar a receita facilmente durante o preparo. |    2   |
| 07 |    Média    | Como usuário, quero registrar os ingredientes disponíveis na minha despensa e receber sugestões de receitas com base nesses ingredientes, para aproveitar melhor os alimentos que já possuo. |    2   |
| 08 |    Média    | Como usuário, quero gerenciar minha lista de compras, podendo adicionar itens manualmente ou escaneando código de barras e compartilhá-la com familiares, para facilitar a organização das compras. |    2   |
| 09 |    Média    | Como usuário, quero avaliar receitas, comentar e compartilhar fotos dos pratos que preparei, para registrar minha experiência e ajudar outros usuários |    2   |
| 10 |    Média   | Como usuário, quero planejar minhas refeições da semana organizando receitas por dia e tipo de refeição, para facilitar a organização da minha alimentação. |    3   |
| 11 |    Baixa   | Como usuário, quero compartilhar minhas receitas com outras pessoas, para que elas possam acessá-las facilmente. |    3   |

---
<span id="instalacao">

## 📋 Guia de Instalação:

### Pré-requisitos
* Expo
* Firebase Project

### Como executar o projeto

**1. Clone o repositório:**
```
git clone https://github.com/anajgaspar/RecipeApp.git
cd RecipeApp
```

**2. Configure o front-end:**

 Acesse a pasta do front-end
```
cd frontend
```
 Instale as dependências:
```
npm install
```
 Configure o .env utilizando o exemplo.
 <br>
 Inicie a aplicação:
```
npx expo start -c
```

**2. Configure o back-end:**

 Acesse a pasta do back-end:
```
cd backend
```
 Em cada um dos micro-serviços, instale as dependências:
```
npm install
```
 Configure os .env utilizando o exemplo.
 <br>
 Acesse a pasta do docker:
```
cd docker
```
 Inicie os serviços:
```
docker compose up --build
```

---
