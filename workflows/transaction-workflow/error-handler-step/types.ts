export interface Event {
  transactionId: string;
  error: {
    Error: string;
    [key: string]: string;
  };
}
