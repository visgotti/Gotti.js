 ## THIS IS A HEAVILY IN-DEVELOPMENT BRANCH
 ### I'm currently Implementing WebRTC within my systems to allow for peer to peer gameplay.

From a client system you will be able to do 

    // pings relay server to notify the player you want to connect
    this.addPeer(playerId) 
    
    // will send via WebRTC if available, or it will send via connector > relay (keeps track of which connector server a client is on) > connector > client  
    this.dispatchToPeer(playerId, message) 
    
the goal is to allow for this api to work regardless if there's an existing 
WebRTC connection, the backup will normally relay the message across servers from your computer to theirs.

This will allow you to design your application without worrying about if the players browser
supports WebRTC, your app will still work exactly the same either way (higher ping though). You'll just need to take into account performance
and optimization for worse case scenario and everyone must relay or just use the regular connector > area for business logic. It's also my goal to try and make areas smart enough to not send redundant data if theres a peer connection between
players but that's an issue for another day.

 
Node.js <-> HTML5 Networked ECS framework
  
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
    
# Components
### Creating a component

     import { Component } from 'gotti';
     import {  SYSTEM, MESSAGES } from './Constants';
     
     export class PositionComponent extends Component {
        private x: number;
        private y: number;
        constructor(x, y){
           super(SYSTEM.POSITION) // component should match system name 
                                  // if you want to leverage onEntityAddedComponent 
                                  // and onEntityRemovedComponent system hooks
           this.x = x;
           this.y = y;
        }
        setPositionByDeltas(dX, dY) {
            this.x += dX;
            this.y += dY;
        
     }
     
     
### COMPONENT GOTTI.JS METHODS
    setAttribute('attributeName', 'attributeValue')
    setAttributeGetter('attributeName', () => { return 'attributeValue' });
    // read more about setAttribute and setAttributeGetter in entity methods documentation
    // since theyre the same functions for whatever entity the component lives on
    
#Entities
##Creating an Entity
#### adding PositionComponent

    import { Entity, NetworkedComponent  } from 'gotti';
    import { PositionComponent } from './PositionComponent;
    export class Player extends Entity {
        // each entity should have a unique id and that should be about the only 
        // thing set in the constructor unless you add your own properties
        constructor(id) {
            super(id);
        }
        // use initialize function for component initialization 
        // so all the gotti hooks and decorators get applied correctly
        initialize(data) {
            const { x, y } = data; // data should be some initialization attributes
            this.addComponent(new PositionComponent(x, y)); // this would still work fine by dispatchRemote would not do anything
            
            // to leverage the networking do
            this.addComponent(NetworkComponent(new PositionComponent(x, y));
        }
    }
### Entity GOTTI.JS METHODS
    addComponent(component) // adds component to entity and triggers sibling system onEntityAddedComponent        
    removeComponent(component) // adds component to entity and triggers sibling system onEntityRemovedComponent        
    getComponent(componentName) // gets component or null if entity doesnt have it
    hasComponent(componentName) // returns boolean iif entity has component or not
    setAttribute('attributeName', 'attributeValue') // sets an attribute which can also be called from components and will be called on the entity object.
    setAttributeGetter('attributeName', () => { return 'attributeValue' })
                                // same as above but when getAttributes the value 
                                // will be whatever the function returns, this 
                                // is useful if you only want to do attribute formatting/encoding
                                // when you need to get the attributes and not every time a value
                                // in your component changes(changing areas)
                                
    getAttributes() // returns key value pair of all attributes set from all components
    
#### Dynamic Component Methods
    when you add a component to an entity, the component methods all 
    get mapped to the entity and you can call any method without having 
    to do a entity.getComponent(COMPONENT_NAME).callMethod();
    so the above entity, from inside an system we can now do 
  
        const player = this.initializeEntity(new Player(clientId), playerData);
        player.setPositionByDeltas(x, y) 
        // instead of having to always write out
        player.getComponent(SYSTEM.POSITION).setPositionsByDeltas(x, y);
    
    
# Not yet documented - 
 ### ServerSystem.ts
 ### ClientManager.ts (ServerSystem with extra functionality)
 ### Process.ts - initializing/adding systems to a pre defined process.
 ### Client.ts - Web client used to start processes.
   
I'm going to work on writing better documentation and possibly a tutorial.. This is just the start of what the framework is capable of and it's meant to be configured with GottiColyseus servers in order to unlock it's real potential of a full stack ECS framework.. it's not as trivial to setup as I want it to be but after I write some documentation I will hopefully be able to make it more approachable. 


 
