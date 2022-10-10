export interface IServices {
  handleError<T>(operation: string, result?: T);
  log(message: string);
}
