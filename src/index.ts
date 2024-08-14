export type Shape<T> = {
  [K in keyof T]: T[K] | (() => T[K]);
};

export class Builder<T> {
  private _shape: Shape<T>;

  constructor(shape: Shape<T>) {
    this._shape = shape;
  }

  build(): T {
    const data = Object.entries(this._shape).reduce((acc, [key, value]) => {
      if (typeof value === "function") {
        // @ts-expect-error
        acc[key] = value();
      } else {
        // @ts-expect-error
        acc[key] = value;
      }
      return acc;
    }, {} as T);

    return data;
  }
}
