export interface SmsService {
  sendNotification(phoneNumber: number): Promise<any>;
}
