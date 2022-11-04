export class ErrorArray extends Error {
  constructor(public value: string[], message: string) {
    super(message);

    this.name = 'ErrorArray';
  }
}
