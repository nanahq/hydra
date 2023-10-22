
import * as Docker from 'dockerode'
import * as process from 'process'
export async function RabbitmqInstance (): Promise<Docker.Container> {
  let rabbitmqContainer: Docker.Container
  try {
    const docker = new Docker()
    rabbitmqContainer = await docker.createContainer({
      Image: 'rabbitmq', // Use the desired RabbitMQ image version
      HostConfig: {
        PortBindings: process.env.CI !== undefined
          ? {
              '5672/tcp': [{ HostPort: '5672' }]
            }
          : undefined

      }
    })

    await rabbitmqContainer.start()

    process.env.TEST_RMQ_URI = 'amqp://localhost:5672'

    return rabbitmqContainer
  } catch (error) {
    console.error('Failed to start RabbitMQ container:', error)
    throw error
  }
}
