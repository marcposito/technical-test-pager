import DTO from "./DTO";

interface MonitoredServiceDTO extends DTO {
  service_id: string;
  acknowledged: boolean;
  healthy: boolean;
  escalation_level: number;
}

export default MonitoredServiceDTO;
