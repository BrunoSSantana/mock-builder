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
    this._shape = shape;
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
  withValue<K extends keyof T>(prop: K, value: T[K]): this {
    const newShape = { ...this._shape };
    newShape[prop] = () => value;
    this._shape = newShape;
    return this;
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
  ): this {
    this._shape[prop] = () => (condition ? trueValue : falseValue);
    return this;
  }

  /**
   * Applies default values to properties that are not yet defined in the shape.
   *
   * @param defaults - An object containing default values for properties.
   *
   * @returns The current `Builder` instance for chaining.
   *
   * @example
   * ```ts
   * builder.applyDefaultValues({ age: () => 30, isActive: true });
   * ```
   */
  applyDefaultValues(defaults: Partial<Shape<T>>): this {
    this._shape = { ...defaults, ...this._shape };
    return this;
  }
}
