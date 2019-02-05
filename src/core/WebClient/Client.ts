import { Signal } from '@gamestdio/signals';
import * as msgpack from './msgpack';

import { Protocol } from './Protocol';
import { Connector } from './Connector';

export type JoinOptions = { retryTimes: number, requestId: number } & any;

export class Client {
    public id?: string;

    public authenticated: boolean = false;
    public options: any;
    public gameTypes: Array<string> = [];
    public gameRegions: Array<string> = [];

    protected connector: Connector;

    protected requestId = 0;

    protected hostname: string;

    private token: string;

    constructor(url: string, token: string) {
        console.log('setting token to', token);
        this.hostname = url;
        this.options = {};
        this.token = token;
        this.connector = new Connector();
    }

    public async getGateData() {
        return new Promise((resolve, reject) => {
            httpGetAsync(`${this.hostname}/gate`, this.token, (err, data) => {
                if(err) {
                    return reject(`Error getting gate data ${err}`);
                }
                //   this.gameTypes = data.gameTypes;
                //     this.gameRegions = data.gameRegions;

                return resolve(data);
            });
        })
    }

    public requestGame(gameType, gameRegion, auth?: any) {
        httpPostAsync(`${this.hostname}/gate`, this.token, { gameType, gameRegion }, (err, data) => {
            if(err) {
                throw (`Error requesting game ${err}`);
            } else {
                this.connector = new Connector()
            }
        })
    }

    public authenticateGate(url: string, options: any = {}) {
    }

    public close() {
        this.connector.connection.close();
    }
}

function httpGetAsync(url, token, callback)
{
    var http = new XMLHttpRequest();
    http.open("GET", url, true); // true for asynchronous

    http.responseType = 'text';
    http.setRequestHeader('authorization', token);

    http.onreadystatechange = function() {
        if (http.readyState == 4){
            if(http.status == 200) {
                console.log('status was', http.status)
                callback(null, JSON.parse(http.responseText));
            } else {
                callback(JSON.parse(http.responseText), null);
            }
        }
    };
    http.send(null);
}

function httpPostAsync(url, token, request, callback) {
    var http = new XMLHttpRequest();
    http.open('POST', url, true);

//Send the proper header information along with the request
    http.setRequestHeader('Content-Type', 'application/json');

    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4) {
            if(http.status == 200) {
                callback(null, JSON.parse(http.responseText))
            } else {
                callback(JSON.parse(http.responseText), null);
            }
        }
    };
    http.send(JSON.stringify(request));
}