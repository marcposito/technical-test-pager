export type SMS = {
  phoneNumber: number;
};

export type Email = {
  address: string;
};

export type EscalationTarget = {
  channel: SMS | Email;
};

export type EscalationLevel = {
  targets: EscalationTarget[];
};
