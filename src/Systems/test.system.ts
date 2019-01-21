enum NAMES {
    POSITION_SYSTEM,
}
class test {
    constructor() {
        this.name ='IDK_SYSTEM';
    }

    onServerMessage(){};
    onClientMessage(){};

    registerClientMessages() {
        let serverMessages = (() => {
            return {
                to: [
                    NAMES.POSITION_SYSTEM,
                ],
            }
        })
    };
    registerServerMessages() {
        let serverMessages = (() => {
            return {
                to: [
                    NAMES.POSITION_SYSTEM,
                ],
                from: this.name,
            }
        })

    }
}