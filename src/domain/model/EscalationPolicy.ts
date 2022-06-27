import { EscalationLevel } from "./types";

class EscalationPolicy {
  private readonly _id: string;
  private _serviceId: string;
  private _levels: EscalationLevel[];

  private constructor(
    id: string,
    serviceId: string,
    levels: EscalationLevel[]
  ) {
    this._id = id;
    this._serviceId = serviceId;
    this._levels = levels;
  }

  static fromJSON(data: any): EscalationPolicy {
    return new EscalationPolicy(data.id, data.service_id, data.levels);
  }

  get id(): string {
    return this._id;
  }

  get serviceId(): string {
    return this._serviceId;
  }

  get levels(): EscalationLevel[] {
    return this._levels;
  }

  set levels(levels: EscalationLevel[]) {
    this._levels = levels;
  }
}

export default EscalationPolicy;
