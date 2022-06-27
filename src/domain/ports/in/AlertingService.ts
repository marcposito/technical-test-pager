import DTO from "../../model/DTO";

export interface SetMonitoredServiceAsUnhealthyDTO extends DTO {
  serviceId: string;
}
