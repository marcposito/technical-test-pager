export interface IEmailService {
  sendNotification(address: string): Promise<any>;
}
