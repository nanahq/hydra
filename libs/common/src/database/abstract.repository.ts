import { type Logger, NotFoundException } from '@nestjs/common'
import {
  type FilterQuery,
  type Model,
  Types,
  type UpdateQuery,
  type SaveOptions,
  type Connection,
  type HydratedDocument,
  type ClientSession
} from 'mongoose'
import { type AbstractDocument } from './abstract.schema'

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger

  protected constructor (
    protected readonly model: Model<TDocument>,
    private readonly connection?: Connection
  ) {}

  async create (
    document: Omit<TDocument, '_id'> | Partial<TDocument>,
    options?: SaveOptions
  ): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId()
    })
    return (
      await createdDocument.save(options as SaveOptions)
    )
  }

  async findOneAndPopulate (
    filterQuery: FilterQuery<TDocument>,
    populatePath: string | string[]
  ): Promise<any> {
    return await this.model
      .findOne(filterQuery, {}, { lean: true })
      .populate(populatePath as any)
  }

  async findOne (filterQuery: FilterQuery<TDocument>): Promise<any> {
    return await this.model
      .findOne(filterQuery, {}, { lean: true })
  }

  async findAndPopulate<T>(
    filterQuery: FilterQuery<TDocument>,
    populatePath: string | string[]
  ): Promise<T[]> {
    return await this.model
      .find(filterQuery)
      .populate(populatePath as any) as any
  }

  async findOneAndUpdate (
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>
  ): Promise<any> {
    const document = await this.model.findOneAndUpdate(filterQuery, update, {
      lean: true,
      new: true
    })

    if (document === null) {
      this.logger.warn('Document not found with filterQuery:', filterQuery)
      throw new NotFoundException('Document not found.')
    }

    return document
  }

  async upsert (
    filterQuery: FilterQuery<TDocument>,
    document: Partial<TDocument>
  ): Promise<HydratedDocument<TDocument> | any> {
    return await new Promise((resolve) =>
      resolve(
        this.model.findOneAndUpdate(filterQuery, document, {
          lean: true,
          upsert: true,
          new: true
        })
      )
    )
  }

  async insertMany (
    documents: Array<Omit<TDocument, '_id'>> | Array<Partial<TDocument>>,
    options?: SaveOptions
  ): Promise<any> {
    return await this.model.insertMany(documents)
  }

  async find (filterQuery: FilterQuery<TDocument>): Promise<any> {
    return await new Promise((resolve) =>
      resolve(
        this.model
          .find(filterQuery, {}, { lean: true })
      )
    )
  }

  async update (
    filterQuery: FilterQuery<TDocument>,
    update: Partial<TDocument>
  ): Promise<any> {
    return await new Promise((resolve) =>
      resolve(this.model.updateOne(filterQuery, update))
    )
  }

  async findAndUpdate (
    filterQuery: FilterQuery<TDocument>,
    update: Partial<TDocument>
  ): Promise<any> {
    return await new Promise((resolve) => {
      resolve(this.model.updateMany(filterQuery, update))
    })
  }

  async delete (id: Types.ObjectId): Promise<any> {
    return await new Promise((resolve) =>
      resolve(this.model.findByIdAndDelete(id))
    )
  }

  async startTransaction (): Promise<ClientSession | any> {
    if (this.connection !== undefined) {
      const session = await this.connection.startSession()
      session.startTransaction()
      return session
    }
  }
}
