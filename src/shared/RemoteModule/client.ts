import { ReplicatedStorage, RunService } from "@rbxts/services";

if (RunService.IsServer()) error("You cannot execute this on the server");

const eventsFolder = ReplicatedStorage.WaitForChild("Events");

const initializeClientEvent = <TEventType extends keyof CreatableInstances>(name: string, className: TEventType) => {
	const event = eventsFolder.FindFirstChild(name, true);
	if (!event) error(`Event: ${event} does not exists`);
	return event as CreatableInstances[TEventType];
};

export class ClientRemoteEvent {
	event: CreatableInstances["RemoteEvent"];
	onClientEvents: { [key: string]: (...args: unknown[]) => unknown };

	constructor(name: string) {
		this.event = initializeClientEvent(name, "RemoteEvent");
		this.onClientEvents = {};

		this.event.OnClientEvent.Connect((functionName: string, ...args: unknown[]) => {
			this.onClientEvents[functionName](...args);
		});
	}

	FireServer(functionName: string, ...args: unknown[]) {
		this.event.FireServer(functionName, ...args);
	}
}

export class ClientRemoteFunction {
	event: CreatableInstances["RemoteFunction"];
	onClientInvokes: { [key: string]: (...args: unknown[]) => unknown };

	constructor(name: string) {
		this.event = initializeClientEvent(name, "RemoteFunction");
		this.onClientInvokes = {};

		this.event.OnClientInvoke = (functionName: string, ...args: unknown[]) => {
			return this.onClientInvokes[functionName](...args);
		};
	}

	InvokeServer(functionName: string, ...args: unknown[]) {
		return this.event.InvokeServer(functionName, ...args);
	}
}
