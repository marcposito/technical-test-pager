export interface TimerService {
  setTimer(serviceId: string): Promise<any>;
}
