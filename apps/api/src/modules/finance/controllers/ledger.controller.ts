import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { LedgerRepository } from "../repositories/ledger.repository";
import { JwtAuthGuard } from "../../../shared/guards/jwt.guard";
import { RolesGuard } from "../../../shared/guards/roles.guard";
import { Roles } from "../../../shared/decorators/roles.decorator";

@ApiTags("Finance: Ledger")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("finance/ledger")
export class LedgerController {
  constructor(private repo: LedgerRepository) {}

  @Get()
  @Roles("FINANCE", "ADMIN", "PRINCIPAL")
  @ApiOperation({ summary: "Inspect append-only financial ledger" })
  async getLedgerEntries() {
    return this.repo.findEntries();
  }
}
