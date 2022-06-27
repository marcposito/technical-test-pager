import DTO from "../../model/DTO";

export interface SetMonitoredServiceAsHealthyDTO extends DTO {
  serviceId: string;
}

export interface AcknowledgeTimeoutDTO extends DTO {
  serviceId: string;
}
