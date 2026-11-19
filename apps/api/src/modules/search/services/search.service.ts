import { Injectable } from "@nestjs/common";
import { SearchRepository } from "../repositories/search.repository";

@Injectable()
export class SearchService {
  constructor(private repo: SearchRepository) {}

  async searchStudents(q: string) {
    return this.repo.searchStudents(q);
  }

  async searchStaff(q: string) {
    return this.repo.searchStaff(q);
  }

  async searchNotices(q: string) {
    return this.repo.searchNotices(q);
  }
}
