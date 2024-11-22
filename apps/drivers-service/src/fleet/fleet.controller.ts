import { Body, Controller, Get, HttpException, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { FleetService } from './fleet.service'
import {
  AcceptFleetInviteDto,
  CreateAccountWithOrganizationDto, CurrentUser, FleetMember,
  FleetOrganization,
  RegisterDriverDto,
  ResponseWithStatus, UpdateFleetMemberProfileDto, UpdateFleetOwnershipStatusDto
} from '@app/common'
import { FleetOwner } from './decorators/ownership'
import { FleetJwtAuthGuard } from '../auth/guards/jwt.guard'
import { AwsService } from 'apps/vendor-gateway/src/aws.service'
import { FileInterceptor } from '@nestjs/platform-express'
import * as multer from 'multer'

@Controller('fleet')
export class FleetController {
  constructor (
    private readonly fleetService: FleetService,
    private readonly awsService: AwsService
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

  @UseGuards(FleetJwtAuthGuard)
  @Post('owner/driver')
  async ownerCreateDriver (
    @FleetOwner() owner: FleetMember,
      @Body() data: RegisterDriverDto
  ): Promise<ResponseWithStatus> {
    try {
      return await this.fleetService.ownerCreateDriver(data)
    } catch (error) {
      throw new HttpException(error.message, error.status)
    }
  }

  @UseGuards(FleetJwtAuthGuard)
  @Put('owner/update-organization')
  async updateOrganization (
    @FleetOwner() owner: FleetMember,
      @Body() payload: Partial<FleetOrganization>
  ): Promise<ResponseWithStatus> {
    try {
      return await this.fleetService.updateOgranization(
        payload,
        owner.organization
      )
    } catch (error) {
      throw new HttpException(error.message, error.status)
    }
  }

  @UseGuards(FleetJwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage()
    })
  )
  @Put('image/organization')
  async uploadOrganizationLogo (
    @FleetOwner() owner: FleetMember,
      @UploadedFile() file: Express.Multer.File
  ): Promise<string | undefined> {
    try {
      const photo = await this.awsService.upload(file)
      await this.fleetService.uploadOrganizationLogo(photo, owner.organization)
      return photo
    } catch (error) {
      throw new HttpException(error.message, error.status)
    }
  }

  @UseGuards(FleetJwtAuthGuard)
  @Put('member/profile')
  async updateMemberProfile (
    @CurrentUser() member: FleetMember,
      @Body() data: UpdateFleetMemberProfileDto
  ): Promise<ResponseWithStatus> {
    try {
      return await this.fleetService.updateMemberProfile(data, member._id.toString())
    } catch (error) {
      throw new HttpException(error.message, error.status)
    }
  }
}
