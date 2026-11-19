import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../shared/guards/jwt.guard";
import { CurrentUser, AuthenticatedUser } from "../../../shared/decorators/current-user.decorator";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get currently authenticated user identity and roles" })
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Logout user session" })
  async logout() {
    return { message: "Logged out successfully" };
  }
}
