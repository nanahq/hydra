const Sequencer = require('@jest/test-sequencer').default
const ShuffleSeed = require('shuffle-seed')

class CustomSequencer extends Sequencer {
    sort (tests) {
        // In CI, GitHub Actions tests are parallelized across multiple instance
        if (process.env.GH_INSTANCE_TOTAL) {
            const total = parseInt(process.env.GH_INSTANCE_TOTAL, 10)
            const index = parseInt(process.env.GH_INSTANCE_INDEX, 10)

            return ShuffleSeed.shuffle(tests, 'deterministic')
                .filter((_, i) => i % total === index)
        }

        return tests
    }
}

module.exports = CustomSequencer
