import { Get } from '@nestjs/common';

export class HealthController {
  @Get()
  async health() {
    return true;
  }
}
