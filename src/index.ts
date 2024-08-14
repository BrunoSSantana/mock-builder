export type Shape<T> = {
  [K in keyof T]: T[K] | (() => T[K]);
};

/**
 * A utility class for constructing objects based on a specified shape.
 *
 * The `Builder` class allows you to define an object shape where each property
 * can be either a static value or a function that returns a value. When you call
 * `build()`, it evaluates the shape and returns an object with resolved values.
 *
 * @template T - The type of the object to be built.
 */
export class Builder<T> {
  /**
   * The shape of the object, where each key maps to a value or a function
   * that returns the value.
   *
   * @internal
   */
  private _shape: Shape<T>;

  /**
   * Creates a new instance of `Builder`.
   *
   * @param shape - The shape of the object to be built. Each key in the shape can
   *                be a value or a function that returns the value.
   *
   * @example
   * ```ts
   * const builder = new Builder({
   *   id: faker.number.int,
   *   name: faker.lorem.word
   * });
   * ```
   *
   * @example
   * ```ts
   * const builder = new Builder({
   *   id: 1,
   *   name: "foo"
   * });
   * ```
   */
  constructor(shape: Shape<T>) {
    this._shape = { ...shape };
  }

  /**
   * Constructs an object based on the shape provided during the builder's instantiation.
   *
   * This method iterates over the shape and resolves each value. If a value is a function,
   * it invokes the function to retrieve the final value; otherwise, it directly assigns
   * the value.
   *
   * @returns An object of type `T` with all values resolved based on the shape.
   *
   * @example
   * ```ts
   * const foo = builder.build();
   * // Result: { id: 1, name: "foo" } or similar based on the shape
   * ```
   */
  build(): T {
    const data = Object.entries(this._shape).reduce((acc, [key, value]) => {
      acc[key as keyof T] =
        typeof value === "function"
          ? (value as () => T[keyof T])()
          : (value as T[keyof T]);
      return acc;
    }, {} as T);

    return data;
  }

  /**
   * Sets a specific property of the shape to always return a given value.
   *
   * @param prop - The property name to set.
   * @param value - The value that the property should always return.
   *
   * @returns The current `Builder` instance for chaining.
   *
   * @example
   * ```ts
   * builder.withValue('id', 123).withValue('name', 'Alice');
   * const result = builder.build(); // { id: 123, name: "Alice" }
   * ```
   */
  withValue<K extends keyof T>(prop: K, value: T[K]): Builder<T> {
    const newShape: Shape<T> = { ...this._shape, [prop]: () => value };
    return new Builder(newShape);
  }

  /**
   * Sets a property based on a condition.
   *
   * @param prop - The property name to set.
   * @param condition - The condition to evaluate.
   * @param trueValue - The value if the condition is true.
   * @param falseValue - The value if the condition is false.
   *
   * @returns The current `Builder` instance for chaining.
   *
   * @example
   * ```ts
   * builder.setConditionalValue('isAdmin', userType === 'admin', true, false);
   * builder.setConditionalValue("permissions", userType === "admin", adminPermissions, userPermissions);
   * ```
   */
  setConditionalValue<K extends keyof T>(
    prop: K,
    condition: boolean,
    trueValue: T[K],
    falseValue: T[K],
  ): Builder<T> {
    const newShape: Shape<T> = {
      ...this._shape,
      [prop]: () => (condition ? trueValue : falseValue),
    };
    return new Builder(newShape);
  }

  /**
   * Applies default values to properties that are not yet defined in the shape.
   *
   * If a default value is a function, it will be executed during the `build()` method
   * to determine the final value.
   *
   * @param defaults - An object containing default values for properties.
   * @returns The current `Builder` instance for chaining.
   *
   * @example
   * ```ts
   * builder.applyDefaultValues({ age: 30, isActive: true });
   * builder.applyDefaultValues({ age: () => Math.floor(Math.random() * 100), isActive: true });
   *
   * const result = builder.build();
   * // Result might be { age: 45, isActive: true } depending on the random value generated.
   * ```
   */
  applyDefaultValues(defaults: Partial<Shape<T>>): Builder<T> {
    const newShape: Shape<T> = { ...defaults, ...this._shape };
    return new Builder(newShape);
  }
}
