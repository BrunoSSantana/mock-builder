export type Shape<T> = {
  [K in keyof T]: T[K] | (() => T[K]);
};
/**
 * Builds an object from a shape
 */
export class Builder<T> {
  private _shape: Shape<T>;

  /**
   * ## Creates a new Builder
   *
   * @param shape
   * @returns Builder
   *
   * @example
   * ```ts
   * const builder = new Builder({
   *   id: faker.number.int,
   *   name: faker.lorem.word
   * });
   *```
   * @example
   *```ts
   * const builder = new Builder({
   *   id: 1,
   *   name: "foo"
   * });
   *
   * ```
   */
  constructor(shape: Shape<T>) {
    this._shape = shape;
  }

  /**
   * ## Builds an object
   *
   * @returns an object with values defined by the shape
   *
   * @example
   * ```ts
   * const foo = builder.build();
   * ```
   */
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
