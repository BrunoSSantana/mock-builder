/**
 * The shape of the object, where each key maps to a value or a function
 * @type {Shape} - The shape of the object.
 * @template T - The type of the object.
 * @example
 * ```ts
 * interface Foo {
 *   id: number;
 *   name: string;
 * }
 * const builder = new Builder<Foo>({
 *   id: 1,
 *   name: "foo",
 * });
 * const foo = builder.build();
 * // Result: { id: 1, name: "foo" }
 */
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
   * Constructs one or more objects based on the shape provided during the builder's instantiation.
   *
   * @param count - Optional. If a number is provided, it generates that many instances.
   *                If an object with min and max is provided, it generates a random number of instances
   *                between the min and max (inclusive).
   * @returns A single object of type `T` or an array of objects if `count` or random count is specified.
   *
   * @example
   * ```ts
   * const singleEntity = builder.build(); // Builds one entity
   * const multipleEntities = builder.build(3); // Builds three entities
   * const randomEntities = builder.build({ min: 2, max: 5 }); // Builds between 2 to 5 entities
   * ```
   */

  build(): T;
  build(count: 1): T;
  build(count: number): T[];
  build(count: { min: number; max: number }): T[];
  build(count?: number | { min: number; max: number }): T | T[] {
    let entitiesCount = 1;

    if (typeof count === "number") {
      entitiesCount = count;
    } else if (
      typeof count === "object" &&
      count.min !== undefined &&
      count.max !== undefined
    ) {
      entitiesCount = this.getRandomInt(count.min, count.max);
    }

    if (entitiesCount === 1) {
      return this.buildSingle();
    }

    const entities: T[] = [];
    for (let i = 0; i < entitiesCount; i++) {
      entities.push(this.buildSingle());
    }
    return entities;
  }

  private buildSingle(): T {
    const data = Object.entries(this._shape).reduce((acc, [key, value]) => {
      acc[key as keyof T] =
        typeof value === "function"
          ? (value as () => T[keyof T])()
          : (value as T[keyof T]);
      return acc;
    }, {} as T);

    return data;
  }

  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
    const newShape: Shape<T> = { ...this._shape, ...defaults };
    return new Builder(newShape);
  }

  /**
   * Transforms the value of a specific property in the shape using a provided mapping function.
   *
   * The `mapValue` method allows you to apply a transformation function to a property in the shape.
   * The original value or function associated with the property is retrieved and passed to the mapping
   * function (`mapFn`). The result of the mapping function is then set as the new value for the property.
   *
   * @template K - The type of the property key in the object shape.
   * @param prop - The property name in the shape that you want to transform.
   * @param mapFn - A function that takes the current value of the property and returns a new value.
   *
   * @returns The current `Builder` instance for chaining.
   *
   * @example
   * ```ts
   * const builder = new Builder<Foo>({ id: 1, name: "foo" });
   * builder.mapValue('name', (name) => name.toUpperCase());
   * const result = builder.build(); // { id: 1, name: "FOO" }
   * ```
   */
  mapValue<K extends keyof T>(
    prop: K,
    mapFn: (value: T[K]) => T[K],
  ): Builder<T> {
    const original = this._shape[prop];

        /**
     * Resolves the original value of a property in the shape to its actual value.
     *
     * @return {T[K]} The resolved value of the property, either by executing a function or returning a static value.
     */
    const resolveValue = (): T[K] => {
      return typeof original === "function"
        ? (original as () => T[K])()
        : (original as T[K]);
    };

    const newShape: Shape<T> = {
      ...this._shape,
      [prop]: () => mapFn(resolveValue()),
    };

    return new Builder(newShape);
  }
}
