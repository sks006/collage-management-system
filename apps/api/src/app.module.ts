import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { SharedModule } from "./shared/shared.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AcademicModule } from "./modules/academic/academic.module";
import { PeopleModule } from "./modules/people/people.module";
import { AttendanceModule } from "./modules/attendance/attendance.module";
import { LeaveModule } from "./modules/leave/leave.module";
import { FinanceModule } from "./modules/finance/finance.module";
import { PayrollModule } from "./modules/payroll/payroll.module";
import { NoticeModule } from "./modules/notice/notice.module";
import { SearchModule } from "./modules/search/search.module";
import { RequestIdMiddleware } from "./shared/middleware/request-id.middleware";

@Module({
  imports: [
    SharedModule,
    AuthModule,
    AcademicModule,
    PeopleModule,
    AttendanceModule,
    LeaveModule,
    FinanceModule,
    PayrollModule,
    NoticeModule,
    SearchModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
