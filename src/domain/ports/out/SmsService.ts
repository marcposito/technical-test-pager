export interface ISmsService {
  sendNotification(phoneNumber: number): Promise<any>;
}
