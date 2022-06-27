import ServiceIsHealthyException from "../../domain/exception/ServiceIsHealthyException";
import ValidationException from "../../domain/exception/ValidationException";
import MonitoredService from "../../domain/model/MonitoredService";
import { SetMonitoredServiceAsHealthyDTO } from "../../domain/ports/in/ConsoleService";
import { PagerRepository } from "../../domain/ports/out";
import SetMonitoredServiceAsHealthyValidator from "../validator/SetMonitoredServiceAsHealthyValidator";

class FlagServiceAsHealthy {
  private pagerRepository: PagerRepository;

  constructor(pagerRepository: PagerRepository) {
    this.pagerRepository = pagerRepository;
  }

  async execute(data: SetMonitoredServiceAsHealthyDTO): Promise<any> {
    await this.validate(data);

    const monitoredService = await this.getMonitoredService(data.serviceId);

    if (this.isServiceHealthy(monitoredService)) {
      throw new ServiceIsHealthyException();
    } else {
      await this.pagerRepository.setMonitoredService({
        service_id: monitoredService.serviceId,
        acknowledged: true,
        healthy: true,
        escalation_level: 0,
      });
    }
  }

  private async validate(data: SetMonitoredServiceAsHealthyDTO): Promise<void> {
    const validator = new SetMonitoredServiceAsHealthyValidator();

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

  private isServiceHealthy(monitoredService: MonitoredService): boolean {
    return monitoredService.healthy;
  }
}

export default FlagServiceAsHealthy;
