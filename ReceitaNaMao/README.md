# Receita na Mão 👐🍲
>⌛ Em desenvolvimento

<img width="2560" height="650" alt="GitHub Banner" src="https://github.com/user-attachments/assets/12618612-98e8-4b42-af40-422d65e7f304" />

O **Receita Na Mão** é um aplicativo mobile, com o objetivo de auxiliar usuários na organização de receitas, planejamento de refeições e gerenciamento de ingredientes, oferecendo uma experiência prática e intuitiva para o preparo de pratos no dia a dia.
O aplicativo permite armazenar receitas, gerenciar uma despensa virtual, gerar listas de compras e receber sugestões personalizadas.

<div align=center>
<a href ="#tecnologias"> Tecnologias </a> | 
<a href ="#backlog"> Backlog do Produto </a> | <a href ="#instalacao"> Manual de Instalação </a>
</div>

---
<span id="tecnologias">

## 🔧 Tecnologias Utilizadas:

![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-a08021?style=for-the-badge&logo=firebase&logoColor=ffcd34)
![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

---
<span id="backlog">

## 📜 Backlog do Produto:

|  RF  | Prioridade | User Story                                                                                                                                                  | Sprint |
| :--: | :--------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------- | :----: |
| RF01 |    Alta    | Como visitante, quero me cadastrar informando nome, e-mail válido e senha, para garantir o acesso de todas as funcionalidades do sistema com segurança.     |    1   |
| RF02 |    Alta    | Como usuário, quero confirmar meu e-mail através de um link de verificação, para validar minha identidade e ativar minha conta. |    1   |
| RF03 |    Alta    | Como usuário, quero iniciar sessão informando meu e-mail e senha cadastrados, para acessar e utilizar todas as funcionalidades do sistema. |    1   |
| RF08 |    Alta    | Como usuário, quero cadastrar minhas próprias receitas, para organizar minhas receitas favoritas e acessá-las facilmente no aplicativo. |    1   |
| RF09 |    Alta    | Como usuário, quero buscar receitas digitando palavras-chave ou utilizando comandos de voz, para encontrar rapidamente receitas específicas ou ingredientes que desejo preparar. |    1   |
| RF10 |    Alta    | Como usuário, quero aplicar filtros nas buscas de receitas, para encontrar receitas que atendam às minhas preferências. |    1   |
| RF11 |    Alta    | Como usuário, quero visualizar o modo de preparo das receitas em um formato passo a passo, exibindo cada etapa separadamente, para acompanhar o preparo de forma mais clara e organizada. |    1   |
| RF20 |    Alta    | Como usuário, quero visualizar um feed de receitas sugeridas, baseado nas minhas preferências, para descobrir novas receitas relevantes para mim. |    1   |
| RF06 |    Média    | Como usuário, quero visualizar e gerenciar os dados da minha conta, para manter minhas informações atualizadas e meu perfil personalizado.                 |    2   |
| RF07 |    Média   | Como usuário, quero criar e gerenciar múltiplos perfis familiares dentro do aplicativo, para que cada membro da família possa ter suas próprias experiências. |    2   |
| RF12 |    Média   | Como usuário, quero iniciar temporizadores diretamente nos passos da receita que possuem tempo de espera, para controlar melhor o tempo de preparo dos alimentos. |    2   |
| RF12 |    Média   | Como usuário, quero adicionar anotações pessoais nas receitas, para adaptar as receitas de acordo com minhas preferências. |    2   |
| RF14 |    Média   | Como usuário, quero que a tela do dispositivo permaneça ativa enquanto estou no modo de preparo da receita, para evitar que o celular bloqueie durante o acompanhamento das etapas. |    2   |
| RF16 |    Alta   | Como usuário, quero cadastrar os ingredientes disponíveis na minha despensa, para controlar melhor os alimentos que tenho em casa e evitar desperdícios. |    2   |
| RF17 |    Média   | Como usuário, quero escanear o código de barras de produtos utilizando a câmera do celular, para adicionar rapidamente ingredientes à minha despensa ou lista de compras. |    2   |
| RF18 |    Alta   | Como usuário, quero compartilhar minha lista de compras com outros membros da família, para facilitar a organização das compras domésticas. |    2   |
| RF19 |    Alta   | Como usuário, quero receber sugestões de receitas baseadas nos ingredientes disponíveis na minha despensa, especialmente aqueles próximos da data de vencimento, para aproveitar melhor os alimentos que já possuo. |    2   |
| RF22 |    Média   | Como usuário, quero gerar um QR Code para compartilhar minhas receitas com outras pessoas, permitindo que elas possam acessar rapidamente a receita diretamente no aplicativo. |    2   |
| RF04 |    Baixa   | Como usuário, quero iniciar sessão utilizando minha conta Google, para acessar rapidamente o sistema sem precisar se cadastrar manualmente. |    3   |
| RF05 |    Baixa   | Como usuário, quero utilizar autenticação biométrica (impressão digital), para tornar o processo de login mais seguro. |    3   |
| RF15 |    Baixa   | Como usuário, quero registrar o preço dos ingredientes utilizados nas receitas e calcular automaticamente o custo total da preparação, para acompanhar e controlar meus gastos com alimentação. |    3   |
| RF23 |    Média   | Como usuário, quero avaliar receitas utilizando um sistema de estrelas, para registrar minha opinião e ajudar outros usuários a identificar receitas bem avaliadas. |    3   |
| RF24 |    Média   | Como usuário, quero comentar nas receitas e anexar fotos do prato que preparei, para compartilhar minha experiência culinária com outros usuários do aplicativo. |    3   |
| RF25 |    Baixa   | Como usuário, quero ganhar badges ou níveis de reputação conforme publico receitas, recebo avaliações ou interajo com a comunidade, para incentivar minha participação no aplicativo. |    3   |
| RF26 |    Baixa   | Como usuário, quero realizar backup dos meus dados, no Google Drive, para não perder minhas informações. |    3   |
| RF27 |    Baixa   | Como usuário, quero acessar receitas e funcionalidades já sincronizadas mesmo sem conexão com a internet, para poder utilizar o aplicativo em qualquer situação. |    3   |
| RF28 |    Baixa   | Como novo usuário, quero visualizar um tutorial interativo ao acessar o aplicativo pela primeira vez, para entender rapidamente como utilizar suas principais funcionalidades. |    3   |

---
<span id="instalacao">

## 📋 Guia de Instalação:

### Pré-requisitos
* JDK 17+
* Gradle
* Dispositivo Android ou emulador

---
