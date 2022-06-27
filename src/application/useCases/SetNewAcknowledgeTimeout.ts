import ServiceDoesNotHaveMoreLevelsException from "../../domain/exception/ServiceDoesNotHaveMoreLevelsException";
import ServiceIsAlreadyAcknowledgedException from "../../domain/exception/ServiceIsAlreadyAckknowledgedException";
import ServiceIsHealthyException from "../../domain/exception/ServiceIsHealthyException";
import ValidationException from "../../domain/exception/ValidationException";
import EscalationPolicy from "../../domain/model/EscalationPolicy";
import MonitoredService from "../../domain/model/MonitoredService";
import { EscalationTarget } from "../../domain/model/types";
import { SetNewAcknowledgeTimeoutDTO } from "../../domain/ports/in";
import {
  PagerRepository,
  SmsService,
  EmailService,
  EscalationPolicyService,
  TimerService,
} from "../../domain/ports/out";
import {
  isChannelSMS,
  isServiceAlreadyAcknowledged,
  isServiceHealthy,
  parseEscalationPolicyFromDTO,
  parseMonitoredServiceFromDTO,
} from "../lib/common";
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

  async execute(data: any): Promise<any> {
    await this.validate(data);

    let monitoredService = await this.getMonitoredService(data);
    const escalationPolicy = await this.getEscalationPolicy(data);

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

  private async validate(data: any): Promise<void> {
    const validator = new SetNewAcknowledgedTimeoutValidator();

    if (!(await validator.validate(data))) {
      const errors = validator.getErrors();

      throw new ValidationException(errors);
    }
  }

  private async getMonitoredService(
    data: SetNewAcknowledgeTimeoutDTO
  ): Promise<MonitoredService> {
    const monitoredServiceFromDb = await this.pagerRepository.getMonitoredService(
      data.serviceId
    );
    return parseMonitoredServiceFromDTO(monitoredServiceFromDb);
  }

  private async getEscalationPolicy(
    data: SetNewAcknowledgeTimeoutDTO
  ): Promise<EscalationPolicy> {
    const escalationPolicyFromDb = await this.escalationPolicyService.getEscalationPolicy(
      data.serviceId
    );
    return parseEscalationPolicyFromDTO(escalationPolicyFromDb);
  }

  private async setMonitoredService(
    monitoredService: MonitoredService
  ): Promise<void> {
    await this.pagerRepository.setMonitoredService({
      service_id: monitoredService.serviceId,
      acknowledged: monitoredService.acknowledged,
      healthy: monitoredService.healthy,
      escalation_level: monitoredService.escalationLevel + 1,
    });
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
    if (isServiceHealthy(monitoredService)) {
      throw new ServiceIsHealthyException();
    }

    if (isServiceAlreadyAcknowledged(monitoredService)) {
      throw new ServiceIsAlreadyAcknowledgedException();
    }

    if (
      !this.doesTheServiceHaveMoreLevels(monitoredService, escalationPolicy)
    ) {
      throw new ServiceDoesNotHaveMoreLevelsException();
    }
  }

  private async handleTargetAlerting(
    targets: EscalationTarget[]
  ): Promise<void> {
    for (let target of targets) {
      if (isChannelSMS(target.channel)) {
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
