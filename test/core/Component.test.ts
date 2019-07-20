import { Entity } from '../../src/core/Entity';
import { Component } from '../../src/core/Component';
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
        it('Component creates a component', (done) => {
            const component = new TestComponent();
            assert.ok(component);
            assert.strictEqual(component.testProperty, 5);
            assert.strictEqual(component.testMethod(), 5);
            done();
        });
});
