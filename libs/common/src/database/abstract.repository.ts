import { Logger, NotFoundException } from '@nestjs/common'
import {
  FilterQuery,
  Model,
  Types,
  UpdateQuery,
  SaveOptions,
  Connection,
  ClientSession,
  HydratedDocument
} from 'mongoose'

import { AbstractDocument } from './abstract.schema'

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected readonly logger = Logger
  constructor (
    protected readonly model: Model<TDocument>,
    protected readonly connection: Connection
  ) {}

  async create (
    document: Omit<TDocument, '_id'>,
    options?: SaveOptions
  ): Promise<TDocument> {
    const CreatedDocument = new this.model({
      ...document,
      _id: new Types.ObjectId()
    })
    return (
      await CreatedDocument.save(options)
    ).toJSON() as unknown as TDocument
  }

  async findOne (
    filterQuery: FilterQuery<TDocument>
  ): Promise<TDocument | null> {
    return await this.model.findOne(filterQuery, {}, { lean: true })
  }

  async findOneAndUpdate (
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>
  ): Promise<TDocument> {
    const updatedDocument = await this.model.findOneAndUpdate(
      filterQuery,
      update,
      {
        lean: true,
        new: true
      }
    )

    if (updatedDocument == null) {
      this.logger.warn('Document not found with filterQuery', filterQuery)
      throw new NotFoundException('Document not found.')
    }

    return updatedDocument
  }

  async upsert (
    filterQuery: FilterQuery<TDocument>,
    document: Partial<TDocument>
  ): Promise<Array<HydratedDocument<TDocument>> | undefined> {
    return await this.model.findOneAndUpdate(filterQuery, document, {
      lean: true,
      upsert: true,
      new: true
    })
  }

  async find (
    filterQuery: FilterQuery<TDocument>
  ): Promise<Array<HydratedDocument<TDocument>> | null> {
    return await this.model.find(filterQuery, {}, { lean: true })
  }

  async startTransaction (): Promise<ClientSession> {
    const session = await this.connection.startSession()
    session.startTransaction()
    return session
  }
}
