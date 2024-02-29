import * as Docker from 'dockerode'

export async function waitForContainer (timeout: number): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), timeout)
  })
}
export async function RabbitmqInstance (
  port: number
): Promise<Docker.Container> {
  let rabbitmqContainer: Docker.Container
  try {
    const docker = new Docker()
    rabbitmqContainer = await docker.createContainer({
      Image: 'rabbitmq', // Use the desired RabbitMQ image version
      HostConfig: {
        PortBindings: {
          '5672/tcp': [{ HostPort: port.toString() }]
        },
        AutoRemove: true
      }
    })

    await rabbitmqContainer.start()
    // await waitForContainer(60000)
    return rabbitmqContainer
  } catch (error) {
    console.error('Failed to start RabbitMQ container:', error)
    throw error
  }
}

export async function stopRabbitmqContainer (
  container: Docker.Container
): Promise<void> {
  try {
    if (container !== undefined) {
      // Stop the container
      await container.stop()

      // // Remove the container
      // await container.remove({ force: true })

      console.log('RabbitMQ container stopped and removed.')
    }
  } catch (error) {
    console.error('Failed to stop and remove RabbitMQ container:', error)
    throw error
  }
}
