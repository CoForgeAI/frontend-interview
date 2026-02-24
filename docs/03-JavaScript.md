# JavaScript 基础面试题

## 数据类型

### 🔸 JavaScript 有哪些数据类型？如何判断？

**答案：**

**基本类型（7种）：**
- `string`
- `number`
- `boolean`
- `undefined`
- `null`
- `symbol`（ES6）
- `bigint`（ES2020）

**引用类型：**
- `object`（包括 Array、Function、Date、RegExp 等）

**判断方法：**

```javascript
// 1. typeof（适合基本类型，但 null 和数组有坑）
typeof 'hello'      // 'string'
typeof 123          // 'number'
typeof true         // 'boolean'
typeof undefined    // 'undefined'
typeof Symbol()     // 'symbol'
typeof 123n         // 'bigint'
typeof null         // 'object'（历史遗留 bug）
typeof []           // 'object'
typeof {}           // 'object'
typeof function(){} // 'function'

// 2. instanceof（判断原型链，适合引用类型）
[] instanceof Array    // true
{} instanceof Object   // true
(() => {}) instanceof Function // true

// 3. Object.prototype.toString.call()（最准确）
Object.prototype.toString.call('hello')     // '[object String]'
Object.prototype.toString.call(123)         // '[object Number]'
Object.prototype.toString.call(null)        // '[object Null]'
Object.prototype.toString.call(undefined)   // '[object Undefined]'
Object.prototype.toString.call([])          // '[object Array]'
Object.prototype.toString.call({})          // '[object Object]'
Object.prototype.toString.call(() => {})    // '[object Function]'

// 4. Array.isArray()（专门判断数组）
Array.isArray([])  // true
Array.isArray({})  // false

// 封装通用类型判断
function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}
```

---

### 🔸 描述下列代码的执行结果

**题目：**
```javascript
foo(typeof a);
function foo(p) {
  console.log(this);
  console.log(p);
  console.log(typeof b);
  let b = 0;
}
```

**答案：**

```javascript
// 输出结果：
// 1. window（或 global 对象）
// 2. 'undefined'
// 3. ReferenceError: Cannot access 'b' before initialization
```

**详细解析：**

**第 1 行：`foo(typeof a);`**
- `typeof a`：变量 `a` 未声明，但 `typeof` 对未声明的变量不会报错，返回 `'undefined'`
- 调用 `foo('undefined')`

**第 2 行：`function foo(p) {`**
- 函数声明，参数 `p` 的值为 `'undefined'`

**第 3 行：`console.log(this);`**
- 普通函数调用，非严格模式下 `this` 指向全局对象
- 浏览器中为 `window`，Node.js 中为 `global`
- 输出：`window` 或 `global`

**第 4 行：`console.log(p);`**
- 输出参数 `p` 的值
- 输出：`'undefined'`

**第 5 行：`console.log(typeof b);`**
- 变量 `b` 使用 `let` 声明，存在暂时性死区（TDZ）
- 在声明之前访问会报错
- **抛出错误：`ReferenceError: Cannot access 'b' before initialization`**

**第 6 行：`let b = 0;`**
- 由于第 5 行已经报错，这行代码不会执行

**关键知识点：**

1. **`typeof` 对未声明变量的行为**
   ```javascript
   console.log(typeof undeclaredVar); // 'undefined'（不报错）
   console.log(undeclaredVar);        // ReferenceError（报错）
   ```

2. **暂时性死区（TDZ）**
   ```javascript
   console.log(x); // ReferenceError
   let x = 1;

   // 对比 var
   console.log(y); // undefined（不报错）
   var y = 1;
   ```

3. **`typeof` 对暂时性死区变量的行为**
   ```javascript
   typeof x;  // ReferenceError（let/const 声明的变量）
   let x = 1;

   typeof y;  // 'undefined'（var 声明的变量）
   var y = 1;

   typeof z;  // 'undefined'（未声明的变量）
   ```

**变体题目：**

```javascript
// 如果改成 var
foo(typeof a);
function foo(p) {
  console.log(this);     // window
  console.log(p);        // 'undefined'
  console.log(typeof b); // 'undefined'（不报错）
  var b = 0;
}
// 可以正常执行完
```

```javascript
// 严格模式
'use strict';
foo(typeof a);
function foo(p) {
  console.log(this);     // undefined（严格模式下函数调用 this 为 undefined）
  console.log(p);        // 'undefined'
  console.log(typeof b); // ReferenceError
  let b = 0;
}
```

---

### 🔸 null 和 undefined 的区别？

**答案：**

| 特性 | null | undefined |
|------|------|-----------|
| 含义 | 空对象指针，表示"无"的对象 | 未定义，表示"无"的原始值 |
| typeof | 'object' | 'undefined' |
| 转为数值 | 0 | NaN |
| 出现场景 | 主动赋值 | 变量声明未赋值、函数无返回值、访问不存在的属性 |

```javascript
// 转换为数值
Number(null)       // 0
Number(undefined)  // NaN

// 相等性
null == undefined  // true
null === undefined // false

// 使用场景
let obj = null;        // 明确表示空对象
let value;             // undefined，变量已声明但未赋值
function fn() {}       // 返回 undefined
let obj2 = {};
console.log(obj2.a);   // undefined，属性不存在
```

---

### 🔸 == 和 === 的区别？

**答案：**

- `==`：相等运算符，会进行类型转换
- `===`：严格相等运算符，不进行类型转换

```javascript
// === 严格相等
1 === 1      // true
1 === '1'    // false
null === undefined // false

// == 类型转换规则
1 == '1'     // true，字符串转数字
1 == true    // true，布尔转数字
'1' == true  // true
null == undefined // true
NaN == NaN   // false（NaN 不等于任何值，包括自己）

// 对象与原始值比较
[1] == 1     // true，[1].valueOf() -> [1], [1].toString() -> '1' -> 1
[1,2] == '1,2' // true

// 建议：始终使用 ===
```

**类型转换规则：**
1. 如果有布尔值，转为数字（true -> 1，false -> 0）
2. 如果是字符串和数字比较，字符串转数字
3. 如果是对象和原始值比较，对象调用 valueOf() 和 toString()
4. null 和 undefined 相等，但不等于其他值

---

### 🔸 什么是类型转换？有哪些转换规则？

**答案：**

**转换为字符串：**
```javascript
String(123)       // '123'
String(true)      // 'true'
String(null)      // 'null'
String(undefined) // 'undefined'
String({})        // '[object Object]'
String([1,2])     // '1,2'

// 或使用 toString()
(123).toString()  // '123'
```

**转换为数字：**
```javascript
Number('123')     // 123
Number('123abc')  // NaN
Number('')        // 0
Number(true)      // 1
Number(false)     // 0
Number(null)      // 0
Number(undefined) // NaN
Number([])        // 0
Number([1])       // 1
Number([1,2])     // NaN
Number({})        // NaN

// 或使用 parseInt/parseFloat
parseInt('123abc')  // 123
parseFloat('3.14px') // 3.14
```

**转换为布尔值：**
```javascript
// 假值（转为 false）
Boolean(0)         // false
Boolean(-0)        // false
Boolean('')        // false
Boolean(null)      // false
Boolean(undefined) // false
Boolean(NaN)       // false

// 其他都是真值（转为 true）
Boolean(1)         // true
Boolean('hello')   // true
Boolean({})        // true
Boolean([])        // true
```

---

### 🔸 深拷贝和浅拷贝的区别？如何实现？

**答案：**

**浅拷贝：** 只复制第一层，嵌套对象仍是引用

**深拷贝：** 完全复制，包括所有嵌套对象

**浅拷贝方法：**
```javascript
// 1. Object.assign
const copy1 = Object.assign({}, obj);

// 2. 展开运算符
const copy2 = { ...obj };

// 3. Array.slice / Array.concat
const arrCopy = arr.slice();
const arrCopy2 = [].concat(arr);
```

**深拷贝方法：**
```javascript
// 1. JSON 方法（有局限性）
const copy = JSON.parse(JSON.stringify(obj));
// 局限：不能处理 function、undefined、Symbol、循环引用、Date、RegExp 等

// 2. structuredClone（现代浏览器）
const copy = structuredClone(obj);
// 支持循环引用，但不支持 function、Symbol

// 3. 手写深拷贝
function deepClone(obj, map = new WeakMap()) {
  // 处理 null 和非对象
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 处理循环引用
  if (map.has(obj)) {
    return map.get(obj);
  }

  // 处理 Date
  if (obj instanceof Date) {
    return new Date(obj);
  }

  // 处理 RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }

  // 处理 Map
  if (obj instanceof Map) {
    const cloneMap = new Map();
    map.set(obj, cloneMap);
    obj.forEach((value, key) => {
      cloneMap.set(deepClone(key, map), deepClone(value, map));
    });
    return cloneMap;
  }

  // 处理 Set
  if (obj instanceof Set) {
    const cloneSet = new Set();
    map.set(obj, cloneSet);
    obj.forEach(value => {
      cloneSet.add(deepClone(value, map));
    });
    return cloneSet;
  }

  // 处理数组和普通对象
  const clone = Array.isArray(obj) ? [] : {};
  map.set(obj, clone);

  // 复制所有属性（包括 Symbol）
  const keys = [...Object.keys(obj), ...Object.getOwnPropertySymbols(obj)];
  for (const key of keys) {
    clone[key] = deepClone(obj[key], map);
  }

  return clone;
}
```

---

## 作用域与闭包

### 🔸 什么是作用域？有哪些类型？

**答案：**

作用域决定了变量的可访问范围。

**类型：**
1. **全局作用域**：在任何地方都能访问
2. **函数作用域**：函数内部声明的变量
3. **块级作用域**（ES6）：let/const 在 {} 内声明的变量

```javascript
// 全局作用域
var globalVar = 'global';

function foo() {
  // 函数作用域
  var functionVar = 'function';

  if (true) {
    // 块级作用域（let/const）
    let blockVar = 'block';
    var notBlockVar = 'not block'; // var 没有块级作用域
  }

  console.log(notBlockVar); // 'not block'
  console.log(blockVar);    // ReferenceError
}
```

**作用域链：**
当访问一个变量时，会从当前作用域开始，逐级向上查找，直到全局作用域。

```javascript
const a = 1;

function outer() {
  const b = 2;

  function inner() {
    const c = 3;
    console.log(a, b, c); // 1, 2, 3 - 通过作用域链查找
  }

  inner();
}
```

---

### 🔸 什么是闭包？有哪些应用场景？

**答案：**

闭包是指函数可以访问其词法作用域外的变量，即使该函数在其词法作用域外执行。

```javascript
function outer() {
  const count = 0;

  return function inner() {
    // inner 函数引用了 outer 的变量 count，形成闭包
    return count;
  };
}

const fn = outer();
fn(); // 0 - 即使 outer 执行完毕，count 仍然可以访问
```

**应用场景：**

**1. 数据私有化：**
```javascript
function createCounter() {
  let count = 0; // 私有变量

  return {
    increment() { return ++count; },
    decrement() { return --count; },
    getCount() { return count; }
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.getCount();  // 1
// 无法直接访问 count
```

**2. 函数柯里化：**
```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...moreArgs) {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
}

const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);
curriedAdd(1)(2)(3); // 6
curriedAdd(1, 2)(3); // 6
```

**3. 防抖/节流：**
```javascript
function debounce(fn, delay) {
  let timer = null; // 闭包保存 timer

  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
```

**4. 循环中的闭包问题：**
```javascript
// 问题代码
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 输出: 3, 3, 3

// 解决方案 1：使用 let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 输出: 0, 1, 2

// 解决方案 2：使用闭包
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 100);
  })(i);
}
// 输出: 0, 1, 2
```

---

### 🔸 var、let、const 的区别？

**答案：**

| 特性 | var | let | const |
|------|-----|-----|-------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | 是（初始化为 undefined） | 是（暂时性死区） | 是（暂时性死区） |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 重新赋值 | 允许 | 允许 | 不允许（引用类型的属性可改） |
| 全局对象属性 | 是（window.xxx） | 否 | 否 |

```javascript
// 变量提升
console.log(a); // undefined
var a = 1;

console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 2;

// 暂时性死区（TDZ）
let x = 1;
{
  console.log(x); // ReferenceError
  let x = 2;
}

// const 引用类型
const obj = { a: 1 };
obj.a = 2;      // 允许
obj = {};       // TypeError

// 全局对象
var foo = 1;
console.log(window.foo); // 1

let bar = 2;
console.log(window.bar); // undefined
```

---

### 🔸 变量提升和函数提升的优先级？

**答案：**

**函数声明的提升优先级高于变量声明**。当函数声明和变量声明同名时，函数声明会覆盖变量声明。

**经典面试题：**
```javascript
foo();
var foo;
function foo() {
  console.log(1);
}

foo = function() {
  console.log(2);
}

// 输出：1
```

**执行过程分析：**

```javascript
// 1. 提升阶段（编译阶段）
function foo() {  // 函数声明提升，且完整初始化
  console.log(1);
}
var foo;  // 变量声明提升，但被忽略（因为 foo 已经被函数声明定义）

// 2. 执行阶段
foo();  // 调用函数，输出 1

foo = function() {  // 函数表达式赋值（在调用之后）
  console.log(2);
}
```

**提升规则总结：**

| 类型 | 提升内容 | 初始化 | 优先级 |
|------|---------|--------|--------|
| 函数声明 `function foo(){}` | 完整提升（包括函数体） | 立即初始化 | 最高 |
| 变量声明 `var foo` | 只提升声明 | 初始化为 undefined | 低 |
| 函数表达式 `var foo = function(){}` | 按变量提升规则 | undefined | 低 |
| let/const | 提升但不初始化 | 暂时性死区 | - |

**更多示例：**

```javascript
// 示例 1：函数声明优先于变量声明
console.log(foo); // [Function: foo]
var foo = 'variable';
function foo() {
  return 'function';
}
console.log(foo); // 'variable'

// 等价于：
function foo() {
  return 'function';
}
// var foo; 被忽略
console.log(foo); // [Function: foo]
foo = 'variable';
console.log(foo); // 'variable'
```

```javascript
// 示例 2：多个同名函数声明
function foo() {
  console.log(1);
}
function foo() {
  console.log(2);
}
function foo() {
  console.log(3);
}
foo(); // 输出 3（后面的函数声明会覆盖前面的）
```

```javascript
// 示例 3：函数表达式不会提升函数体
console.log(foo); // undefined
var foo = function() {
  console.log('hello');
};
console.log(foo); // [Function: foo]

// 等价于：
var foo;
console.log(foo); // undefined
foo = function() {
  console.log('hello');
};
console.log(foo); // [Function: foo]
```

```javascript
// 示例 4：调用顺序很重要
var foo;
function foo() {
  console.log(1);
}

foo = function() {
  console.log(2);
}

foo(); // 输出 2（调用在赋值之后）
```

**关键点：**
1. **函数声明**会完整提升，包括函数体
2. **变量声明**只提升声明，不提升赋值
3. **同名时**，函数声明优先级更高，会覆盖变量声明
4. **函数表达式**的赋值发生在执行阶段，不影响提升阶段
5. **多个同名函数声明**，后面的会覆盖前面的

---

## this 指向

### 🔸 this 指向有哪些规则？

**答案：**

**1. 默认绑定（普通函数调用）：**
```javascript
function foo() {
  console.log(this);
}
foo(); // window（非严格模式）/ undefined（严格模式）
```

**2. 隐式绑定（对象方法调用）：**
```javascript
const obj = {
  name: 'obj',
  foo() {
    console.log(this.name);
  }
};
obj.foo(); // 'obj'

// 隐式丢失
const fn = obj.foo;
fn(); // undefined（this 指向 window）
```

**3. 显式绑定（call/apply/bind）：**
```javascript
function foo() {
  console.log(this.name);
}

const obj = { name: 'obj' };

foo.call(obj);    // 'obj'
foo.apply(obj);   // 'obj'
foo.bind(obj)();  // 'obj'
```

**4. new 绑定：**
```javascript
function Person(name) {
  this.name = name;
}
const p = new Person('张三');
console.log(p.name); // '张三'
```

**5. 箭头函数：**
```javascript
const obj = {
  name: 'obj',
  foo: () => {
    console.log(this.name); // undefined，箭头函数没有自己的 this
  },
  bar() {
    const inner = () => {
      console.log(this.name); // 'obj'，继承 bar 的 this
    };
    inner();
  }
};
```

**优先级：**
new 绑定 > 显式绑定 > 隐式绑定 > 默认绑定

---

### 🔸 call、apply、bind 的区别？如何手写实现？

**答案：**

| 方法 | 参数 | 返回值 | 执行时机 |
|------|------|--------|----------|
| call | (thisArg, arg1, arg2, ...) | 函数执行结果 | 立即执行 |
| apply | (thisArg, [args]) | 函数执行结果 | 立即执行 |
| bind | (thisArg, arg1, arg2, ...) | 新函数 | 返回函数，不执行 |

```javascript
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

const obj = { name: '张三' };

greet.call(obj, 'Hello', '!');  // 'Hello, 张三!'
greet.apply(obj, ['Hello', '!']); // 'Hello, 张三!'
const boundGreet = greet.bind(obj, 'Hello');
boundGreet('!'); // 'Hello, 张三!'
```

**手写实现：**

```javascript
// 手写 call
Function.prototype.myCall = function(context, ...args) {
  context = context == null ? window : Object(context);
  const key = Symbol();
  context[key] = this;
  const result = context[key](...args);
  delete context[key];
  return result;
};

// 手写 apply
Function.prototype.myApply = function(context, args = []) {
  context = context == null ? window : Object(context);
  const key = Symbol();
  context[key] = this;
  const result = context[key](...args);
  delete context[key];
  return result;
};

// 手写 bind
Function.prototype.myBind = function(context, ...args) {
  const fn = this;

  return function Bound(...newArgs) {
    // 处理 new 调用的情况
    if (this instanceof Bound) {
      return new fn(...args, ...newArgs);
    }
    return fn.apply(context, [...args, ...newArgs]);
  };
};
```

---

## 原型与继承

### 🔸 原型和原型链是什么？

**答案：**

**原型（Prototype）：**
- 每个函数都有 `prototype` 属性，指向原型对象
- 每个对象都有 `__proto__` 属性，指向其构造函数的原型对象
- 原型对象有 `constructor` 属性，指向构造函数

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`);
};

const p = new Person('张三');

// 原型关系
p.__proto__ === Person.prototype // true
Person.prototype.constructor === Person // true
Person.prototype.__proto__ === Object.prototype // true
Object.prototype.__proto__ === null // true
```

**原型链：**
当访问对象属性时，如果对象本身没有，会沿着 `__proto__` 向上查找，直到 `null`。

```javascript
// 查找过程
p.sayHello(); // 在 p.__proto__（Person.prototype）上找到
p.toString(); // 在 p.__proto__.__proto__（Object.prototype）上找到
```

```
p -> Person.prototype -> Object.prototype -> null
```

---

### 🔸 实现继承的方式有哪些？

**答案：**

**1. 原型链继承：**
```javascript
function Parent() {
  this.colors = ['red', 'blue'];
}
Parent.prototype.getColors = function() {
  return this.colors;
};

function Child() {}
Child.prototype = new Parent();

// 问题：所有实例共享引用类型属性
const c1 = new Child();
const c2 = new Child();
c1.colors.push('green');
console.log(c2.colors); // ['red', 'blue', 'green']
```

**2. 构造函数继承：**
```javascript
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}

function Child(name) {
  Parent.call(this, name);
}

// 问题：无法继承原型上的方法
```

**3. 组合继承：**
```javascript
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}
Parent.prototype.sayName = function() {
  console.log(this.name);
};

function Child(name, age) {
  Parent.call(this, name); // 第一次调用
  this.age = age;
}
Child.prototype = new Parent(); // 第二次调用
Child.prototype.constructor = Child;

// 问题：Parent 构造函数被调用两次
```

**4. 寄生组合继承（推荐）：**
```javascript
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}
Parent.prototype.sayName = function() {
  console.log(this.name);
};

function Child(name, age) {
  Parent.call(this, name);
  this.age = age;
}

// 核心：使用 Object.create 创建原型
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

Child.prototype.sayAge = function() {
  console.log(this.age);
};
```

**5. ES6 class 继承：**
```javascript
class Parent {
  constructor(name) {
    this.name = name;
  }

  sayName() {
    console.log(this.name);
  }
}

class Child extends Parent {
  constructor(name, age) {
    super(name); // 必须先调用 super
    this.age = age;
  }

  sayAge() {
    console.log(this.age);
  }
}
```

---

### 🔸 new 操作符做了什么？如何手写实现？

**答案：**

**new 操作符的步骤：**
1. 创建一个新的空对象
2. 将新对象的 `__proto__` 指向构造函数的 `prototype`
3. 执行构造函数，并将 `this` 绑定到新对象
4. 如果构造函数返回对象，则返回该对象；否则返回新创建的对象

```javascript
function myNew(Constructor, ...args) {
  // 1. 创建新对象，原型指向构造函数的 prototype
  const obj = Object.create(Constructor.prototype);

  // 2. 执行构造函数
  const result = Constructor.apply(obj, args);

  // 3. 如果构造函数返回对象，则返回该对象；否则返回新对象
  return result instanceof Object ? result : obj;
}

// 测试
function Person(name) {
  this.name = name;
}
Person.prototype.sayHello = function() {
  console.log(`Hello, ${this.name}`);
};

const p = myNew(Person, '张三');
p.sayHello(); // 'Hello, 张三'
p instanceof Person; // true
```

---

### 🔸 如何确保构造函数只能被 new 调用，而不能被普通调用？

**答案：**

有以下几种方法可以实现：

**方法1：使用 new.target（ES6 推荐）**

```javascript
function Person(name) {
  // 检查是否通过 new 调用
  if (!new.target) {
    throw new Error('Person 必须使用 new 调用');
  }
  this.name = name;
}

// 正确调用
const p1 = new Person('张三'); // ✓

// 错误调用
const p2 = Person('李四'); // ✗ 抛出错误
```

**方法2：使用 instanceof 检查**

```javascript
function Person(name) {
  if (!(this instanceof Person)) {
    throw new Error('Person 必须使用 new 调用');
  }
  this.name = name;
}
```

**方法3：使用 ES6 Class（自动强制 new）**

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
}

// Class 自动强制必须用 new 调用
const p1 = new Person('张三'); // ✓
const p2 = Person('李四');     // ✗ TypeError: Class constructor cannot be invoked without 'new'
```

**方法4：自动修正（不推荐，但可以了解）**

```javascript
function Person(name) {
  // 如果没有用 new 调用，自动返回一个 new 实例
  if (!(this instanceof Person)) {
    return new Person(name);
  }
  this.name = name;
}

// 两种方式都能工作
const p1 = new Person('张三'); // ✓
const p2 = Person('李四');     // ✓ 自动转换为 new Person('李四')
```

**推荐做法：**
- 现代项目推荐使用 **ES6 Class** 或 **new.target**
- new.target 在构造函数中会指向被 new 调用的构造函数，普通调用时为 undefined
- ES6 Class 是最简洁和最安全的方式，会自动强制 new 调用

---

## 异步编程

### 🔸 什么是事件循环（Event Loop）？

**答案：**

JavaScript 是单线程语言，通过事件循环实现异步操作。

**执行顺序：**
1. 执行同步代码（调用栈）
2. 清空微任务队列
3. 执行一个宏任务
4. 重复 2-3

**宏任务（Macro Task）：**
- script 整体代码
- setTimeout / setInterval
- setImmediate（Node.js）
- I/O
- UI rendering

**微任务（Micro Task）：**
- Promise.then/catch/finally
- MutationObserver
- queueMicrotask
- process.nextTick（Node.js）

```javascript
console.log('1'); // 同步

setTimeout(() => {
  console.log('2'); // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log('3'); // 微任务
});

console.log('4'); // 同步

// 输出顺序：1, 4, 3, 2
```

**复杂示例：**
```javascript
console.log('start');

setTimeout(() => {
  console.log('setTimeout 1');
  Promise.resolve().then(() => {
    console.log('promise in setTimeout');
  });
}, 0);

Promise.resolve().then(() => {
  console.log('promise 1');
  setTimeout(() => {
    console.log('setTimeout in promise');
  }, 0);
}).then(() => {
  console.log('promise 2');
});

console.log('end');

// 输出：start, end, promise 1, promise 2, setTimeout 1, promise in setTimeout, setTimeout in promise
```

---

### 🔸 Promise 的理解和使用？

**答案：**

**三种状态：**
- `pending`：进行中
- `fulfilled`：已成功
- `rejected`：已失败

状态一旦改变就不会再变。

**基本用法：**
```javascript
const promise = new Promise((resolve, reject) => {
  // 异步操作
  if (success) {
    resolve(value);
  } else {
    reject(error);
  }
});

promise
  .then(value => {
    // 成功处理
  })
  .catch(error => {
    // 错误处理
  })
  .finally(() => {
    // 无论成功失败都执行
  });
```

**静态方法：**
```javascript
// Promise.all - 全部成功才成功，一个失败就失败
Promise.all([p1, p2, p3]).then(results => {});

// Promise.allSettled - 等待所有完成，无论成功失败
Promise.allSettled([p1, p2, p3]).then(results => {
  // results: [{ status: 'fulfilled', value }, { status: 'rejected', reason }]
});

// Promise.race - 返回最快的那个
Promise.race([p1, p2, p3]).then(result => {});

// Promise.any - 返回第一个成功的，全部失败才失败
Promise.any([p1, p2, p3]).then(result => {});

// Promise.resolve / Promise.reject
Promise.resolve(42);
Promise.reject(new Error('error'));
```

**链式调用：**
```javascript
fetch('/api/user')
  .then(res => res.json())
  .then(user => fetch(`/api/posts/${user.id}`))
  .then(res => res.json())
  .then(posts => console.log(posts))
  .catch(err => console.error(err));
```

---

### 🔸 手写 Promise

**答案：**

```javascript
class MyPromise {
  static PENDING = 'pending';
  static FULFILLED = 'fulfilled';
  static REJECTED = 'rejected';

  constructor(executor) {
    this.status = MyPromise.PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.status === MyPromise.PENDING) {
        this.status = MyPromise.FULFILLED;
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };

    const reject = (reason) => {
      if (this.status === MyPromise.PENDING) {
        this.status = MyPromise.REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    // 处理值穿透
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };

    const promise2 = new MyPromise((resolve, reject) => {
      const fulfilledMicrotask = () => {
        queueMicrotask(() => {
          try {
            const x = onFulfilled(this.value);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      };

      const rejectedMicrotask = () => {
        queueMicrotask(() => {
          try {
            const x = onRejected(this.reason);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      };

      if (this.status === MyPromise.FULFILLED) {
        fulfilledMicrotask();
      } else if (this.status === MyPromise.REJECTED) {
        rejectedMicrotask();
      } else {
        this.onFulfilledCallbacks.push(fulfilledMicrotask);
        this.onRejectedCallbacks.push(rejectedMicrotask);
      }
    });

    return promise2;
  }

  resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
      return reject(new TypeError('Chaining cycle detected'));
    }

    if (x instanceof MyPromise) {
      x.then(resolve, reject);
    } else if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
      let called = false;
      try {
        const then = x.then;
        if (typeof then === 'function') {
          then.call(
            x,
            y => {
              if (called) return;
              called = true;
              this.resolvePromise(promise2, y, resolve, reject);
            },
            r => {
              if (called) return;
              called = true;
              reject(r);
            }
          );
        } else {
          resolve(x);
        }
      } catch (error) {
        if (called) return;
        reject(error);
      }
    } else {
      resolve(x);
    }
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(callback) {
    return this.then(
      value => MyPromise.resolve(callback()).then(() => value),
      reason => MyPromise.resolve(callback()).then(() => { throw reason })
    );
  }

  static resolve(value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise(resolve => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = [];
      let count = 0;

      if (promises.length === 0) {
        return resolve(results);
      }

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          value => {
            results[index] = value;
            count++;
            if (count === promises.length) {
              resolve(results);
            }
          },
          reject
        );
      });
    });
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(promise => {
        MyPromise.resolve(promise).then(resolve, reject);
      });
    });
  }
}
```

---

### 🔸 async/await 的理解？

**答案：**

async/await 是 Promise 的语法糖，让异步代码看起来像同步代码。

```javascript
// Promise 写法
function fetchData() {
  return fetch('/api/user')
    .then(res => res.json())
    .then(user => fetch(`/api/posts/${user.id}`))
    .then(res => res.json());
}

// async/await 写法
async function fetchData() {
  const userRes = await fetch('/api/user');
  const user = await userRes.json();
  const postsRes = await fetch(`/api/posts/${user.id}`);
  return await postsRes.json();
}
```

**错误处理：**
```javascript
// try-catch
async function fetchData() {
  try {
    const res = await fetch('/api/data');
    return await res.json();
  } catch (error) {
    console.error(error);
  }
}

// 或者 catch
fetchData().catch(console.error);
```

**并行执行：**
```javascript
// 串行（慢）
async function serial() {
  const a = await fetch('/api/a');
  const b = await fetch('/api/b');
}

// 并行（快）
async function parallel() {
  const [a, b] = await Promise.all([
    fetch('/api/a'),
    fetch('/api/b')
  ]);
}
```

**注意事项：**
```javascript
// forEach 中 await 不生效
arr.forEach(async (item) => {
  await doSomething(item); // 不会等待
});

// 使用 for...of
for (const item of arr) {
  await doSomething(item); // 串行执行
}

// 或 Promise.all
await Promise.all(arr.map(item => doSomething(item))); // 并行执行
```

---

### 🔸 async/await 的实现原理是什么？

**答案：**

async/await 的实现原理基于 **Generator 函数** 和 **Promise**。

**核心概念：**
- `async` 函数返回一个 Promise
- `await` 等待一个 Promise 完成
- 本质上是 Generator + 自动执行器的语法糖

**Generator 基础：**
```javascript
// Generator 函数
function* gen() {
  const a = yield Promise.resolve(1);
  console.log(a); // 1
  const b = yield Promise.resolve(2);
  console.log(b); // 2
  return a + b;
}

// 手动执行
const g = gen();
g.next().value.then(val => {
  g.next(val).value.then(val => {
    const result = g.next(val);
    console.log(result.value); // 3
  });
});
```

**async/await 等价实现：**
```javascript
// async/await 写法
async function asyncFn() {
  const a = await Promise.resolve(1);
  console.log(a); // 1
  const b = await Promise.resolve(2);
  console.log(b); // 2
  return a + b;
}

// 等价于 Generator + 自动执行器
function* generatorFn() {
  const a = yield Promise.resolve(1);
  console.log(a);
  const b = yield Promise.resolve(2);
  console.log(b);
  return a + b;
}

// 自动执行器
function asyncToGenerator(generatorFn) {
  return function() {
    const gen = generatorFn.apply(this, arguments);

    return new Promise((resolve, reject) => {
      function step(key, arg) {
        let result;
        try {
          result = gen[key](arg);
        } catch (error) {
          return reject(error);
        }

        const { value, done } = result;

        if (done) {
          return resolve(value);
        } else {
          return Promise.resolve(value).then(
            val => step('next', val),
            err => step('throw', err)
          );
        }
      }

      step('next');
    });
  };
}

// 使用
const asyncFnFromGenerator = asyncToGenerator(generatorFn);
asyncFnFromGenerator().then(result => console.log(result)); // 3
```

**完整实现（支持错误处理）：**
```javascript
function asyncToGenerator(generatorFn) {
  return function(...args) {
    const gen = generatorFn.apply(this, args);

    return new Promise((resolve, reject) => {
      function step(key, arg) {
        let result;

        try {
          result = gen[key](arg);
        } catch (error) {
          return reject(error);
        }

        const { value, done } = result;

        if (done) {
          // Generator 执行完毕
          return resolve(value);
        }

        // 将 value 转为 Promise，继续执行
        return Promise.resolve(value).then(
          // 成功时继续执行 next
          val => step('next', val),
          // 失败时执行 throw，触发 Generator 内的 try-catch
          err => step('throw', err)
        );
      }

      // 开始执行
      step('next');
    });
  };
}
```

**使用示例：**
```javascript
// 使用 Generator 模拟 async/await
function* fetchUser() {
  try {
    const user = yield fetch('/api/user').then(r => r.json());
    console.log('用户:', user);

    const posts = yield fetch(`/api/posts/${user.id}`).then(r => r.json());
    console.log('文章:', posts);

    return posts;
  } catch (error) {
    console.error('错误:', error);
  }
}

// 转换为 async 函数
const asyncFetchUser = asyncToGenerator(fetchUser);

// 调用
asyncFetchUser().then(posts => {
  console.log('完成:', posts);
});
```

**Babel 转译示例：**
```javascript
// 原始代码
async function foo() {
  const result = await bar();
  return result;
}

// Babel 转译后（简化版）
function foo() {
  return _asyncToGenerator(function* () {
    const result = yield bar();
    return result;
  }).apply(this, arguments);
}

function _asyncToGenerator(fn) {
  return function() {
    var self = this, args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(undefined);
    });
  };
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}
```

**核心原理总结：**

1. **async 函数返回 Promise**
   ```javascript
   async function foo() {
     return 1;
   }
   // 等价于
   function foo() {
     return Promise.resolve(1);
   }
   ```

2. **await 暂停执行**
   - await 表达式会暂停 async 函数的执行
   - 等待 Promise resolve
   - 然后恢复执行并返回 resolve 的值

3. **错误处理**
   ```javascript
   async function foo() {
     try {
       await Promise.reject('error');
     } catch (e) {
       console.log(e); // 'error'
     }
   }

   // Generator 实现
   function* foo() {
     try {
       yield Promise.reject('error');
     } catch (e) {
       console.log(e); // 'error'
     }
   }
   ```

4. **执行流程**
   - 遇到 await，将后续代码包装成微任务
   - 等待 Promise 完成
   - 将结果传回，继续执行

**关键特性：**
- async 函数总是返回 Promise
- await 只能在 async 函数内使用
- await 后面可以是任意值（会被自动包装为 Promise）
- 错误会被转换为 rejected Promise
- 支持 try-catch 捕获异步错误

---

### 🔸 try...catch 可以捕获到异步代码中的错误吗？

**答案：**

**简短回答：** 不一定。`try...catch` 只能捕获**同步代码**和 **async/await** 中的错误，无法捕获 setTimeout、Promise 等传统异步代码的错误。

#### 1. try...catch 无法捕获 setTimeout 错误

```javascript
// ❌ 无法捕获
try {
  setTimeout(() => {
    throw new Error('setTimeout 错误');
  }, 1000);
} catch (e) {
  console.log('捕获到错误:', e.message); // 不会执行
}
// 错误会直接抛到全局，导致程序崩溃
```

**原因：** `setTimeout` 是异步的，当回调执行时，`try...catch` 已经执行完毕并退出了调用栈。

#### 2. try...catch 无法捕获 Promise 错误

```javascript
// ❌ 无法捕获
try {
  Promise.reject('Promise 错误');
} catch (e) {
  console.log('捕获到错误:', e); // 不会执行
}
// 会产生 UnhandledPromiseRejection 警告

// ❌ 即使是 Promise.then 也不行
try {
  fetch('/api/data').then(res => res.json());
} catch (e) {
  console.log('捕获到错误:', e); // 不会执行
}
```

**原因：** Promise 的错误是通过 `.catch()` 或第二个回调参数处理的，不会被 `try...catch` 捕获。

#### 3. async/await 可以用 try...catch 捕获

```javascript
// ✅ 可以捕获
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (e) {
    console.log('捕获到错误:', e.message); // 能够捕获
    return null;
  }
}

// ✅ 也可以捕获 await 后的同步错误
async function test() {
  try {
    await Promise.reject('错误');
    // 或者
    await new Promise((resolve, reject) => {
      setTimeout(() => reject('延迟错误'), 1000);
    });
  } catch (e) {
    console.log('捕获到:', e); // 都能捕获
  }
}
```

**原因：** `async/await` 本质上是 Promise 的语法糖，`await` 会等待 Promise 执行，如果 Promise 被 reject，会将错误转换为同步形式抛出，从而能被 `try...catch` 捕获。

#### 4. 不同场景的错误处理对比

| 场景 | 能否用 try...catch | 正确处理方式 | 示例 |
|------|-------------------|-------------|------|
| 同步代码 | ✅ 可以 | `try...catch` | `try { JSON.parse('') } catch(e) {}` |
| setTimeout | ❌ 不可以 | 回调内部 try...catch | `setTimeout(() => { try {} catch(e) {} })` |
| Promise | ❌ 不可以 | `.catch()` 或第二个参数 | `promise.catch(e => {})` |
| async/await | ✅ 可以 | `try...catch` | `try { await promise } catch(e) {}` |
| Promise.all | ❌ 不可以（除非用 await） | `.catch()` | `Promise.all([...]).catch(e => {})` |
| async/await + Promise.all | ✅ 可以 | `try...catch` | `try { await Promise.all([...]) } catch(e) {}` |

#### 5. 混合场景示例

```javascript
// ❌ 错误示例：混用导致无法捕获
async function badExample() {
  try {
    // 这个不会被 catch 捕获（没有 await）
    fetch('/api').then(res => res.json());

    // 这个会被 catch 捕获
    await fetch('/api2');
  } catch (e) {
    console.log(e); // 只能捕获第二个 fetch 的错误
  }
}

// ✅ 正确示例：统一使用 await
async function goodExample() {
  try {
    // 都使用 await，所有错误都能被捕获
    const res1 = await fetch('/api');
    const data1 = await res1.json();

    const res2 = await fetch('/api2');
    const data2 = await res2.json();
  } catch (e) {
    console.log('所有错误都能捕获:', e);
  }
}
```

#### 6. 全局错误捕获

对于无法用 `try...catch` 捕获的错误，可以使用全局错误处理：

```javascript
// 捕获未处理的 Promise 错误
window.addEventListener('unhandledrejection', event => {
  console.error('未处理的 Promise 错误:', event.reason);
  event.preventDefault(); // 阻止默认行为（控制台警告）
});

// 捕获同步错误和异步回调中的错误
window.addEventListener('error', event => {
  console.error('全局错误:', event.error);
});

// 示例
setTimeout(() => {
  throw new Error('这个错误会被 error 事件捕获');
}, 1000);

Promise.reject('这个错误会被 unhandledrejection 事件捕获');
```

#### 7. 最佳实践

```javascript
// ✅ 推荐：async/await + try...catch
async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取用户数据失败:', error);
    // 可以在这里做错误上报、用户提示等
    throw error; // 重新抛出让调用者处理
  }
}

// ✅ 推荐：Promise.catch() 链式调用
function fetchUserDataPromise(userId) {
  return fetch(`/api/users/${userId}`)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .catch(error => {
      console.error('获取用户数据失败:', error);
      throw error;
    });
}

// ❌ 避免：混用导致错误处理不一致
async function badMix() {
  try {
    fetch('/api1'); // 没有 await，错误无法捕获
    await fetch('/api2'); // 有 await，错误能捕获
  } catch (e) {
    // 只能捕获部分错误
  }
}
```

**总结：**
- **同步代码 + async/await**：使用 `try...catch`
- **Promise 链式调用**：使用 `.catch()`
- **setTimeout/事件回调**：回调内部使用 `try...catch`
- **全局兜底**：使用 `window.addEventListener('unhandledrejection')` 和 `'error'`

---

### 🔸 CommonJS 和 ES6 模块引入的区别？

**答案：**

CommonJS 和 ES6 模块是 JavaScript 中两种不同的模块系统，主要区别如下：

**语法对比：**

```javascript
// CommonJS
const module1 = require('./module1');
const { foo, bar } = require('./module2');
module.exports = { name: 'Alice' };
exports.age = 25;

// ES6 Module
import module1 from './module1';
import { foo, bar } from './module2';
export default { name: 'Alice' };
export const age = 25;
```

**核心区别：**

| 特性 | CommonJS | ES6 Module |
|------|----------|-----------|
| 语法 | `require()` / `module.exports` | `import` / `export` |
| 加载时机 | 运行时加载（动态） | 编译时加载（静态） |
| 输出 | 值的拷贝 | 值的引用（动态绑定） |
| this 指向 | 指向当前模块 | undefined |
| 使用环境 | Node.js（默认） | 浏览器、Node.js（需配置） |
| 循环依赖 | 返回已执行部分 | 动态引用，不存在问题 |
| 异步加载 | 同步加载 | 支持异步加载 |
| Tree Shaking | 不支持 | 支持（静态分析） |

**1. 加载时机不同：**

```javascript
// CommonJS - 运行时加载
// 可以动态加载模块
if (condition) {
  const module = require('./module'); // ✅ 允许
}

// 可以在任意位置 require
function foo() {
  const module = require('./module'); // ✅ 允许
}

// ES6 Module - 编译时加载
// 必须在顶层作用域
import module from './module'; // ✅ 必须在顶层

if (condition) {
  import module from './module'; // ❌ 语法错误
}

// 但可以使用动态 import()
if (condition) {
  import('./module').then(module => {
    // ✅ 允许，返回 Promise
  });
}
```

**2. 输出值的差异：**

```javascript
// CommonJS - 值的拷贝
// module.js
let count = 0;
function increment() {
  count++;
}
module.exports = { count, increment };

// main.js
const { count, increment } = require('./module');
console.log(count); // 0
increment();
console.log(count); // 0（仍然是 0，因为是拷贝的值）

// ============================================

// ES6 Module - 值的引用（动态绑定）
// module.js
export let count = 0;
export function increment() {
  count++;
}

// main.js
import { count, increment } from './module';
console.log(count); // 0
increment();
console.log(count); // 1（动态引用，值会更新）
```

**3. 模块导出方式：**

```javascript
// CommonJS - 4 种导出方式
// 方式 1：直接导出对象
module.exports = {
  name: 'Alice',
  age: 25
};

// 方式 2：导出单个值
module.exports = function() {};

// 方式 3：使用 exports（exports 是 module.exports 的引用）
exports.name = 'Alice';
exports.age = 25;

// 方式 4：混用（注意：重新赋值 module.exports 会覆盖）
exports.foo = 'bar';
module.exports = { baz: 'qux' }; // exports.foo 会失效

// ============================================

// ES6 Module - 命名导出 + 默认导出
// 命名导出
export const name = 'Alice';
export const age = 25;
export function sayHello() {}

// 默认导出
export default {
  name: 'Alice',
  age: 25
};

// 混合导出
export const name = 'Alice';
export default function() {}
```

**4. 模块导入方式：**

```javascript
// CommonJS
const module = require('./module');           // 导入整个模块
const { name, age } = require('./module');    // 解构导入
const name = require('./module').name;        // 导入单个属性

// ES6 Module
import module from './module';                // 导入默认导出
import { name, age } from './module';         // 导入命名导出
import * as module from './module';           // 导入所有命名导出
import module, { name, age } from './module'; // 混合导入
import { name as userName } from './module';  // 重命名导入
```

**5. 循环依赖处理：**

```javascript
// CommonJS - 返回已执行部分
// a.js
exports.done = false;
const b = require('./b');
console.log('在 a.js 中，b.done =', b.done);
exports.done = true;
console.log('a.js 执行完毕');

// b.js
exports.done = false;
const a = require('./a'); // 由于 a 未执行完，只能拿到已执行部分
console.log('在 b.js 中，a.done =', a.done); // false
exports.done = true;
console.log('b.js 执行完毕');

// main.js
require('./a');
// 输出：
// 在 b.js 中，a.done = false
// b.js 执行完毕
// 在 a.js 中，b.done = true
// a.js 执行完毕

// ============================================

// ES6 Module - 动态引用，不会出现问题
// a.js
import { bar } from './b';
export function foo() {
  console.log('foo');
  bar(); // 可以正常调用
}

// b.js
import { foo } from './a';
export function bar() {
  console.log('bar');
  foo(); // 可以正常调用
}
```

**6. this 指向：**

```javascript
// CommonJS
console.log(this === module.exports); // true
console.log(this === exports);        // true

// ES6 Module
console.log(this); // undefined
```

**7. Node.js 中使用 ES6 模块：**

```javascript
// 方法 1：package.json 中设置 "type": "module"
{
  "type": "module"
}

// 方法 2：文件后缀改为 .mjs
// module.mjs
export const name = 'Alice';

// 方法 3：使用 .cjs 后缀强制使用 CommonJS
// module.cjs
module.exports = { name: 'Alice' };
```

**8. 动态导入对比：**

```javascript
// CommonJS - 同步动态导入
const moduleName = './module';
const module = require(moduleName); // ✅ 支持

let module;
if (condition) {
  module = require('./moduleA');
} else {
  module = require('./moduleB');
}

// ES6 Module - 异步动态导入
const moduleName = './module';
import(moduleName).then(module => {
  // 使用 module
});

// 条件导入
if (condition) {
  import('./moduleA').then(module => {});
} else {
  import('./moduleB').then(module => {});
}

// 配合 async/await
async function loadModule() {
  const module = await import('./module');
}
```

**9. Tree Shaking 支持：**

```javascript
// CommonJS - 不支持 Tree Shaking
// utils.js
exports.add = (a, b) => a + b;
exports.subtract = (a, b) => a - b;
exports.multiply = (a, b) => a * b;

// main.js
const { add } = require('./utils');
// 打包时，subtract 和 multiply 也会被打包（无法 Tree Shaking）

// ============================================

// ES6 Module - 支持 Tree Shaking
// utils.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const multiply = (a, b) => a * b;

// main.js
import { add } from './utils';
// 打包时，subtract 和 multiply 不会被打包（Tree Shaking）
```

**实际应用场景：**

```javascript
// 1. Node.js 服务端（推荐 ES6 Module）
// package.json
{
  "type": "module"
}

// 2. 浏览器环境（ES6 Module）
<script type="module">
  import { name } from './module.js';
</script>

// 3. 需要兼容老版本 Node.js（CommonJS）
const fs = require('fs');
const path = require('path');

// 4. 前端打包工具（ES6 Module，支持 Tree Shaking）
import { Button } from 'antd'; // 只打包 Button 组件
```

**总结：**

1. **ES6 Module 优势：**
   - 静态分析，支持 Tree Shaking
   - 语法更简洁
   - 官方标准，浏览器原生支持
   - 动态引用，循环依赖处理更好

2. **CommonJS 优势：**
   - Node.js 默认支持
   - 动态加载更灵活
   - 历史遗留代码兼容性好

3. **推荐使用：**
   - 新项目：优先使用 ES6 Module
   - Node.js 项目：使用 ES6 Module（设置 `"type": "module"`）
   - 前端项目：使用 ES6 Module
   - 老项目维护：根据现有模块系统选择

---

### 🔸 MessageChannel 是什么，有什么使用场景？

**答案：**

MessageChannel 是浏览器提供的一个消息通道 API，可以创建一个新的消息通道，用于两个独立的上下文之间进行通信。

**基本概念：**
- MessageChannel 创建一个带有两个 MessagePort 的新消息通道
- 两个端口可以相互发送消息
- 消息是异步传递的（微任务）

**基本用法：**
```javascript
// 创建 MessageChannel
const channel = new MessageChannel();

// port1 和 port2 是两个端口
const { port1, port2 } = channel;

// 在 port1 监听消息
port1.onmessage = (event) => {
  console.log('port1 收到:', event.data); // 'Hello from port2'
};

// 从 port2 发送消息
port2.postMessage('Hello from port2');
```

**使用场景：**

**1. 实现宏任务调度：**
```javascript
// MessageChannel 的消息传递是异步的，可用于任务调度
function runTask(callback) {
  const channel = new MessageChannel();

  channel.port1.onmessage = () => {
    callback();
  };

  channel.port2.postMessage(null);
}

// 使用
console.log('1');
runTask(() => {
  console.log('3 - 异步执行');
});
console.log('2');

// 输出：1, 2, 3 - 异步执行
```

**2. Web Worker 通信：**
```javascript
// 主线程
const worker = new Worker('worker.js');
const channel = new MessageChannel();

// 将 port2 传递给 Worker
worker.postMessage({ port: channel.port2 }, [channel.port2]);

// 在主线程使用 port1 通信
channel.port1.onmessage = (e) => {
  console.log('来自 Worker:', e.data);
};

channel.port1.postMessage('Hello Worker');

// worker.js
self.onmessage = (e) => {
  const port = e.data.port;

  port.onmessage = (e) => {
    console.log('Worker 收到:', e.data);
    port.postMessage('Hello Main Thread');
  };
};
```

**3. iframe 跨窗口通信：**
```javascript
// 父页面
const iframe = document.querySelector('iframe');
const channel = new MessageChannel();

// 将 port2 传递给 iframe
iframe.contentWindow.postMessage('init', '*', [channel.port2]);

// 使用 port1 接收消息
channel.port1.onmessage = (e) => {
  console.log('来自 iframe:', e.data);
};

// iframe 页面
window.addEventListener('message', (e) => {
  if (e.data === 'init') {
    const port = e.ports[0];

    port.onmessage = (e) => {
      console.log('iframe 收到:', e.data);
    };

    port.postMessage('Hello Parent');
  }
});
```

**4. 实现微任务调度（类似 queueMicrotask）：**
```javascript
// 注意：MessageChannel 实际创建的是宏任务，而非微任务
// 但可以用于模拟异步调度
function scheduleMacrotask(callback) {
  const channel = new MessageChannel();
  channel.port1.onmessage = callback;
  channel.port2.postMessage(null);
}

console.log('start');

scheduleMacrotask(() => {
  console.log('macrotask');
});

Promise.resolve().then(() => {
  console.log('microtask');
});

console.log('end');

// 输出：start, end, microtask, macrotask
```

**5. React 调度器中的应用：**
```javascript
// React Scheduler 使用 MessageChannel 实现任务调度
// 简化版示例
let scheduledCallback = null;
const channel = new MessageChannel();

channel.port1.onmessage = () => {
  if (scheduledCallback) {
    const callback = scheduledCallback;
    scheduledCallback = null;
    callback();
  }
};

function scheduleWork(callback) {
  scheduledCallback = callback;
  channel.port2.postMessage(null);
}

// React 使用这种方式在浏览器空闲时执行更新
```

**MessageChannel vs postMessage 对比：**

| 特性 | MessageChannel | window.postMessage |
|------|----------------|-------------------|
| 通信方式 | 点对点，私有通道 | 广播式，公开通信 |
| 安全性 | 更安全，不经过全局作用域 | 需要验证 origin |
| 性能 | 更快，直接通信 | 较慢，需要序列化 |
| 使用场景 | Worker、iframe 私有通信 | 跨域窗口通信 |

**注意事项：**
```javascript
// 1. 使用完后关闭端口
port1.close();
port2.close();

// 2. 传递可转移对象
const buffer = new ArrayBuffer(1024);
port2.postMessage(buffer, [buffer]); // 转移所有权

// 3. 错误处理
port1.onmessageerror = (e) => {
  console.error('消息反序列化失败', e);
};
```

---

## DOM 操作

### 🔸 什么是 DOM 和 BOM？

**答案：**

**DOM（Document Object Model）** 和 **BOM（Browser Object Model）** 是浏览器提供给 JavaScript 的两个重要的 API 模型。

---

**1. DOM - 文档对象模型**

DOM 是 **W3C 标准**，用于操作 **HTML 和 XML 文档**的编程接口。

**核心概念：**
- 将 HTML 文档表示为一个树形结构
- 每个 HTML 元素都是一个节点（Node）
- 提供了访问和操作文档内容、结构、样式的方法

**DOM 树结构：**
```
Document
  └── html
      ├── head
      │   ├── title
      │   └── meta
      └── body
          ├── div
          │   ├── p
          │   └── span
          └── script
```

**常用 DOM 对象和方法：**

```javascript
// 1. Document 对象（文档根节点）
document.title;                           // 页面标题
document.body;                            // <body> 元素
document.documentElement;                 // <html> 元素
document.head;                            // <head> 元素

// 2. 查找元素
document.getElementById('id');            // 根据 ID 查找
document.getElementsByClassName('class'); // 根据类名查找（返回 HTMLCollection）
document.getElementsByTagName('div');     // 根据标签名查找
document.querySelector('.class');         // CSS 选择器查找（返回第一个）
document.querySelectorAll('.class');      // CSS 选择器查找（返回 NodeList）

// 3. 创建和操作元素
const div = document.createElement('div');     // 创建元素
div.textContent = 'Hello';                     // 设置文本内容
div.innerHTML = '<span>World</span>';          // 设置 HTML 内容
div.setAttribute('class', 'box');              // 设置属性
div.classList.add('active');                   // 添加 class
div.style.color = 'red';                       // 设置样式

// 4. 插入和删除元素
parent.appendChild(child);                     // 插入到末尾
parent.insertBefore(newNode, referenceNode);   // 插入到指定位置
parent.removeChild(child);                     // 删除子元素
element.remove();                              // 删除自身

// 5. 节点关系
element.parentNode;                            // 父节点
element.childNodes;                            // 所有子节点（包括文本节点）
element.children;                              // 所有子元素（不包括文本节点）
element.firstChild / element.firstElementChild; // 第一个子节点/元素
element.lastChild / element.lastElementChild;  // 最后一个子节点/元素
element.nextSibling / element.nextElementSibling; // 下一个兄弟节点/元素
element.previousSibling / element.previousElementSibling; // 上一个兄弟节点/元素

// 6. 事件处理
element.addEventListener('click', handler);    // 添加事件监听
element.removeEventListener('click', handler); // 移除事件监听
```

**DOM 节点类型：**

| 节点类型 | nodeType | 说明 |
|---------|---------|------|
| Element | 1 | 元素节点（如 `<div>`、`<p>`） |
| Attribute | 2 | 属性节点（如 `class="box"`） |
| Text | 3 | 文本节点（元素内的文本） |
| Comment | 8 | 注释节点（`<!-- 注释 -->`） |
| Document | 9 | 文档根节点 |
| DocumentFragment | 11 | 文档片段节点 |

```javascript
const div = document.querySelector('div');
console.log(div.nodeType);        // 1 (Element)
console.log(div.nodeName);        // 'DIV'
console.log(div.nodeValue);       // null (元素节点的 nodeValue 为 null)

const textNode = div.firstChild;
console.log(textNode.nodeType);   // 3 (Text)
console.log(textNode.nodeValue);  // 文本内容
```

---

**2. BOM - 浏览器对象模型**

BOM 是 **浏览器厂商定义的标准**，用于操作 **浏览器窗口和浏览器本身**的编程接口（**非 W3C 标准，但已被广泛支持**）。

**核心概念：**
- 以 `window` 对象为核心
- 提供与浏览器交互的方法和对象
- 包括浏览器窗口、历史记录、地址栏、定时器等

**BOM 对象层级结构：**
```
window (全局对象，浏览器窗口)
  ├── document (DOM 的入口)
  ├── location (URL 信息)
  ├── navigator (浏览器信息)
  ├── screen (屏幕信息)
  ├── history (历史记录)
  ├── localStorage / sessionStorage (本地存储)
  └── console (控制台)
```

**常用 BOM 对象和方法：**

```javascript
// 1. window 对象（全局对象）
window.innerWidth;                    // 浏览器窗口宽度（包括滚动条）
window.innerHeight;                   // 浏览器窗口高度（包括滚动条）
window.outerWidth;                    // 浏览器外部宽度（包括边框、工具栏）
window.outerHeight;                   // 浏览器外部高度
window.open('url', 'name', 'options'); // 打开新窗口
window.close();                       // 关闭当前窗口
window.scrollTo(x, y);                // 滚动到指定位置
window.scrollBy(x, y);                // 相对当前位置滚动

// 定时器
const timerId = setTimeout(fn, delay);    // 延迟执行（一次）
clearTimeout(timerId);                    // 清除延迟定时器
const intervalId = setInterval(fn, delay); // 定期执行（重复）
clearInterval(intervalId);                 // 清除定期定时器

// 弹窗
alert('提示信息');                         // 警告框
const result = confirm('确认吗？');         // 确认框（返回 true/false）
const input = prompt('请输入：', '默认值'); // 输入框（返回字符串或 null）

// 2. location 对象（URL 信息）
location.href;                        // 完整 URL: 'https://example.com/path?query=1#hash'
location.protocol;                    // 协议: 'https:'
location.host;                        // 主机名 + 端口: 'example.com:8080'
location.hostname;                    // 主机名: 'example.com'
location.port;                        // 端口: '8080'
location.pathname;                    // 路径: '/path'
location.search;                      // 查询字符串: '?query=1'
location.hash;                        // 锚点: '#hash'

location.assign('url');               // 跳转到新 URL（可后退）
location.replace('url');              // 替换当前 URL（不可后退）
location.reload();                    // 重新加载页面
location.reload(true);                // 强制从服务器重新加载

// 3. navigator 对象（浏览器信息）
navigator.userAgent;                  // 用户代理字符串
navigator.language;                   // 浏览器语言: 'zh-CN'
navigator.languages;                  // 浏览器支持的语言列表
navigator.onLine;                     // 是否在线: true/false
navigator.platform;                   // 操作系统平台: 'Win32', 'MacIntel'
navigator.cookieEnabled;              // 是否启用 Cookie
navigator.geolocation;                // 地理位置 API

// 4. screen 对象（屏幕信息）
screen.width;                         // 屏幕宽度（像素）
screen.height;                        // 屏幕高度（像素）
screen.availWidth;                    // 可用屏幕宽度（去除任务栏）
screen.availHeight;                   // 可用屏幕高度（去除任务栏）
screen.colorDepth;                    // 颜色深度（位）

// 5. history 对象（历史记录）
history.length;                       // 历史记录数量
history.back();                       // 后退（等同于浏览器后退按钮）
history.forward();                    // 前进（等同于浏览器前进按钮）
history.go(-1);                       // 后退 1 页
history.go(1);                        // 前进 1 页
history.pushState(state, title, url); // 添加历史记录（不刷新页面）
history.replaceState(state, title, url); // 替换历史记录（不刷新页面）

// 6. localStorage / sessionStorage（本地存储）
localStorage.setItem('key', 'value'); // 存储数据（永久保存）
localStorage.getItem('key');          // 获取数据
localStorage.removeItem('key');       // 删除数据
localStorage.clear();                 // 清空所有数据

sessionStorage.setItem('key', 'value'); // 存储数据（会话结束后清除）
sessionStorage.getItem('key');
```

---

**DOM vs BOM 对比：**

| 特性 | DOM | BOM |
|------|-----|-----|
| **全称** | Document Object Model | Browser Object Model |
| **标准** | W3C 标准 | 浏览器厂商标准（非 W3C） |
| **作用** | 操作 HTML/XML 文档 | 操作浏览器窗口和浏览器本身 |
| **核心对象** | `document` | `window` |
| **主要功能** | 增删改查 HTML 元素、样式、属性 | 浏览器窗口、URL、历史记录、定时器 |
| **包含对象** | Element, Node, Attribute, Text | window, location, navigator, history, screen |
| **独立性** | 可独立于浏览器（Node.js 也有 DOM 实现） | 依赖浏览器环境 |

---

**关系图：**

```
浏览器环境
  └── window（BOM 的核心）
      ├── document（DOM 的入口）
      │   └── DOM 树（HTML 元素）
      ├── location（URL 操作）
      ├── navigator（浏览器信息）
      ├── history（历史记录）
      ├── screen（屏幕信息）
      └── localStorage / sessionStorage（存储）
```

**重要关系：**
- `window` 是浏览器的全局对象，BOM 的核心
- `document` 是 `window` 的一个属性，也是 DOM 的入口
- DOM 是 BOM 的一部分（`window.document`）
- 在浏览器中，全局变量和函数都是 `window` 的属性

```javascript
// window 是全局对象
console.log(window.document === document); // true
console.log(window.alert === alert);       // true

var a = 1;
console.log(window.a === a);               // true

function foo() {}
console.log(window.foo === foo);           // true
```

---

**实际应用示例：**

```javascript
// 示例 1：检测用户设备和浏览器（BOM）
function detectDevice() {
  const ua = navigator.userAgent;

  return {
    isMobile: /Mobile|Android|iPhone/i.test(ua),
    isChrome: /Chrome/i.test(ua),
    isFirefox: /Firefox/i.test(ua),
    isSafari: /Safari/i.test(ua) && !/Chrome/i.test(ua),
    isOnline: navigator.onLine,
    language: navigator.language
  };
}

// 示例 2：操作 URL（BOM）
function parseURL() {
  return {
    fullURL: location.href,
    domain: location.hostname,
    path: location.pathname,
    params: new URLSearchParams(location.search),
    hash: location.hash.slice(1)
  };
}

// 示例 3：操作页面元素（DOM）
function createCard(title, content) {
  const card = document.createElement('div');
  card.className = 'card';

  const h2 = document.createElement('h2');
  h2.textContent = title;

  const p = document.createElement('p');
  p.textContent = content;

  card.appendChild(h2);
  card.appendChild(p);

  return card;
}

// 示例 4：BOM + DOM 结合使用
function autoSaveForm() {
  // 使用 BOM 的 localStorage 存储
  // 使用 DOM 获取表单数据
  const form = document.querySelector('form');

  form.addEventListener('input', () => {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    localStorage.setItem('formData', JSON.stringify(data));
  });

  // 页面加载时恢复数据
  window.addEventListener('load', () => {
    const saved = localStorage.getItem('formData');
    if (saved) {
      const data = JSON.parse(saved);
      Object.entries(data).forEach(([name, value]) => {
        const input = form.querySelector(`[name="${name}"]`);
        if (input) input.value = value;
      });
    }
  });
}
```

---

**总结：**

1. **DOM** 用于操作 **网页内容**（HTML 元素），是 W3C 标准
2. **BOM** 用于操作 **浏览器窗口**（URL、历史记录、定时器等），非 W3C 标准
3. `window` 是 BOM 的核心，`document` 是 DOM 的入口
4. DOM 是 BOM 的一部分（`window.document`）
5. 在浏览器环境中，DOM 和 BOM 通常一起使用

---

### 🔸 DOM 事件流是什么？

**答案：**

DOM 事件流描述了事件从页面接收事件的顺序。

**三个阶段：**
1. **捕获阶段**：从 window 向目标元素传播
2. **目标阶段**：到达目标元素
3. **冒泡阶段**：从目标元素向 window 传播

```javascript
// addEventListener 第三个参数决定监听阶段
element.addEventListener('click', handler, true);  // 捕获阶段
element.addEventListener('click', handler, false); // 冒泡阶段（默认）
element.addEventListener('click', handler, {
  capture: false,  // 是否捕获阶段
  once: true,      // 只执行一次
  passive: true    // 不会调用 preventDefault
});
```

**阻止传播：**
```javascript
event.stopPropagation();      // 阻止继续传播
event.stopImmediatePropagation(); // 阻止传播并阻止同元素其他监听器
```

**阻止默认行为：**
```javascript
event.preventDefault(); // 阻止默认行为（如链接跳转、表单提交）
```

---

### 🔸 不会冒泡的事件有哪些？

**答案：**

以下是**不会冒泡的常见事件**：

**1. 资源加载事件：**
- `load` - 资源加载完成
- `error` - 资源加载失败
- `unload` - 文档卸载

**2. 焦点事件：**
- `focus` - 获得焦点（但 `focusin` 会冒泡）
- `blur` - 失去焦点（但 `focusout` 会冒泡）

**3. 鼠标事件：**
- `mouseenter` - 鼠标进入（但 `mouseover` 会冒泡）
- `mouseleave` - 鼠标离开（但 `mouseout` 会冒泡）

**补充：mouseenter vs mouseover 的详细区别：**

| 特性 | mouseenter | mouseover |
|------|-----------|----------|
| 事件冒泡 | 不会冒泡 | 会冒泡 |
| 子元素触发 | 移到子元素不触发 | 移到子元素会触发 |
| 性能 | 更好 | 相对较差 |
| 使用场景 | 悬浮菜单、卡片效果 | 事件委托 |

```javascript
// 示例对比
const parent = document.querySelector('#parent');
const child = document.querySelector('#child');

// mouseover - 会多次触发
parent.addEventListener('mouseover', () => {
  console.log('mouseover triggered');
  // 鼠标从父元素移到子元素时，会再次触发
});

// mouseenter - 只触发一次
parent.addEventListener('mouseenter', () => {
  console.log('mouseenter triggered');
  // 鼠标从父元素移到子元素时，不会再次触发
});

// 实际效果：鼠标 外部 → 父元素 → 子元素
// mouseover 输出：2 次（进入父元素 + 进入子元素）
// mouseenter 输出：1 次（仅进入父元素）
```

**对应的离开事件：**
- `mouseover` ↔ `mouseout`（都会冒泡）
- `mouseenter` ↔ `mouseleave`（都不会冒泡）

**4. 媒体事件：**
- `play` / `pause` / `ended` - 媒体播放相关
- `loadstart` / `progress` / `loadeddata` / `canplay` - 媒体加载相关

**5. 其他事件：**
- `abort` - 操作中止
- `scroll` - 滚动（虽然会传播，但默认不冒泡到父元素）
- `resize` - 窗口大小改变

**示例：**
```javascript
// load 事件不会冒泡
const img = document.querySelector('img');
const parent = img.parentElement;

img.addEventListener('load', () => {
  console.log('图片加载完成');
});

parent.addEventListener('load', () => {
  console.log('这个不会被触发'); // 不会执行，因为 load 不冒泡
});

// focus 不冒泡，但 focusin 会冒泡
const input = document.querySelector('input');

input.addEventListener('focus', () => {
  console.log('focus 事件'); // 不冒泡
});

input.addEventListener('focusin', () => {
  console.log('focusin 事件'); // 会冒泡
});
```

**解决方案：**

如果需要在父元素监听这些不冒泡的事件，可以：

```javascript
// 方案 1：使用捕获阶段
parent.addEventListener('focus', handler, true); // 第三个参数为 true

// 方案 2：使用会冒泡的替代事件
input.addEventListener('focusin', handler);  // 替代 focus
input.addEventListener('focusout', handler); // 替代 blur
div.addEventListener('mouseover', handler);  // 替代 mouseenter
div.addEventListener('mouseout', handler);   // 替代 mouseleave
```

---

### 🔸 事件委托是什么？有什么好处？

**答案：**

事件委托利用事件冒泡，将子元素的事件监听委托给父元素处理。

```javascript
// 不使用事件委托（性能差）
document.querySelectorAll('li').forEach(li => {
  li.addEventListener('click', handleClick);
});

// 使用事件委托
document.querySelector('ul').addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    handleClick(e);
  }
});
```

**好处：**
1. **减少内存消耗**：只需绑定一个监听器
2. **动态元素支持**：新增的子元素自动获得事件处理
3. **减少 DOM 操作**：无需为每个元素单独绑定

**注意事项：**
```javascript
// 处理嵌套元素
ul.addEventListener('click', (e) => {
  const li = e.target.closest('li'); // 查找最近的 li 祖先
  if (li && ul.contains(li)) {
    handleClick(li);
  }
});
```

---

### 🔸 什么是防抖和节流？如何实现？

**答案：**

**防抖（Debounce）：** 连续触发时，只执行最后一次

```javascript
function debounce(fn, delay, immediate = false) {
  let timer = null;

  return function(...args) {
    const callNow = immediate && !timer;

    clearTimeout(timer);

    timer = setTimeout(() => {
      timer = null;
      if (!immediate) {
        fn.apply(this, args);
      }
    }, delay);

    if (callNow) {
      fn.apply(this, args);
    }
  };
}

// 使用场景：搜索框输入、窗口 resize、表单验证
const handleSearch = debounce((value) => {
  console.log('搜索:', value);
}, 300);
```

**节流（Throttle）：** 固定时间内只执行一次

```javascript
// 时间戳版本（第一次立即执行）
function throttle(fn, interval) {
  let lastTime = 0;

  return function(...args) {
    const now = Date.now();

    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

// 定时器版本（最后一次也会执行）
function throttle(fn, interval) {
  let timer = null;

  return function(...args) {
    if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        fn.apply(this, args);
      }, interval);
    }
  };
}

// 组合版本
function throttle(fn, interval, options = {}) {
  const { leading = true, trailing = true } = options;
  let lastTime = 0;
  let timer = null;

  return function(...args) {
    const now = Date.now();

    if (!lastTime && !leading) {
      lastTime = now;
    }

    const remaining = interval - (now - lastTime);

    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      lastTime = now;
      fn.apply(this, args);
    } else if (!timer && trailing) {
      timer = setTimeout(() => {
        lastTime = leading ? Date.now() : 0;
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}

// 使用场景：滚动事件、拖拽、按钮点击
const handleScroll = throttle(() => {
  console.log('滚动位置:', window.scrollY);
}, 200);
```

---

## 其他重要概念

### 🔸 什么是垃圾回收机制？

**答案：**

JavaScript 自动进行内存管理，垃圾回收器会自动释放不再使用的内存。

**标记清除（Mark-and-Sweep）：**
1. 标记所有从根（全局对象）可达的对象
2. 清除所有未标记的对象

**引用计数（已淘汰）：**
- 跟踪每个值被引用的次数
- 问题：循环引用会导致内存泄漏

**常见内存泄漏：**
```javascript
// 1. 意外的全局变量
function leak() {
  leaked = '泄漏'; // 没有声明，成为全局变量
}

// 2. 闭包
function createClosure() {
  const largeData = new Array(1000000);
  return function() {
    return largeData;
  };
}
const closure = createClosure(); // largeData 无法释放

// 3. 未清除的定时器
const timer = setInterval(() => {}, 1000);
// clearInterval(timer); // 需要清除

// 4. DOM 引用
const element = document.getElementById('button');
document.body.removeChild(element);
// element 变量仍然引用该 DOM，需要 element = null

// 5. 事件监听
element.addEventListener('click', handler);
// element.removeEventListener('click', handler); // 需要移除
```

---

### 🔸 什么是严格模式？

**答案：**

严格模式是 ES5 引入的一种更严格的 JavaScript 运行模式。

```javascript
'use strict';

// 或在函数内部
function strict() {
  'use strict';
  // 严格模式代码
}
```

**主要限制：**
```javascript
'use strict';

// 1. 禁止意外创建全局变量
x = 10; // ReferenceError

// 2. 禁止删除变量
var x = 1;
delete x; // SyntaxError

// 3. 函数参数名唯一
function fn(a, a, b) {} // SyntaxError

// 4. 禁止八进制字面量
var x = 010; // SyntaxError

// 5. 禁止使用 with
with (obj) {} // SyntaxError

// 6. this 不再自动指向全局
function fn() {
  console.log(this); // undefined，而不是 window
}

// 7. arguments 不再追踪参数变化
function fn(a) {
  a = 10;
  console.log(arguments[0]); // 原值，而不是 10
}

// 8. 禁止使用保留字作为变量名
var let = 1; // SyntaxError
```

---

### 🔸 如何判断一个对象是否为空？

**答案：**

```javascript
const obj = {};

// 1. Object.keys()
Object.keys(obj).length === 0; // true

// 2. JSON.stringify()
JSON.stringify(obj) === '{}'; // true

// 3. for...in
function isEmpty(obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

// 4. Object.getOwnPropertyNames()（包括不可枚举属性）
Object.getOwnPropertyNames(obj).length === 0;

// 5. Reflect.ownKeys()（包括 Symbol 属性）
Reflect.ownKeys(obj).length === 0;

// 完整判断
function isEmptyObject(obj) {
  return obj !== null &&
         typeof obj === 'object' &&
         !Array.isArray(obj) &&
         Reflect.ownKeys(obj).length === 0;
}
```

---

### 🔸 Proxy 能监听到对象中的嵌套属性变化吗？

**答案：**

Proxy **只能监听第一层属性**，对于嵌套对象的属性变化无法直接监听到。

**问题演示：**
```javascript
const obj = {
  name: 'Alice',
  info: {
    age: 25,
    address: {
      city: 'Beijing'
    }
  }
};

const proxy = new Proxy(obj, {
  get(target, key) {
    console.log('get', key);
    return target[key];
  },
  set(target, key, value) {
    console.log('set', key, value);
    target[key] = value;
    return true;
  }
});

proxy.name = 'Bob';  // ✅ 可以监听到：set name Bob
proxy.info.age = 26;  // ❌ 只会触发 get info，但不会监听到 age 的修改
proxy.info.address.city = 'Shanghai';  // ❌ 只会触发 get info，深层修改监听不到
```

**原因：**
- 当访问 `proxy.info.age` 时，Proxy 只能拦截 `info` 的获取操作
- 获取到的 `info` 对象是原始对象，不是 Proxy 对象
- 对原始对象的修改无法被监听

**重要区别：引用替换 vs 引用对象内部修改**

```javascript
const obj = {
  user: { name: 'Alice' },
  arr: [1, 2, 3]
};

const proxy = new Proxy(obj, {
  get(target, key) {
    console.log('get', key);
    return target[key];
  },
  set(target, key, value) {
    console.log('set', key, value);
    target[key] = value;
    return true;
  }
});

// ✅ 情况1：替换整个引用 - 可以监听到
proxy.user = { name: 'Bob' };
// 输出：set user { name: 'Bob' }
// 原因：user 属性本身被重新赋值，Proxy 可以拦截到

proxy.arr = [4, 5, 6];
// 输出：set arr [4, 5, 6]
// 原因：arr 属性本身被重新赋值，Proxy 可以拦截到

// ❌ 情况2：修改引用对象的内部 - 监听不到
proxy.user.name = 'Charlie';
// 输出：get user
// 原因：只触发了获取 user 的操作，name 的修改发生在原始对象上

proxy.arr.push(4);
// 输出：get arr
// 原因：只触发了获取 arr 的操作，push 操作发生在原始数组上

proxy.arr[0] = 100;
// 输出：get arr
// 原因：只触发了获取 arr 的操作，索引赋值发生在原始数组上
```

**总结对比：**

| 操作类型 | 示例 | 是否可监听 | 触发的拦截器 |
|---------|------|-----------|------------|
| 替换引用（整体赋值） | `proxy.info = {...}` | ✅ 可以 | set |
| 替换引用（整体赋值） | `proxy.arr = [...]` | ✅ 可以 | set |
| 修改对象内部属性 | `proxy.info.age = 26` | ❌ 不可以 | 仅 get info |
| 修改数组内部元素 | `proxy.arr[0] = 1` | ❌ 不可以 | 仅 get arr |
| 调用数组方法 | `proxy.arr.push(4)` | ❌ 不可以 | 仅 get arr |

**解决方案：递归创建 Proxy**
```javascript
function deepProxy(obj, handler) {
  // 如果不是对象，直接返回
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  return new Proxy(obj, {
    get(target, key) {
      const value = Reflect.get(target, key);
      handler.get && handler.get(target, key, value);

      // 如果获取的值是对象，递归代理
      if (typeof value === 'object' && value !== null) {
        return deepProxy(value, handler);
      }
      return value;
    },
    set(target, key, value) {
      handler.set && handler.set(target, key, value);
      return Reflect.set(target, key, value);
    },
    deleteProperty(target, key) {
      handler.deleteProperty && handler.deleteProperty(target, key);
      return Reflect.deleteProperty(target, key);
    }
  });
}

// 使用深度代理
const deepProxyObj = deepProxy(obj, {
  get(target, key, value) {
    console.log('get', key);
  },
  set(target, key, value) {
    console.log('set', key, value);
  },
  deleteProperty(target, key) {
    console.log('delete', key);
  }
});

deepProxyObj.name = 'Bob';  // ✅ 监听到：set name Bob
deepProxyObj.info.age = 26;  // ✅ 监听到：set age 26
deepProxyObj.info.address.city = 'Shanghai';  // ✅ 监听到：set city Shanghai
delete deepProxyObj.info.age;  // ✅ 监听到：delete age
```

**进阶：完整的深度响应式实现**
```javascript
function reactive(obj, callback) {
  const cache = new WeakMap(); // 缓存已创建的 Proxy，避免重复创建

  function createProxy(target, path = []) {
    // 如果已经代理过，直接返回
    if (cache.has(target)) {
      return cache.get(target);
    }

    const proxy = new Proxy(target, {
      get(target, key) {
        const value = Reflect.get(target, key);

        // 递归代理对象类型
        if (typeof value === 'object' && value !== null) {
          return createProxy(value, [...path, key]);
        }

        return value;
      },

      set(target, key, value) {
        const oldValue = target[key];
        const result = Reflect.set(target, key, value);

        // 值发生变化时触发回调
        if (oldValue !== value) {
          callback({
            type: 'set',
            target,
            key,
            value,
            oldValue,
            path: [...path, key]
          });
        }

        return result;
      },

      deleteProperty(target, key) {
        const oldValue = target[key];
        const result = Reflect.deleteProperty(target, key);

        callback({
          type: 'delete',
          target,
          key,
          oldValue,
          path: [...path, key]
        });

        return result;
      }
    });

    cache.set(target, proxy);
    return proxy;
  }

  return createProxy(obj);
}

// 使用示例
const state = reactive({
  user: {
    name: 'Alice',
    profile: {
      age: 25
    }
  }
}, (change) => {
  console.log('状态变化：', change);
});

state.user.name = 'Bob';
// 输出：状态变化：{ type: 'set', key: 'name', value: 'Bob', oldValue: 'Alice', path: ['user', 'name'] }

state.user.profile.age = 26;
// 输出：状态变化：{ type: 'set', key: 'age', value: 26, oldValue: 25, path: ['user', 'profile', 'age'] }
```

**注意事项：**
1. **性能问题**：深度代理会为每个嵌套对象创建 Proxy，可能影响性能
2. **循环引用**：需要使用 WeakMap 缓存已代理的对象，避免无限递归
3. **数组处理**：数组的 push、pop 等方法会触发多次 set，需要特殊处理
4. **Vue 3 的实现**：Vue 3 的响应式系统就是基于这个原理，但做了大量优化

**应用场景：**
- 响应式数据系统（Vue 3、MobX）
- 数据变化监听和追踪
- 表单数据双向绑定
- 状态管理库

---

### 🔸 数组常用方法有哪些？

**答案：**

**改变原数组：**
```javascript
const arr = [1, 2, 3];

arr.push(4);      // [1,2,3,4] 末尾添加
arr.pop();        // [1,2,3] 末尾删除
arr.unshift(0);   // [0,1,2,3] 开头添加
arr.shift();      // [1,2,3] 开头删除
arr.splice(1, 1, 'a'); // [1,'a',3] 删除/插入/替换
arr.reverse();    // 反转
arr.sort((a,b) => a-b); // 排序
arr.fill(0);      // 填充
arr.copyWithin(0, 2); // 复制
```

**不改变原数组：**
```javascript
// 遍历
arr.forEach(item => {});
arr.map(item => item * 2);
arr.filter(item => item > 1);
arr.find(item => item > 1);
arr.findIndex(item => item > 1);
arr.some(item => item > 1);
arr.every(item => item > 1);
arr.reduce((acc, cur) => acc + cur, 0);
arr.reduceRight((acc, cur) => acc + cur, 0);

// 查询
arr.includes(1);
arr.indexOf(1);
arr.lastIndexOf(1);

// 转换
arr.slice(0, 2);
arr.concat([4, 5]);
arr.join('-');
arr.flat(2);
arr.flatMap(item => [item, item * 2]);

// 迭代器
arr.keys();
arr.values();
arr.entries();

// ES2023
arr.toSorted((a, b) => a - b); // 不改变原数组的排序
arr.toReversed();              // 不改变原数组的反转
arr.toSpliced(1, 1, 'a');      // 不改变原数组的 splice
arr.with(0, 'new');            // 不改变原数组的替换
```

---

### 🔸 对象常用方法有哪些？

**答案：**

```javascript
const obj = { a: 1, b: 2 };

// 获取键/值/键值对
Object.keys(obj);    // ['a', 'b']
Object.values(obj);  // [1, 2]
Object.entries(obj); // [['a', 1], ['b', 2]]

// 创建/复制
Object.create(proto);           // 创建新对象
Object.assign({}, obj, obj2);   // 浅拷贝/合并
Object.fromEntries([['a', 1]]); // 从键值对创建

// 属性描述符
Object.getOwnPropertyDescriptor(obj, 'a');
Object.getOwnPropertyDescriptors(obj);
Object.defineProperty(obj, 'c', { value: 3, writable: true });
Object.defineProperties(obj, { c: { value: 3 } });

// 冻结/密封
Object.freeze(obj);     // 完全冻结
Object.seal(obj);       // 密封（不能添加删除，可修改）
Object.isFrozen(obj);
Object.isSealed(obj);
Object.isExtensible(obj);
Object.preventExtensions(obj);

// 原型
Object.getPrototypeOf(obj);
Object.setPrototypeOf(obj, proto);

// 判断
Object.is(value1, value2);     // 类似 === 但 NaN===NaN, +0!==-0
Object.hasOwn(obj, 'a');       // ES2022，替代 hasOwnProperty
obj.hasOwnProperty('a');

// Symbol 属性
Object.getOwnPropertySymbols(obj);
```

---

### 🔸 什么是跨域？怎么解决？

**答案：**

**跨域的本质：浏览器的同源策略**

同源策略是浏览器的安全机制，要求两个 URL 的 **协议**、**域名**、**端口** 三者完全一致才算"同源"。

```
https://www.example.com:443/path

协议：https
域名：www.example.com
端口：443
```

**同源判断示例：**

| URL | 与 `https://www.example.com` 对比 | 是否同源 |
|-----|------|------|
| `https://www.example.com/other` | 路径不同 | ✅ 同源 |
| `http://www.example.com` | 协议不同 | ❌ 跨域 |
| `https://api.example.com` | 域名不同 | ❌ 跨域 |
| `https://www.example.com:8080` | 端口不同 | ❌ 跨域 |

**同源策略限制的内容：**
- AJAX 请求（XMLHttpRequest / Fetch）
- Cookie、LocalStorage、IndexedDB 的读取
- DOM 的访问（iframe 跨域时）

---

**跨域解决方案：**

**1. CORS（跨域资源共享）—— 最主流的方案**

CORS 是 W3C 标准，由**服务端**设置响应头来允许跨域请求。

```javascript
// 服务端设置响应头（以 Node.js / Express 为例）
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.example.com'); // 允许的源，* 表示所有
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // 允许的方法
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // 允许的请求头
  res.setHeader('Access-Control-Allow-Credentials', 'true'); // 允许携带 Cookie
  res.setHeader('Access-Control-Max-Age', '86400'); // 预检请求缓存时间（秒）
  next();
});
```

**简单请求 vs 预检请求：**

| 类型 | 条件 | 流程 |
|------|------|------|
| **简单请求** | GET/HEAD/POST + 简单请求头 + Content-Type 为 text/plain、multipart/form-data、application/x-www-form-urlencoded | 直接发送请求，浏览器自动带上 Origin |
| **预检请求** | PUT/DELETE 或自定义请求头或 Content-Type 为 application/json 等 | 先发送 OPTIONS 预检请求，服务端返回允许信息后再发送真实请求 |

```javascript
// 预检请求流程：
// 1. 浏览器自动发送 OPTIONS 请求
// OPTIONS /api/data HTTP/1.1
// Origin: https://www.example.com
// Access-Control-Request-Method: POST
// Access-Control-Request-Headers: Content-Type

// 2. 服务端返回允许信息
// Access-Control-Allow-Origin: https://www.example.com
// Access-Control-Allow-Methods: POST
// Access-Control-Allow-Headers: Content-Type

// 3. 浏览器确认允许后，发送真实请求
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: '张三' })
});
```

**2. 代理服务器 —— 开发环境常用**

同源策略是**浏览器**的限制，服务器之间通信不受限制。利用代理服务器转发请求来绕过跨域。

```javascript
// Vite 开发环境代理配置
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});

// Webpack devServer 代理配置
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    }
  }
};

// 前端直接请求本地代理
fetch('/api/users'); // 实际会被代理到 https://api.example.com/users
```

**生产环境：** 使用 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name www.example.com;

    location /api/ {
        proxy_pass https://api.example.com/;
        proxy_set_header Host api.example.com;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**3. JSONP —— 老方案，仅支持 GET**

利用 `<script>` 标签不受同源策略限制的特性。

```javascript
// 前端
function jsonp(url, callbackName) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    window[callbackName] = (data) => {
      resolve(data);
      document.body.removeChild(script);
      delete window[callbackName];
    };
    script.src = `${url}?callback=${callbackName}`;
    document.body.appendChild(script);
  });
}

// 使用
jsonp('https://api.example.com/data', 'handleData')
  .then(data => console.log(data));

// 服务端返回：handleData({ name: '张三', age: 25 })
```

**JSONP 的缺点：**
- 只支持 GET 请求
- 存在 XSS 安全风险
- 不支持错误处理（script 加载失败无法捕获）
- 已逐渐被 CORS 取代

**4. postMessage —— 跨窗口/iframe 通信**

```javascript
// 页面 A（https://a.example.com）
const iframe = document.getElementById('myIframe');
iframe.contentWindow.postMessage({ type: 'greeting', data: 'hello' }, 'https://b.example.com');

// 页面 B（https://b.example.com）在 iframe 内
window.addEventListener('message', (e) => {
  // 验证来源！防止恶意消息
  if (e.origin !== 'https://a.example.com') return;

  console.log(e.data); // { type: 'greeting', data: 'hello' }

  // 回复消息
  e.source.postMessage({ type: 'reply', data: 'world' }, e.origin);
});
```

**5. WebSocket —— 天然支持跨域**

```javascript
// WebSocket 协议不受同源策略限制
const ws = new WebSocket('wss://api.example.com/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'hello' }));
};

ws.onmessage = (e) => {
  console.log(JSON.parse(e.data));
};
```

---

**各方案对比：**

| 方案 | 适用场景 | 优点 | 缺点 |
|------|---------|------|------|
| **CORS** | 最通用的跨域方案 | 标准规范、支持所有请求方式 | 需要服务端配合 |
| **代理服务器** | 开发环境 / 生产环境 | 前端无感知、安全 | 需要配置代理服务器 |
| **JSONP** | 兼容老浏览器 | 简单、兼容性好 | 只支持 GET、有安全风险 |
| **postMessage** | iframe / 多窗口通信 | 安全、支持复杂数据 | 仅限窗口间通信 |
| **WebSocket** | 实时双向通信 | 全双工、天然跨域 | 需要服务端支持 WebSocket |

**实际开发中的最佳实践：**
1. **开发环境：** 使用 Vite / Webpack 代理
2. **生产环境：** 使用 CORS 或 Nginx 反向代理
3. **iframe 通信：** 使用 postMessage
4. **实时通信：** 使用 WebSocket
