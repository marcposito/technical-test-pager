export interface PagerRepository {
  getMonitoredService(serviceId: string): Promise<any>;
  setMonitoredService(query: any): Promise<void>;
}
