import { Injectable } from "@nestjs/common";
import { LedgerRepository } from "../repositories/ledger.repository";

@Injectable()
export class LedgerService {
  constructor(private repo: LedgerRepository) {}

  async getLedgerEntries() {
    return this.repo.findEntries();
  }
}
