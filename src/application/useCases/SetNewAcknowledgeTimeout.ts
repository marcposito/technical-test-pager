import ServiceDoesNotHaveMoreLevelsException from "../../domain/exception/ServiceDoesNotHaveMoreLevelsException";
import ServiceIsAlreadyAcknowledgedException from "../../domain/exception/ServiceIsAlreadyAckknowledgedException";
import ServiceIsHealthyException from "../../domain/exception/ServiceIsHealthyException";
import ValidationException from "../../domain/exception/ValidationException";
import EscalationPolicy from "../../domain/model/EscalationPolicy";
import MonitoredService from "../../domain/model/MonitoredService";
import { SMS, Email, EscalationTarget } from "../../domain/model/types";
import { SetNewAcknowledgeTimeoutDTO } from "../../domain/ports/in";
import {
  PagerRepository,
  SmsService,
  EmailService,
  EscalationPolicyService,
  TimerService,
} from "../../domain/ports/out";
import SetNewAcknowledgedTimeoutValidator from "../validator/SetNewAcknowledgedTimeoutValidator";

class SetNewAcknowledgeTimeout {
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

  async execute(data: SetNewAcknowledgeTimeoutDTO): Promise<any> {
    await this.validate(data);

    let monitoredService = await this.getMonitoredService(data.serviceId);
    const escalationPolicy = await this.getEscalationPolicy(data.serviceId);

    this.validateWeCanScaleAlertToTheNextLevel(
      monitoredService,
      escalationPolicy
    );

    await this.setMonitoredService(monitoredService);

    const targets =
      escalationPolicy.levels[monitoredService.escalationLevel + 1].targets;

    await this.handleTargetAlerting(targets);

    await this.setTimer(monitoredService.serviceId);
  }

  private async validate(data: SetNewAcknowledgeTimeoutDTO): Promise<void> {
    const validator = new SetNewAcknowledgedTimeoutValidator();

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

  private async setMonitoredService(
    monitoredService: MonitoredService
  ): Promise<void> {
    await this.pagerRepository.setMonitoredService({
      service_id: monitoredService.serviceId,
      acknowledged: true,
      healthy: monitoredService.healthy,
      escalation_level: monitoredService.escalationLevel,
    });
  }

  private isServiceHealthy(monitoredService: MonitoredService): boolean {
    return monitoredService.healthy;
  }

  private isServiceAlreadyAcknowledged(
    monitoredService: MonitoredService
  ): boolean {
    return monitoredService.acknowledged;
  }

  private doesTheServiceHaveMoreLevels(
    monitoredService: MonitoredService,
    escalationPolicy: EscalationPolicy
  ): boolean {
    return (
      monitoredService.escalationLevel < escalationPolicy.levels.length - 1
    );
  }

  private validateWeCanScaleAlertToTheNextLevel(
    monitoredService: MonitoredService,
    escalationPolicy: EscalationPolicy
  ): void {
    if (this.isServiceHealthy(monitoredService)) {
      throw new ServiceIsHealthyException();
    }

    if (this.isServiceAlreadyAcknowledged(monitoredService)) {
      throw new ServiceIsAlreadyAcknowledgedException();
    }

    if (
      !this.doesTheServiceHaveMoreLevels(monitoredService, escalationPolicy)
    ) {
      throw new ServiceDoesNotHaveMoreLevelsException();
    }
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

export default SetNewAcknowledgeTimeout;
