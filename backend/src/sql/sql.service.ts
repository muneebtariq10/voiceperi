import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SqlService {
  constructor(private dataSource: DataSource) {}

  async runQuery(query: string): Promise<any> {
    try {
      const result = await this.dataSource.query(query);
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
