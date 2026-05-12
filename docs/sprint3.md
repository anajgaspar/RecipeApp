# Sprint 3 - Detalhamento de User Stories

## US de Rank #10 - Planejamento semanal de refeições

**User Story:** Como usuário, quero planejar minhas refeições da semana organizando receitas por dia e tipo de refeição, para facilitar a organização da minha alimentação.

### Critérios de aceitação

- O usuário deve conseguir criar um plano semanal e atribuir receitas a dias (segunda–domingo) e tipos (café da manhã, almoço, jantar, lanche).
- O usuário deve poder editar e remover receitas do plano.

### Cenários de teste

- **Cenário 1 (sucesso) - Criar plano semanal:**  
	**Dado que:** o usuário está autenticado,  
	**Quando:** ele cria um plano atribuindo receitas a diferentes dias e tipos e salva,  
	**Então:** as alterações devem ser refletidas no plano.

- **Cenário 2 (sucesso) - Editar plano existente:**  
	**Dado que:** existe um plano salvo para a semana,  
	**Quando:** o usuário altera receitas atribuídas e salva,  
	**Então:** as alterações devem ser refletidas ao recarregar o plano.

---

## US de Rank #11 - Compartilhar receitas

**User Story:** Como usuário, quero compartilhar minhas receitas com outras pessoas, para que elas possam acessá-las facilmente.

### Critérios de aceitação

- O usuário deve conseguir gerar um link de compartilhamento para uma receita.
- O usuário deve conseguir gerar um QR Code de redirecionamento para uma receita.
- O link deve permitir acesso de leitura à receita com token obrigatório.

### Cenários de teste

- **Cenário 1 (sucesso) - Copiar/usar link gerado:**  
	**Dado que:** o link foi gerado com sucesso,  
	**Quando:** o usuário copia e abre o link em outro dispositivo,  
	**Então:** a receita deve ser exibida corretamente **com** necessidade de login.

- **Cenário 2 (sucesso) - Abrir QR Code gerado:**  
	**Dado que:** o QR Code foi gerado com sucesso,  
	**Quando:** o usuário escaneia o código em outro dispositivo,  
	**Então:** a receita deve ser exibida corretamente **com** necessidade de login.

---