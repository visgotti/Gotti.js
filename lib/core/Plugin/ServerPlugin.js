// import { ServerPlugin } from "gotti"
// export class PlayerManager extends ServerPlugin {
//     private playerMapManager: PlayerManager;
//     constructor() {
//         super("ZoneClientManager");
//     }
//     data() {
//         return {
//             playerMap: {},
//             playerArray: [],
//         }
//     },
//     methods: {
//         // todo based on how first player gets added defines how other handlers work
//         addPlayer(player, id?) {
//             if(id || id === 0){
//                 this.playerMap[id] = player;
//             } else if (player.id || player.id === 0) {
//                 this.playerMap[player.id] = player;
//             }
//             this
//         },
//         removePlayer(id) {
//         },
//         getPlayer(id) {
//             return this.props.playerMap[id]
//         },
//     }
// }
// function addPluginToSystem(plugin, system) {
//     for(let name in plugin.data) {
//         if(system.prototype[name] || system[name]) throw new Error ('system already using prop');
//         Object.defineProperty(system.prototype, `${name}`, {
//             get: function() {
//                 return plugin.data[name];
//             },
//             set: function() {
//                 throw new Error(`Cannot set property value ${name} because it is a prop belonging to the plugin ${plugin.name}`)
//             }
//         })
//     }
// }
// function installPlugin(PluginConstructor: ServerPlugin, options){
//     const plugin = new PluginConstructor();
//     let data = plugin.data && plugin.data();
//     if(options.include && options.exclude) throw new Error(`Cannot have include and excluded options for plugin ${PluginConstructor.toString()}`)
//     let systems;
//     if(options.include) {
//         systems = this.systems.filter(s => s.exclude.includes(s.name))
//     } else if(options.exclude) {
//         systems = this.systems.filter(s => !s.include.includes(s.name))
//     } else {
//         systems = [...this.systems]
//     }
//     for(let system in systems) {
//         this.addPropsToSystem(systems[system], data);
//     }
//     for(let prop in plugin)
//     for(let prop in plugin.props) {
//         deepFreeze(plugin[prop])
//         Object.defineProperty(Plugin.prototype, "bar", {
//             get: function () {
//                 return this._bar;
//             },
//             set: function (value) {
//                 this._bar = value;
//             },
//             enumerable: true,
//             configurable: true
//         });
//         return foo;
//     }
// }
// function deepFreeze (o) {
//     Object.freeze(o);
//     Object.getOwnPropertyNames(o).forEach(function (prop) {
//       if (o.hasOwnProperty(prop)
//       && o[prop] !== null
//       && (typeof o[prop] === "object" || typeof o[prop] === "function")
//       && !Object.isFrozen(o[prop])) {
//         deepFreeze(o[prop]);
//       }
//     });
//     return o;
//   };
