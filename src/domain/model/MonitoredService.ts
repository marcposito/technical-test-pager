class MonitoredService {
  private _serviceId: string;
  private _acknowledged: boolean;
  private _healthy: boolean;
  private _escalationLevel: number;

  private constructor(
    serviceId: string,
    acknowledged: boolean,
    healthy: boolean,
    escalationLevel: number
  ) {
    this._serviceId = serviceId;
    this._acknowledged = acknowledged;
    this._healthy = healthy;
    this._escalationLevel = escalationLevel;
  }

  static fromJSON(data: any): MonitoredService {
    return new MonitoredService(
      data.service_id,
      data.acknowledged,
      data.healthy,
      data.escalation_level
    );
  }

  get serviceId(): string {
    return this._serviceId;
  }

  get acknowledged(): boolean {
    return this._acknowledged;
  }

  get healthy(): boolean {
    return this._healthy;
  }

  get escalationLevel(): number {
    return this._escalationLevel;
  }

  set acknowledged(acknowledged: boolean) {
    this._acknowledged = acknowledged;
  }

  set healthy(healthy: boolean) {
    this._healthy = healthy;
  }

  set escalationLevel(escalationLevel: number) {
    this._escalationLevel = escalationLevel;
  }
}

export default MonitoredService;
