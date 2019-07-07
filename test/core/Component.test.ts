import { Entity } from '../../src/core/Entity';
import { Component } from '../../src/core/Component';
import { NetworkComponent } from '../../src/core/NetworkComponentDecorator'
import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';

export class TestComponent extends Component {
    public testProperty: number = 5;
    constructor() {
        super('TEST');
        this.testProperty = 5;
    }
    testMethod() {
        return this.testProperty;
    }
}

describe('Component', function() {
        it('Component isNetworking is false by default construction', (done) => {
            const component = new TestComponent();
            assert.ok(component);
            assert.ok(!component.isNetworked);
            done();
        });
        it('NetworkComponent decorator sets isNetworked to true', (done) => {
            const component = NetworkComponent(new TestComponent());
            assert.ok(component);
            assert.ok(component.isNetworked);
            done();
        })
});
