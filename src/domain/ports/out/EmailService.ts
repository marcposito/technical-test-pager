export interface EmailService {
  sendNotification(address: string): Promise<any>;
}
