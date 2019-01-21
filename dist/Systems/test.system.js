var NAMES;
(function (NAMES) {
    NAMES[NAMES["POSITION_SYSTEM"] = 0] = "POSITION_SYSTEM";
})(NAMES || (NAMES = {}));
class test {
    constructor() {
        this.name = 'IDK_SYSTEM';
    }
    onServerMessage() { }
    ;
    onClientMessage() { }
    ;
    registerClientMessages() {
        let serverMessages = (() => {
            return {
                to: [
                    NAMES.POSITION_SYSTEM,
                ],
            };
        });
    }
    ;
    registerServerMessages() {
        let serverMessages = (() => {
            return {
                to: [
                    NAMES.POSITION_SYSTEM,
                ],
                from: this.name,
            };
        });
    }
}
