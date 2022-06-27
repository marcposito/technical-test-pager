import ServiceIsAlreadyAcknowledgedException from "../../domain/exception/ServiceIsAlreadyAckknowledgedException";
import ValidationException from "../../domain/exception/ValidationException";
import MonitoredService from "../../domain/model/MonitoredService";
import { IAcknowledgeTimeout } from "../../domain/ports/in";
import { PagerRepository } from "../../domain/ports/out";
import {
  isServiceAlreadyAcknowledged,
  parseMonitoredServiceFromDTO,
} from "../lib/common";
import AcknowledgeTimeoutValidator from "../validator/AcknowledgeTimeoutValidator";

class AcknowledgeTimeout {
  private pagerRepository: PagerRepository;

  constructor(pagerRepository: PagerRepository) {
    this.pagerRepository = pagerRepository;
  }

  async execute(data: any): Promise<any> {
    await this.validate(data);

    const monitoredService = await this.getMonitoredService(data);

    if (isServiceAlreadyAcknowledged(monitoredService)) {
      throw new ServiceIsAlreadyAcknowledgedException();
    } else {
      await this.pagerRepository.setMonitoredService({
        service_id: monitoredService.serviceId,
        acknowledged: true,
        healthy: monitoredService.healthy,
        escalation_level: monitoredService.escalationLevel,
      });
    }
  }

  private async validate(data: any): Promise<void> {
    const validator = new AcknowledgeTimeoutValidator();

    if (!(await validator.validate(data))) {
      const errors = validator.getErrors();

      throw new ValidationException(errors);
    }
  }

  private async getMonitoredService(
    data: IAcknowledgeTimeout
  ): Promise<MonitoredService> {
    const monitoredServiceFromDb = await this.pagerRepository.getMonitoredService(
      data.serviceId
    );
    return parseMonitoredServiceFromDTO(monitoredServiceFromDb);
  }
}

export default AcknowledgeTimeout;
