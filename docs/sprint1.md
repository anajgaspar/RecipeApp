# Sprint 1 - Detalhamento de User Stories

## US de Rank #1 - Cadastrar receitas próprias

**User Story:** Como usuário, quero cadastrar minhas próprias receitas, para organizar e acessar minhas receitas favoritas no aplicativo.

### Critérios de aceitação

- O usuário deve conseguir cadastrar uma nova receita informando, no mínimo, título, lista de ingredientes e modo de preparo.
- O usuário deve conseguir editar uma receita cadastrada por ele.
- O usuário deve conseguir excluir uma receita cadastrada por ele.
- O sistema deve exibir a nova receita cadastrada na lista de receitas do usuário.

### Regras de negócio

- RN.1: Os campos título, ingredientes e modo de preparo são obrigatórios no cadastro da receita.
- RN.2: Apenas o autor da receita pode editar ou excluir a própria receita.
- RN.3: Os ingredientes devem conter informações como quantidade (obrigatórios), unidade de medida (obrigatórios) e custo (opcional).
- RN.4: A dificuldade deve ser selecionada entre: fácil, média ou difícil.

### Cenários de teste

- **Cenário 1 (sucesso) - Cadastrar receita completa com ingredientes estruturados:**  
	**Dado que:** o usuário está autenticado e na tela de cadastro de receitas,  
	**Quando:** ele informa título, categoria, dificuldade, modo de preparo e ao menos 1 ingrediente com quantidade e unidade, e confirma o cadastro,  
	**Então:** a receita deve ser salva com sucesso, associada ao usuário logado e exibida no feed/lista pessoal.

- **Cenário 2 (exceção) - Tentar cadastrar receita sem campos obrigatórios:**  
	**Dado que:** o usuário está na tela de cadastro de receitas,  
	**Quando:** ele tenta salvar sem preencher título, modo de preparo ou ingredientes obrigatórios,  
	**Então:** o sistema deve bloquear o envio e exibir mensagens de validação por campo.

- **Cenário 3 (exceção) - Tentar editar/excluir receita de outro usuário:**  
	**Dado que:** existe uma receita criada por outro usuário,  
	**Quando:** o usuário autenticado tenta editar ou excluir essa receita por ação direta ou chamada de API,  
	**Então:** o sistema deve negar a operação e retornar erro de permissão.

- **Cenário 4 (exceção) - Falha de autenticação no cadastro:**  
	**Dado que:** o token do usuário expirou durante o cadastro,  
	**Quando:** ele tenta salvar a receita,  
	**Então:** o sistema deve interromper a operação, informar necessidade de novo login e não persistir dados parciais.

---

## US de Rank #2 - Visualizar feed de receitas sugeridas

**User Story:** Como usuário, quero visualizar um feed de receitas sugeridas, baseado nas minhas preferências, para descobrir novas receitas relevantes para mim.

### Critérios de aceitação

- O usuário deve conseguir acessar um feed com receitas sugeridas, considerando favoritos.
- O feed deve listar receitas com informações resumidas (nome, imagem e tempo de preparo, quando disponível).
- O usuário deve conseguir abrir os detalhes de uma receita a partir do feed.
- O sistema deve priorizar sugestões aderentes às preferências do usuário.
- O feed deve ser atualizado automaticamente conforme novas receitas sejam adicionadas.

### Regras de negócio

- RN.1: O feed deve considerar as preferências cadastradas pelo usuário quando existirem.
- RN.2: Quando não houver preferências cadastradas, o sistema deve exibir receitas gerais/populares.
- RN.3: Receitas inativas ou removidas não devem ser exibidas no feed.

### Cenários de teste

- **Cenário 1 (sucesso) - Exibir feed personalizado com base no perfil:**  
	**Dado que:** o usuário possui preferências cadastradas (ex.: categorias e dificuldade),  
	**Quando:** ele acessa a tela inicial de receitas,  
	**Então:** o sistema deve priorizar receitas aderentes às preferências e ocultar receitas inativas/removidas.

- **Cenário 2 (sucesso) - Atualização do feed após nova receita publicada:**  
	**Dado que:** o usuário está no feed e uma nova receita compatível é publicada,  
	**Quando:** o feed é atualizado,  
	**Então:** a nova receita deve aparecer sem duplicar itens já carregados.

- **Cenário 3 (exceção) - Usuário sem preferências cadastradas:**  
	**Dado que:** o usuário não possui preferências cadastradas,  
	**Quando:** ele acessa o feed de receitas sugeridas,  
	**Então:** o sistema deve exibir receitas gerais/populares e manter acesso completo à funcionalidade.

- **Cenário 4 (exceção) - Falha ao carregar feed:**  
	**Dado que:** há indisponibilidade temporária do serviço de receitas,  
	**Quando:** o usuário abre o feed,  
	**Então:** o sistema deve exibir estado de erro amigável com opção de tentar novamente.

---

## US de Rank #3 - Buscar receitas por palavras-chave e filtros

**User Story:** Como usuário, quero buscar receitas utilizando palavras-chave e aplicar filtros, para encontrar facilmente receitas que atendam às minhas preferências.

### Critérios de aceitação

- O usuário deve conseguir buscar receitas por palavra-chave.
- O usuário deve conseguir aplicar filtros de busca (ex.: dificuldade, categoria).
- O sistema deve exibir resultados que correspondam ao termo e aos filtros selecionados.

### Regras de negócio

- RN.1: A busca deve considerar: título da receita e ingredientes.
- RN.2: Os filtros disponíveis incluem: dificuldade e categoria.
- RN.3: Os filtros selecionados devem ser aplicados em conjunto ao termo de busca.

### Cenários de teste

- **Cenário 1 (sucesso) - Buscar por termo em título e ingredientes:**  
	**Dado que:** o usuário está na tela de busca,  
	**Quando:** ele pesquisa por um termo válido (ex.: "frango"),  
	**Então:** o sistema deve retornar receitas cujo título ou ingredientes contenham o termo informado.

- **Cenário 2 (sucesso) - Buscar com múltiplos filtros combinados:**  
	**Dado que:** o usuário está na tela de busca de receitas,  
	**Quando:** ele informa um termo válido e aplica os filtros de categoria e dificuldade,  
	**Então:** o sistema deve retornar apenas receitas que atendam simultaneamente ao termo e aos filtros selecionados.

- **Cenário 3 (exceção) - Busca com termo inválido:**  
	**Dado que:** o usuário está na tela de busca de receitas,  
	**Quando:** ele tenta pesquisar com menos de 2 caracteres,  
	**Então:** o sistema deve exibir mensagem orientando a informar um termo válido e não executar a consulta.

- **Cenário 4 (exceção) - Nenhum resultado encontrado:**  
	**Dado que:** o usuário realiza uma busca válida com filtros restritivos,  
	**Quando:** não existem receitas compatíveis,  
	**Então:** o sistema deve exibir estado "nenhum resultado" e permitir limpar filtros para nova busca.

---

## US de Rank #4 - Visualizar detalhes da receita

**User Story:** Como usuário, quero visualizar os detalhes de uma receita, para entender os ingredientes, modo de preparo e outras informações necessárias antes de prepará-la.

### Critérios de aceitação

- O usuário deve conseguir abrir a tela de detalhes de uma receita selecionada.
- A tela de detalhes deve exibir, no mínimo, título, ingredientes e modo de preparo.
- O sistema deve exibir informações complementares da receita quando disponíveis (tempo, porções, categoria, imagem).
- O usuário deve conseguir retornar à lista/feed após consultar os detalhes.

### Regras de negócio

- RN.1: Somente receitas ativas e existentes podem ter detalhes exibidos.
- RN.2: Se alguma informação opcional não existir, a tela deve continuar funcional sem quebrar o layout.
- RN.3: O acesso aos detalhes deve respeitar as regras de permissão de conteúdo privado/público.

### Cenários de teste

- **Cenário 1 (sucesso) - Abrir detalhes completos da receita:**  
	**Dado que:** o usuário está no feed ou na lista de resultados,  
	**Quando:** ele seleciona uma receita ativa e existente,  
	**Então:** o sistema deve abrir a tela com título, ingredientes, modo de preparo e metadados disponíveis (tempo, porções, categoria e imagem).

- **Cenário 2 (sucesso) - Abrir receita com dados opcionais ausentes:**  
	**Dado que:** existe uma receita sem imagem e sem tempo de preparo cadastrado,  
	**Quando:** o usuário abre os detalhes dessa receita,  
	**Então:** a tela deve ser exibida normalmente, com placeholders ou campos omitidos sem quebrar layout.

- **Cenário 3 (exceção) - Receita indisponível:**  
	**Dado que:** o usuário tenta abrir uma receita removida ou inexistente,  
	**Quando:** o sistema não encontra os dados da receita,  
	**Então:** deve exibir mensagem de indisponibilidade e permitir voltar para a tela anterior.

---

## US de Rank #5 - Favoritar receitas

**User Story:** Como usuário, quero marcar receitas como favoritas, para acessá-las facilmente sempre que quiser prepará-las novamente.

### Critérios de aceitação

- O sistema deve permitir que o usuário marque uma receita como favorita a partir da tela de detalhes da receita.
- O sistema deve exibir um indicador visual (ícone de coração) mostrando que a receita foi adicionada aos favoritos.
- O sistema deve disponibilizar uma seção onde o usuário possa visualizar todas as receitas que foram marcadas como favoritas.

### Cenários de teste

- **Cenário 1 (sucesso) - Marcar receita como favorita na tela de detalhes:**  
	**Dado que:** o usuário está autenticado e visualizando os detalhes de uma receita,  
	**Quando:** ele aciona o botão de favorito (ícone de coração),  
	**Então:** a receita deve ser adicionada aos favoritos do usuário.

- **Cenário 2 (sucesso) - Listar receitas favoritadas na seção de favoritos:**  
	**Dado que:** o usuário possui receitas marcadas como favoritas,  
	**Quando:** ele acessa a seção de favoritos,  
	**Então:** o sistema deve exibir todas as receitas favoritadas por esse usuário.