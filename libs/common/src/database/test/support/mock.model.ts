export abstract class MockModel<T> {
  protected abstract entityStub: T

  constructor (createEntityData: T) {
    this.constructorSpy(createEntityData)
  }

  constructorSpy (_createEntityData: T): void {}

  async findOne (): Promise<T> {
    return await new Promise((resolve) => resolve(this.entityStub))
  }

  async find (): Promise<T[]> {
    return [this.entityStub]
  }

  async create (): Promise<T> {
    return this.entityStub
  }

  async findOneAndPopulate (): Promise<T> {
    return this.entityStub
  }

  async findOneAndUpdate (): Promise<T> {
    return this.entityStub
  }

  async delete (): Promise<T> {
    return this.entityStub
  }
}
