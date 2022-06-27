import { EscalationLevel } from "../../domain/model/types";
import DTO from "./DTO";

interface EscalationPolicyDTO extends DTO {
  id: string;
  service_id: string;
  levels: EscalationLevel[];
}

export default EscalationPolicyDTO;
