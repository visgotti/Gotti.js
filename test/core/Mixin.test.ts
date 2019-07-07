import { Entity } from '../../src/core/Entity';
import { EntityManager } from '../../src/core/EntityManager';
import { Component } from '../../src/core/Component';
import { MessageQueue } from '../../src/core/MessageQueue';

import ClientSystem  from '../../src/core/System/ClientSystem';
import System  from '../../src/core/System/System';
import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';

import { Mixin } from '../../src/core/SystemMixin';

class TestMixin implements Mixin {
    props: {
        callCount: 0,
    }
    beforeUpdate(delta) {
        this.props.callCount++;
    }
    afterUpdate(delta) {
        this.props.callCount++;
    }
    beforeOnEntityAddedComponent(entity) {
        this.props.callCount++;
    }
    afterOnEntityAddedComponent(entity) {
        this.props.callCount++;
    }
    beforeOnEntityRemovedComponent(entity) {
        this.props.callCount++;
    }
    afterOnEntityRemovedComponent(entity) {
        this.props.callCount++;
    }
    beforeOnInit() {
        this.props.callCount++;
    }
    afterOnInit() {
        this.props.callCount++;
    }
    beforeOnStart() {
        this.props.callCount++;
    }
    afterOnStart() {
        this.props.callCount++;
    }
    beforeOnStop() {
        this.props.callCount++;
    }
    afterOnStop() {
        this.props.callCount++;
    }
}

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
        this.messageQueue = new MessageQueue();
        console.log(TestMixin.prototype.afterUpdate);
        this.mixins = [TestMixin];
    }
    clear(){}
    initialize(...args: any[]): void {}
    onLocalMessage(message: any): void {}
    update(delta): void {}
}

describe.only('System Mixin', function() {
    let entityManager;
    let testSystem;
    let entity;
    beforeEach('creates EntityManager entity ', (done) => {
        testSystem = new TestSystem();
        entity = null;
        let systemMap = {'TEST': testSystem};
        entityManager = new EntityManager(systemMap);
        testSystem._onInit();
        done();
    });
    describe('testSystem.props', () => {
        it('Should include callCount', () => {
            assert.ok(testSystem.props.hasOwnProperty('callCount'));
            assert.strictEqual(testSystem.props.callCount, 0);
        });
    });
});
