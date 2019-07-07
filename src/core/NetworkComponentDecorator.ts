import { Component } from "./Component";

export const NetworkComponent = function NetworkComponent (component: Component){
    component.isNetworked = true;
    return component;
}
