import EscalationPolicy from "../../domain/model/EscalationPolicy";
import MonitoredService from "../../domain/model/MonitoredService";
import { SMS, Email } from "../../domain/model/types";

export const isServiceAlreadyAcknowledged = (
  monitoredService: MonitoredService
): boolean => monitoredService.acknowledged;

export const isServiceHealthy = (monitoredService: MonitoredService): boolean =>
  monitoredService.healthy;

export const isChannelSMS = (channel: SMS | Email): channel is SMS =>
  (channel as SMS).phoneNumber !== undefined;

export const parseEscalationPolicyFromDTO = (data: any): EscalationPolicy => {
  return EscalationPolicy.fromJSON({
    id: data.id,
    service_id: data.serviceId,
    levels: data.levels,
  });
};

export const parseMonitoredServiceFromDTO = (data: any): MonitoredService => {
  return MonitoredService.fromJSON({
    service_id: data.service_id,
    acknowledged: data.acknowledged,
    healthy: data.healthy,
  });
};
