Full-stack and optimal game engine. It will provide a few frameworks that every game will use
which allows you to create modular and powerful systems that can live on both server and client
side. I am basing this on my current private engine, the problem is I don't have tests and it's not as modular
as I'd like it to be, it's primary focus was a top down shooter I'm in the progress of creating.

The focus of this project is to completely refactor it in order to be
easier to understand for other developers, more stable, and much more modular/universal.

I want systems to be very modular and easy to implement. I'm still working out the logistics of
the full engine and what it will consist other than modular Systems. But for now systems and system communication
between a network will be my main focus.

Currently I've just started recoding the core componenets, I hope to approach this with a more TDD
workflow than I usually have, because without tests I become a ball of anxiety when running code.

Systems will have an API that makes communicating with other local systems easy and makes
sending remote messages from client to server or server to client just as easily. Although the
low level implementations will be a bit more complex, the public API will be near identical and work
almost the exact same way for both.

Each system you create will inherit from the base System class, and with it you get access to functions like

    system.dispatchLocal(message) // sends messages locally ( server to other server systems or client to other client systems )

and also

    system.dispatchRemote(message) // sends messages remotely ( server to client systems or client to server systems )

then all these messages will be handled the same by implementing the abstract onMessage method inherited from the base system class.

    onMessage(message) {
         switch(message.type) {
            case 'foo':
                this.handleFoo(message.data);
                break;
         }
    }

the way a message MUST Be formatted is

    {
        type: 'MESSAGE_TYPE',
        data: {
            'foo': 'bar',
             'anyJSON', 'isValid'
         },
         to: ['COLLISION_SYSTEM', 'OTHER_SYSTEM'],
         from: 'OTHER_OTHER_SYSTEM'
    }

it will throw an error if the message is not formatted correctly.
The best bet would be to have messageFactories for your system so
you can just call a function with params and pass it into the dispatch method.


