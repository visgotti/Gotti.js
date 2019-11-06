import { Plugin, installPlugin } from '../../src/core/Plugin/Plugin';
import { createDummyClientSystem, system_names, Messages, TestPlugin } from '../mocks';

import ClientSystem from '../../src/core/System/ClientSystem';

import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';

describe('Plugin', function() {
    let testPlugin;
    beforeEach('Creates plugin ', () => {
        testPlugin = new Plugin(TestPlugin);
    })
    describe('installed plugin', () => {
        it('Adds all the props to the plugin', () => {
            assert.strictEqual(testPlugin.props.testString, "test");
            assert.strictEqual(testPlugin.props.testNumber, 0);
            assert.strictEqual(testPlugin.testString, "test");
            assert.strictEqual(testPlugin.testNumber, 0);
        });
        it('Basic method works', () => {
            assert.strictEqual(testPlugin.methods.test(), "test");
            assert.strictEqual(testPlugin.test(), "test");
        });
        it('Method can succesfulyl change props', () => {
            testPlugin.methods.add(1);
            assert.strictEqual(testPlugin.props.testNumber, 1);
            assert.strictEqual(testPlugin.testNumber, 1);
            testPlugin.add(1);
            assert.strictEqual(testPlugin.props.testNumber, 2);
            assert.strictEqual(testPlugin.testNumber, 2);
        });
    })
});

describe('installPlugin', function() {
    let testPlugin;
    let testSystem1;
    let testSystem2;
    beforeEach('Creates plugin and two dummy systems', () => {
        testPlugin = new Plugin(TestPlugin);
        testSystem1 = createDummyClientSystem(system_names[0]);
        testSystem2 = createDummyClientSystem(system_names[1]);
        installPlugin(testSystem1, testPlugin);
        installPlugin(testSystem2, testPlugin);
    });
    it('adds plugin properties to a system', () => {
        assert.strictEqual(testSystem1.$.testString, "test");
        assert.strictEqual(testSystem1.$.testNumber, 0);

        assert.strictEqual(testSystem2.$.testString, "test");
        assert.strictEqual(testSystem2.$.testNumber, 0);
    });

    it('throws error if system tries to set property', () => {
        try {
            testSystem1.$.testString = "newTestString"
        } catch(err) {
            assert.strictEqual(err.message, `System ${testSystem1.name} cannot set plugin prop: testString, only the plugin TestPlugin can mutate the prop.`)
        }
    });
    it('Basic method on the system works', () => {
        assert.strictEqual(testSystem1.$.test(), "test");
        assert.strictEqual(testSystem2.$.test(), "test");
    });
    it('Methods that change props persist across systems', () => {
        testSystem1.$.add(10);
        assert.strictEqual(testSystem1.$.testNumber, 10);
        assert.strictEqual(testSystem2.$.testNumber, 10);
        testSystem2.$.add(10);
        assert.strictEqual(testSystem1.$.testNumber, 20);
        assert.strictEqual(testSystem2.$.testNumber, 20);
    });
    it('Property and methods work from implemented system', () => {
        const system = new ImplementedSystem();
        installPlugin(system, testPlugin);
        assert.strictEqual(system.testNumberProperty(), 0);
        system.testAddProperty(5);
        assert.strictEqual(system.testNumberProperty(), 5);
    });
    it('Handles plugin event emits', (done) => {
        const system = new ImplementedSystem();
        installPlugin(system, testPlugin);

        system.$.on('test', (payload) => {
            assert.strictEqual(payload, "testPayload");
            done();
        });
        system.$.testEmit();
    });
});

class ImplementedSystem extends ClientSystem {
    public onServerMessage(message) {
        throw new Error("Method not implemented.");
    }
    public onPeerMessage(peerId: string | number, message) {
        throw new Error("Method not implemented.");
    }
    public onLocalMessage(message): void {
        throw new Error("Method not implemented.");
    }
    public update(delta: any): void {
        throw new Error("Method not implemented.");
    }
    public clear(): void {
        throw new Error("Method not implemented.");
    }
    constructor() {
        super("Implementation")
    }
    testNumberProperty() {
        return this.$.testNumber
    }
    testAddProperty(n) {
        this.$.add(n);
    }
}

