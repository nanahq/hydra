import { Injectable, Logger } from '@nestjs/common'
import { AbstractRepository } from '@app/common'
import { InjectModel, InjectConnection } from '@nestjs/mongoose'
import { Model, Connection } from 'mongoose'
import { Vendor } from '@app/common/database/schemas/vendor.schema'
import { VendorSettings } from '@app/common/database/schemas/vendor-settings.schema'

@Injectable()
export class VendorRepository extends AbstractRepository<Vendor> {
  protected readonly logger = new Logger(VendorRepository.name)

  constructor (
  @InjectModel(Vendor.name) vendorModel: Model<Vendor>,
    @InjectConnection() connection: Connection
  ) {
    super(vendorModel, connection)
  }
}

@Injectable()
export class VendorSettingsRepository extends AbstractRepository<VendorSettings> {
  protected readonly logger = new Logger(VendorSettings.name)

  constructor (
  @InjectModel(VendorSettings.name) vendorSettingsModel: Model<VendorSettings>,
    @InjectConnection() connection: Connection
  ) {
    super(vendorSettingsModel, connection)
  }
}
