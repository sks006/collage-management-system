import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { NoticeService } from "../services/notice.service";
import { JwtAuthGuard } from "../../../shared/guards/jwt.guard";
import { RolesGuard } from "../../../shared/guards/roles.guard";
import { Roles } from "../../../shared/decorators/roles.decorator";
import { CurrentUser, AuthenticatedUser } from "../../../shared/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../../shared/pipes/zod-validation.pipe";
import { createNoticeSchema } from "@sms/shared";

@ApiTags("Notices")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("notices")
export class NoticeController {
  constructor(private service: NoticeService) {}

  @Get()
  @ApiOperation({ summary: "List active school notices" })
  async getNotices() {
    return this.service.getPublishedNotices();
  }

  @Post()
  @Roles("ADMIN", "PRINCIPAL", "OFFICE")
  @ApiOperation({ summary: "Draft new notice" })
  async createNotice(
    @Body(new ZodValidationPipe(createNoticeSchema)) dto: any,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.createNotice(dto, user.id);
  }

  @Post(":id/publish")
  @Roles("ADMIN", "PRINCIPAL")
  @ApiOperation({ summary: "Publish notice and trigger dispatch outbox" })
  async publishNotice(@Param("id") id: string) {
    return this.service.publishNotice(id);
  }
}
