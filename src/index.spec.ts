import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockRandom = vi.fn();

vi.mock("./random", () => ({ default: mockRandom }));

import Builder, { setLocale } from "./index";
import { createBuilder, generate, generateRandom } from "./index";

interface Foo {
  id: number;
  name: string;
}

describe("class instance testes", () => {
  let builder: Builder<Foo>;
  beforeEach(() => {
    builder = new Builder<Foo>();
  });

  afterEach(() => {
    mockRandom.mockClear();
  });

  it("should create", () => {
    expect(builder).toBeTruthy();
  });

  it("should build from shape", () => {
    const shape: Partial<Foo> = {
      id: 1,
    };
    const value = builder.addShape(() => shape).generate();

    expect(value).toStrictEqual(shape);
  });

  it("should build from  complex shape", () => {
    const shape: Partial<Foo> = {
      id: 1,
      name: "name",
    };
    const value = builder.addShape(() => shape).generate();
    expect(value).toStrictEqual(shape);
  });

  it("should define a value from a string property rule", () => {
    const value = builder.ruleFor("id", () => 1).generate();

    expect(value).toStrictEqual({ id: 1 });
  });

  it("should define a value from a string property rule as value", () => {
    const value = builder.ruleFor("id", 1).generate();

    expect(value).toStrictEqual({ id: 1 });
  });

  it("should generate multiple instances of a shape ", () => {
    const shape: Partial<Foo> = {
      id: 1,
      name: "name",
    };

    const value = builder.addShape(() => shape).generate(2);
    expect(value).toStrictEqual([shape, shape]);
  });

  it("should generate data in fix range", () => {
    const shape: Partial<Foo> = {
      id: 1,
      name: "name",
    };
    mockRandom.mockReturnValueOnce(3);

    const values = builder.addShape(() => shape).generateRandom(10);

    expect(values.length).toBe(3);
    expect(mockRandom).toHaveBeenCalledWith(10, undefined);
  });

  it("should generate data in range", () => {
    const shape: Partial<Foo> = {
      id: 1,
      name: "name",
    };
    mockRandom.mockReturnValueOnce(15);

    const values = builder.addShape(() => shape).generateRandom(10, 20);

    expect(values.length).toBe(15);
    expect(mockRandom).toHaveBeenCalledWith(10, 20);
  });

  it("should generate random objects", () => {
    const fakes = builder
      .ruleFor("id", (faker) => faker.number.int())
      .ruleFor("name", (faker) => faker.person.firstName())
      .generate(2);

    expect(fakes[0]).not.toEqual(fakes[1]);
  });
});

describe("static and standalone functions", () => {
  it("createBuilder standalone functions should work", () => {
    const shape: Partial<Foo> = {
      id: 1,
      name: "name",
    };
    const value = createBuilder(() => shape).generate(2);
    expect(value).toStrictEqual([shape, shape]);
  });

  it("generate standalone functions should work", () => {
    const shape: Partial<Foo> = {
      id: 1,
      name: "name",
    };
    const value = generate(() => shape, 2);
    expect(value).toStrictEqual([shape, shape]);
  });

  it("faker works", () => {
    setLocale("pt_BR");
    const shape: Partial<Foo> = {
      id: 1,
      name: "name",
    };
    const value = generate<Foo>((f) => ({
      id: f.number.int(),
      name: f.person.fullName(),
    }));

    expect(value.name).toBeTruthy();
    expect(value.id).toBeTruthy();
  });

  it("should generate data in fix range", () => {
    const shape: Partial<Foo> = {
      id: 1,
      name: "name",
    };
    mockRandom.mockReturnValueOnce(3);
    const values = generateRandom(() => shape, 10);

    expect(values.length).toBe(3);
    expect(mockRandom).toHaveBeenCalledWith(10, undefined);
  });

  it("should generate 1 item if random returns 0", () => {
    const shape: Partial<Foo> = {
      id: 1,
      name: "name",
    };
    mockRandom.mockReturnValueOnce(0);
    const values = generateRandom(() => shape, 10);

    expect(values.length).toBe(1);
    expect(mockRandom).toHaveBeenCalledWith(10, undefined);
  });

  it("should generate data in range", () => {
    const shape: Partial<Foo> = {
      id: 1,
      name: "name",
    };
    mockRandom.mockReturnValueOnce(15);
    const values = generateRandom(() => shape, 10, 20);

    expect(values.length).toBe(15);
    expect(mockRandom).toHaveBeenCalledWith(10, 20);
  });
});
