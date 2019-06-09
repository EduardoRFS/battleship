# WIP

- Projeto em progresso
- Sendo desenvolvido em https://www.twitch.tv/eduardorfs
- Maiores documentações olhar o api.spec.js

## TODO

- validations deveriam estar separadas do código
- limpar os `// TODO:` nos códigos
- fazer uma test suite
- unit tests usando algum mock para o mongoose
- refatorar aquela api.spec.js ta mto feio
- endgame, mas testar isso é tão cansativo
- uma interface

## Idéia

Essencialmente é uma API que permite criar sessões de batalha naval sem autênticação, com N players e autenticado de forma stateless, a unica prova de sua identidade é sua chave privada.

## JWT

O uso de JWT aqui é completamente desnecessário, o responsável pela autenticação é o RSA, porém é mais simples do que mandar um JSON todas vezes com uma mensagem contendo uma assinatura da chave privada, o JWT já nos da esa assinatura e ainda transfere o JSON necessário. Motivo da chave ser enviada no corpo da request é por preguiça mesmo.

## MongoDB

MongoDB foi escolhido para esse projeto por que tal não possui nenhuma relação no banco com exceção do User, que foi removido para ser o descrito acima, tornando todos os dados em apenas um grande JSON.

Como virtualmente todos dados são necessários em todas requests, o custo de fazer um JOIN seria muito maior do que apenas uma simples query do Mongo.

## API

Todas as mensagens devem ser um JWT assinados com a respetiva chave privada da chave publica informada dentro dele.

### POST /games

##### Body

```json
{ "public_key": "...", "max_players": 2 }
```

Cria uma sala, vai retornar uma instancia do game com o id e com o numero maximo de players estabelecidos, a chave publica usada aqui vai ser identificado como owner da sala, podendo o fazer alterações futuras.

### POST /games/:id/join

```json
{ "public_key": "...", "name": "Your name" }
```

Um player entra na sala e define um name, esse name é apenas para ser ultilizado posteriormente na visualização, essa chave publica será usada para identificação futura.

### POST /games/:id/place

```json
{
  "public_key": "...",
  "aircraft_carrier": {
    "position": { "x": 0, "y": 0 },
    "rotation": "horizontal"
  },
  "battleship": { "position": { "x": 0, "y": 1 }, "rotation": "horizontal" },
  "submarine": { "position": { "x": 0, "y": 2 }, "rotation": "vertical" },
  "destroyer": { "position": { "x": 0, "y": 5 }, "rotation": "horizontal" },
  "boat": { "position": { "x": 0, "y": 6 }, "rotation": "horizontal" }
}
```

O campo de chave publica é ultilizado como identificação, a mesma usada na hora do `/join`, posição e rotação de cada unidade são usados posteriormente no calculo de ataque

### POST /games/:id/attack

```json
{
  "public_key": "...",
  "position": { "x": 8, "y": 0 },
  "player": 0
}
```

Chave publica novamente é a mesma usada no `/join`, a posição é a posição aonde você vai ser atacado e player o player a qual você irá atacar.
Por questão de performance foi usado o `index` da array como identificação do player, porém considero posteriormente mudar isso para a chave publica de outro player
