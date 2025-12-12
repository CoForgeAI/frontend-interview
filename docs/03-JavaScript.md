# JavaScript 基础面试题

## 数据类型

### 1. JavaScript 有哪些数据类型？如何判断？

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

### 2. null 和 undefined 的区别？

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

### 3. == 和 === 的区别？

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

### 4. 什么是类型转换？有哪些转换规则？

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

### 5. 深拷贝和浅拷贝的区别？如何实现？

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

### 6. 什么是作用域？有哪些类型？

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

### 7. 什么是闭包？有哪些应用场景？

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

### 8. var、let、const 的区别？

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

## this 指向

### 9. this 指向有哪些规则？

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

### 10. call、apply、bind 的区别？如何手写实现？

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

### 11. 原型和原型链是什么？

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

### 12. 实现继承的方式有哪些？

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

### 13. new 操作符做了什么？如何手写实现？

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

## 异步编程

### 14. 什么是事件循环（Event Loop）？

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

### 15. Promise 的理解和使用？

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

### 16. 手写 Promise

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

### 17. async/await 的理解？

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

## DOM 操作

### 18. DOM 事件流是什么？

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

### 19. 事件委托是什么？有什么好处？

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

### 20. 什么是防抖和节流？如何实现？

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

### 21. 什么是垃圾回收机制？

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

### 22. 什么是严格模式？

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

### 23. 如何判断一个对象是否为空？

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

### 24. 数组常用方法有哪些？

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

### 25. 对象常用方法有哪些？

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
