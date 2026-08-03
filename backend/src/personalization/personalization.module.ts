import { Module } from '@nestjs/common';
import { PersonalizationService } from './personalization.service';
import { PersonalizationController } from './personalization.controller';
import { B2CPersonalizationAdapter } from '../integrations/adapters';

@Module({
  controllers: [PersonalizationController],
  providers: [PersonalizationService, B2CPersonalizationAdapter],
  exports: [PersonalizationService, B2CPersonalizationAdapter],
})
export class PersonalizationModule {}
