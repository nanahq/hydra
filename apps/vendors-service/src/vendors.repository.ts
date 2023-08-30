import { Injectable, Logger } from '@nestjs/common'
import { AbstractRepository, Vendor, VendorSettings } from '@app/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

@Injectable()
export class VendorRepository extends AbstractRepository<Vendor> {
  protected readonly logger = new Logger(VendorRepository.name)

  constructor (@InjectModel(Vendor.name) vendorModel: Model<Vendor>) {
    super(vendorModel)
  }
}

@Injectable()
export class VendorSettingsRepository extends AbstractRepository<VendorSettings> {
  protected readonly logger = new Logger(VendorSettings.name)

  constructor (
  @InjectModel(VendorSettings.name)
    vendorSettingsModel: Model<VendorSettings>
  ) {
    super(vendorSettingsModel)
  }
}
