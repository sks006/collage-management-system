import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
  LoginDto,
  CallbackDto,
  DecideRoleRequestDto,
} from '../services/auth.service';
import { JwtAuthGuard } from '../../../shared/guards/jwt.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Public: Institutional & Keycloak credential login
   */
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * Public: OIDC authorization code callback exchange
   */
  @Post('callback')
  callback(@Body() dto: CallbackDto) {
    return this.authService.handleOidcCallback(dto);
  }

  /**
   * Public: Resend 6-digit verification OTP
   */
  @Post('resend-otp')
  resendOtp(@Body('email') email: string) {
    return this.authService.resendOtp(email);
  }

  /**
   * Public: Verification email token link handler
   */
  @Post('verify-email')
  verifyEmail(@Body('token') token: string) {
    return this.authService.verifyEmail(token);
  }

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
  async getProfile(@Req() req: any) {
    const details = await this.authService.getMe(req.user);
    return {
      user: req.user,
      profile: details.profile,
      profileType: details.profileType,
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
   * Protected: Decide Role Request (Approve or Reject via PATCH)
   */
  @Patch('role-requests/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'PRINCIPAL')
  decideRoleRequest(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: DecideRoleRequestDto,
  ) {
    return this.authService.decideRoleRequest(id, req.user, dto);
  }

  /**
   * Protected: 1-Click Role Request Approval (Backward Compatibility)
   */
  @Post('role-requests/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'PRINCIPAL')
  approveRoleRequest(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: { roleOverride?: string },
  ) {
    return this.authService.approveRoleRequest(id, req.user?.id || req.user?.sub, body?.roleOverride);
  }

  /**
   * Protected: Role Request Rejection (Backward Compatibility)
   */
  @Post('role-requests/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'PRINCIPAL')
  rejectRoleRequest(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: { reason?: string },
  ) {
    return this.authService.rejectRoleRequest(id, req.user?.id || req.user?.sub, body?.reason);
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
