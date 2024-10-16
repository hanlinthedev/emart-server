import { Global, Module } from '@nestjs/common';
import { SseService } from './sse.service';

@Global() // To make this module available globally (optional)
@Module({
  providers: [SseService],
  exports: [SseService], // Exporting to make it usable in other modules
})
export class SseModule {}
