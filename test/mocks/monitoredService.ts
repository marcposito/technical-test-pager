import MonitoredServiceDTO from "../../src/application/dto/MonitoredServiceDTO";

export const getMonitoredServiceInputData = (): MonitoredServiceDTO => {
  return {
    service_id: "test-service-id",
    acknowledged: true,
    healthy: true,
    escalation_level: 0,
  };
};
