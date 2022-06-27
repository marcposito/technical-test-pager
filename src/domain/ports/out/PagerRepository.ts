export interface IPagerRepository {
  getMonitoredService(serviceId: string): Promise<any>;
  setMonitoredService(query: any): Promise<void>;
}
