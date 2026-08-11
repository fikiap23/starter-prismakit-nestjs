import { Module } from '@nestjs/common';
import { StockRepository } from './repositories/stock.repository';

@Module({
  providers: [StockRepository],
  exports: [StockRepository],
})
export class StockModule {}
