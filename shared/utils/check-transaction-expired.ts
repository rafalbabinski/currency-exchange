import { DateTime } from "luxon";

export const checkTransactionExpired = ({
  createdAt,
  timeToCompleteTransaction,
}: {
  createdAt: string;
  timeToCompleteTransaction: number;
}) => {
  const createdAtDate = DateTime.fromISO(createdAt);

  if (!createdAtDate.isValid) {
    throw new Error("Invalid createdAt date format");
  }

  const maxDate = createdAtDate.plus(timeToCompleteTransaction);
  const currentDate = DateTime.now();

  return currentDate > maxDate;
};
