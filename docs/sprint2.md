# Sprint 2 - Detalhamento de User Stories

## US de Rank #6 - Modo de preparo

**User Story:** Como usuário, quero visualizar o modo de preparo da receita em passos, iniciar temporizadores quando necessário e adicionar anotações pessoais, para acompanhar a receita facilmente durante o preparo.

### Critérios de aceitação

- O usuário deve poder navegar (anterior e próximo) entre os passos individuais.
- O sistema deve permitir iniciar temporizadores quando necessário.
- O usuário deve poder adicionar anotações pessoais na receita.
- O sistema deve manter a tela ativa durante o modo de preparo.

### Regras de negócio

- RN.1: Temporizadores só devem aparecer em passos que possuam tempo definido.
- RN.2: O temporizador deve permitir iniciar, pausar e reiniciar.
- RN.3: Anotações devem ser visíveis apenas para o usuário que as criou.


### Cenários de teste

- **Cenário 1 (sucesso) - Navegar entre passos do modo de preparo:**  
	**Dado que:** a receita possui modo de preparo com múltiplos passos,  
	**Quando:** o usuário avança e retorna usando os controles de próximo e anterior,  
	**Então:** o sistema deve exibir corretamente o passo correspondente sem perder o contexto da execução.

- **Cenário 2 (sucesso) - Controlar temporizador em passo com tempo definido:**  
	**Dado que:** o usuário está em um passo com tempo definido,  
	**Quando:** ele inicia, pausa e reinicia o temporizador,  
	**Então:** o sistema deve exibir os controles de temporizador e refletir corretamente os estados de execução (rodando, pausado e reiniciado).

- **Cenário 3 (sucesso) - Persistir e isolar anotações pessoais por usuário:**  
	**Dado que:** dois usuários diferentes acessam a mesma receita,  
	**Quando:** um deles adiciona uma anotação pessoal no modo de preparo,  
	**Então:** a anotação deve ser visível apenas para o autor e não deve aparecer para os demais usuários.

- **Cenário 4 (sucesso) - Manter tela ativa durante o preparo:**  
	**Dado que:** o usuário iniciou o modo de preparo da receita,  
	**Quando:** ele permanece na tela durante a execução dos passos e temporizadores,  
	**Então:** o sistema deve manter a tela ativa até a saída do modo de preparo.

---

## US de Rank #7 - Gerenciar despensa

**User Story:** Como usuário, quero registrar os ingredientes disponíveis na minha despensa e receber sugestões de receitas com base nesses ingredientes, para aproveitar melhor os alimentos que já possuo.

### Critérios de aceitação

- O usuário deve poder cadastrar ingredientes na despensa manualmente ou via scanner de código de barras.
- O sistema deve permitir informar quantidade e data de validade.
- O sistema deve emitir uma notificação sobre ingredientes próximos do vencimento.

### Regras de negócio

- RN.1: Cada ingrediente deve possuir nome, quantidade e unidade de medida.

### Cenários de teste

- **Cenário 1 (sucesso) - Cadastrar ingrediente manualmente na despensa:**  
	**Dado que:** o usuário está autenticado e na tela de despensa,  
	**Quando:** ele informa nome, quantidade, unidade e data de validade de um ingrediente e confirma o cadastro,  
	**Então:** o item deve ser salvo e exibido na lista da despensa.

- **Cenário 2 (sucesso) - Cadastrar ingrediente via scanner de código de barras:**  
	**Dado que:** o usuário está na funcionalidade de scanner da despensa,  
	**Quando:** ele escaneia um código de barras válido e confirma os dados do item,  
	**Então:** o sistema deve preencher os dados identificados e permitir salvar o ingrediente na despensa.

- **Cenário 3 (sucesso) - Notificar ingrediente próximo do vencimento:**  
	**Dado que:** há ingrediente com data de validade próxima na despensa,  
	**Quando:** o sistema executa a verificação de validade,  
	**Então:** o usuário deve receber notificação sobre o item próximo do vencimento.

---

## US de Rank #8 - Gerenciar lista de compras

**User Story:** Como usuário, quero gerenciar minha lista de compras, podendo adicionar itens manualmente ou escaneando código de barras e compartilhá-la com familiares, para facilitar a organização das compras.

### Critérios de aceitação

- O usuário deve poder criar e gerenciar uma lista de compras.
- O usuário deve poder cadastrar ingredientes na lista de compras manualmente ou via scanner de código de barras.
- O usuário deve poder marcar itens como comprados.
- O usuário deve poder compartilhar a lista de compras com outros usuários.

### Cenários de teste

- **Cenário 1 (sucesso) - Criar lista de compras e adicionar item manualmente:**  
	**Dado que:** o usuário está autenticado na funcionalidade de lista de compras,  
	**Quando:** ele cria uma nova lista e adiciona um item manualmente,  
	**Então:** o item deve ser exibido na lista com status inicial de não comprado.

- **Cenário 2 (sucesso) - Adicionar item via scanner de código de barras:**  
	**Dado que:** o usuário abriu o scanner na lista de compras,  
	**Quando:** ele escaneia um código de barras válido e confirma a inclusão,  
	**Então:** o item deve ser adicionado à lista de compras.

- **Cenário 3 (sucesso) - Compartilhar lista com outro usuário:**  
	**Dado que:** a lista de compras possui ao menos um item cadastrado,  
	**Quando:** o usuário compartilha a lista com outro usuário válido,  
	**Então:** o usuário convidado deve obter acesso à lista conforme as permissões definidas.

---

## US de Rank #9 - Comentar e avaliar receitas

**User Story:** Como usuário, quero avaliar receitas, comentar e compartilhar fotos dos pratos que preparei, para registrar minha experiência e ajudar outros usuários

### Critérios de aceitação

- O usuário deve poder avaliar uma receita com estrelas.
- O usuário deve poder comentar em uma receita.
- O usuário deve poder anexar fotos do prato preparado na avaliação.
- Outros usuários devem poder visualizar avaliações e comentários.

### Regras de negócio

- RN.1: A avaliação deve ser de 1 a 5 estrelas.
- RN.2: A média das avaliações deve ser exibida na receita.


### Cenários de teste

- **Cenário 1 (sucesso) - Avaliar receita com nota válida:**  
	**Dado que:** o usuário está autenticado na tela de detalhes da receita,  
	**Quando:** ele envia uma avaliação entre 1 e 5 estrelas,  
	**Então:** o sistema deve registrar a avaliação e atualizar a média exibida da receita.

- **Cenário 2 (sucesso) - Comentar em receita com foto anexa:**  
	**Dado que:** o usuário concluiu o preparo e deseja registrar sua experiência,  
	**Quando:** ele publica um comentário com texto e anexa foto do prato,  
	**Então:** o sistema deve salvar o comentário e a imagem vinculados à receita.