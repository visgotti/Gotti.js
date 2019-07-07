import { Component } from "./Component";

export function NetworkComponent(component: Component) {
    component.isNetworked = true;
    return component;
}