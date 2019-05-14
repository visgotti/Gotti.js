import { Entity } from '../../src/core/Entity';
import { EntityManager } from '../../src/core/EntityManager';
import { Component } from '../../src/core/Component';
import ClientSystem  from '../../src/core/System/ClientSystem';
import System  from '../../src/core/System/System';
import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';

class TestEntity extends Entity {
    constructor() {
        super(0, 'test');
    }
    initialize(): void {
        this.addComponent(new TestComponent());
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

export class TestSystem extends System {
    constructor() {
        super('TEST');
    }
    clear(){}
    initialize(...args: any[]): void {}
    onLocalMessage(message: any): void {}
    update(delta): void {}
}

describe('EntityManager', function() {
    let entityManager;
    let testSystem;
    let entity;
    beforeEach('creates EntityManager entity ', (done) => {
        testSystem = new TestSystem() as ClientSystem;
        entity = null;
        let systemMap = {'TEST': testSystem};
        entityManager = new EntityManager(systemMap);
        done();
    });
    describe('entityManager.initializeEntity', () => {
        it('correctly initializes an entity with the added components', () => {
            entity = entityManager.initializeEntity(new TestEntity());
            assert.strictEqual(entity.id, 0);
            assert.strictEqual(entity.testMethod(), 5);
        });
        it('calls the systems onEntityAddedComponent when initialized', () => {
            let spy = sinon.spy(testSystem, 'onEntityAddedComponent');
            entity = entityManager.initializeEntity(new TestEntity());
            sinon.assert.calledOnce(spy);
        });
        it('calls the systems onEntityAddedComponent when you manually add a system at component runtime', () => {
            let spy = sinon.spy(testSystem, 'onEntityAddedComponent');
            entity = new TestEntity();
            entity.initialize = () => {};

            entityManager.initializeEntity(entity);
            // shouldnt have called it yet since we didnt add the component
            sinon.assert.callCount(spy, 0);
            entity.addComponent(new TestComponent());
            sinon.assert.calledOnce(spy);
        });
    });
    describe('After initialized, onEntityRemovedComponent is called by entityManager.destroyEntity', () => {
        it('calls onEntityRemovedComponent when called', () => {
            let spy = sinon.spy(testSystem, 'onEntityRemovedComponent');
            entity = entityManager.initializeEntity(new TestEntity());
            entityManager.destroyEntity(entity);
            sinon.assert.calledOnce(spy);
        });
    });
    describe('After initialized, onEntityRemovedComponent is called by entity.destroy()', () => {
        it('calls onEntityRemovedComponent when called', () => {
            let spy = sinon.spy(testSystem, 'onEntityRemovedComponent');
            entity = entityManager.initializeEntity(new TestEntity());
            entity.destroy();
            sinon.assert.calledOnce(spy);
        });
    });
});
