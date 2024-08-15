Forked from [fluentbuilder](https://github.com/lucasteles/fluentbuilder)
# mock-builder

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/types-TypeScript-blue)

## Overview

The `mock-builder` is a TypeScript library designed to help you create objects based on a specified shape. Each property in the shape can be either a static value or a function that returns a value. The library emphasizes immutability, ensuring that each modification creates a new instance, thereby avoiding side effects and promoting predictable, maintainable code.

## Features

- **Immutable Design**: Ensures that every operation returns a new instance, avoiding unintended side effects.
- **Flexible Shape Definition**: Supports both static values and functions that generate values.
- **TypeScript Support**: Fully typed for a robust development experience.
- **Chainable API**: Easily chain methods for building complex objects.

## Installation

Install the package via npm:

```bash
npm install immutable-builder
```

or via yarn
```bash
yarn add immutable-builder
```
## Usage
### Basic Usage
```ts
import { Builder } from 'immutable-builder';

// Define a shape for the object
const builder = new Builder({
  id: () => Math.floor(Math.random() * 100),
  name: 'defaultName'
});

// Build the object
const myObject = builder.build();

console.log(myObject);
// Output: { id: 42, name: 'defaultName' }
```
### Applying Default Values
```ts
const builder = new Builder({
  id: 1,
  name: 'Alice'
});

// Apply default values
const updatedBuilder = builder.applyDefaultValues({
  age: () => 30, // Function executed during build
  isActive: true
});

const myObject = updatedBuilder.build();
console.log(myObject);
// Output: { id: 1, name: 'Alice', age: 30, isActive: true }
```

### Setting Values Conditionally
```ts
const builder = new Builder({
  id: 1,
  name: 'Alice'
});

// Set values based on a condition
const updatedBuilder = builder.setConditionalValue(
  'isAdmin',
  userType === 'admin',
  true,
  false
);

const myObject = updatedBuilder.build();
console.log(myObject);
// Output: { id: 1, name: 'Alice', isAdmin: false }
```

## API
`Builder`

`constructor(shape: Shape<T>)`
- Creates a new Builder instance.
- Parameters:
  - shape: An object where each key is a property of the resulting object and can be either a value or a function that returns a value.

`build(): T`

- Constructs an object based on the shape provided during instantiation.
- Returns: An object of type T with all values resolved.

`withValue<K extends keyof T>(prop: K, value: T[K]): Builder<T>`

- Sets a specific property of the shape to always return a given value.
- Parameters:
  - prop: The property name to set.
  - value: The value that the property should always return.
- Returns: A new Builder instance.

`setConditionalValue<K extends keyof T>(prop: K, condition: boolean, trueValue: T[K], falseValue: T[K]): Builder<T>`

- Sets a property based on a condition.
- Parameters:
  - prop: The property name to set.
  - condition: The condition to evaluate.
  - trueValue: The value if the condition is true.
  - falseValue: The value if the condition is false.
- Returns: A new Builder instance.

`applyDefaultValues(defaults: Partial<Shape<T>>): Builder<T>`

- Applies default values to undefined properties. If a default value is a function, it runs during build() to get the final value.
- Parameters:
- defaults: An object containing default values for properties.
- Returns: A new Builder instance.
## Contributing
Contributions are welcome! Please feel free to submit a Pull Request or open an Issue on GitHub.
