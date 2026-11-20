import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { SearchService } from "../services/search.service";
import { JwtAuthGuard } from "../../../shared/guards/jwt.guard";
import { RolesGuard } from "../../../shared/guards/roles.guard";
import { Roles } from "../../../shared/decorators/roles.decorator";

@ApiTags("Search")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("search")
export class SearchController {
  constructor(private service: SearchService) {}

  @Get("students")
  @Roles("ADMIN", "OFFICE", "TEACHER", "STUDENT", "PARENT")
  @ApiOperation({ summary: "Fast trigram search for student IDs" })
  async searchStudents(@Query("q") q: string) {
    return this.service.searchStudents(q || "");
  }

  @Get("staff")
  @Roles("ADMIN", "OFFICE", "TEACHER")
  @ApiOperation({ summary: "Fast trigram search for staff IDs" })
  async searchStaff(@Query("q") q: string) {
    return this.service.searchStaff(q || "");
  }

  @Get("notices")
  @Roles("ADMIN", "OFFICE", "TEACHER", "STUDENT", "PARENT")
  @ApiOperation({ summary: "Full-text search for notices" })
  async searchNotices(@Query("q") q: string) {
    return this.service.searchNotices(q || "");
  }
}
