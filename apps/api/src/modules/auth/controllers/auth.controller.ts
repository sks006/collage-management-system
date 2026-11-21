import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  AuthService,
  ProvisionUserDto,
  RegisterDto,
  VerifyOtpDto,
} from '../services/auth.service';
import { JwtAuthGuard } from '../../../shared/guards/jwt.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Public: User Registration with Gmail OTP initiation
   */
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * Public: 6-digit numeric OTP code verification
   */
  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  /**
   * Protected: Active session & rowScope details
   */
  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getProfile(@Req() req: any) {
    return {
      user: req.user,
      scope: req.rowScope,
    };
  }

  /**
   * Protected: Admin role requests query
   */
  @Get('role-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'PRINCIPAL')
  getRoleRequests(@Query('status') status?: string) {
    return this.authService.getRoleRequests(status || 'PENDING');
  }

  /**
   * Protected: 1-Click Role Request Approval
   */
  @Post('role-requests/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'PRINCIPAL')
  approveRoleRequest(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: { roleOverride?: string },
  ) {
    return this.authService.approveRoleRequest(id, req.user?.id, body?.roleOverride);
  }

  /**
   * Protected: Role Request Rejection
   */
  @Post('role-requests/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'PRINCIPAL')
  rejectRoleRequest(@Param('id') id: string, @Req() req: any) {
    return this.authService.rejectRoleRequest(id, req.user?.id);
  }

  /**
   * Protected: Single User Provisioning
   */
  @Post('provision')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  provisionSingle(@Body() dto: ProvisionUserDto) {
    return this.authService.provisionUser(dto);
  }

  /**
   * Protected: Bulk User Provisioning
   */
  @Post('provision/bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  provisionBulk(@Body() body: { users: ProvisionUserDto[] }) {
    return this.authService.bulkProvisionUsers(body.users);
  }
}
