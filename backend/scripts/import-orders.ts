import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { OrdersImportService } from '../src/orders/orders-import.service';

async function bootstrap() {
  const args = process.argv.slice(2);
  let filePath = '';
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--file=')) {
      filePath = args[i].split('=')[1];
    } else if (args[i] === '--dry-run') {
      dryRun = true;
    }
  }

  if (!filePath) {
    console.error(
      'Usage: npm run import:orders -- --file="<path>" [--dry-run]',
    );
    process.exit(1);
  }

  // Create an application context without listening on HTTP ports
  const app = await NestFactory.createApplicationContext(AppModule);

  const importService = app.get(OrdersImportService);

  await importService.importOrders(filePath, dryRun);

  await app.close();
}

bootstrap();
