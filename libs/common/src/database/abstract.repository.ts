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

  constructor (
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection
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
    ).toJSON() as unknown as TDocument
  }

  async findOne (filterQuery: FilterQuery<TDocument>): Promise<TDocument | null> {
    return await this.model.findOne(filterQuery, {}, { lean: true })
  }

  async findOneAndUpdate (
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>
  ): Promise<HydratedDocument<TDocument>> {
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

  async find (filterQuery: FilterQuery<TDocument>): Promise<any> {
    return await new Promise((resolve) =>
      resolve(this.model.find(filterQuery, {}, { lean: true }))
    )
  }

  async delete (id: Types.ObjectId): Promise<any> {
    return await new Promise((resolve) =>
      resolve(this.model.findByIdAndDelete(id))
    )
  }

  async startTransaction (): Promise<ClientSession> {
    const session = await this.connection.startSession()
    session.startTransaction()
    return session
  }
}
