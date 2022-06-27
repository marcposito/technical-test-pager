import ValidationException from "../../domain/exception/ValidationException";
import {
  EmailService,
  SmsService,
  EscalationPolicyService,
  PagerRepository,
  TimerService,
} from "../../domain/ports/out";
import { SetMonitoredServiceAsUnhealthyDTO } from "../../domain/ports/in";
import SetMonitoredServiceAsUnhealthyValidator from "../validator/SetMonitoredServiceAsUnhealthyValidator";
import MonitoredService from "../../domain/model/MonitoredService";
import ServiceIsUnhealthyException from "../../domain/exception/ServiceIsUnhealthyException";
import EscalationPolicy from "../../domain/model/EscalationPolicy";
import { Email, EscalationTarget, SMS } from "../../domain/model/types";

class FlagServiceAsUnhealthy {
  private pagerRepository: PagerRepository;
  private smsService: SmsService;
  private emailService: EmailService;
  private timerService: TimerService;
  private escalationPolicyService: EscalationPolicyService;

  constructor(
    pagerRepository: PagerRepository,
    smsService: SmsService,
    emailService: EmailService,
    timerService: TimerService,
    escalationPolicyService: EscalationPolicyService
  ) {
    this.pagerRepository = pagerRepository;
    this.smsService = smsService;
    this.emailService = emailService;
    this.timerService = timerService;
    this.escalationPolicyService = escalationPolicyService;
  }

  async execute(data: SetMonitoredServiceAsUnhealthyDTO): Promise<any> {
    await this.validate(data);

    const monitoredService = await this.getMonitoredService(data.serviceId);

    if (this.isServiceHealthy(monitoredService)) {
      await this.flagMonitoredServiceAsUnhealthy(monitoredService);

      const escalationPolicy = await this.getEscalationPolicy(data.serviceId);

      const targets =
        escalationPolicy.levels[monitoredService.escalationLevel].targets;

      await this.handleTargetAlerting(targets);

      await this.setTimer(monitoredService.serviceId);
    } else {
      throw new ServiceIsUnhealthyException();
    }
  }

  private async validate(
    data: SetMonitoredServiceAsUnhealthyDTO
  ): Promise<void> {
    const validator = new SetMonitoredServiceAsUnhealthyValidator();

    if (!(await validator.validate(data))) {
      const errors = validator.getErrors();

      throw new ValidationException(errors);
    }
  }

  private isServiceHealthy(monitoredService: MonitoredService): boolean {
    return monitoredService.healthy;
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

  private async flagMonitoredServiceAsUnhealthy(
    monitoredService: MonitoredService
  ): Promise<void> {
    await this.pagerRepository.setMonitoredService({
      service_id: monitoredService.serviceId,
      acknowledged: monitoredService.acknowledged,
      healthy: false,
      escalation_level: 0,
    });
  }

  private async getEscalationPolicy(data: any): Promise<EscalationPolicy> {
    const escalationPolicyFromDb = await this.escalationPolicyService.getEscalationPolicy(
      data.serviceId
    );
    return this.parseEscalationPolicy(escalationPolicyFromDb);
  }

  private parseEscalationPolicy(data: any): EscalationPolicy {
    return EscalationPolicy.fromJSON({
      id: data.id,
      service_id: data.serviceId,
      levels: data.levels,
    });
  }

  private isChannelSMS(channel: SMS | Email): channel is SMS {
    return (channel as SMS).phoneNumber !== undefined;
  }

  private async handleTargetAlerting(
    targets: EscalationTarget[]
  ): Promise<void> {
    for (let target of targets) {
      if (this.isChannelSMS(target.channel)) {
        await this.sendSMSAltert(target.channel.phoneNumber);
      } else {
        await this.sendEmailAlert(target.channel.address);
      }
    }
  }

  private async sendEmailAlert(address: string): Promise<void> {
    await this.emailService.sendNotification(address);
  }

  private async sendSMSAltert(phone: number): Promise<void> {
    await this.smsService.sendNotification(phone);
  }

  private async setTimer(serviceId: string): Promise<void> {
    await this.timerService.setTimer(serviceId);
  }
}

export default FlagServiceAsUnhealthy;
