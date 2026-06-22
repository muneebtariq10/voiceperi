import { Body, Controller, Post } from '@nestjs/common';
import { SqlService } from './sql.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('sql')
export class SqlController {
  constructor(private readonly sqlService: SqlService) {}

  @Public()
  @Post('run')
  async runSql(@Body('query') query: string) {
    // OPTIONAL: Add auth check here
    return await this.sqlService.runQuery(query);
  }
}
