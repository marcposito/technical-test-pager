export interface EscalationPolicyService {
  getEscalationPolicy(serviceId: string): Promise<any>;
}
