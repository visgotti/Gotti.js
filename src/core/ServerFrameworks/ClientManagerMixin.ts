import { ClientManager } from './ClientManager';
import { Mixin } from "../SystemMixin";
import {Entity} from "../Entity";

export interface ClientManagerMixin extends Mixin {
    beforeOnClientWrite: (clientId, options?) => void;
    afterOnClientWrite: (clientId, options?) => void;

    beforeOnClientListen: (clientId, options?) => void;
    afterOnClientListen: (clientId, options?) => void;

    beforeOnClientRemoveWrite: (clientId, options?) => void;
    afterOnClientRemoveWrite: (clientId, options?) => void;

    beforeOnClientRemoveListen: (clientId, options?) => void;
    afterOnClientRemoveListen: (clientId, options?) => void;
}