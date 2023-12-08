# ROBLOX-TS RemoteEvent Module Test

Esse é um experimento que fiz utilizando o [roblox-ts](https://roblox-ts.com/docs/). Basicamente a funcionalidade desse module é permitir a criação de [RemoteEvent](https://create.roblox.com/docs/scripting/events/remote) e [RemoteFunction](https://create.roblox.com/docs/reference/engine/classes/RemoteFunction) e também organizar as funções entre cliente e servidor.

## Conteudo
- [Iniciando o projeto](#inciciando-o-projeto)
- [Exemplo de uso](#exemplo-de-uso)
    - [RemoteEvents](#remoteevents)
    - [RemoteFunctions](#remotefunctions)

## Inciciando o projeto
- Clone este repositório
- Instale o [roblox-ts](https://roblox-ts.com/docs/guide/setup) e [Rojo](https://rojo.space/)
- Execute o projeto com o comando `npx rbxtsc -w`
- Em outro terminal, execute `rojo serve`
- Abra o roblox studio e conecte com o plugin do Rojo

Caso você tenha um projeto em roblox-ts, você pode copiar o conteudo dentro da pasta `src/RemoteModule` para o seu projeto.

## Exemplo de uso

### RemoteEvents
RemoteEvent é uma boa opção para a comunicação entre client e server. Eu geralmente utilizo mais RemoteEvents que [RemoteFunctions](#RemoteFunctions). Porém a diferença é que o RemoteFunction retorna uma resposta, em vez do RemoteEvent que não retorna nada


#### Métodos
- Server
    - FireClient (player: Player, ...args: unknown[])
        - player é o jogador a qual vai receber a mensagem
        - ...args são os argumentos que serão passados, podem ser qualquer coisa.
    - FireAllClients (...args: unknown[])
        - ...args são os argumentos que serão passados para todos os jogadores, podem ser qualquer coisa
- Client
    - FireServer(functionName: string, ...args: unknown[])
        - functionName é o nome da função no servidor que irá executar
        - ...args são os argumentos que serão passados para o servidor

Em um server script, inicialize o RemoteEvent
```ts
import { ServerRemoteEvent } from "shared/RemoteModule/server"

const myRemote = new ServerRemoteEvent("MyRemoteEvent")
```

Após isso, você pode definir uma função específica quando o client comunicar o servidor
```ts
myRemote.onServerEvents.PlayerCalled = (player: Player, ...args: unknown[]) => {
    const text = args[0]
    print(`${player.Name} said: ${text}`);
}
```
Agora com a função PlayerCalled definida, podemos chama-la no cliente. Para fazermos isso, precisamos inicializar o RemoteEvent(que no exemplo, é o "MyRemoteEvent") no client.
```ts
import { ClientRemoteEvent } from "shared/RemoteModule/client"

const myRemote = new ClientRemoteEvent("MyRemoteEvent")
```

Com nosso RemoteEvent definido no cliente, para comunicar o servidor que queremos usar a função "PlayerCalled", você deve usar o método "FireServer"
```ts
myRemote:FireServer("PlayerCalled", "Texto")
```

Agora, quando o jogador entrar no jogo ele irá chamar a função "PlayerCalled", o server irá receber e vai mandar o output de "Player said: Texto".

Você também pode usar o RemoteEvent para enviar alguma mensagem ao client. Vamos utilizar o exemplo acima para criar uma função "Received" e nela mandar o texto de "Recebido":

```ts
import { ServerRemoteEvent } from "shared/RemoteModule/server"

const myRemote = new ServerRemoteEvent("MyRemoteEvent")

myRemote.onServerEvents.PlayerCalled = (player: Player, ...args: unknown[]) => {
    const text = args[0]
    print(`${player.Name} said: ${text}`);
    
    // Iremos chamar a função para o player que chamou a função PlayerCalled
    myRemote:FireClient(player, "Received", "Recebido")
}
```

Para recebermos no client, podemos fazer:
```ts
import { ClientRemoteEvent } from "shared/RemoteModule/client"

const myRemote = new ClientRemoteEvent("MyRemoteEvent")
myRemote:FireServer("PlayerCalled", "Texto")

myRemote.onClientEvents.Received = (args: ...unknown[]) => {
    const serverMessage = args[0]
    print(`O servidor retornou o texto: ${serverMessage}`)
}
```

Além disso, podemos também chamar a função "FireAllClients" no servidor para comunicar todos os clients:

```ts
const myRemote = new ServerRemoteEvent("MyRemoteEvent")

// Semelhante a FireClient, a diferença é que ela envia a mensagem a todos os client
myRemote:FireAllClients("HelloClient", "Olá pessoas")
```

Para receber a mensagem no client:
```ts
const myRemote = new ClientRemoteEvent("MyRemoteEvent")

myRemote.onClientEvents.HelloClient = (...args: unknown[]) => {
    const serverMessage = args[0]
    print(`O servidor chamou todos os clientes e enviou a seguinte mensagem: ${serverMessage}`)
}
```

### RemoteFunction
Ele funciona similarmente aos RemoteEvents, porém como mencionado anteriormente, ele retorna alguma resposta ao cliente ou servidor

#### Métodos
- Server
    - InvokeClient(player: Player, ...args[]: unknown[]) < ela pode retornar algo 
        - player é o jogador a qual vai receber a mensagem
        - ...args são os argumentos que serão passados, podem ser qualquer coisa.


- Client
    - InvokeServer(functionName: string, ...args[]: unknown[]) < ela pode retornar algo
        - functionName é o nome da função no servidor que irá executar no servidor
        - ...args são os argumentos que serão passados para o servidor    

Acredito que uma maneira boa de explicar como um RemoteFunction funciona é por meio de um "Ping" script. O servidor irá enviar a mensagem para o cliente e quando o cliente receber, ele irá retornar a mensagem para o servidor. Por fim, a gente pode calcular o tempo de resposta.
Vamos começar inicializando um RemoteFunction
```ts
import { ServerRemoteFunction } from "shared/RemoteModule/server"

const pingRemote = new ServerRemoteFunction("PingRemoteFunction")
```
No client, podemos inicializar o RemoteFunction e retornar true quando receber a mensagem
```ts
import { ClientRemoteFunction } from "shared/RemoteModule/client"

const pingRemote = new ClientRemoteFunction("PingRemoteFunction")
pingRemoteFunction.onClientInvokes.Ping = () => true;
```
Agora toda vez que o servidor der InvokeClient em um jogador com argumento "Ping", ele irá retornar "true" como resposta.

Com isso, podemos criar um loop que calcula o tempo de resposta entre o jogador e o servidor:
```ts
// Fazemos um loop a cada 1 segundo e enquanto o jogador estiver no servidor
while (player.IsDescendantOf(Players) && task.wait(1)) {
        // Salva o tempo para que possamos calcular o tempo de resposta mais tarde
		const elapsingTime = os.clock();
        // Enviamos a mensagem de Ping para o jogador
        // Coloquei dentro de um pcall para evitar quaisquer erros, como no caso do jogador sair
        // O script só vai continuar quando o jogador retornar uma resposta
		pcall(() => PingRemoteFunction.InvokeClient(player, "Ping"));
        // Calculamos a diferença entre o tempo atual e o tempo que salvamos anteriormente
		const difference = os.clock() - elapsingTime;
        // Com isso nós podemos multiplicar a diferenca por 1000 e obteremos o ping do jogador
		const pingValue = math.floor(difference * 1e3);
	}
```
Você também pode utilizar o InvokeServer para solicitar algo ao server e receber uma resposta. Por exemplo, você pode criar um RemoteFunction que retorna o nome do jogador. No servidor vamos inicializar o RemoteFunction e definir a função GetName:
```ts
import { ServerRemoteFunction } from "shared/RemoteModule/server"

const getNameRemote = new ServerRemoteFunction("GetNameRemoteFunction")
getNameRemote.onServerInvokes.GetName = (player: Player) => player.Name
```

No client, podemos inicializar o RemoteFunction e chamar a função GetName:
```ts
import { ClientRemoteFunction } from "shared/RemoteModule/client"

const getNameRemote = new ClientRemoteFunction("GetNameRemoteFunction")
const playerName = getNameRemote.InvokeServer("GetName")
print(`O seu nome é: ${playerName}`)
```