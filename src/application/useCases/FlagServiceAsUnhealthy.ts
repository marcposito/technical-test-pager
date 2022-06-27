import ValidationException from "../../domain/exception/ValidationException";
import {
  EmailService,
  SmsService,
  EscalationPolicyService,
  PagerRepository,
  TimerService,
} from "../../domain/ports/out";
import { ISetMonitoredServiceAsUnhealthy } from "../../domain/ports/in";
import SetMonitoredServiceAsUnhealthyValidator from "../validator/SetMonitoredServiceAsUnhealthyValidator";
import MonitoredService from "../../domain/model/MonitoredService";
import ServiceIsUnhealthyException from "../../domain/exception/ServiceIsUnhealthyException";
import EscalationPolicy from "../../domain/model/EscalationPolicy";
import { EscalationTarget } from "../../domain/model/types";
import {
  isChannelSMS,
  isServiceHealthy,
  parseEscalationPolicyFromDTO,
  parseMonitoredServiceFromDTO,
} from "../lib/common";

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

  async execute(data: any): Promise<any> {
    await this.validate(data);

    const monitoredService = await this.getMonitoredService(data);

    if (isServiceHealthy(monitoredService)) {
      await this.flagMonitoredServiceAsUnhealthy(monitoredService);

      const escalationPolicy = await this.getEscalationPolicy(data);

      const targets =
        escalationPolicy.levels[monitoredService.escalationLevel].targets;

      await this.handleTargetAlerting(targets);

      await this.setTimer(monitoredService.serviceId);
    } else {
      throw new ServiceIsUnhealthyException();
    }
  }

  private async validate(data: any): Promise<void> {
    const validator = new SetMonitoredServiceAsUnhealthyValidator();

    if (!(await validator.validate(data))) {
      const errors = validator.getErrors();

      throw new ValidationException(errors);
    }
  }

  private async getMonitoredService(
    data: ISetMonitoredServiceAsUnhealthy
  ): Promise<MonitoredService> {
    const monitoredServiceFromDb = await this.pagerRepository.getMonitoredService(
      data.serviceId
    );
    return parseMonitoredServiceFromDTO(monitoredServiceFromDb);
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

  private async getEscalationPolicy(
    data: ISetMonitoredServiceAsUnhealthy
  ): Promise<EscalationPolicy> {
    const escalationPolicyFromDb = await this.escalationPolicyService.getEscalationPolicy(
      data.serviceId
    );
    return parseEscalationPolicyFromDTO(escalationPolicyFromDb);
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

export default FlagServiceAsUnhealthy;
