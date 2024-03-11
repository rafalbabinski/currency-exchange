import { StartTransactionLambdaPayload } from "../../../functions/start-transaction/event.schema";

export interface StartTransactionStepLambdaPayload extends StartTransactionLambdaPayload {
  transactionId: string;
}
