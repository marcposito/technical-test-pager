import MonitoredServiceDTO from "../../src/application/dto/MonitoredServiceDTO";

export const getMonitoredServiceInputData = (): MonitoredServiceDTO => {
  return {
    service_id: "test-service-id",
    acknowledged: false,
    healthy: false,
    escalation_level: 0,
  };
};

export const getMonitoredServiceAcknowledgedInputData = (): MonitoredServiceDTO => {
  return {
    service_id: "test-service-id",
    acknowledged: true,
    healthy: false,
    escalation_level: 0,
  };
};
