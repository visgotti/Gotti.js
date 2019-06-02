 Node.js <-> HTML5 Networked ECS framework
 
 Client System Usage 
 
 # Gotti.js

Gotti.js is a full stack javascript game engine framework.

It's mostly used by inheriting from the core base classes and implementing abstract methods.

# SYSTEMS
### CLIENT SYSTEM INHERITTED ABSTRACT METHODS 
    import { ClientSystem } from 'gotti';
    import { SYSTEM, MESSAGES } from './Constants'; // should have a constants file with enumerated types 

    export class CustomSystem extends ClientSystem {
        constructor() { 
            super(SYSTEM.PLAYER_MOVEMENT); // IMPORTANT TO USE CORRECT SYSTEM NAME HERE
         	// gotti.js hasnt decorated the system at this point do not use gotti.js methods.
        }
    
        public onInit() {
        	// gotti.js initialized system and decorated with needed methods at this point
        };
    
        /*{ 
            type: number | string - Message type/code
            data: any - Payload of message 
            to: Array<number | string> - system names/codes the message was dispatched to explicitly  
            from? number | string  - which system name/code it was sent from
        }*/
       
        public onLocalMessage(msg) { 
            switch(msg.type) {
                case MESSAGES.TEST_MESSAGE:
                	// handle message here
                	console.log(msg.data );
                    break;  
            }
        };
    
        public onServerMessage(msg) {
            switch(msg.type) 
              case MESSAGES.SERVER_TEST_MESSAGE:
                  break;
            }
        };
    
        public update(delta) {
         	// update loop called every tick 
        };
        public onStop() {
          	// called when process stops a system 
        };
        public onStart() {
         	// called when a process starts the system
        };
        public onEntityAddedComponent(entity: any): void {
          // hook that gets called when a component is added to an entity 
        }
        public onEntityRemovedComponent(entity: any): void {
          // hook that gets called when a component is removed from an
        }
    }
### CLIENT SYSTEM GOTTI.JS METHODS
    dispatchLocal({type, data, to, from?})
    dispatchToServer({type, data, to, from?})
    immediateDispatchToServer ({type, data,to, from?}) // doesnt get queued in game loop from client or on server, use for data you want to be synched as fast as possible, I use it for projectile shooting
    dispatchAllLocal // sends a message to all started systems
    dispatchLocalInstant //triggers onLocalMessage instantly instead of waiting game loop
    dispatchAllLocalInstant // triggers onLocalMessage instantly of all client started systems
    initializeEntity(entity) // decorates entity to trigger system functions when adding/removing components with same name as the system
    destroyEntity(entity) // as of now just calls entity.destroy() which if initialized with initializeEntity it will trigger the onEntityRemovedComponent of all components that have a sibling system started.
    addMessageListener(messageType) // if a message isnt explicitly dispatched to a system a system can still listen for it, and then handle it normally inside the onLocalMessage TODO: listen for server messages too
    removeMessageListener(messageType) // removes message listener (gets called if system is stopped too so you dont have to worry about doing this in the onStop abstract method)
    
# Not yet documented - 
 ### Component.ts
 ### Entity.ts
 ### ServerSystem.ts
 ### ClientManager.ts (ServerSystem with extra functionality)
 ### Process.ts - initializing/adding systems to a pre defined process.
 ### Client.ts - Web client used to start processes.
   
I'm going to work on writing better documentation and possibly a tutorial.. This is just the start of what the framework is capable of and it's meant to be configured with GottiColyseus servers in order to unlock it's real potential of a full stack ECS framework.. it's not as trivial to setup as I want it to be but after I write some documentation I will hopefully be able to make it more approachable. 


 
