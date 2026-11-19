import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { SearchService } from "../services/search.service";
import { JwtAuthGuard } from "../../../shared/guards/jwt.guard";

@ApiTags("Search")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("search")
export class SearchController {
  constructor(private service: SearchService) {}

  @Get("students")
  @ApiOperation({ summary: "Fast trigram search for student IDs" })
  async searchStudents(@Query("q") q: string) {
    return this.service.searchStudents(q || "");
  }

  @Get("staff")
  @ApiOperation({ summary: "Fast trigram search for staff IDs" })
  async searchStaff(@Query("q") q: string) {
    return this.service.searchStaff(q || "");
  }

  @Get("notices")
  @ApiOperation({ summary: "Full-text search for notices" })
  async searchNotices(@Query("q") q: string) {
    return this.service.searchNotices(q || "");
  }
}
