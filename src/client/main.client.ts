import { ClientRemoteFunction } from "shared/RemoteModule/client";

const pingRemoteFunction = new ClientRemoteFunction("Ping");
pingRemoteFunction.onClientInvokes.Ping = () => true;
