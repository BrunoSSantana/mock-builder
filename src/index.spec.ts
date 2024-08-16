import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";
import { Builder, type Shape } from "./index";

interface Foo {
  id: number;
  name: string;
}

describe("class instance tests", () => {
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

  it("should apply default values", () => {
    const baseProfileBuilder = new Builder({
      name: "Default",
      age: 25,
      isAdmin: false,
    });

    const adminProfileBuilder = baseProfileBuilder.withValue("isAdmin", true);

    const userProfileBuilder = baseProfileBuilder
      .withValue("isAdmin", false)
      .withValue("age", 30);

    const adminProfile = adminProfileBuilder.build();
    const userProfile = userProfileBuilder.build();

    expect(adminProfile.isAdmin).toBe(true);
    expect(userProfile.isAdmin).toBe(false);
    expect(userProfile.age).toBe(30);
  });

  it("should build a single entity", () => {
    const shape: Shape<Foo> = {
      id: faker.number.int,
      name: faker.lorem.word,
    };

    const builder: Builder<Foo> = new Builder(shape);
    const entity = builder.build();

    expect(entity).toHaveProperty("id");
    expect(entity).toHaveProperty("name");
  });

  it("should build multiple entities", () => {
    const shape: Shape<Foo> = {
      id: faker.number.int,
      name: faker.lorem.word,
    };

    const builder: Builder<Foo> = new Builder(shape);
    const entities = builder.build(3) as Foo[];

    expect(Array.isArray(entities)).toBe(true);
    expect(entities).toHaveLength(3);

    entities.forEach((entity) => {
      expect(entity).toHaveProperty("id");
      expect(entity).toHaveProperty("name");
    });
  });

  it("should build a random number of entities", () => {
    const shape: Shape<Foo> = {
      id: faker.number.int,
      name: faker.lorem.word,
    };

    const builder: Builder<Foo> = new Builder(shape);
    const entities = builder.build({ min: 2, max: 5 }) as Foo[];

    expect(Array.isArray(entities)).toBe(true);
    expect(entities.length).toBeGreaterThanOrEqual(2);
    expect(entities.length).toBeLessThanOrEqual(5);

    entities.forEach((entity) => {
      expect(entity).toHaveProperty("id");
      expect(entity).toHaveProperty("name");
    });
  });

  it("should correctly apply conditional values", () => {
    const shape: Shape<Foo> = {
      id: 1,
      name: "Default",
    };

    const builder = new Builder(shape);

    const trueConditionBuilder = builder.setConditionalValue(
      "name",
      true,
      "TrueName",
      "FalseName",
    );
    const falseConditionBuilder = builder.setConditionalValue(
      "name",
      false,
      "TrueName",
      "FalseName",
    );

    const trueConditionEntity = trueConditionBuilder.build();
    const falseConditionEntity = falseConditionBuilder.build();

    expect(trueConditionEntity.name).toBe("TrueName");
    expect(falseConditionEntity.name).toBe("FalseName");
  });

  it("should override values with withValue", () => {
    const shape: Shape<Foo> = {
      id: 1,
      name: "Default",
    };

    const builder = new Builder(shape);

    const customBuilder = builder.withValue("name", "CustomName");
    const entity = customBuilder.build();

    expect(entity.name).toBe("CustomName");
  });

  it("should return the correct number of entities when min equals max", () => {
    const shape: Shape<Foo> = {
      id: faker.number.int,
      name: faker.lorem.word,
    };

    const builder: Builder<Foo> = new Builder(shape);
    const entities = builder.build({ min: 3, max: 3 }) as Foo[];

    expect(entities).toHaveLength(3);

    entities.forEach((entity) => {
      expect(entity).toHaveProperty("id");
      expect(entity).toHaveProperty("name");
    });
  });

  it("should return an empty array when min and max are zero", () => {
    const shape: Shape<Foo> = {
      id: faker.number.int,
      name: faker.lorem.word,
    };

    const builder: Builder<Foo> = new Builder(shape);
    const entities = builder.build({ min: 0, max: 0 }) as Foo[];

    expect(entities).toHaveLength(0);
  });

  it("should not override existing properties when applying default values", () => {
    const shape: Shape<Foo> = {
      id: 1,
      name: "John Doe",
    };

    const builder = new Builder(shape);

    const builderWithDefaults = builder.applyDefaultValues({
      id: 2,
      name: "Default Name",
    });

    const userProfile = builderWithDefaults.build();

    expect(userProfile).toHaveProperty("id", 2);
    expect(userProfile).toHaveProperty("name", "Default Name");
  });

  it("should apply functions as default values correctly", () => {
    const shape: Shape<Foo> = {
      id: 1,
      name: "John Doe",
    };

    const builder = new Builder(shape);

    const builderWithDefaults = builder.applyDefaultValues({
      id: () => 2,
      name: () => "Default Name",
    });

    const userProfile = builderWithDefaults.build();

    expect(userProfile).toHaveProperty("id", 2);
    expect(userProfile).toHaveProperty("name", "Default Name");
  });
});
