import { Players } from "@rbxts/services";
import { ServerRemoteFunction } from "shared/RemoteModule/server";

const PingRemoteFunction = new ServerRemoteFunction("Ping");

const onPlayerAdded = (player: Player) => {
	const leaderstats = new Instance("Folder");
	leaderstats.Name = "leaderstats";
	leaderstats.Parent = player;

	const ping = new Instance("NumberValue");
	ping.Name = "Ping";
	ping.Value = 500;
	ping.Parent = leaderstats;

	while (player.IsDescendantOf(Players) && task.wait(1)) {
		const elapsingTime = os.clock();
		pcall(() => PingRemoteFunction.InvokeClient(player, "Ping"));
		const difference = os.clock() - elapsingTime;
		const pingValue = math.floor(difference * 1e3);
		ping.Value = pingValue;
	}
};

const players = Players.GetPlayers();
for (const player of players) {
	task.spawn(onPlayerAdded, player);
}
Players.PlayerAdded.Connect(onPlayerAdded);
