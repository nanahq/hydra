import { Body, Controller, Get, HttpException, Param, Post, UseGuards } from '@nestjs/common'
import { FleetService } from './fleet.service'
import {
  AcceptFleetInviteDto,
  CreateAccountWithOrganizationDto, FleetMember,
  FleetOrganization,
  ResponseWithStatus, UpdateFleetOwnershipStatusDto
} from '@app/common'
import { FleetOwner } from './decorators/ownership'
import { FleetJwtAuthGuard } from '../auth/guards/jwt.guard'

@Controller('fleet')
export class FleetController {
  constructor (
    private readonly fleetService: FleetService
  ) {}

  @Post('create/organization')
  async createFleetOrganization (
    @Body() data: CreateAccountWithOrganizationDto
  ): Promise<ResponseWithStatus> {
    try {
      return await this.fleetService.createFleetOrganization(data)
    } catch (error) {
      throw new HttpException(error.message, error.status)
    }
  }

  @Post('invite/member')
  async acceptFleetOrgInvite (
    @Body() data: AcceptFleetInviteDto
  ): Promise<ResponseWithStatus> {
    try {
      return await this.fleetService.acceptFleetOrgInvite(data)
    } catch (error) {
      throw new HttpException(error.message, error.status)
    }
  }

  @Get('organization/:inviteLink')
  async getOrganization (
    @Param('inviteLink') inviteLink: string
  ): Promise<FleetOrganization> {
    try {
      return await this.fleetService.getFleetOrganization(inviteLink)
    } catch (error) {
      throw new HttpException(error.message, error.status)
    }
  }

  @UseGuards(FleetJwtAuthGuard)
  @Post('update-org-ownership')
  async updateOrgOwnership (
    @FleetOwner() owner: FleetMember,
      @Body() data: UpdateFleetOwnershipStatusDto
  ): Promise<ResponseWithStatus> {
    try {
      return await this.fleetService.updateOrgOwnership(data)
    } catch (error) {
      throw new HttpException(error.message, error.status)
    }
  }
}
