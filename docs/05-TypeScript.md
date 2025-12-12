# TypeScript 面试题

## 基础概念

### 1. 什么是 TypeScript？相比 JavaScript 有什么优势？

**答案：**

TypeScript 是 JavaScript 的超集，添加了类型系统和对 ES6+ 的支持。

**优势：**
1. **静态类型检查**：编译时发现错误，减少运行时 bug
2. **代码智能提示**：IDE 自动补全、重构支持
3. **增强可读性**：类型即文档
4. **更好的协作**：大型项目更易维护
5. **渐进式采用**：可以逐步迁移

---

### 2. TypeScript 有哪些基本类型？

**答案：**

```typescript
// 基本类型
let str: string = 'hello';
let num: number = 123;
let bool: boolean = true;
let u: undefined = undefined;
let n: null = null;
let sym: symbol = Symbol();
let big: bigint = 100n;

// 数组
let arr1: number[] = [1, 2, 3];
let arr2: Array<number> = [1, 2, 3];

// 元组（固定长度和类型的数组）
let tuple: [string, number] = ['hello', 123];

// 枚举
enum Color {
  Red,      // 0
  Green,    // 1
  Blue      // 2
}
let c: Color = Color.Green;

// 字符串枚举
enum Direction {
  Up = 'UP',
  Down = 'DOWN'
}

// any（任意类型，跳过类型检查）
let anything: any = 'hello';
anything = 123;

// unknown（安全的 any）
let unknownVal: unknown = 'hello';
// unknownVal.toUpperCase(); // Error
if (typeof unknownVal === 'string') {
  unknownVal.toUpperCase(); // OK
}

// void（没有返回值）
function log(): void {
  console.log('hello');
}

// never（永不返回）
function throwError(): never {
  throw new Error('error');
}

function infiniteLoop(): never {
  while (true) {}
}

// object
let obj: object = {};
let obj2: { name: string; age: number } = { name: '张三', age: 18 };
```

---

### 3. any、unknown、never 的区别？

**答案：**

| 类型 | 描述 | 能否赋值给其他类型 | 能否操作 |
|------|------|-------------------|----------|
| `any` | 任意类型 | 可以 | 可以 |
| `unknown` | 未知类型 | 只能赋值给 any/unknown | 需要类型收窄后才能操作 |
| `never` | 不存在的类型 | 可以赋值给任何类型 | 不能有值 |

```typescript
// any - 放弃类型检查
let a: any = 'hello';
a.foo(); // 不报错，运行时可能出错

// unknown - 安全的 any
let b: unknown = 'hello';
// b.foo(); // Error: Object is of type 'unknown'

// 类型收窄后可以操作
if (typeof b === 'string') {
  b.toUpperCase(); // OK
}

// never - 用于永不可能的情况
type Exclude<T, U> = T extends U ? never : T;

// 穷尽检查
type Shape = 'circle' | 'square';

function getArea(shape: Shape) {
  switch (shape) {
    case 'circle':
      return Math.PI;
    case 'square':
      return 1;
    default:
      const _exhaustive: never = shape; // 如果漏了 case，这里会报错
      return _exhaustive;
  }
}
```

---

### 4. interface 和 type 的区别？

**答案：**

```typescript
// interface - 接口
interface Person {
  name: string;
  age: number;
}

// type - 类型别名
type PersonType = {
  name: string;
  age: number;
};
```

**区别：**

| 特性 | interface | type |
|------|-----------|------|
| 扩展方式 | extends | & (交叉类型) |
| 声明合并 | 支持 | 不支持 |
| 计算属性 | 不支持 | 支持 |
| 基本类型别名 | 不支持 | 支持 |
| 映射类型 | 不支持 | 支持 |

```typescript
// 1. 扩展方式
interface Animal {
  name: string;
}
interface Dog extends Animal {
  bark(): void;
}

type AnimalType = {
  name: string;
};
type DogType = AnimalType & {
  bark(): void;
};

// 2. 声明合并（只有 interface 支持）
interface User {
  name: string;
}
interface User {
  age: number;
}
// User 变成 { name: string; age: number }

// 3. type 可以声明基本类型别名
type ID = string | number;
type EventNames = 'click' | 'scroll' | 'mousemove';

// 4. type 支持计算属性
type Keys = 'firstName' | 'lastName';
type Person2 = {
  [K in Keys]: string;
};

// 5. type 支持映射类型
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

**推荐：**
- 定义对象类型：优先使用 interface
- 需要联合类型、元组、映射类型：使用 type
- 需要声明合并：使用 interface

---

## 高级类型

### 5. 联合类型和交叉类型

**答案：**

**联合类型（Union Types）：**
```typescript
// 值可以是多种类型之一
type ID = string | number;

function printId(id: ID) {
  if (typeof id === 'string') {
    console.log(id.toUpperCase());
  } else {
    console.log(id);
  }
}

// 字面量联合类型
type Direction = 'up' | 'down' | 'left' | 'right';
type Result = 'success' | 'error' | 1 | 2;
```

**交叉类型（Intersection Types）：**
```typescript
// 组合多个类型
interface Person {
  name: string;
}
interface Employee {
  employeeId: number;
}

type Worker = Person & Employee;
// { name: string; employeeId: number }

const worker: Worker = {
  name: '张三',
  employeeId: 123
};
```

---

### 6. 类型守卫有哪些？

**答案：**

类型守卫用于在运行时收窄类型。

```typescript
// 1. typeof
function padLeft(value: string | number) {
  if (typeof value === 'string') {
    return value.padStart(4, '0');
  }
  return value.toString().padStart(4, '0');
}

// 2. instanceof
class Dog {
  bark() {}
}
class Cat {
  meow() {}
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark();
  } else {
    animal.meow();
  }
}

// 3. in 操作符
interface Fish {
  swim(): void;
}
interface Bird {
  fly(): void;
}

function move(animal: Fish | Bird) {
  if ('swim' in animal) {
    animal.swim();
  } else {
    animal.fly();
  }
}

// 4. 自定义类型守卫（is）
function isFish(animal: Fish | Bird): animal is Fish {
  return (animal as Fish).swim !== undefined;
}

function doSomething(animal: Fish | Bird) {
  if (isFish(animal)) {
    animal.swim(); // animal 是 Fish
  } else {
    animal.fly(); // animal 是 Bird
  }
}

// 5. 可辨识联合（Discriminated Unions）
interface Circle {
  kind: 'circle';
  radius: number;
}
interface Square {
  kind: 'square';
  size: number;
}
type Shape = Circle | Square;

function getArea(shape: Shape) {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.size ** 2;
  }
}
```

---

### 7. 泛型是什么？如何使用？

**答案：**

泛型允许在定义函数、接口或类时不预先指定具体类型，而是在使用时再指定。

```typescript
// 泛型函数
function identity<T>(value: T): T {
  return value;
}

identity<string>('hello'); // 显式指定
identity(123);             // 类型推断

// 多个类型参数
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

// 泛型接口
interface GenericIdentityFn<T> {
  (arg: T): T;
}

// 泛型类
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}

const myNumber = new GenericNumber<number>();
myNumber.zeroValue = 0;
myNumber.add = (x, y) => x + y;
```

**泛型约束：**
```typescript
// extends 约束
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength('hello');   // OK
logLength([1, 2, 3]); // OK
logLength(123);       // Error: number 没有 length 属性

// keyof 约束
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}

const obj = { a: 1, b: 2 };
getProperty(obj, 'a'); // OK
getProperty(obj, 'c'); // Error
```

**泛型默认值：**
```typescript
interface Response<T = any> {
  data: T;
  status: number;
}

const res: Response = { data: 'hello', status: 200 };
const res2: Response<number> = { data: 123, status: 200 };
```

---

### 8. 常用的内置工具类型有哪些？

**答案：**

```typescript
interface Person {
  name: string;
  age: number;
  address?: string;
}

// Partial<T> - 所有属性变为可选
type PartialPerson = Partial<Person>;
// { name?: string; age?: number; address?: string }

// Required<T> - 所有属性变为必选
type RequiredPerson = Required<Person>;
// { name: string; age: number; address: string }

// Readonly<T> - 所有属性变为只读
type ReadonlyPerson = Readonly<Person>;
// { readonly name: string; readonly age: number; readonly address?: string }

// Pick<T, K> - 选取部分属性
type NameOnly = Pick<Person, 'name'>;
// { name: string }

// Omit<T, K> - 排除部分属性
type WithoutAge = Omit<Person, 'age'>;
// { name: string; address?: string }

// Record<K, T> - 构造键值对类型
type StringRecord = Record<string, number>;
// { [key: string]: number }

type PageInfo = Record<'home' | 'about' | 'contact', { title: string }>;

// Exclude<T, U> - 从联合类型中排除
type T1 = Exclude<'a' | 'b' | 'c', 'a'>;
// 'b' | 'c'

// Extract<T, U> - 从联合类型中提取
type T2 = Extract<'a' | 'b' | 'c', 'a' | 'f'>;
// 'a'

// NonNullable<T> - 排除 null 和 undefined
type T3 = NonNullable<string | null | undefined>;
// string

// ReturnType<T> - 获取函数返回类型
function fn() {
  return { x: 1, y: 2 };
}
type FnReturn = ReturnType<typeof fn>;
// { x: number; y: number }

// Parameters<T> - 获取函数参数类型
function greet(name: string, age: number) {}
type GreetParams = Parameters<typeof greet>;
// [string, number]

// InstanceType<T> - 获取构造函数实例类型
class Person2 {
  name: string;
}
type PersonInstance = InstanceType<typeof Person2>;
// Person2

// Awaited<T> - 获取 Promise 解析后的类型
type PromiseResult = Awaited<Promise<string>>;
// string

// ThisParameterType<T> - 提取函数 this 参数类型
// OmitThisParameter<T> - 移除函数 this 参数
```

---

### 9. 如何实现自定义工具类型？

**答案：**

```typescript
// 1. 实现 Partial
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

// 2. 实现 Required
type MyRequired<T> = {
  [P in keyof T]-?: T[P]; // -? 移除可选
};

// 3. 实现 Readonly
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};

// 4. 实现 Pick
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// 5. 实现 Omit
type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

// 6. 实现 Record
type MyRecord<K extends keyof any, T> = {
  [P in K]: T;
};

// 7. 实现 Exclude
type MyExclude<T, U> = T extends U ? never : T;

// 8. 实现 Extract
type MyExtract<T, U> = T extends U ? T : never;

// 9. 实现 NonNullable
type MyNonNullable<T> = T extends null | undefined ? never : T;

// 10. 实现 ReturnType
type MyReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any;

// 11. 实现 Parameters
type MyParameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;

// 12. 深层 Partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 13. 深层 Readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 14. 获取对象的可选属性
type OptionalKeys<T> = {
  [K in keyof T]: {} extends Pick<T, K> ? K : never;
}[keyof T];

// 15. 获取对象的必选属性
type RequiredKeys<T> = {
  [K in keyof T]: {} extends Pick<T, K> ? never : K;
}[keyof T];
```

---

### 10. 条件类型和 infer 关键字

**答案：**

**条件类型：**
```typescript
// 基本语法
type TypeName<T> =
  T extends string ? 'string' :
  T extends number ? 'number' :
  T extends boolean ? 'boolean' :
  T extends undefined ? 'undefined' :
  T extends Function ? 'function' :
  'object';

type T1 = TypeName<string>;  // 'string'
type T2 = TypeName<() => void>; // 'function'

// 分布式条件类型
type ToArray<T> = T extends any ? T[] : never;
type StrOrNumArray = ToArray<string | number>;
// string[] | number[]

// 禁止分布式
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type StrOrNumArray2 = ToArrayNonDist<string | number>;
// (string | number)[]
```

**infer 关键字：**
```typescript
// 在条件类型中推断类型

// 获取数组元素类型
type ElementType<T> = T extends (infer E)[] ? E : T;
type T1 = ElementType<string[]>;  // string
type T2 = ElementType<number>;    // number

// 获取函数返回类型
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type T3 = GetReturnType<() => string>;  // string

// 获取函数第一个参数类型
type FirstArg<T> = T extends (first: infer F, ...args: any[]) => any ? F : never;

// 获取 Promise 内部类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type T4 = UnwrapPromise<Promise<string>>;  // string

// 递归解包 Promise
type DeepUnwrapPromise<T> =
  T extends Promise<infer U> ? DeepUnwrapPromise<U> : T;
type T5 = DeepUnwrapPromise<Promise<Promise<string>>>;  // string

// 元组转联合类型
type TupleToUnion<T extends any[]> = T[number];
type T6 = TupleToUnion<[string, number, boolean]>;  // string | number | boolean
```

---

### 11. 模板字面量类型

**答案：**

```typescript
// 基本用法
type Greeting = `Hello, ${string}`;
const g1: Greeting = 'Hello, World';  // OK
const g2: Greeting = 'Hi, World';     // Error

// 组合字面量类型
type Direction = 'top' | 'bottom' | 'left' | 'right';
type Margin = `margin-${Direction}`;
// 'margin-top' | 'margin-bottom' | 'margin-left' | 'margin-right'

// 多个联合类型的组合
type Color = 'red' | 'blue';
type Size = 'small' | 'large';
type Style = `${Color}-${Size}`;
// 'red-small' | 'red-large' | 'blue-small' | 'blue-large'

// 内置字符串操作类型
type Uppercase<S extends string> = intrinsic;
type Lowercase<S extends string> = intrinsic;
type Capitalize<S extends string> = intrinsic;
type Uncapitalize<S extends string> = intrinsic;

type T1 = Uppercase<'hello'>;     // 'HELLO'
type T2 = Lowercase<'HELLO'>;     // 'hello'
type T3 = Capitalize<'hello'>;    // 'Hello'
type T4 = Uncapitalize<'Hello'>;  // 'hello'

// 实际应用：事件处理器类型
type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}`]: (event: T[K]) => void;
};

interface Events {
  click: MouseEvent;
  focus: FocusEvent;
}

type Handlers = EventHandlers<Events>;
// { onClick: (event: MouseEvent) => void; onFocus: (event: FocusEvent) => void }
```

---

## 实践应用

### 12. 如何为第三方库添加类型声明？

**答案：**

**1. 使用 @types 包：**
```bash
npm install @types/lodash -D
```

**2. 创建声明文件（.d.ts）：**
```typescript
// types/my-library.d.ts
declare module 'my-library' {
  export function doSomething(value: string): number;
  export interface Options {
    timeout: number;
    retry: boolean;
  }
  export default class MyClass {
    constructor(options: Options);
    run(): Promise<void>;
  }
}

// 全局声明
declare global {
  interface Window {
    myGlobal: string;
  }
}

// 扩展模块
declare module 'express' {
  interface Request {
    user?: {
      id: string;
      name: string;
    };
  }
}
```

**3. tsconfig.json 配置：**
```json
{
  "compilerOptions": {
    "typeRoots": ["./types", "./node_modules/@types"],
    "types": ["node", "jest"]
  }
}
```

---

### 13. TypeScript 中的装饰器

**答案：**

装饰器是一种特殊的声明，可以附加到类、方法、属性或参数上。

```typescript
// tsconfig.json 需要开启
// "experimentalDecorators": true

// 类装饰器
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
}

// 装饰器工厂
function color(value: string) {
  return function (target: any) {
    target.color = value;
  };
}

@color('red')
class Car {}

// 方法装饰器
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`Result:`, result);
    return result;
  };

  return descriptor;
}

class Calculator {
  @log
  add(a: number, b: number) {
    return a + b;
  }
}

// 属性装饰器
function format(formatString: string) {
  return function (target: any, propertyKey: string) {
    let value: string;

    const getter = function () {
      return `${formatString} ${value}`;
    };

    const setter = function (newVal: string) {
      value = newVal;
    };

    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    });
  };
}

class Person {
  @format('Hello')
  name: string;
}

// 参数装饰器
function required(target: any, propertyKey: string, parameterIndex: number) {
  // 记录必需参数的索引
}
```

---

### 14. TypeScript 配置文件详解

**答案：**

```json
{
  "compilerOptions": {
    // 基本配置
    "target": "ES2020",           // 编译目标
    "module": "ESNext",           // 模块系统
    "lib": ["DOM", "ES2020"],     // 包含的类型声明
    "outDir": "./dist",           // 输出目录
    "rootDir": "./src",           // 源码目录

    // 严格模式
    "strict": true,               // 开启所有严格检查
    "strictNullChecks": true,     // 严格空值检查
    "strictFunctionTypes": true,  // 严格函数类型检查
    "noImplicitAny": true,        // 禁止隐式 any
    "noImplicitThis": true,       // 禁止隐式 this

    // 模块解析
    "moduleResolution": "node",   // 模块解析策略
    "baseUrl": "./",              // 基础路径
    "paths": {                    // 路径别名
      "@/*": ["src/*"]
    },
    "esModuleInterop": true,      // ES 模块互操作
    "allowSyntheticDefaultImports": true,

    // 类型检查
    "skipLibCheck": true,         // 跳过库文件检查
    "forceConsistentCasingInFileNames": true,

    // 输出
    "declaration": true,          // 生成 .d.ts
    "declarationMap": true,       // 生成声明文件的 map
    "sourceMap": true,            // 生成 source map

    // 额外检查
    "noUnusedLocals": true,       // 未使用的局部变量报错
    "noUnusedParameters": true,   // 未使用的参数报错
    "noImplicitReturns": true,    // 隐式返回报错
    "noFallthroughCasesInSwitch": true,

    // 装饰器
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,

    // JSX
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

### 15. 常见 TypeScript 面试代码题

**答案：**

**1. 实现 DeepReadonly：**
```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepReadonly<T[P]>
    : T[P];
};
```

**2. 实现 TupleToObject：**
```typescript
type TupleToObject<T extends readonly (string | number | symbol)[]> = {
  [K in T[number]]: K;
};

const tuple = ['a', 'b', 'c'] as const;
type Result = TupleToObject<typeof tuple>;
// { a: 'a'; b: 'b'; c: 'c' }
```

**3. 实现 First 获取数组第一个元素类型：**
```typescript
type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never;
// 或
type First<T extends any[]> = T['length'] extends 0 ? never : T[0];

type T1 = First<[1, 2, 3]>;  // 1
type T2 = First<[]>;         // never
```

**4. 实现 Last 获取数组最后一个元素类型：**
```typescript
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;

type T1 = Last<[1, 2, 3]>;  // 3
```

**5. 实现 Length 获取元组长度：**
```typescript
type Length<T extends readonly any[]> = T['length'];

type T1 = Length<[1, 2, 3]>;  // 3
```

**6. 实现 Concat 合并元组：**
```typescript
type Concat<T extends any[], U extends any[]> = [...T, ...U];

type T1 = Concat<[1, 2], [3, 4]>;  // [1, 2, 3, 4]
```

**7. 实现 Push 和 Pop：**
```typescript
type Push<T extends any[], U> = [...T, U];
type Pop<T extends any[]> = T extends [...infer R, any] ? R : [];

type T1 = Push<[1, 2], 3>;  // [1, 2, 3]
type T2 = Pop<[1, 2, 3]>;   // [1, 2]
```

**8. 实现 Flatten 扁平化数组类型：**
```typescript
type Flatten<T extends any[]> = T extends [infer First, ...infer Rest]
  ? First extends any[]
    ? [...Flatten<First>, ...Flatten<Rest>]
    : [First, ...Flatten<Rest>]
  : [];

type T1 = Flatten<[1, [2, [3, 4]], 5]>;  // [1, 2, 3, 4, 5]
```

**9. 实现 Trim：**
```typescript
type Space = ' ' | '\n' | '\t';

type TrimLeft<S extends string> = S extends `${Space}${infer R}` ? TrimLeft<R> : S;
type TrimRight<S extends string> = S extends `${infer R}${Space}` ? TrimRight<R> : S;
type Trim<S extends string> = TrimLeft<TrimRight<S>>;

type T1 = Trim<'  hello  '>;  // 'hello'
```

**10. 实现 Replace：**
```typescript
type Replace<S extends string, From extends string, To extends string> =
  From extends ''
    ? S
    : S extends `${infer L}${From}${infer R}`
      ? `${L}${To}${R}`
      : S;

type ReplaceAll<S extends string, From extends string, To extends string> =
  From extends ''
    ? S
    : S extends `${infer L}${From}${infer R}`
      ? ReplaceAll<`${L}${To}${R}`, From, To>
      : S;

type T1 = Replace<'hello world', 'world', 'ts'>;  // 'hello ts'
type T2 = ReplaceAll<'a-b-c', '-', ''>;          // 'abc'
```
