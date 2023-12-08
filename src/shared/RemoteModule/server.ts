import { ReplicatedStorage, RunService } from "@rbxts/services";

if (RunService.IsClient()) error("You cannot execute this on the client");

let eventsFolder = ReplicatedStorage.FindFirstChild("Events");
if (!eventsFolder) {
	eventsFolder = new Instance("Folder");
	eventsFolder.Name = "Events";

	const remoteFunctions = new Instance("Folder");
	remoteFunctions.Name = "RemoteFunctions";
	remoteFunctions.Parent = eventsFolder;

	const remoteEvents = new Instance("Folder");
	remoteEvents.Name = "RemoteEvents";
	remoteEvents.Parent = eventsFolder;

	eventsFolder.Parent = ReplicatedStorage;
}

const initializeServerEvent = <TEventType extends keyof CreatableInstances>(name: string, className: TEventType) => {
	if (className !== "RemoteEvent" && className !== "RemoteFunction")
		error("You cannot initialize a instance that is not a RemoteEvent or RemoteFunction");

	const event = new Instance(className);
	event.Name = name;
	event.Parent =
		className === "RemoteEvent"
			? eventsFolder?.FindFirstChild("RemoteEvents")
			: eventsFolder?.FindFirstChild("RemoteFunctions");
	return event;
};

export class ServerRemoteEvent {
	event: CreatableInstances["RemoteEvent"];
	onServerEvents: { [key: string]: (player: Player, ...args: unknown[]) => void };

	constructor(name: string) {
		this.event = initializeServerEvent(name, "RemoteEvent");
		this.onServerEvents = {};

		this.event.OnServerEvent.Connect((player, functionName, ...args) => {
			this.onServerEvents[functionName as string](player, ...args);
		});
	}

	FireClient(player: Player, ...args: unknown[]) {
		this.event.FireClient(player, ...args);
	}

	FireAllClients(...args: unknown[]) {
		this.event.FireAllClients(...args);
	}
}

export class ServerRemoteFunction {
	event: CreatableInstances["RemoteFunction"];
	onServerInvokes: { [key: string]: (player: Player, ...args: unknown[]) => unknown };

	constructor(name: string) {
		this.event = initializeServerEvent(name, "RemoteFunction");
		this.onServerInvokes = {};

		this.event.OnServerInvoke = (player, functionName, ...args) => {
			return this.onServerInvokes[functionName as string](player, ...args);
		};
	}

	InvokeClient(player: Player, ...args: unknown[]) {
		return this.event.InvokeClient(player, ...args);
	}
}
