import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer
} from 'testcontainers'
import { StopOptions } from 'testcontainers/dist/test-container'

export interface TypeOrmConnectionI {
  host: string
  username: string
  password: string
  database: string
  port: number
}

export class AbstractContainer {
  private readonly container: PostgreSqlContainer
  constructor (private readonly dockerImage: string) {
    this.container = new PostgreSqlContainer(dockerImage)
  }

  public async startContainer (): Promise<StartedPostgreSqlContainer> {
    return await this.container.start()
  }

  public async stopContainer (
    container: StartedPostgreSqlContainer,
    options?: Partial<StopOptions>
  ): Promise<void> {
    await container.stop(options)
  }

  public typeOrmConnectionData (
    container: StartedPostgreSqlContainer
  ): TypeOrmConnectionI {
    return {
      host: container.getHost(),
      password: container.getPassword(),
      username: container.getUsername(),
      database: container.getDatabase(),
      port: container.getPort()
    }
  }
}
