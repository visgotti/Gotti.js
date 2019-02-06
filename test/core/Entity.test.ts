import { Entity } from '../../src/core/Entity';
import { Component } from '../../src/core/Component';

import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';

class TestEntity extends Entity {
    constructor() {
        super(0, 'test');
    }
}


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

describe.only('Entity', function() {
    let testEntity;
    before('Creates entity ', (done) => {
        testEntity = new TestEntity();
        done();
    });
    describe('entity.addComponent', () => {
        it('Adds all the components methods to the entity', (done) => {
            testEntity.addComponent(new TestComponent());
            assert.ok(testEntity.testMethod);
            assert.strictEqual(testEntity.testMethod(), 5);
            assert.strictEqual(Object.keys(testEntity.methodsFromComponent).length, 1);
            assert.strictEqual(Object.keys(testEntity.components).length, 1);
            done();
        });
        it('throws an error if we try adding duplicate components', (done) => {
            assert.throws(() => {    testEntity.addComponent(new TestComponent()); });
            done();
        })
    });
    describe('entity.removeComponent', () => {
        it('succesfully removes component and its methods from entity', (done) => {
            testEntity.removeComponent('TEST');
            assert.ok(!('testMethod' in testEntity));
            assert.strictEqual(Object.keys(testEntity.methodsFromComponent).length, 0);
            assert.strictEqual(Object.keys(testEntity.components).length, 0);
            done();
        });
    });
});