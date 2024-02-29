import { GenericContainer, StartedTestContainer } from 'testcontainers'
import * as process from 'process'

export async function MongodbInstance (): Promise<StartedTestContainer> {
  let mongo: StartedTestContainer
  try {
    mongo = await new GenericContainer('mongo:6')
      .withExposedPorts(27017)
      .withEnv('MONGO_INITDB_ROOT_USERNAME', 'root')
      .withEnv('MONGO_INITDB_ROOT_PASSWORD', 'secret')
      .start()

    const mongoUri = `mongodb://root:secret@localhost:${mongo.getMappedPort(
      27017
    )}/`

    process.env.TEST_MONGODB_URI = mongoUri

    return mongo
  } catch (error) {
    console.error('Failed to start mongo db container')
    throw error
  }
}
