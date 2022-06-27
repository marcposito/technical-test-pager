import ServiceIsAlreadyAcknowledgedException from "../../domain/exception/ServiceIsAlreadyAckknowledgedException";
import ValidationException from "../../domain/exception/ValidationException";
import MonitoredService from "../../domain/model/MonitoredService";
import { AcknowledgeTimeoutDTO } from "../../domain/ports/in";
import { PagerRepository } from "../../domain/ports/out";
import AcknowledgeTimeoutValidator from "../validator/AcknowledgeTimeoutValidator";

class AcknowledgeTimeout {
  private pagerRepository: PagerRepository;

  constructor(pagerRepository: PagerRepository) {
    this.pagerRepository = pagerRepository;
  }

  async execute(data: AcknowledgeTimeoutDTO): Promise<any> {
    await this.validate(data);

    const monitoredService = await this.getMonitoredService(data.serviceId);

    if (this.isServiceAlreadyAcknowledged(monitoredService)) {
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

  private async validate(data: AcknowledgeTimeoutDTO): Promise<void> {
    const validator = new AcknowledgeTimeoutValidator();

    if (!(await validator.validate(data))) {
      const errors = validator.getErrors();

      throw new ValidationException(errors);
    }
  }

  private async getMonitoredService(data: any): Promise<MonitoredService> {
    const monitoredServiceFromDb = await this.pagerRepository.getMonitoredService(
      data.serviceId
    );
    return this.parseMonitoredService(monitoredServiceFromDb);
  }

  private parseMonitoredService(data: any): MonitoredService {
    return MonitoredService.fromJSON({
      service_id: data.service_id,
      acknowledged: data.acknowledged,
      healthy: data.healthy,
    });
  }

  private isServiceAlreadyAcknowledged(
    monitoredService: MonitoredService
  ): boolean {
    return monitoredService.acknowledged;
  }
}

export default AcknowledgeTimeout;
