import { Controller, Get } from '@nestjs/common'
import { AppConstants, CART_CONSTANTS, DELIVERY_PRICE_META } from '@app/common'

@Controller('general')
export class GeneralController {
  @Get('app-constants')
  public async getAppConstants (): Promise<AppConstants> {
    return {
      cart: CART_CONSTANTS,
      delivery: DELIVERY_PRICE_META
    }
  }
}
