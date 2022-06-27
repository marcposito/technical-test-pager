export interface ITimerService {
  setTimer(serviceId: string): Promise<any>;
}
