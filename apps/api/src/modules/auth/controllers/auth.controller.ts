import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService, ProvisionUserDto } from '../services/auth.service';
import { JwtGuard } from '../../../shared/guards/jwt.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';

@Controller('auth')
@UseGuards(JwtGuard, RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  getProfile(@Req() req: Request) {
    return {
      user: req.user,
      scope: req.rowScope,
    };
  }

  @Post('provision')
  @Roles('ADMIN')
  provisionSingle(@Body() dto: ProvisionUserDto) {
    return this.authService.provisionUser(dto);
  }

  @Post('provision/bulk')
  @Roles('ADMIN')
  provisionBulk(@Body() body: { users: ProvisionUserDto[] }) {
    return this.authService.bulkProvisionUsers(body.users);
  }
}