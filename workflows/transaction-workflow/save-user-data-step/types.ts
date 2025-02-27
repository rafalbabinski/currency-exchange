import { SaveUserDataLambdaPayload } from "../../../functions/save-user-data/event.schema";

export interface SaveUserDataStepLambdaPayload extends Pick<SaveUserDataLambdaPayload, "body"> {
  transactionId: string;
  taskToken: string;
}
