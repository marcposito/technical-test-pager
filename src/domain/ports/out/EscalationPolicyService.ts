export interface IEscalationPolicyService {
  getEscalationPolicy(serviceId: string): Promise<any>;
}
