export const api = {
  rates: (stage: string, isOffline: boolean, getRatesLambdaURL: string) =>
    isOffline ? "http://localhost:1337/local" : `${getRatesLambdaURL}/${stage}`,
};
