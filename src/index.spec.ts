import { describe, expect, it } from "vitest";

import { faker } from "@faker-js/faker";
import { Builder, type Shape } from "./index";

interface Foo {
  id: number;
  name: string;
}

describe("class instance testes", () => {
  it("should build from shape", () => {
    let shape: Shape<Foo> = {
      id: 1,
      name: "foo",
    };

    let builder: Builder<Foo> = new Builder(shape);
    let firstFooObject = builder.build();
    let secondFooObject = builder.build();

    expect(firstFooObject).toStrictEqual(secondFooObject);

    shape = {
      id: faker.number.int,
      name: faker.lorem.word,
    };

    builder = new Builder(shape);
    firstFooObject = builder.build();
    secondFooObject = builder.build();

    expect(firstFooObject.id).not.equal(secondFooObject.id);
    expect(firstFooObject.name).not.toEqual(secondFooObject.name);
  });
});
