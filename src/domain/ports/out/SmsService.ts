export interface ISmsService {
  sendNotification(phoneNumber: number): Promise<void>;
}
