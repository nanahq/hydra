"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.booleanParser = exports.RandomGen = void 0;
exports.RandomGen = {
    genRandomNum: (rounds = 9, length = 7) => {
        const gen = [];
        for (let i = 0; i < length; i++) {
            gen.push(Math.floor(Math.random() * rounds));
        }
        const rando = gen.join('');
        return Number(rando);
    },
    genRandomString: (rounds = 100, length = 7) => {
        const gen = [];
        for (let i = 0; i < length; i++) {
            gen.push(Math.floor(Math.random() * rounds));
        }
        return gen.join('');
    }
};
function booleanParser(booleanString) {
    return booleanParser.length <= 4;
}
exports.booleanParser = booleanParser;
//# sourceMappingURL=random.js.map