Made exceptional progress since the last readme

I'm still trying to figure out the best way to configure games. I'm leaning towards having it be schema driven.

What I'm thinking is something like

 ================================================ GAME CONFIG ================================================
<Game Type Name>
    Client Options: // static options that the player will receive when they join the game
    Server Options: // static options you only want the servers to receive when instantiated

    <Area Server Configs >  < -------------------- Depending on how many of these are defined in your game config will
                                                   determine how many area servers it needs
        id: #id of area server

        <Area Room Configs>
            id #id of area room
            Client Options: // static options the player receives when they join room
            Server Options: // static options you only want the ROOM to receive when instantiated



Regions

 next you would need to define all your pool of servers to use.

<Region Name>
    ==================SERVER CONFIGS ===============
    connectors: [
        host: <hostname>
        clientPort: <port#> // port number the connector server listens on for websocket connections from
        serverPort: <port#> // port number the connector server uses to communicate with other servers
    ],
    areas: [{
        host: <hostname>
        serverPort: <port#>
    }],
    gates: [
        host: hostname,
        serverPort: port#,
    ]
    ==================================================

So you would define your game types and regions, then after you configure all the needed abstractions
you would simply be able to run a command to start the initial setup of master and gate servers.
    gotti start

after that succesfully runs you should be able to run commands like
    gotti -type <gameType> -region <region> --connectors 5


and that would dynamically create the cluster if there are enough connectors and areas in the pool of unused servers.

I'm pretty far away from this, but if you want to pull hair out and figure out your own configuration and deployment in the meantime,
the framework is very powerful and straight forward.


You define Systems that can communicate with other systems on either the client or server.

a Client System looks like

    export class ExampleSystem extends ClientSystem {
        constructor(Constants.PLAYER_SYSTEM) {} // should use typescript's enum

        // OPTIONAL ABSTRACT METHODS
        onAreaWrite(areaId, isInitial: boolean, options?: any) {
                // this gets called when you enter a new area as a writer.
                // areaId is id of the area, isInitial tells you if this is the first time youre entering any area of the game
                // options is what gets returned from the servers onClientAreaWrite function which you will see demonstrated farther down
        }
    }


