# Vue 面试题

## 基础概念

### 1. Vue 的核心特性是什么？

**答案：**

1. **数据驱动（MVVM）**：数据变化自动更新视图
2. **组件化**：页面拆分为独立可复用的组件
3. **指令系统**：v-bind、v-on、v-if、v-for 等
4. **响应式系统**：数据变化自动追踪并更新
5. **虚拟 DOM**：高效的 DOM 更新策略

---

### 2. Vue 2 和 Vue 3 的主要区别？

**答案：**

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 响应式原理 | Object.defineProperty | Proxy |
| API 风格 | Options API | Composition API + Options API |
| 生命周期 | beforeCreate、created 等 | setup + onMounted 等 |
| 入口 | new Vue() | createApp() |
| Fragment | 不支持 | 支持多根节点 |
| Teleport | 不支持 | 支持 |
| Suspense | 不支持 | 支持 |
| TypeScript | 支持一般 | 原生支持 |
| Tree-shaking | 不支持 | 支持 |
| 性能 | - | 提升 1.3-2 倍 |

```javascript
// Vue 2
new Vue({
  el: '#app',
  data: {
    count: 0
  }
});

// Vue 3
import { createApp, ref } from 'vue';

createApp({
  setup() {
    const count = ref(0);
    return { count };
  }
}).mount('#app');
```

---

### 3. Vue 的生命周期及其执行顺序

**答案：**

**Vue 2 生命周期：**
```javascript
export default {
  beforeCreate() {
    // 实例初始化后，数据观测和事件配置之前
    // 此时 data、methods 不可用
  },
  created() {
    // 实例创建完成
    // data、methods 可用，但 DOM 未挂载
    // 适合：发起异步请求
  },
  beforeMount() {
    // 挂载开始之前
    // 模板编译完成，但未渲染到 DOM
  },
  mounted() {
    // 挂载完成
    // DOM 已渲染，可以访问 DOM 元素
    // 适合：DOM 操作、第三方库初始化
  },
  beforeUpdate() {
    // 数据更新时，DOM 更新之前
  },
  updated() {
    // DOM 更新完成
    // 避免在此修改数据，可能导致无限循环
  },
  beforeDestroy() {
    // 实例销毁之前
    // 适合：清理定时器、取消订阅、解绑事件
  },
  destroyed() {
    // 实例销毁完成
  },
  // keep-alive 特有
  activated() {
    // 组件激活时
  },
  deactivated() {
    // 组件停用时
  },
  // 错误捕获
  errorCaptured() {
    // 捕获子组件错误
  }
};
```

**Vue 3 生命周期（Composition API）：**
```javascript
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onActivated,
  onDeactivated,
  onErrorCaptured
} from 'vue';

export default {
  setup() {
    // setup 相当于 beforeCreate + created

    onBeforeMount(() => {});
    onMounted(() => {});
    onBeforeUpdate(() => {});
    onUpdated(() => {});
    onBeforeUnmount(() => {});  // 对应 beforeDestroy
    onUnmounted(() => {});      // 对应 destroyed
    onActivated(() => {});
    onDeactivated(() => {});
    onErrorCaptured(() => {});
  }
};
```

**父子组件生命周期执行顺序：**
```
挂载阶段：
父 beforeCreate -> 父 created -> 父 beforeMount
-> 子 beforeCreate -> 子 created -> 子 beforeMount -> 子 mounted
-> 父 mounted

更新阶段：
父 beforeUpdate -> 子 beforeUpdate -> 子 updated -> 父 updated

销毁阶段：
父 beforeDestroy -> 子 beforeDestroy -> 子 destroyed -> 父 destroyed
```

---

## 响应式原理

### 4. Vue 2 响应式原理（Object.defineProperty）

**答案：**

```javascript
// 简化版实现
class Observer {
  constructor(data) {
    this.walk(data);
  }

  walk(obj) {
    Object.keys(obj).forEach(key => {
      this.defineReactive(obj, key, obj[key]);
    });
  }

  defineReactive(obj, key, val) {
    const dep = new Dep();

    // 递归处理嵌套对象
    if (typeof val === 'object' && val !== null) {
      new Observer(val);
    }

    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        // 依赖收集
        if (Dep.target) {
          dep.addSub(Dep.target);
        }
        return val;
      },
      set(newVal) {
        if (newVal === val) return;
        val = newVal;
        // 通知更新
        dep.notify();
      }
    });
  }
}

// 依赖管理
class Dep {
  static target = null;

  constructor() {
    this.subs = [];
  }

  addSub(sub) {
    this.subs.push(sub);
  }

  notify() {
    this.subs.forEach(sub => sub.update());
  }
}

// Watcher
class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm;
    this.key = key;
    this.cb = cb;

    Dep.target = this;
    this.vm[this.key]; // 触发 getter，收集依赖
    Dep.target = null;
  }

  update() {
    this.cb.call(this.vm, this.vm[this.key]);
  }
}
```

**Vue 2 响应式的局限性：**
```javascript
// 1. 无法检测对象属性的添加/删除
vm.obj.newProp = 'value'; // 不是响应式的
// 解决：Vue.set(vm.obj, 'newProp', 'value')

// 2. 无法检测数组索引修改
vm.arr[0] = 'new value'; // 不是响应式的
// 解决：Vue.set(vm.arr, 0, 'new value') 或 vm.arr.splice(0, 1, 'new value')

// 3. 无法检测数组长度修改
vm.arr.length = 0; // 不是响应式的
// 解决：vm.arr.splice(0)
```

---

### 5. Vue 3 响应式原理（Proxy）

**答案：**

```javascript
import { reactive, ref, effect } from 'vue';

// 简化版 reactive 实现
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      // 依赖收集
      track(target, key);
      // 深层响应式
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }
      return result;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      // 触发更新
      if (oldValue !== value) {
        trigger(target, key);
      }
      return result;
    },
    deleteProperty(target, key) {
      const result = Reflect.deleteProperty(target, key);
      trigger(target, key);
      return result;
    }
  });
}

// 依赖收集
const targetMap = new WeakMap();
let activeEffect = null;

function track(target, key) {
  if (!activeEffect) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  dep.add(activeEffect);
}

// 触发更新
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => effect());
  }
}

// effect 函数
function effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}
```

**Vue 3 响应式 API：**
```javascript
import { reactive, ref, computed, watch, watchEffect } from 'vue';

// reactive - 创建响应式对象
const state = reactive({
  count: 0,
  user: { name: '张三' }
});

// ref - 创建响应式基本类型
const count = ref(0);
count.value++; // 需要 .value 访问

// computed - 计算属性
const doubled = computed(() => count.value * 2);

// 可写计算属性
const plusOne = computed({
  get: () => count.value + 1,
  set: (val) => { count.value = val - 1; }
});

// watch - 监听
watch(count, (newVal, oldVal) => {
  console.log(`count 从 ${oldVal} 变为 ${newVal}`);
});

// 监听多个源
watch([count, () => state.user.name], ([newCount, newName]) => {});

// 深度监听
watch(() => state.user, (newUser) => {}, { deep: true });

// 立即执行
watch(count, (val) => {}, { immediate: true });

// watchEffect - 自动追踪依赖
watchEffect(() => {
  console.log(count.value, state.user.name);
});
```

---

### 6. ref 和 reactive 的区别？

**答案：**

| 特性 | ref | reactive |
|------|-----|----------|
| 适用类型 | 基本类型 + 对象 | 只能是对象 |
| 访问方式 | .value | 直接访问 |
| 解构 | 保持响应式 | 丢失响应式 |
| 模板中使用 | 自动解包，无需 .value | 直接使用 |

```javascript
import { ref, reactive, toRefs } from 'vue';

// ref
const count = ref(0);
count.value++;  // 需要 .value

// ref 也可以包装对象
const user = ref({ name: '张三' });
user.value.name = '李四';

// reactive
const state = reactive({
  count: 0,
  user: { name: '张三' }
});
state.count++;  // 直接访问

// 解构问题
const { count: c } = state; // c 不是响应式的
const { count: c2 } = toRefs(state); // c2 是 ref，保持响应式

// 模板中使用
// <template>
//   <div>{{ count }}</div> <!-- ref 自动解包 -->
//   <div>{{ state.count }}</div>
// </template>
```

**什么时候用 ref，什么时候用 reactive：**
- 基本类型：使用 ref
- 需要整体替换的对象：使用 ref
- 不需要整体替换的对象/数组：使用 reactive
- 表单数据：通常使用 reactive

---

## 组件通信

### 7. Vue 组件通信方式有哪些？

**答案：**

**1. props / emit（父子通信）：**
```vue
<!-- 父组件 -->
<template>
  <Child :message="msg" @update="handleUpdate" />
</template>

<!-- 子组件 -->
<script setup>
const props = defineProps({
  message: String
});

const emit = defineEmits(['update']);

function sendToParent() {
  emit('update', 'new value');
}
</script>
```

**2. v-model（双向绑定）：**
```vue
<!-- 父组件 -->
<Child v-model="value" />
<!-- 等价于 -->
<Child :modelValue="value" @update:modelValue="value = $event" />

<!-- 子组件 -->
<script setup>
const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);

function update(val) {
  emit('update:modelValue', val);
}
</script>

<!-- 多个 v-model -->
<Child v-model:title="title" v-model:content="content" />
```

**3. provide / inject（跨层级通信）：**
```javascript
// 祖先组件
import { provide, ref } from 'vue';

const theme = ref('dark');
provide('theme', theme);

// 或提供响应式数据
provide('theme', {
  value: theme,
  update: (val) => { theme.value = val; }
});

// 后代组件
import { inject } from 'vue';

const theme = inject('theme');
const theme2 = inject('theme', 'default'); // 带默认值
```

**4. EventBus（Vue 3 推荐使用 mitt）：**
```javascript
// eventBus.js
import mitt from 'mitt';
export const emitter = mitt();

// 组件 A - 发送
import { emitter } from './eventBus';
emitter.emit('custom-event', { data: 'hello' });

// 组件 B - 接收
import { emitter } from './eventBus';
import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
  emitter.on('custom-event', handleEvent);
});

onUnmounted(() => {
  emitter.off('custom-event', handleEvent);
});
```

**5. Vuex / Pinia（状态管理）：**
```javascript
// Pinia store
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  getters: {
    doubleCount: (state) => state.count * 2
  },
  actions: {
    increment() {
      this.count++;
    }
  }
});

// 组件中使用
import { useCounterStore } from '@/stores/counter';

const store = useCounterStore();
store.count;
store.doubleCount;
store.increment();
```

**6. $refs（访问子组件实例）：**
```vue
<template>
  <Child ref="childRef" />
</template>

<script setup>
import { ref, onMounted } from 'vue';

const childRef = ref(null);

onMounted(() => {
  childRef.value.someMethod();
});
</script>

<!-- 子组件需要 expose -->
<script setup>
function someMethod() {}
defineExpose({ someMethod });
</script>
```

**7. $attrs（透传属性）：**
```vue
<!-- 父组件 -->
<Child class="child" data-id="1" @click="handleClick" />

<!-- 子组件 -->
<template>
  <!-- $attrs 包含所有非 props 的属性和事件 -->
  <div v-bind="$attrs">
    <GrandChild v-bind="$attrs" />
  </div>
</template>

<script setup>
import { useAttrs } from 'vue';
const attrs = useAttrs();
</script>
```

---

### 8. computed 和 watch 的区别？

**答案：**

| 特性 | computed | watch |
|------|----------|-------|
| 用途 | 计算派生数据 | 监听数据变化执行副作用 |
| 缓存 | 有缓存，依赖不变不重新计算 | 无缓存 |
| 返回值 | 必须有返回值 | 不需要返回值 |
| 异步 | 不支持 | 支持 |
| 首次执行 | 会执行 | 默认不执行（可配置 immediate） |

```javascript
import { ref, computed, watch, watchEffect } from 'vue';

const firstName = ref('张');
const lastName = ref('三');

// computed - 计算属性
const fullName = computed(() => {
  return firstName.value + lastName.value;
});

// watch - 监听特定数据
watch(firstName, (newVal, oldVal) => {
  console.log('firstName 变化了');
  // 可以执行异步操作
  fetchData(newVal);
});

// watch 配置项
watch(
  () => state.user,
  (newUser) => {},
  {
    deep: true,      // 深度监听
    immediate: true, // 立即执行
    flush: 'post'    // 在组件更新后执行
  }
);

// watchEffect - 自动追踪依赖
watchEffect(() => {
  console.log(firstName.value, lastName.value);
});

// 停止监听
const stop = watchEffect(() => {});
stop(); // 停止监听
```

---

## 虚拟 DOM 和 Diff 算法

### 9. 什么是虚拟 DOM？有什么优缺点？

**答案：**

虚拟 DOM 是用 JavaScript 对象描述真实 DOM 的数据结构。

```javascript
// 虚拟 DOM 结构
const vnode = {
  type: 'div',
  props: {
    id: 'app',
    class: 'container'
  },
  children: [
    { type: 'h1', children: 'Hello' },
    { type: 'p', children: 'World' }
  ]
};
```

**优点：**
1. **跨平台**：可以渲染到 DOM、Canvas、Native 等
2. **性能优化**：批量更新、最小化 DOM 操作
3. **开发体验**：声明式编程，专注于数据逻辑

**缺点：**
1. **首次渲染慢**：需要创建虚拟 DOM 再渲染
2. **内存占用**：需要额外存储虚拟 DOM 对象
3. **不如直接操作 DOM 快**：简单场景下有额外开销

---

### 10. Vue 的 Diff 算法原理

**答案：**

**Diff 策略：**
1. **同层比较**：只比较同一层级，不跨层
2. **类型不同直接替换**：节点类型不同，直接删除重建
3. **key 优化**：通过 key 判断节点是否可复用

**Vue 3 Diff 算法流程：**

```javascript
// 新旧节点数组
// old: [a, b, c, d, e]
// new: [a, b, d, c, f]

// 1. 从头比较相同节点
// a === a ✓
// b === b ✓

// 2. 从尾比较相同节点
// 无相同

// 3. 处理新增/删除
// 如果 old 遍历完，new 还有剩余 -> 新增
// 如果 new 遍历完，old 还有剩余 -> 删除

// 4. 乱序情况 - 最长递增子序列
// 构建 key -> index 的 Map
// 找出可复用节点的最长递增子序列
// 只移动不在子序列中的节点
```

**简化版 Diff 实现：**
```javascript
function patchChildren(n1, n2, container) {
  const oldChildren = n1.children;
  const newChildren = n2.children;

  let i = 0;
  let e1 = oldChildren.length - 1;
  let e2 = newChildren.length - 1;

  // 1. 从头开始比较
  while (i <= e1 && i <= e2) {
    if (isSameVNode(oldChildren[i], newChildren[i])) {
      patch(oldChildren[i], newChildren[i], container);
      i++;
    } else {
      break;
    }
  }

  // 2. 从尾开始比较
  while (i <= e1 && i <= e2) {
    if (isSameVNode(oldChildren[e1], newChildren[e2])) {
      patch(oldChildren[e1], newChildren[e2], container);
      e1--;
      e2--;
    } else {
      break;
    }
  }

  // 3. 新增节点
  if (i > e1 && i <= e2) {
    while (i <= e2) {
      mount(newChildren[i], container);
      i++;
    }
  }
  // 4. 删除节点
  else if (i > e2 && i <= e1) {
    while (i <= e1) {
      unmount(oldChildren[i]);
      i++;
    }
  }
  // 5. 乱序 - 使用最长递增子序列
  else {
    // ... 复杂逻辑
  }
}
```

---

### 11. key 的作用是什么？为什么不建议用 index？

**答案：**

**key 的作用：**
1. 帮助 Vue 识别节点，判断是否可复用
2. 提高 Diff 效率，减少不必要的 DOM 操作

**为什么不用 index：**
```vue
<!-- 使用 index 作为 key -->
<li v-for="(item, index) in list" :key="index">
  {{ item.name }}
  <input type="text" />
</li>

<!--
问题：当在列表头部插入新元素时
原数组：[{id: 1, name: 'A'}, {id: 2, name: 'B'}]
新数组：[{id: 3, name: 'C'}, {id: 1, name: 'A'}, {id: 2, name: 'B'}]

使用 index 作为 key 时：
- key=0 的节点会被复用（但内容从 A 变成 C）
- key=1 的节点会被复用（但内容从 B 变成 A）
- key=2 是新增节点

如果 li 中有 input，输入框的内容会错乱
-->

<!-- 正确做法：使用唯一 id -->
<li v-for="item in list" :key="item.id">
  {{ item.name }}
  <input type="text" />
</li>
```

---

## 高级特性

### 12. Vue 3 Composition API 的优势

**答案：**

**1. 更好的代码组织：**
```javascript
// Options API - 同一功能的代码分散在各处
export default {
  data() {
    return { count: 0, user: null };
  },
  methods: {
    increment() { this.count++; },
    fetchUser() { /* ... */ }
  },
  computed: {
    doubleCount() { return this.count * 2; }
  },
  mounted() {
    this.fetchUser();
  }
};

// Composition API - 按功能组织代码
function useCounter() {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);
  function increment() { count.value++; }
  return { count, doubleCount, increment };
}

function useUser() {
  const user = ref(null);
  async function fetchUser() { /* ... */ }
  onMounted(fetchUser);
  return { user, fetchUser };
}

export default {
  setup() {
    const { count, doubleCount, increment } = useCounter();
    const { user, fetchUser } = useUser();
    return { count, doubleCount, increment, user };
  }
};
```

**2. 更好的逻辑复用：**
```javascript
// 自定义 Hook
function useMouse() {
  const x = ref(0);
  const y = ref(0);

  function update(e) {
    x.value = e.pageX;
    y.value = e.pageY;
  }

  onMounted(() => window.addEventListener('mousemove', update));
  onUnmounted(() => window.removeEventListener('mousemove', update));

  return { x, y };
}

// 使用
const { x, y } = useMouse();
```

**3. 更好的 TypeScript 支持：**
```typescript
interface Props {
  title: string;
  count?: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update', value: string): void;
}>();
```

---

### 13. Vue 的插槽（Slot）

**答案：**

**默认插槽：**
```vue
<!-- 父组件 -->
<Card>
  <p>这是内容</p>
</Card>

<!-- 子组件 Card.vue -->
<template>
  <div class="card">
    <slot>默认内容</slot>
  </div>
</template>
```

**具名插槽：**
```vue
<!-- 父组件 -->
<Card>
  <template #header>
    <h1>标题</h1>
  </template>

  <template #default>
    <p>主要内容</p>
  </template>

  <template #footer>
    <button>按钮</button>
  </template>
</Card>

<!-- 子组件 -->
<template>
  <div class="card">
    <header>
      <slot name="header"></slot>
    </header>
    <main>
      <slot></slot>
    </main>
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>
```

**作用域插槽：**
```vue
<!-- 子组件 -->
<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <slot :item="item" :index="index">
        {{ item.name }}
      </slot>
    </li>
  </ul>
</template>

<!-- 父组件 -->
<List :items="items">
  <template #default="{ item, index }">
    <span>{{ index }}: {{ item.name }}</span>
  </template>
</List>

<!-- 简写（只有默认插槽时） -->
<List :items="items" v-slot="{ item }">
  <span>{{ item.name }}</span>
</List>
```

---

### 14. Vue 的自定义指令

**答案：**

```javascript
// Vue 3 全局指令
app.directive('focus', {
  mounted(el) {
    el.focus();
  }
});

// 组件内指令
const vFocus = {
  mounted(el) {
    el.focus();
  }
};

// 指令钩子
const vPermission = {
  created(el, binding, vnode, prevVnode) {},
  beforeMount(el, binding, vnode, prevVnode) {},
  mounted(el, binding, vnode, prevVnode) {},
  beforeUpdate(el, binding, vnode, prevVnode) {},
  updated(el, binding, vnode, prevVnode) {},
  beforeUnmount(el, binding, vnode, prevVnode) {},
  unmounted(el, binding, vnode, prevVnode) {}
};

// binding 对象
// {
//   value: 指令的值，如 v-my-directive="1 + 1" 中的 2
//   oldValue: 之前的值
//   arg: 指令的参数，如 v-my-directive:foo 中的 'foo'
//   modifiers: 修饰符对象，如 v-my-directive.prevent.stop 中的 { prevent: true, stop: true }
//   instance: 使用该指令的组件实例
//   dir: 指令的定义对象
// }

// 实际示例：防抖指令
const vDebounce = {
  mounted(el, binding) {
    let timer = null;
    el.addEventListener('click', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        binding.value();
      }, binding.arg || 300);
    });
  }
};

// 使用
<button v-debounce:500="handleClick">点击</button>
```

---

### 15. keep-alive 的原理和使用

**答案：**

keep-alive 用于缓存组件，避免重复渲染。

```vue
<!-- 基本使用 -->
<keep-alive>
  <component :is="currentComponent" />
</keep-alive>

<!-- 配合路由 -->
<router-view v-slot="{ Component }">
  <keep-alive>
    <component :is="Component" />
  </keep-alive>
</router-view>

<!-- include/exclude -->
<keep-alive include="Home,About">
  <component :is="currentComponent" />
</keep-alive>

<keep-alive :include="['Home', 'About']">
  <component :is="currentComponent" />
</keep-alive>

<keep-alive :include="/^Home/">
  <component :is="currentComponent" />
</keep-alive>

<!-- max - 最大缓存数 -->
<keep-alive :max="10">
  <component :is="currentComponent" />
</keep-alive>
```

**生命周期：**
```javascript
// 被缓存的组件特有
{
  activated() {
    // 组件激活时调用
    // 每次进入都会调用
  },
  deactivated() {
    // 组件停用时调用
    // 离开时调用，而不是 unmounted
  }
}
```

**原理：**
```javascript
// 简化实现
const KeepAlive = {
  setup(props, { slots }) {
    const cache = new Map();
    const keys = new Set();

    return () => {
      const vnode = slots.default();
      const key = vnode.key || vnode.type;

      if (cache.has(key)) {
        // 从缓存获取
        vnode.component = cache.get(key).component;
      } else {
        // 添加到缓存
        cache.set(key, vnode);
        keys.add(key);

        // 超过 max，删除最早的
        if (props.max && keys.size > props.max) {
          const firstKey = keys.values().next().value;
          cache.delete(firstKey);
          keys.delete(firstKey);
        }
      }

      // 标记为 keep-alive
      vnode.shapeFlag |= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE;

      return vnode;
    };
  }
};
```

---

## Vue Router

### 16. Vue Router 的导航守卫

**答案：**

**全局守卫：**
```javascript
const router = createRouter({ ... });

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // to: 目标路由
  // from: 来源路由
  // next: 放行函数

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

// Vue 3 新写法（返回值）
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/login'; // 或 return { name: 'Login' }
  }
  // 返回 undefined / true 表示放行
  // 返回 false 取消导航
});

// 全局解析守卫
router.beforeResolve((to, from) => {
  // 在组件守卫和异步路由组件解析后调用
});

// 全局后置钩子
router.afterEach((to, from, failure) => {
  // 不接受 next，不能改变导航
  // 适合做分析、页面标题等
  document.title = to.meta.title || '默认标题';
});
```

**路由独享守卫：**
```javascript
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from) => {
      if (!isAdmin) {
        return '/403';
      }
    }
  }
];
```

**组件内守卫：**
```javascript
// Options API
export default {
  beforeRouteEnter(to, from, next) {
    // 不能访问 this
    next(vm => {
      // 通过 vm 访问组件实例
    });
  },
  beforeRouteUpdate(to, from) {
    // 路由参数变化时调用
    // 可以访问 this
  },
  beforeRouteLeave(to, from) {
    // 离开时调用
    // 可以用于提示用户保存
    if (this.hasUnsavedChanges) {
      const answer = window.confirm('确定离开？');
      if (!answer) return false;
    }
  }
};

// Composition API
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';

onBeforeRouteLeave((to, from) => {
  // ...
});

onBeforeRouteUpdate((to, from) => {
  // ...
});
```

**导航解析流程：**
1. 导航被触发
2. 离开组件的 `beforeRouteLeave`
3. 全局 `beforeEach`
4. 复用组件的 `beforeRouteUpdate`
5. 路由配置的 `beforeEnter`
6. 解析异步路由组件
7. 进入组件的 `beforeRouteEnter`
8. 全局 `beforeResolve`
9. 导航确认
10. 全局 `afterEach`
11. DOM 更新
12. `beforeRouteEnter` 中 `next` 的回调

---

### 17. Vue Router 的路由模式

**答案：**

**Hash 模式：**
```javascript
import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: []
});

// URL: http://example.com/#/user/1
```
- 使用 URL 的 hash（#）部分
- 兼容性好，不需要服务器配置
- SEO 不友好

**History 模式：**
```javascript
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: []
});

// URL: http://example.com/user/1
```
- 使用 HTML5 History API
- URL 更美观
- 需要服务器配置（所有路由都返回 index.html）
- SEO 友好

**Memory 模式（SSR）：**
```javascript
import { createRouter, createMemoryHistory } from 'vue-router';

const router = createRouter({
  history: createMemoryHistory(),
  routes: []
});
```
- 不与 URL 交互
- 用于 SSR 或测试

---

## Pinia / Vuex

### 18. Pinia 和 Vuex 的区别

**答案：**

| 特性 | Pinia | Vuex |
|------|-------|------|
| 支持 Vue 版本 | Vue 2/3 | Vue 2/3 |
| TypeScript | 原生支持 | 支持一般 |
| mutation | 无 | 有 |
| 模块 | 扁平化 | 嵌套模块 |
| 体积 | 更小 | 更大 |
| DevTools | 支持 | 支持 |

**Pinia 基本使用：**
```javascript
// stores/counter.js
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Eduardo'
  }),

  getters: {
    doubleCount: (state) => state.count * 2,
    // 访问其他 getter
    doubleCountPlusOne() {
      return this.doubleCount + 1;
    }
  },

  actions: {
    increment() {
      this.count++;
    },
    async fetchData() {
      const res = await api.getData();
      this.count = res.count;
    }
  }
});

// Setup Store 语法
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);

  function increment() {
    count.value++;
  }

  return { count, doubleCount, increment };
});
```

**组件中使用：**
```vue
<script setup>
import { useCounterStore } from '@/stores/counter';
import { storeToRefs } from 'pinia';

const store = useCounterStore();

// 解构保持响应式
const { count, doubleCount } = storeToRefs(store);

// actions 可以直接解构
const { increment } = store;

// 批量修改
store.$patch({
  count: store.count + 1,
  name: 'new name'
});

// 函数式 patch
store.$patch((state) => {
  state.count++;
  state.items.push({ name: 'new item' });
});

// 重置状态
store.$reset();

// 监听状态变化
store.$subscribe((mutation, state) => {
  localStorage.setItem('counter', JSON.stringify(state));
});
</script>
```

---

### 19. nextTick 的原理和使用

**答案：**

nextTick 用于在 DOM 更新后执行回调。

```javascript
import { nextTick } from 'vue';

// 使用方式 1：回调
nextTick(() => {
  // DOM 已更新
});

// 使用方式 2：async/await
async function update() {
  state.count++;
  await nextTick();
  // DOM 已更新
  console.log(el.textContent);
}
```

**原理：**
Vue 的响应式更新是异步的，数据变化后会进入更新队列，在下一个事件循环中批量更新 DOM。nextTick 将回调放入微任务队列，在 DOM 更新后执行。

```javascript
// 简化实现
let pending = false;
const callbacks = [];

function nextTick(callback) {
  callbacks.push(callback);

  if (!pending) {
    pending = true;
    // 使用微任务
    Promise.resolve().then(flushCallbacks);
  }

  // 返回 Promise
  return new Promise(resolve => {
    callbacks.push(resolve);
  });
}

function flushCallbacks() {
  pending = false;
  const copies = callbacks.slice(0);
  callbacks.length = 0;
  copies.forEach(cb => cb());
}
```

---

### 20. Vue 性能优化方法

**答案：**

**1. 编译优化：**
```vue
<!-- v-once：只渲染一次 -->
<span v-once>{{ staticContent }}</span>

<!-- v-memo：记忆化，依赖不变不重新渲染 -->
<div v-memo="[item.id, item.active]">
  {{ item.name }}
</div>
```

**2. 组件优化：**
```javascript
// 异步组件
const AsyncComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
);

// Suspense
<Suspense>
  <template #default>
    <AsyncComponent />
  </template>
  <template #fallback>
    <Loading />
  </template>
</Suspense>
```

**3. 列表优化：**
```vue
<!-- 使用唯一 key -->
<li v-for="item in list" :key="item.id">

<!-- 虚拟列表 -->
<virtual-list :items="hugeList" :item-height="50">
  <template #default="{ item }">
    {{ item.name }}
  </template>
</virtual-list>
```

**4. 计算属性缓存：**
```javascript
// 使用 computed 而不是 method
const expensive = computed(() => {
  return hugeArray.filter(/* ... */).map(/* ... */);
});
```

**5. shallowRef / shallowReactive：**
```javascript
// 只对第一层响应式
const shallowState = shallowReactive({
  nested: { deep: 'value' } // 不是响应式的
});

const shallowCount = shallowRef({ count: 0 });
```

**6. 组件懒加载：**
```javascript
// 路由懒加载
const routes = [
  {
    path: '/dashboard',
    component: () => import('./views/Dashboard.vue')
  }
];
```

**7. 事件销毁：**
```javascript
onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
```

**8. 避免不必要的响应式：**
```javascript
// 大型静态数据使用 markRaw
import { markRaw } from 'vue';

const bigData = markRaw({
  // 大量静态数据
});
```

---

## Vue 原理面试题精选

> 以下面试题从面试官角度设计，包含追问和深度考察点，适合中高级前端面试准备。

---

### 1. Vue 3 响应式系统相比 Vue 2 有什么本质变化？为什么要做这个改变？

**标准答案：**

**本质变化：从 Object.defineProperty 改为 Proxy**

| 对比维度 | Vue 2 (Object.defineProperty) | Vue 3 (Proxy) |
|---------|------------------------------|---------------|
| 拦截能力 | 只能拦截已存在的属性 | 拦截整个对象的所有操作 |
| 新增属性 | 需要 `Vue.set()` | 自动响应式 |
| 删除属性 | 需要 `Vue.delete()` | 自动响应式 |
| 数组索引 | 无法检测 `arr[0] = x` | 自动响应式 |
| 数组长度 | 无法检测 `arr.length = 0` | 自动响应式 |
| Map/Set | 不支持 | 原生支持 |
| 初始化性能 | 递归遍历所有属性（eager） | 懒代理，按需创建（lazy） |

**为什么要改变：**

1. **API 完整性**：Vue 2 的 `Vue.set/delete` 是对语言限制的妥协，增加了学习成本和心智负担
2. **性能优化**：Vue 2 初始化时必须递归遍历整个对象，深层嵌套对象会导致明显的初始化延迟
3. **更好的 TypeScript 支持**：Proxy 的类型推导更加自然

```javascript
// Vue 2 的痛点
const vm = new Vue({
  data: { obj: { a: 1 }, arr: [1, 2, 3] }
});
vm.obj.b = 2;       // ❌ 不响应
vm.arr[0] = 100;    // ❌ 不响应
delete vm.obj.a;    // ❌ 不响应

// Vue 3 完美解决
const state = reactive({ obj: { a: 1 }, arr: [1, 2, 3] });
state.obj.b = 2;    // ✅ 响应式
state.arr[0] = 100; // ✅ 响应式
delete state.obj.a; // ✅ 响应式
```

**🔍 追问 1：Vue 3 的「懒代理」是什么意思？有什么好处？**

懒代理指的是 Proxy 只在访问嵌套对象时才递归创建代理，而不是初始化时一次性代理所有层级。

```javascript
const state = reactive({
  level1: {
    level2: {
      level3: { value: 1 }
    }
  }
});

// 此时只有 state 被代理
// 只有访问 state.level1 时，level1 才被代理
// 只有访问 state.level1.level2 时，level2 才被代理
```

好处：
- 大型对象初始化速度快
- 未访问的深层属性不会消耗内存
- 真正按需代理

**🔍 追问 2：Proxy 相比 defineProperty 有什么缺点吗？**

1. **兼容性**：Proxy 无法被 polyfill，不支持 IE11
2. **性能开销**：单次属性访问 Proxy 略慢于 defineProperty（但整体性能更好）
3. **调试复杂度**：控制台打印代理对象需要展开才能看到原始值

**🔍 追问 3：为什么 Vue 3 要用 Reflect 配合 Proxy？**

```javascript
const proxy = new Proxy(target, {
  get(target, key, receiver) {
    // 用 Reflect.get 而不是 target[key]
    return Reflect.get(target, key, receiver);
  }
});
```

原因：
1. **正确处理 this 指向**：当对象有 getter 时，`receiver` 确保 getter 中的 `this` 指向代理对象而不是原始对象
2. **返回值语义**：Reflect 方法返回布尔值表示操作是否成功，便于判断
3. **与 Proxy 一一对应**：Reflect 的方法与 Proxy 的 trap 完全对应

---

### 2. Vue 的依赖收集是怎么实现的？什么时候收集？什么时候触发？

**标准答案：**

**核心机制：发布-订阅模式**

```
读取数据（getter）→ 收集当前正在运行的 effect
修改数据（setter）→ 触发收集到的所有 effect 重新执行
```

**关键数据结构：**

```javascript
// targetMap: WeakMap<target, Map<key, Set<effect>>>
// 例如：
targetMap = {
  [stateObject]: {
    'count': Set([effect1, effect2]),  // count 属性的依赖
    'name': Set([effect3])             // name 属性的依赖
  }
}
```

**收集时机**：当 effect 函数执行时，访问响应式数据会触发 getter，此时收集依赖

**触发时机**：当响应式数据被修改时，触发 setter，通知所有依赖的 effect 重新执行

```javascript
// 简化实现
let activeEffect = null;

function track(target, key) {
  if (!activeEffect) return; // 没有正在运行的 effect，不收集

  let depsMap = targetMap.get(target);
  if (!depsMap) targetMap.set(target, (depsMap = new Map()));

  let dep = depsMap.get(key);
  if (!dep) depsMap.set(key, (dep = new Set()));

  dep.add(activeEffect); // 收集当前 effect
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => effect()); // 触发所有依赖
  }
}
```

**🔍 追问 1：为什么用 WeakMap 存储依赖？**

- WeakMap 的 key 是弱引用，当 target 对象没有其他引用时，可以被垃圾回收
- 避免内存泄漏，不需要手动清理

**🔍 追问 2：依赖收集有什么问题需要处理？**

**问题 1：分支切换导致的无效依赖**
```javascript
const state = reactive({ ok: true, text: 'hello' });

effect(() => {
  // 当 ok 为 false 时，text 的变化不应该触发更新
  console.log(state.ok ? state.text : 'not ok');
});

state.ok = false;
state.text = 'world'; // 不应该触发 effect，但实际会触发
```

**解决方案**：每次 effect 执行前清除旧依赖，重新收集

**问题 2：嵌套 effect**
```javascript
effect(() => {
  effect(() => {
    console.log(state.b);
  });
  console.log(state.a);
});
```

**解决方案**：使用 effectStack 栈结构管理当前活跃的 effect

---

### 3. computed 和 watch 的实现原理有什么区别？

**标准答案：**

| 特性 | computed | watch |
|-----|----------|-------|
| 返回值 | 返回计算后的值 | 无返回值，执行副作用 |
| 缓存 | 有缓存，依赖不变不重新计算 | 无缓存，每次变化都执行 |
| 执行时机 | 惰性求值（访问时计算） | 立即执行或依赖变化时执行 |
| 适用场景 | 派生数据 | 副作用（请求、DOM 操作等） |

**computed 核心实现：dirty 标记 + 缓存**

```javascript
function computed(getter) {
  let value;
  let dirty = true; // 脏值标记

  const effectFn = effect(getter, {
    lazy: true,
    scheduler: () => {
      dirty = true;          // 依赖变化时，标记为脏
      trigger(obj, 'value'); // 通知依赖 computed 的地方
    }
  });

  const obj = {
    get value() {
      if (dirty) {
        value = effectFn(); // 脏了才重新计算
        dirty = false;
      }
      track(obj, 'value');  // computed 也可以被收集
      return value;
    }
  };
  return obj;
}
```

**watch 核心实现：调度器 + 新旧值对比**

```javascript
function watch(source, cb) {
  let oldValue;

  const effectFn = effect(
    () => traverse(source), // 递归读取，收集所有依赖
    {
      lazy: true,
      scheduler: () => {
        const newValue = effectFn();
        cb(newValue, oldValue);  // 回调拿到新旧值
        oldValue = newValue;
      }
    }
  );

  oldValue = effectFn(); // 首次执行，记录旧值
}
```

**🔍 追问：computed 的缓存是怎么失效的？**

当 computed 依赖的响应式数据变化时，scheduler 被调用，将 `dirty` 设为 `true`。下次访问 `computed.value` 时发现是脏的，才重新计算。

---

### 4. Vue 3 的 Diff 算法相比 Vue 2 有什么优化？

**标准答案：**

**Vue 2：双端对比算法**
- 同时从新旧子节点的两端开始对比
- 四种对比策略：头头、尾尾、头尾、尾头

**Vue 3：快速 Diff 算法**
- 预处理相同前缀和后缀
- 利用最长递增子序列（LIS）最小化移动次数

```
旧: A B C D E F G
新: A B E C D H F G

1. 相同前缀：A B（不用动）
2. 相同后缀：F G（不用动）
3. 中间部分：[C D E] → [E C D H]
   - 建立 key → index 映射
   - 计算最长递增子序列
   - 只移动不在 LIS 中的节点
```

**最长递增子序列的作用：**

```javascript
// newIndexToOldIndexMap = [5, 3, 4, 0]
// 表示新节点在旧数组中的位置（0 表示新增）
// LIS = [1, 2]，即索引 1 和 2 的节点不需要移动

// 移动策略：
// - 索引 0 (E)：不在 LIS 中，需要移动
// - 索引 1 (C)：在 LIS 中，不移动
// - 索引 2 (D)：在 LIS 中，不移动
// - 索引 3 (H)：值为 0，是新增节点
```

**🔍 追问 1：为什么要用最长递增子序列？**

目标是最小化 DOM 移动操作。LIS 中的节点相对顺序在新旧数组中是一致的，所以不需要移动。只需要移动不在 LIS 中的节点。

**🔍 追问 2：为什么 Vue 的 diff 需要 key？**

没有 key 时，Vue 只能按索引对比，无法识别节点的移动，只能销毁重建：

```javascript
// 没有 key：A B C → C A B
// Vue 认为：A→C, B→A, C→B（三次更新）

// 有 key：A B C → C A B
// Vue 知道：C 移到前面，A B 不动（一次移动）
```

**🔍 追问 3：为什么不推荐用 index 作为 key？**

当列表发生插入/删除时，index 会变化，导致 key 失效：

```javascript
// 原列表：[{id:1}, {id:2}, {id:3}]  key: 0, 1, 2
// 删除 id:1 后：[{id:2}, {id:3}]    key: 0, 1
// Vue 认为 key=0 的节点从 id:1 变成了 id:2，触发不必要的更新
```

---

### 5. nextTick 的实现原理是什么？为什么能拿到更新后的 DOM？

**标准答案：**

**核心原理：微任务队列**

Vue 的 DOM 更新是异步的，多次数据修改会被合并到一个微任务中执行。`nextTick` 将回调也放入微任务队列，排在 DOM 更新之后。

```javascript
// 简化实现
const queue = [];
let isFlushing = false;
const resolvedPromise = Promise.resolve();

function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job);
  }
  if (!isFlushing) {
    isFlushing = true;
    resolvedPromise.then(flushJobs);
  }
}

function nextTick(fn) {
  return fn ? resolvedPromise.then(fn) : resolvedPromise;
}
```

**执行顺序：**

```javascript
const count = ref(0);

count.value++;  // 1. 触发更新，queueJob(updateFn)
count.value++;  // 2. 去重，不重复入队
count.value++;  // 3. 去重，不重复入队

nextTick(() => {
  // 5. DOM 已更新，可以拿到最新的 DOM
});

// 4. 同步代码执行完，微任务执行：flushJobs() → DOM 更新
```

**🔍 追问 1：为什么 Vue 选择微任务而不是宏任务？**

- 微任务在当前事件循环中执行，更新更及时
- 避免不必要的渲染：微任务在渲染之前执行，多次修改只触发一次渲染

**🔍 追问 2：Vue 2 的 nextTick 降级策略是什么？**

```javascript
// 优先级：Promise > MutationObserver > setImmediate > setTimeout
if (typeof Promise !== 'undefined') {
  // Promise.then
} else if (typeof MutationObserver !== 'undefined') {
  // MutationObserver
} else if (typeof setImmediate !== 'undefined') {
  // setImmediate (IE/Node)
} else {
  // setTimeout
}
```

Vue 3 直接使用 `Promise.resolve().then()`，不再做降级处理。

---

### 6. keep-alive 是怎么实现组件缓存的？

**标准答案：**

**核心机制：**
1. 将离开的组件移动到隐藏容器，而不是销毁
2. 用 Map 缓存组件的 VNode
3. 返回时从缓存恢复，触发 activated 而非 mounted

```javascript
const KeepAlive = {
  setup(props, { slots }) {
    const cache = new Map();      // 缓存 VNode
    const keys = new Set();       // 缓存 key，用于 LRU

    return () => {
      const vnode = slots.default();
      const key = vnode.key || vnode.type;

      if (cache.has(key)) {
        // 命中缓存：复用组件实例
        vnode.component = cache.get(key).component;
        // 标记为 kept-alive，渲染器会跳过挂载
      } else {
        // 未命中：加入缓存
        cache.set(key, vnode);
        keys.add(key);

        // LRU 淘汰
        if (keys.size > props.max) {
          const oldest = keys.values().next().value;
          cache.delete(oldest);
          keys.delete(oldest);
        }
      }

      return vnode;
    };
  }
};
```

**生命周期变化：**

```
首次进入：beforeCreate → created → beforeMount → mounted
离开：deactivated（不触发 unmounted）
再次进入：activated（不触发 mounted）
```

**🔍 追问：keep-alive 的 include/exclude 是怎么匹配的？**

根据组件的 `name` 选项进行匹配，支持字符串、正则、数组：

```vue
<keep-alive :include="['Home', 'About']">
  <router-view />
</keep-alive>
```

---

### 7. Vue 的模板编译过程是怎样的？做了哪些优化？

**标准答案：**

**编译三阶段：**

```
template → Parse → AST → Transform → AST → Generate → render function
```

1. **Parse（解析）**：将模板字符串解析为 AST
2. **Transform（转换）**：对 AST 进行优化和转换
3. **Generate（生成）**：将 AST 生成渲染函数代码

**Vue 3 编译优化：**

**1. 静态提升（Static Hoisting）**

```javascript
// 编译前
<div>
  <span>static</span>
  <span>{{ dynamic }}</span>
</div>

// 编译后（静态节点提升到函数外部）
const _hoisted_1 = /*#__PURE__*/_createElementVNode("span", null, "static")

function render() {
  return _createElementVNode("div", null, [
    _hoisted_1,  // 静态节点复用，不重新创建
    _createElementVNode("span", null, _toDisplayString(dynamic))
  ])
}
```

**2. patchFlag（补丁标记）**

```javascript
// 标记动态内容类型，diff 时只检查标记的部分
export const enum PatchFlags {
  TEXT = 1,           // 动态文本
  CLASS = 2,          // 动态 class
  STYLE = 4,          // 动态 style
  PROPS = 8,          // 动态属性
  FULL_PROPS = 16,    // 有动态 key
  // ...
}

// 编译结果
_createElementVNode("div", { class: cls }, text, 3 /* TEXT, CLASS */)
```

**3. Block Tree（块级树）**

将动态节点收集到 Block 中，diff 时直接对比动态节点数组，跳过静态内容。

**🔍 追问：v-if 和 v-for 哪个优先级高？**

- **Vue 2**：v-for 优先级高于 v-if（不推荐一起用）
- **Vue 3**：v-if 优先级高于 v-for

```vue
<!-- Vue 3 中可以这样写 -->
<li v-for="item in list" v-if="item.active">{{ item.name }}</li>

<!-- 相当于 -->
<template v-for="item in list">
  <li v-if="item.active">{{ item.name }}</li>
</template>
```

---

### 8. provide/inject 是怎么跨层级传递数据的？

**标准答案：**

**核心机制：原型链**

```javascript
function provide(key, value) {
  const instance = getCurrentInstance();
  let { provides } = instance;
  const parentProvides = instance.parent?.provides;

  // 创建原型链继承
  if (provides === parentProvides) {
    provides = instance.provides = Object.create(parentProvides);
  }
  provides[key] = value;
}

function inject(key, defaultValue) {
  const instance = getCurrentInstance();
  const provides = instance.parent?.provides;

  // 通过原型链查找
  if (provides && key in provides) {
    return provides[key];
  }
  return defaultValue;
}
```

**原型链结构：**

```
孙组件.provides → 子组件.provides → 父组件.provides → 根组件.provides
```

**优势：**
- O(1) 查找复杂度（原型链查找）
- 自动继承祖先的 provide
- 同名 key 就近覆盖

**🔍 追问：provide 的值是响应式的吗？**

默认不是响应式的。如果需要响应式，需要传递 ref 或 reactive 对象：

```javascript
// 父组件
const count = ref(0);
provide('count', count);  // 传递 ref

// 子组件
const count = inject('count');
console.log(count.value);  // 响应式
```

---

### 9. Vue 的异步更新机制是怎么实现的？

**标准答案：**

**核心：调度器 + 微任务队列**

当响应式数据变化时，不会立即更新 DOM，而是将更新任务放入队列，在微任务中批量执行。

```javascript
const queue = [];
let isFlushing = false;

function queueJob(job) {
  // 1. 去重：同一个组件只更新一次
  if (!queue.includes(job)) {
    queue.push(job);
  }

  // 2. 开启微任务
  if (!isFlushing) {
    isFlushing = true;
    Promise.resolve().then(flushJobs);
  }
}

function flushJobs() {
  // 3. 按优先级排序（父组件先于子组件）
  queue.sort((a, b) => a.id - b.id);

  // 4. 执行所有更新
  for (const job of queue) {
    job();
  }

  // 5. 重置状态
  queue.length = 0;
  isFlushing = false;
}
```

**🔍 追问：为什么要异步更新？同步更新不行吗？**

1. **性能优化**：多次修改只触发一次更新
   ```javascript
   state.a = 1;  // 不立即更新
   state.b = 2;  // 不立即更新
   state.c = 3;  // 不立即更新
   // 微任务中批量更新一次
   ```

2. **避免重复渲染**：父子组件依赖同一数据时，保证只渲染一次

3. **保证数据一致性**：所有数据修改完成后再更新视图

---

### 10. Teleport 是怎么实现将内容渲染到指定位置的？

**标准答案：**

Teleport 的实现不复杂，核心是在 patch 时将子节点挂载到指定的 DOM 容器。

```javascript
const Teleport = {
  __isTeleport: true,

  process(n1, n2, container, internals) {
    const { to } = n2.props;
    const target = document.querySelector(to);

    if (!n1) {
      // 首次挂载：挂载到 target 而不是 container
      n2.children.forEach(child => {
        internals.patch(null, child, target);
      });
    } else {
      // 更新
      n2.children.forEach((child, i) => {
        internals.patch(n1.children[i], child, target);
      });
    }
  }
};
```

**使用场景：**
- Modal 弹窗（避免 z-index、overflow 问题）
- Toast 通知
- Tooltip（避免被父元素裁剪）

```vue
<template>
  <div class="container">
    <Teleport to="body">
      <div class="modal">我会被渲染到 body 下</div>
    </Teleport>
  </div>
</template>
```

**🔍 追问：Teleport 的内容还在原组件的上下文中吗？**

是的，Teleport 只改变 DOM 位置，不改变组件上下文。子组件仍然可以访问父组件的 props、provide 等。

---

### 11. Vue 3 的 ref 和 reactive 有什么区别？什么时候用哪个？

**标准答案：**

| 特性 | ref | reactive |
|-----|-----|----------|
| 接受类型 | 任意类型 | 仅对象/数组 |
| 访问方式 | 需要 `.value` | 直接访问 |
| 解构 | 保持响应式 | 丢失响应式 |
| 重新赋值 | 可以 | 不可以（会丢失响应式） |
| 底层实现 | 对象用 reactive，原始值用 getter/setter | Proxy |

**ref 实现原理：**

```javascript
function ref(value) {
  return createRef(value);
}

function createRef(rawValue) {
  // 如果是对象，内部用 reactive 包装
  const _value = isObject(rawValue) ? reactive(rawValue) : rawValue;

  const refObject = {
    __v_isRef: true,
    get value() {
      track(refObject, 'value');
      return _value;
    },
    set value(newVal) {
      if (hasChanged(newVal, rawValue)) {
        rawValue = newVal;
        _value = isObject(newVal) ? reactive(newVal) : newVal;
        trigger(refObject, 'value');
      }
    }
  };

  return refObject;
}
```

**使用场景：**

```javascript
// ✅ ref：原始值、需要重新赋值、模板 ref
const count = ref(0);
const inputRef = ref(null);
const user = ref({ name: 'John' }); // 可以整体替换

// ✅ reactive：复杂对象、不需要重新赋值
const state = reactive({
  user: { name: 'John' },
  list: []
});

// ❌ reactive 的坑
const state = reactive({ count: 0 });
let { count } = state;  // 解构后丢失响应式
count++;                // 不会触发更新

// ✅ 解决方案：toRefs
const { count } = toRefs(state);
count.value++;          // 保持响应式
```

**🔍 追问：为什么 ref 需要 .value？**

为了保持原始值的响应式。JavaScript 中原始值是按值传递的，无法被 Proxy 拦截。ref 通过包装成对象，用 `.value` 属性实现响应式。

---

### 12. Vue 的 Slot 插槽是怎么实现的？

**标准答案：**

**插槽本质：父组件传递的 VNode 片段**

```javascript
// 父组件
<Child>
  <template #header>Header Content</template>
  <template #default>Default Content</template>
</Child>

// 编译结果
h(Child, null, {
  header: () => h('span', 'Header Content'),
  default: () => h('span', 'Default Content')
})
```

**子组件接收：**

```javascript
// 子组件 setup
setup(props, { slots }) {
  return () => h('div', [
    h('header', slots.header?.()),  // 调用插槽函数
    h('main', slots.default?.())
  ]);
}

// 或者在 template 中
<template>
  <header><slot name="header" /></header>
  <main><slot /></main>
</template>
```

**作用域插槽原理：**

```javascript
// 父组件
<Child v-slot="{ item }">
  {{ item.name }}
</Child>

// 编译为
h(Child, null, {
  default: ({ item }) => h('span', item.name)
})

// 子组件传递数据
slots.default?.({ item: currentItem })
```

**🔍 追问：为什么插槽是函数而不是直接的 VNode？**

1. **延迟执行**：只有在子组件渲染时才创建 VNode，避免不必要的计算
2. **作用域支持**：函数可以接收参数，实现作用域插槽
3. **响应式更新**：父组件数据变化时，重新调用函数生成新 VNode

---

### 13. Vue Router 的实现原理是什么？

**标准答案：**

**两种路由模式：**

| 模式 | 实现 | URL 形式 | 兼容性 |
|-----|------|---------|--------|
| Hash | window.onhashchange | `/#/path` | 所有浏览器 |
| History | History API | `/path` | IE10+ |

**Hash 模式实现：**

```javascript
class HashRouter {
  constructor() {
    this.routes = {};
    this.currentPath = '';

    window.addEventListener('hashchange', () => {
      this.currentPath = location.hash.slice(1) || '/';
      this.render();
    });

    window.addEventListener('load', () => {
      this.currentPath = location.hash.slice(1) || '/';
      this.render();
    });
  }

  route(path, callback) {
    this.routes[path] = callback;
  }

  push(path) {
    location.hash = path;
  }

  render() {
    const callback = this.routes[this.currentPath];
    callback?.();
  }
}
```

**History 模式实现：**

```javascript
class HistoryRouter {
  constructor() {
    this.routes = {};

    window.addEventListener('popstate', () => {
      this.render(location.pathname);
    });
  }

  route(path, callback) {
    this.routes[path] = callback;
  }

  push(path) {
    history.pushState(null, '', path);
    this.render(path);
  }

  render(path) {
    const callback = this.routes[path];
    callback?.();
  }
}
```

**Vue Router 核心实现：**

```javascript
// router-view 组件
const RouterView = {
  setup() {
    const route = inject('route');  // 当前路由

    return () => {
      const matched = route.matched[depth];  // 匹配的路由记录
      return h(matched.component);
    };
  }
};

// router-link 组件
const RouterLink = {
  props: ['to'],
  setup(props) {
    const router = inject('router');

    return () => h('a', {
      href: props.to,
      onClick(e) {
        e.preventDefault();
        router.push(props.to);
      }
    }, slots.default?.());
  }
};
```

**🔍 追问：History 模式为什么需要服务器配置？**

History 模式的 URL 是真实路径（如 `/user/123`）。刷新页面时，浏览器会向服务器请求这个路径。如果服务器没有配置，会返回 404。

```nginx
# Nginx 配置
location / {
  try_files $uri $uri/ /index.html;
}
```

---

### 14. Vuex/Pinia 的状态管理原理是什么？

**标准答案：**

**核心原理：响应式数据 + 发布订阅**

**Vuex 简化实现：**

```javascript
class Store {
  constructor(options) {
    // 状态响应式
    this._state = reactive({ data: options.state });

    // getters 计算属性
    this.getters = {};
    Object.keys(options.getters || {}).forEach(key => {
      Object.defineProperty(this.getters, key, {
        get: () => options.getters[key](this.state)
      });
    });

    // mutations 同步修改
    this._mutations = options.mutations;

    // actions 异步操作
    this._actions = options.actions;
  }

  get state() {
    return this._state.data;
  }

  commit(type, payload) {
    const mutation = this._mutations[type];
    mutation?.(this.state, payload);
  }

  dispatch(type, payload) {
    const action = this._actions[type];
    return action?.({ commit: this.commit.bind(this), state: this.state }, payload);
  }

  install(app) {
    app.provide('store', this);
    app.config.globalProperties.$store = this;
  }
}
```

**Pinia 简化实现：**

```javascript
function defineStore(id, options) {
  return function useStore() {
    // 已存在则复用
    if (stores.has(id)) {
      return stores.get(id);
    }

    // 创建 store
    const state = reactive(options.state?.() || {});
    const getters = {};
    const actions = {};

    // 处理 getters
    Object.keys(options.getters || {}).forEach(key => {
      getters[key] = computed(() => options.getters[key](state));
    });

    // 处理 actions（直接绑定 this）
    Object.keys(options.actions || {}).forEach(key => {
      actions[key] = options.actions[key].bind({ ...state, ...getters });
    });

    const store = reactive({
      ...toRefs(state),
      ...getters,
      ...actions,
      $reset() {
        Object.assign(state, options.state?.());
      }
    });

    stores.set(id, store);
    return store;
  };
}
```

**🔍 追问：Pinia 相比 Vuex 有什么优势？**

| Vuex | Pinia |
|------|-------|
| mutations + actions | 只有 actions |
| 模块需要嵌套 | 扁平化，独立 store |
| TypeScript 支持一般 | 完美支持 TypeScript |
| 需要 commit/dispatch | 直接调用方法 |
| Vue 2/3 都支持 | 主要针对 Vue 3 |

---

### 15. Vue 3 的 Composition API 和 Options API 有什么区别？为什么要引入 Composition API？

**标准答案：**

**Options API 的问题：**

```javascript
// 逻辑分散在各个选项中
export default {
  data() {
    return {
      // 功能 A 的数据
      searchQuery: '',
      // 功能 B 的数据
      sortType: 'asc'
    };
  },
  computed: {
    // 功能 A 的计算属性
    filteredList() { /* ... */ },
    // 功能 B 的计算属性
    sortedList() { /* ... */ }
  },
  methods: {
    // 功能 A 的方法
    search() { /* ... */ },
    // 功能 B 的方法
    sort() { /* ... */ }
  },
  mounted() {
    // 功能 A 和 B 的初始化混在一起
  }
};
```

**Composition API 的优势：**

```javascript
// 按逻辑关注点组织代码
export default {
  setup() {
    // 功能 A：完整的搜索逻辑
    const { searchQuery, filteredList, search } = useSearch();

    // 功能 B：完整的排序逻辑
    const { sortType, sortedList, sort } = useSort();

    return { searchQuery, filteredList, search, sortType, sortedList, sort };
  }
};

// 可复用的组合函数
function useSearch() {
  const searchQuery = ref('');
  const filteredList = computed(() => /* ... */);
  const search = () => { /* ... */ };

  onMounted(() => { /* 初始化 */ });

  return { searchQuery, filteredList, search };
}
```

**核心区别：**

| 对比 | Options API | Composition API |
|-----|-------------|-----------------|
| 代码组织 | 按选项类型（data/methods） | 按逻辑功能 |
| 逻辑复用 | Mixins（有命名冲突） | 组合函数（清晰来源） |
| TypeScript | 需要额外类型声明 | 天然类型推导 |
| this 访问 | 需要 this | 无 this，直接使用 |
| Tree Shaking | 整个组件 | 按需引入 |

**🔍 追问：Composition API 和 React Hooks 有什么区别？**

| 对比 | Vue Composition API | React Hooks |
|-----|---------------------|-------------|
| 执行次数 | setup 只执行一次 | 每次渲染都执行 |
| 调用限制 | 无（可在条件中调用） | 必须顶层调用 |
| 响应式 | 自动追踪依赖 | 手动声明依赖数组 |
| 心智模型 | 基于响应式 | 基于快照和闭包 |

```javascript
// Vue：setup 只执行一次，响应式自动追踪
setup() {
  const count = ref(0);
  const double = computed(() => count.value * 2); // 自动追踪 count
  return { count, double };
}

// React：每次渲染都执行，需要手动声明依赖
function Component() {
  const [count, setCount] = useState(0);
  const double = useMemo(() => count * 2, [count]); // 手动写 [count]
  return /* ... */;
}
```

---

### 16. Vue 3 的 watchEffect 和 watch 有什么区别？各自的使用场景是什么？

**标准答案：**

```javascript
import { ref, watch, watchEffect } from 'vue';

const count = ref(0);
const name = ref('Vue');

// watch：显式指定依赖，懒执行
watch(count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} -> ${newVal}`);
});

// watch 监听多个源
watch([count, name], ([newCount, newName], [oldCount, oldName]) => {
  console.log('多个值变化');
});

// watchEffect：自动收集依赖，立即执行
watchEffect(() => {
  console.log(`count is: ${count.value}`); // 自动追踪 count
});
```

**核心区别：**

| 特性 | watch | watchEffect |
|------|-------|-------------|
| 依赖声明 | 显式指定 | 自动收集 |
| 初始执行 | 默认不执行（lazy） | 立即执行 |
| 新旧值 | 可获取 | 无法获取 |
| 深度监听 | 需要 `deep: true` | 自动深度 |
| 停止监听 | 返回 stop 函数 | 返回 stop 函数 |

**watchEffect 原理：**

```javascript
// 简化实现
function watchEffect(effect) {
  const runner = () => {
    // 设置当前活跃 effect
    activeEffect = runner;
    // 执行时自动收集依赖
    effect();
    activeEffect = null;
  };

  runner(); // 立即执行

  return () => {
    // 清理：从依赖中移除 runner
    cleanupEffect(runner);
  };
}
```

**使用场景：**

```javascript
// watch：需要对比新旧值的场景
watch(userId, async (newId, oldId) => {
  if (newId !== oldId) {
    await fetchUserData(newId);
  }
});

// watchEffect：副作用自动追踪
watchEffect(() => {
  // 自动追踪 userId，变化时重新执行
  document.title = `User ${userId.value}`;
});

// watchEffect 清理副作用
watchEffect((onCleanup) => {
  const timer = setInterval(() => {
    console.log(count.value);
  }, 1000);

  onCleanup(() => clearInterval(timer));
});
```

**🔍 追问：watchPostEffect 和 watchSyncEffect 有什么区别？**

```javascript
// watchEffect - 默认 pre，组件更新前执行
watchEffect(() => { /* ... */ });

// watchPostEffect - 组件更新后执行，可访问更新后的 DOM
watchPostEffect(() => {
  console.log(element.value?.textContent); // 获取更新后的 DOM
});

// watchSyncEffect - 同步执行，响应式变化时立即执行
watchSyncEffect(() => {
  // 危险！可能导致无限循环
  console.log(count.value);
});
```

---

### 17. Vue 3 的 shallowRef 和 shallowReactive 是什么？什么时候使用？

**标准答案：**

**shallowRef：只有 .value 是响应式的**

```javascript
import { shallowRef, triggerRef } from 'vue';

const state = shallowRef({ count: 0, nested: { value: 1 } });

// ✅ 替换整个值会触发更新
state.value = { count: 1, nested: { value: 2 } };

// ❌ 修改内部属性不会触发更新
state.value.count = 2; // 不触发
state.value.nested.value = 3; // 不触发

// 手动触发更新
triggerRef(state);
```

**shallowReactive：只有根级属性是响应式的**

```javascript
import { shallowReactive } from 'vue';

const state = shallowReactive({
  count: 0,
  nested: { value: 1 }
});

// ✅ 根级属性修改会触发更新
state.count = 1;

// ❌ 嵌套属性修改不会触发更新
state.nested.value = 2; // 不触发
```

**使用场景：**

```javascript
// 1. 大型不可变数据（性能优化）
const bigData = shallowRef(immutableBigObject);

// 2. 集成第三方库（避免深度代理破坏原有功能）
const chart = shallowRef(null);
onMounted(() => {
  chart.value = new ECharts(element);
});

// 3. 频繁更新的扁平对象
const position = shallowReactive({ x: 0, y: 0 });
window.addEventListener('mousemove', (e) => {
  position.x = e.clientX;
  position.y = e.clientY;
});
```

**🔍 追问：如何判断一个值是否是响应式的？**

```javascript
import { isRef, isReactive, isProxy, isReadonly, toRaw } from 'vue';

const refVal = ref(0);
const reactiveVal = reactive({});
const readonlyVal = readonly({});

isRef(refVal);           // true
isReactive(reactiveVal); // true
isProxy(reactiveVal);    // true
isReadonly(readonlyVal); // true

// 获取原始对象
const raw = toRaw(reactiveVal);
```

---

### 18. Vue 的 v-model 在组件上是如何工作的？Vue 2 和 Vue 3 有什么区别？

**标准答案：**

**Vue 2 的 v-model：**

```javascript
// 语法糖展开
<CustomInput v-model="value" />
// 等同于
<CustomInput :value="value" @input="value = $event" />

// 组件实现
Vue.component('CustomInput', {
  props: ['value'],
  template: `
    <input :value="value" @input="$emit('input', $event.target.value)" />
  `
});

// 自定义 v-model（只能有一个）
Vue.component('CustomCheckbox', {
  model: {
    prop: 'checked',
    event: 'change'
  },
  props: ['checked'],
  template: `
    <input type="checkbox" :checked="checked" @change="$emit('change', $event.target.checked)" />
  `
});
```

**Vue 3 的 v-model：**

```javascript
// 默认展开
<CustomInput v-model="value" />
// 等同于
<CustomInput :modelValue="value" @update:modelValue="value = $event" />

// 组件实现
const CustomInput = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template: `
    <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
  `
};

// 多个 v-model（Vue 3 新特性）
<UserForm
  v-model:name="userName"
  v-model:email="userEmail"
/>

// 组件实现
const UserForm = {
  props: ['name', 'email'],
  emits: ['update:name', 'update:email'],
  template: `
    <input :value="name" @input="$emit('update:name', $event.target.value)" />
    <input :value="email" @input="$emit('update:email', $event.target.value)" />
  `
};
```

**v-model 修饰符：**

```javascript
// 内置修饰符
<input v-model.trim="text" />    // 自动去除首尾空格
<input v-model.number="num" />   // 转为数字
<input v-model.lazy="text" />    // change 事件而非 input

// 自定义修饰符（Vue 3）
<CustomInput v-model.capitalize="text" />

const CustomInput = {
  props: {
    modelValue: String,
    modelModifiers: { default: () => ({}) }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const handleInput = (e) => {
      let value = e.target.value;
      if (props.modelModifiers.capitalize) {
        value = value.charAt(0).toUpperCase() + value.slice(1);
      }
      emit('update:modelValue', value);
    };
    return { handleInput };
  }
};
```

**🔍 追问：defineModel 宏是什么？**

```javascript
// Vue 3.4+ 新增的编译器宏
<script setup>
const model = defineModel(); // 自动处理 props 和 emits
</script>

<template>
  <input v-model="model" />
</template>

// 带选项
const name = defineModel('name', { required: true, default: '' });
const count = defineModel('count', { type: Number, default: 0 });
```

---

### 19. Vue 的异步组件加载失败如何处理？Suspense 的错误边界是什么？

**标准答案：**

**defineAsyncComponent 的错误处理：**

```javascript
import { defineAsyncComponent } from 'vue';

const AsyncComponent = defineAsyncComponent({
  loader: () => import('./MyComponent.vue'),

  // 加载中显示的组件
  loadingComponent: LoadingSpinner,

  // 加载失败显示的组件
  errorComponent: ErrorDisplay,

  // 显示 loading 前的延迟（避免闪烁）
  delay: 200,

  // 超时时间，超时后显示错误组件
  timeout: 3000,

  // 错误处理函数
  onError(error, retry, fail, attempts) {
    if (error.message.includes('fetch') && attempts <= 3) {
      // 网络错误时重试
      retry();
    } else {
      fail();
    }
  }
});
```

**Suspense 的错误处理：**

```vue
<template>
  <!-- Suspense 本身不处理错误，需要配合 onErrorCaptured -->
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>

<script setup>
import { onErrorCaptured, ref } from 'vue';

const error = ref(null);

onErrorCaptured((err) => {
  error.value = err;
  return false; // 阻止错误继续传播
});
</script>
```

**自定义错误边界组件：**

```javascript
// ErrorBoundary.vue
export default {
  name: 'ErrorBoundary',
  props: {
    fallback: Function
  },
  data() {
    return { error: null };
  },
  errorCaptured(err, vm, info) {
    this.error = { err, vm, info };
    return false;
  },
  render() {
    if (this.error) {
      return this.fallback?.(this.error) || h('div', 'Something went wrong');
    }
    return this.$slots.default?.();
  }
};

// 使用
<ErrorBoundary :fallback="({ err }) => h('div', err.message)">
  <Suspense>
    <AsyncComponent />
    <template #fallback>Loading...</template>
  </Suspense>
</ErrorBoundary>
```

**🔍 追问：如何实现组件加载的进度显示？**

```javascript
// 使用 Vite 的 glob import 获取加载进度
const modules = import.meta.glob('./components/*.vue');

async function loadComponentWithProgress(name, onProgress) {
  const loader = modules[`./components/${name}.vue`];

  // 模拟进度（真实场景需要配合打包工具）
  const start = Date.now();
  onProgress(0);

  const module = await loader();

  onProgress(100);
  return module.default;
}
```

---

### 20. Vue 的 effectScope 是什么？有什么实际应用场景？

**标准答案：**

**effectScope 用于管理和批量清理响应式副作用：**

```javascript
import { effectScope, ref, computed, watchEffect } from 'vue';

const scope = effectScope();

scope.run(() => {
  const count = ref(0);
  const double = computed(() => count.value * 2);

  watchEffect(() => {
    console.log(count.value);
  });
});

// 一次性停止所有在 scope 内创建的响应式效果
scope.stop();
```

**实际应用场景：**

```javascript
// 1. 可复用的组合函数中管理副作用
function useMouse() {
  const scope = effectScope();
  const x = ref(0);
  const y = ref(0);

  scope.run(() => {
    const handler = (e) => {
      x.value = e.clientX;
      y.value = e.clientY;
    };

    window.addEventListener('mousemove', handler);

    onScopeDispose(() => {
      window.removeEventListener('mousemove', handler);
    });
  });

  return { x, y, stop: () => scope.stop() };
}

// 2. 状态管理库（如 Pinia）
class Store {
  constructor() {
    this.scope = effectScope(true); // detached scope
    this.state = this.scope.run(() => reactive({}));
  }

  dispose() {
    this.scope.stop();
  }
}

// 3. 条件性响应式逻辑
const enabled = ref(false);
let innerScope;

watch(enabled, (isEnabled) => {
  if (isEnabled) {
    innerScope = effectScope();
    innerScope.run(() => {
      // 创建条件性的响应式效果
    });
  } else {
    innerScope?.stop();
  }
});
```

**getCurrentScope 和 onScopeDispose：**

```javascript
import { getCurrentScope, onScopeDispose } from 'vue';

function useEventListener(target, event, handler) {
  target.addEventListener(event, handler);

  // 获取当前 scope
  const scope = getCurrentScope();
  if (scope) {
    // scope 销毁时自动清理
    onScopeDispose(() => {
      target.removeEventListener(event, handler);
    });
  }

  return () => target.removeEventListener(event, handler);
}
```

**🔍 追问：为什么 Pinia 使用 effectScope？**

Pinia 使用 effectScope 来：
1. 隔离每个 store 的响应式效果
2. 支持 HMR（热模块替换）时清理旧 store
3. 支持 SSR 时在请求结束后清理
4. 允许手动销毁 store 释放内存

---

### 21. Vue Router 的导航守卫执行顺序是怎样的？

**标准答案：**

**完整的导航解析流程：**

```
1. 触发导航
2. 在失活的组件里调用 beforeRouteLeave 守卫
3. 调用全局的 beforeEach 守卫
4. 在重用的组件里调用 beforeRouteUpdate 守卫
5. 在路由配置里调用 beforeEnter
6. 解析异步路由组件
7. 在被激活的组件里调用 beforeRouteEnter
8. 调用全局的 beforeResolve 守卫
9. 导航被确认
10. 调用全局的 afterEach 钩子
11. 触发 DOM 更新
12. 调用 beforeRouteEnter 守卫中传给 next 的回调函数
```

**代码示例：**

```javascript
// 全局守卫
router.beforeEach((to, from, next) => {
  console.log('1. beforeEach');
  next();
});

router.beforeResolve((to, from, next) => {
  console.log('6. beforeResolve');
  next();
});

router.afterEach((to, from) => {
  console.log('7. afterEach');
});

// 路由配置守卫
const routes = [
  {
    path: '/user/:id',
    component: User,
    beforeEnter: (to, from, next) => {
      console.log('4. beforeEnter');
      next();
    }
  }
];

// 组件内守卫
export default {
  beforeRouteLeave(to, from, next) {
    console.log('0. beforeRouteLeave (离开当前路由)');
    next();
  },
  beforeRouteUpdate(to, from, next) {
    console.log('3. beforeRouteUpdate (同一组件，参数变化)');
    next();
  },
  beforeRouteEnter(to, from, next) {
    console.log('5. beforeRouteEnter');
    // 此时组件实例还未创建，不能访问 this
    next(vm => {
      console.log('8. beforeRouteEnter callback (DOM 更新后)');
    });
  }
};
```

**Composition API 中使用：**

```javascript
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';

export default {
  setup() {
    onBeforeRouteLeave((to, from) => {
      const answer = window.confirm('确定离开？未保存的更改将丢失');
      if (!answer) return false;
    });

    onBeforeRouteUpdate((to, from) => {
      // 路由参数变化时触发
    });
  }
};
```

**🔍 追问：如何实现路由权限控制？**

```javascript
// 路由元信息配置
const routes = [
  {
    path: '/admin',
    component: Admin,
    meta: { requiresAuth: true, roles: ['admin'] }
  }
];

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth) {
    const isAuthenticated = await checkAuth();

    if (!isAuthenticated) {
      return next({ name: 'Login', query: { redirect: to.fullPath } });
    }

    const requiredRoles = to.meta.roles;
    if (requiredRoles && !hasRoles(requiredRoles)) {
      return next({ name: 'Forbidden' });
    }
  }

  next();
});
```

---

### 22. Vue 3 的 Fragments、Teleport、Suspense 三大新特性的实现原理是什么？

**标准答案：**

**1. Fragments（多根节点）：**

```javascript
// Vue 2：必须单根节点
<template>
  <div>
    <header />
    <main />
  </div>
</template>

// Vue 3：支持多根节点
<template>
  <header />
  <main />
  <footer />
</template>
```

**实现原理：**

```javascript
// 渲染时创建 Fragment 类型的 VNode
const Fragment = Symbol('Fragment');

function render(vnode) {
  if (vnode.type === Fragment) {
    // 不创建真实 DOM 节点，直接渲染子节点
    vnode.children.forEach(child => {
      patch(null, child, container);
    });
  }
}
```

**2. Teleport（传送门）：**

```vue
<template>
  <button @click="showModal = true">打开弹窗</button>

  <!-- 将内容渲染到 body 下 -->
  <Teleport to="body">
    <div v-if="showModal" class="modal">
      弹窗内容
    </div>
  </Teleport>
</template>
```

**实现原理：**

```javascript
const Teleport = {
  __isTeleport: true,
  process(n1, n2, container, anchor, internals) {
    const { mc: mountChildren, pc: patchChildren } = internals;

    if (!n1) {
      // 挂载：获取目标容器
      const target = document.querySelector(n2.props.to);
      // 将子节点挂载到目标容器
      mountChildren(n2.children, target);
    } else {
      // 更新
      patchChildren(n1, n2, target);

      // 目标变化时移动节点
      if (n2.props.to !== n1.props.to) {
        const newTarget = document.querySelector(n2.props.to);
        n2.children.forEach(child => {
          newTarget.appendChild(child.el);
        });
      }
    }
  }
};
```

**3. Suspense（异步组件加载）：**

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>

<script setup>
// 异步 setup
const data = await fetchData();
</script>
```

**实现原理：**

```javascript
const Suspense = {
  __isSuspense: true,
  process(n1, n2, container, anchor, internals) {
    if (!n1) {
      // 首次挂载
      const suspense = n2.suspense = {
        pendingBranch: null,
        isResolved: false,
        effects: []
      };

      // 先渲染 fallback
      const fallback = n2.children.fallback;
      patch(null, fallback, container);

      // 异步加载 default 内容
      const defaultSlot = n2.children.default;

      // 检测异步组件
      if (hasAsyncSetup(defaultSlot)) {
        suspense.pendingBranch = defaultSlot;

        // 等待所有异步依赖解决
        Promise.all(getAsyncDeps(defaultSlot)).then(() => {
          // 移除 fallback，渲染真实内容
          unmount(fallback);
          patch(null, defaultSlot, container);
          suspense.isResolved = true;

          // 执行缓存的副作用
          suspense.effects.forEach(fn => fn());
        });
      }
    }
  }
};
```

**🔍 追问：Teleport 的 disabled 属性有什么用？**

```vue
<Teleport to="body" :disabled="isMobile">
  <Modal />
</Teleport>

<!-- disabled=true 时，内容会在原位置渲染，不传送 -->
<!-- 常用于响应式场景：移动端原位显示，桌面端传送到 body -->
```

---

### 23. Vue 3 的编译优化有哪些？Block Tree 和 PatchFlags 是什么？

**标准答案：**

**1. 静态提升（Static Hoisting）：**

```javascript
// 模板
<div>
  <span>静态文本</span>
  <span>{{ dynamic }}</span>
</div>

// Vue 2：每次渲染都创建 VNode
function render() {
  return h('div', [
    h('span', '静态文本'),
    h('span', this.dynamic)
  ]);
}

// Vue 3：静态节点提升到渲染函数外
const _hoisted = h('span', '静态文本');

function render() {
  return h('div', [
    _hoisted, // 直接复用
    h('span', this.dynamic)
  ]);
}
```

**2. PatchFlags（补丁标记）：**

```javascript
// 标记动态节点的类型，精确更新
const PatchFlags = {
  TEXT: 1,           // 动态文本
  CLASS: 2,          // 动态 class
  STYLE: 4,          // 动态 style
  PROPS: 8,          // 动态属性
  FULL_PROPS: 16,    // 带有动态 key 的属性
  HYDRATE_EVENTS: 32,
  STABLE_FRAGMENT: 64,
  KEYED_FRAGMENT: 128,
  UNKEYED_FRAGMENT: 256,
  NEED_PATCH: 512,
  DYNAMIC_SLOTS: 1024,
  HOISTED: -1,       // 静态节点
  BAIL: -2           // 退出优化模式
};

// 编译结果示例
h('div', { class: dynamicClass }, text, PatchFlags.TEXT | PatchFlags.CLASS)
```

**3. Block Tree：**

```javascript
// 模板
<div>
  <span>static</span>
  <span>{{ msg }}</span>
  <div v-if="show">
    <span>{{ nested }}</span>
  </div>
</div>

// 编译后：Block 收集动态子节点
function render() {
  return openBlock(), createBlock('div', null, [
    createVNode('span', null, 'static'),
    createVNode('span', null, ctx.msg, PatchFlags.TEXT),
    ctx.show
      ? (openBlock(), createBlock('div', { key: 0 }, [
          createVNode('span', null, ctx.nested, PatchFlags.TEXT)
        ]))
      : createCommentVNode('v-if')
  ]);
}

// Block 结构
{
  type: 'div',
  dynamicChildren: [
    // 只包含动态节点，扁平化
    { type: 'span', children: msg, patchFlag: TEXT },
    { type: 'div', dynamicChildren: [...] } // 嵌套 Block
  ]
}
```

**4. 缓存事件处理函数：**

```javascript
// Vue 2：每次渲染创建新函数
h('button', { onClick: () => this.handleClick() })

// Vue 3：缓存处理函数
const _cache = [];

function render(_cache) {
  return h('button', {
    onClick: _cache[0] || (_cache[0] = () => this.handleClick())
  });
}
```

**🔍 追问：什么情况下会退出优化模式（BAIL）？**

```javascript
// 1. 使用 v-html/v-text 指令
<div v-html="rawHtml"></div>

// 2. 动态组件
<component :is="dynamicComp" />

// 3. 带有 ref 的节点（需要完整 patch）
<div ref="el">...</div>

// 4. 用户手写的渲染函数
// render() { return h(...) }
```

---

### 24. Vue 的模板编译过程是怎样的？AST 是什么？

**标准答案：**

**模板编译三阶段：**

```
Template -> Parse -> AST -> Transform -> AST -> Generate -> Render Function
```

**1. Parse（解析）：模板 → AST**

```javascript
// 模板
<div id="app">
  <span v-if="show">{{ msg }}</span>
</div>

// 解析后的 AST
{
  type: 'Element',
  tag: 'div',
  props: [{ name: 'id', value: 'app' }],
  children: [
    {
      type: 'Element',
      tag: 'span',
      directives: [{ name: 'if', exp: 'show' }],
      children: [
        { type: 'Interpolation', content: 'msg' }
      ]
    }
  ]
}
```

**2. Transform（转换）：优化 AST**

```javascript
// 转换阶段做的事情：
// 1. 静态节点标记（用于静态提升）
// 2. 指令转换（v-if → ConditionalExpression）
// 3. 插槽处理
// 4. 组件识别

{
  type: 'Element',
  tag: 'div',
  codegenNode: {
    type: 'VNodeCall',
    tag: '"div"',
    props: { id: 'app' },
    children: [
      {
        type: 'ConditionalExpression', // v-if 转换
        test: 'show',
        consequent: { /* span VNode */ },
        alternate: { type: 'CommentVNode' }
      }
    ],
    patchFlag: 0,
    dynamicProps: []
  }
}
```

**3. Generate（生成）：AST → 渲染函数**

```javascript
// 生成的渲染函数代码
function render(_ctx, _cache) {
  return (openBlock(), createBlock("div", { id: "app" }, [
    _ctx.show
      ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(_ctx.msg), 1))
      : createCommentVNode("v-if", true)
  ]))
}
```

**简化的解析器实现：**

```javascript
function parse(template) {
  const ast = { type: 'Root', children: [] };
  const stack = [ast];

  while (template) {
    const parent = stack[stack.length - 1];

    if (template.startsWith('</')) {
      // 结束标签
      const match = template.match(/^<\/(\w+)>/);
      stack.pop();
      template = template.slice(match[0].length);
    } else if (template.startsWith('<')) {
      // 开始标签
      const match = template.match(/^<(\w+)([^>]*)>/);
      const node = {
        type: 'Element',
        tag: match[1],
        props: parseProps(match[2]),
        children: []
      };
      parent.children.push(node);
      stack.push(node);
      template = template.slice(match[0].length);
    } else if (template.startsWith('{{')) {
      // 插值
      const match = template.match(/^\{\{(.+?)\}\}/);
      parent.children.push({
        type: 'Interpolation',
        content: match[1].trim()
      });
      template = template.slice(match[0].length);
    } else {
      // 文本
      const textEnd = template.indexOf('<');
      const text = template.slice(0, textEnd > -1 ? textEnd : undefined);
      if (text.trim()) {
        parent.children.push({ type: 'Text', content: text });
      }
      template = template.slice(text.length);
    }
  }

  return ast;
}
```

**🔍 追问：运行时编译和预编译有什么区别？**

| 对比 | 运行时编译 | 预编译（构建时） |
|------|-----------|-----------------|
| 时机 | 浏览器中执行 | 构建时完成 |
| 包体积 | 包含编译器（+30%） | 不需要编译器 |
| 性能 | 首次渲染慢 | 首次渲染快 |
| 使用场景 | 动态模板 | 标准 SFC 开发 |

---

### 25. Vue 中的 h 函数和 createVNode 有什么区别？手写渲染函数的最佳实践是什么？

**标准答案：**

**h 函数是 createVNode 的简写：**

```javascript
import { h, createVNode } from 'vue';

// h 函数：更简洁的 API
h('div', { class: 'container' }, [
  h('span', 'Hello'),
  h('span', 'World')
]);

// createVNode：更底层，支持更多参数
createVNode(
  'div',                    // type
  { class: 'container' },   // props
  ['Hello'],                // children
  PatchFlags.TEXT,          // patchFlag
  ['class']                 // dynamicProps
);
```

**区别：**

| 特性 | h() | createVNode() |
|------|-----|---------------|
| API 风格 | 简洁、灵活 | 完整、底层 |
| PatchFlag | 自动推断 | 可手动指定 |
| 使用场景 | 手写渲染函数 | 编译器生成 |
| 性能 | 略低（参数标准化） | 最优 |

**手写渲染函数最佳实践：**

```javascript
// 1. 函数式组件
const FunctionalComp = (props, { slots, emit, attrs }) => {
  return h('div', { class: 'wrapper' }, slots.default?.());
};

// 2. 动态组件渲染
const DynamicList = {
  props: ['items', 'itemComponent'],
  setup(props, { slots }) {
    return () => h('ul',
      props.items.map(item =>
        h('li', { key: item.id }, [
          h(props.itemComponent, { item })
        ])
      )
    );
  }
};

// 3. 使用 JSX（更易读）
const MyComponent = {
  setup() {
    const count = ref(0);
    return () => (
      <div class="counter">
        <span>{count.value}</span>
        <button onClick={() => count.value++}>+</button>
      </div>
    );
  }
};

// 4. 渲染插槽
const Card = {
  setup(props, { slots }) {
    return () => h('div', { class: 'card' }, [
      slots.header && h('header', slots.header()),
      h('main', slots.default?.()),
      slots.footer && h('footer', slots.footer())
    ]);
  }
};

// 5. 条件渲染
const ConditionalRender = {
  props: ['show'],
  setup(props) {
    return () => props.show
      ? h('div', 'Visible')
      : h('span', { style: 'display: none' });
      // 或者返回 null
  }
};
```

**🔍 追问：什么时候应该用渲染函数而不是模板？**

```javascript
// 1. 高度动态的组件
const DynamicHeading = {
  props: ['level'],
  setup(props, { slots }) {
    return () => h(`h${props.level}`, slots.default?.());
  }
};

// 2. 递归组件
const TreeNode = {
  props: ['node'],
  setup(props) {
    return () => h('li', [
      props.node.label,
      props.node.children && h('ul',
        props.node.children.map(child => h(TreeNode, { node: child }))
      )
    ]);
  }
};

// 3. 基于配置生成 UI
const FormRenderer = {
  props: ['schema'],
  setup(props) {
    return () => h('form',
      props.schema.fields.map(field => {
        const Component = fieldComponents[field.type];
        return h(Component, { key: field.name, ...field });
      })
    );
  }
};
```

---

### 26. Vue 的自定义指令是如何工作的？指令的生命周期是什么？

**标准答案：**

**自定义指令生命周期（Vue 3）：**

```javascript
const myDirective = {
  // 绑定元素的 attribute 或事件监听器被应用之前调用
  created(el, binding, vnode, prevVnode) {},

  // 元素被插入到 DOM 前调用
  beforeMount(el, binding, vnode, prevVnode) {},

  // 元素被插入到 DOM 后调用
  mounted(el, binding, vnode, prevVnode) {},

  // 父组件的 VNode 更新前调用
  beforeUpdate(el, binding, vnode, prevVnode) {},

  // 父组件及其子组件的 VNode 更新后调用
  updated(el, binding, vnode, prevVnode) {},

  // 元素被卸载前调用
  beforeUnmount(el, binding, vnode, prevVnode) {},

  // 元素被卸载后调用
  unmounted(el, binding, vnode, prevVnode) {}
};

// 注册
app.directive('my-directive', myDirective);

// 使用
<div v-my-directive:arg.modifier="value"></div>
```

**binding 对象结构：**

```javascript
{
  value: any,          // 当前值
  oldValue: any,       // 旧值（仅在 updated 中可用）
  arg: string,         // 参数 v-dir:arg
  modifiers: object,   // 修饰符 v-dir.foo.bar → { foo: true, bar: true }
  instance: object,    // 组件实例
  dir: object          // 指令定义对象
}
```

**实际应用示例：**

```javascript
// 1. v-focus：自动聚焦
app.directive('focus', {
  mounted(el) {
    el.focus();
  }
});

// 2. v-click-outside：点击外部关闭
app.directive('click-outside', {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!el.contains(event.target)) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el._clickOutside);
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside);
  }
});

// 3. v-lazy：图片懒加载
app.directive('lazy', {
  mounted(el, binding) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.src = binding.value;
        observer.disconnect();
      }
    });
    observer.observe(el);
    el._observer = observer;
  },
  unmounted(el) {
    el._observer?.disconnect();
  }
});

// 4. v-permission：权限控制
app.directive('permission', {
  mounted(el, binding) {
    const { value } = binding;
    const permissions = usePermissionStore().permissions;

    if (!permissions.includes(value)) {
      el.parentNode?.removeChild(el);
    }
  }
});

// 5. v-debounce：防抖输入
app.directive('debounce', {
  mounted(el, binding) {
    const { value, arg = 300 } = binding;
    let timer;

    el.addEventListener('input', (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => value(e.target.value), arg);
    });
  }
});
```

**🔍 追问：Vue 2 和 Vue 3 的指令生命周期有什么区别？**

| Vue 2 | Vue 3 | 说明 |
|-------|-------|------|
| bind | beforeMount | 指令首次绑定 |
| inserted | mounted | 元素插入 DOM |
| update | beforeUpdate + updated | 更新时 |
| componentUpdated | updated | 组件更新后 |
| unbind | unmounted | 指令解绑 |
| - | created | Vue 3 新增 |

---

### 27. Vue 3 的 defineExpose 是什么？组件实例暴露的最佳实践是什么？

**标准答案：**

**defineExpose 用于显式暴露组件内部属性：**

```vue
<!-- Child.vue -->
<script setup>
import { ref } from 'vue';

const count = ref(0);
const privateMethod = () => console.log('private');
const publicMethod = () => console.log('public');

// 只暴露需要的内容
defineExpose({
  count,
  publicMethod
});
</script>

<!-- Parent.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import Child from './Child.vue';

const childRef = ref(null);

onMounted(() => {
  console.log(childRef.value.count);      // ✅ 可访问
  childRef.value.publicMethod();           // ✅ 可调用
  // childRef.value.privateMethod();       // ❌ undefined
});
</script>

<template>
  <Child ref="childRef" />
</template>
```

**为什么需要 defineExpose？**

```javascript
// Vue 2 / Options API：所有内容都暴露
export default {
  data() {
    return { count: 0 };
  },
  methods: {
    increment() { this.count++; }
  }
};
// 父组件可以访问子组件所有属性和方法

// Vue 3 <script setup>：默认不暴露任何内容
// 必须使用 defineExpose 显式声明
```

**最佳实践：**

```javascript
// 1. 最小暴露原则：只暴露必要的接口
defineExpose({
  // ✅ 暴露稳定的公共 API
  reset: () => { /* ... */ },
  validate: () => { /* ... */ }
  // ❌ 不暴露内部状态和实现细节
});

// 2. 表单组件标准接口
const FormItem = {
  setup(props, { expose }) {
    const value = ref('');
    const error = ref('');

    const validate = () => {
      // 验证逻辑
      return !error.value;
    };

    const reset = () => {
      value.value = '';
      error.value = '';
    };

    // 标准表单接口
    expose({ validate, reset, value });
  }
};

// 3. 命令式组件（如 Dialog）
const Dialog = {
  setup(props, { expose }) {
    const visible = ref(false);

    const open = () => visible.value = true;
    const close = () => visible.value = false;

    expose({ open, close });
  }
};

// 使用
const dialogRef = ref(null);
dialogRef.value.open();
```

**🔍 追问：如何给暴露的内容添加 TypeScript 类型？**

```typescript
// 定义暴露的接口类型
interface FormExpose {
  validate: () => boolean;
  reset: () => void;
  value: Ref<string>;
}

// 方式 1：使用泛型
const formRef = ref<InstanceType<typeof FormItem> & FormExpose>();

// 方式 2：使用 defineExpose 返回值（Vue 3.3+）
const exposed = defineExpose<FormExpose>({
  validate,
  reset,
  value
});

// 方式 3：单独定义类型
export type FormInstance = {
  validate: () => boolean;
  reset: () => void;
};
```

---

### 28. Vue 的 Transition 和 TransitionGroup 的实现原理是什么？

**标准答案：**

**Transition 工作原理：**

```vue
<Transition name="fade">
  <div v-if="show">Content</div>
</Transition>

<style>
/* 进入过渡 */
.fade-enter-from { opacity: 0; }
.fade-enter-active { transition: opacity 0.3s; }
.fade-enter-to { opacity: 1; }

/* 离开过渡 */
.fade-leave-from { opacity: 1; }
.fade-leave-active { transition: opacity 0.3s; }
.fade-leave-to { opacity: 0; }
</style>
```

**过渡类名应用时机：**

```
进入过渡：
1. v-enter-from：插入前添加，插入后下一帧移除
2. v-enter-active：整个进入过渡期间
3. v-enter-to：插入后下一帧添加，过渡结束后移除

离开过渡：
1. v-leave-from：离开开始时添加，下一帧移除
2. v-leave-active：整个离开过渡期间
3. v-leave-to：离开开始后下一帧添加，过渡结束后移除
```

**简化的实现原理：**

```javascript
const Transition = {
  props: ['name', 'mode', 'appear'],
  setup(props, { slots }) {
    return () => {
      const child = slots.default()[0];

      // 包装子节点的钩子
      const enterHooks = {
        onBeforeEnter(el) {
          el.classList.add(`${props.name}-enter-from`);
          el.classList.add(`${props.name}-enter-active`);
        },
        onEnter(el, done) {
          requestAnimationFrame(() => {
            el.classList.remove(`${props.name}-enter-from`);
            el.classList.add(`${props.name}-enter-to`);

            el.addEventListener('transitionend', () => {
              el.classList.remove(`${props.name}-enter-active`);
              el.classList.remove(`${props.name}-enter-to`);
              done();
            }, { once: true });
          });
        }
      };

      const leaveHooks = {
        onBeforeLeave(el) {
          el.classList.add(`${props.name}-leave-from`);
          el.classList.add(`${props.name}-leave-active`);
        },
        onLeave(el, done) {
          requestAnimationFrame(() => {
            el.classList.remove(`${props.name}-leave-from`);
            el.classList.add(`${props.name}-leave-to`);

            el.addEventListener('transitionend', () => {
              done(); // 完成后才移除 DOM
            }, { once: true });
          });
        }
      };

      return cloneVNode(child, { ...enterHooks, ...leaveHooks });
    };
  }
};
```

**TransitionGroup 的 FLIP 动画：**

```javascript
// FLIP = First, Last, Invert, Play
const TransitionGroup = {
  setup(props, { slots }) {
    let positions = new Map();

    return () => {
      const children = slots.default();

      // First：记录移动前的位置
      onBeforeUpdate(() => {
        children.forEach(child => {
          const el = child.el;
          positions.set(child.key, el.getBoundingClientRect());
        });
      });

      // Last & Invert & Play：更新后计算并播放动画
      onUpdated(() => {
        children.forEach(child => {
          const el = child.el;
          const oldPos = positions.get(child.key);
          const newPos = el.getBoundingClientRect();

          const dx = oldPos.left - newPos.left;
          const dy = oldPos.top - newPos.top;

          if (dx || dy) {
            // Invert：移动到旧位置
            el.style.transform = `translate(${dx}px, ${dy}px)`;
            el.style.transition = 'none';

            // Play：动画到新位置
            requestAnimationFrame(() => {
              el.style.transition = 'transform 0.3s';
              el.style.transform = '';
            });
          }
        });
      });

      return h('div', children);
    };
  }
};
```

**🔍 追问：如何实现列表的交错动画？**

```vue
<TransitionGroup
  name="list"
  tag="ul"
  @before-enter="onBeforeEnter"
  @enter="onEnter"
>
  <li v-for="(item, index) in items" :key="item.id" :data-index="index">
    {{ item.text }}
  </li>
</TransitionGroup>

<script setup>
function onBeforeEnter(el) {
  el.style.opacity = 0;
  el.style.transform = 'translateY(20px)';
}

function onEnter(el, done) {
  const delay = el.dataset.index * 100; // 交错延迟

  setTimeout(() => {
    el.style.transition = 'all 0.3s';
    el.style.opacity = 1;
    el.style.transform = 'translateY(0)';

    el.addEventListener('transitionend', done, { once: true });
  }, delay);
}
</script>
```

---

### 29. Vue 的 KeepAlive 缓存淘汰策略是什么？如何自定义缓存策略？

**标准答案：**

**KeepAlive 默认使用 LRU（最近最少使用）算法：**

```javascript
// 简化的 LRU 缓存实现
class LRUCache {
  constructor(max) {
    this.max = max;
    this.cache = new Map();
  }

  get(key) {
    if (this.cache.has(key)) {
      // 访问时移到最后（最近使用）
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.max) {
      // 删除最久未使用的（第一个）
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}
```

**KeepAlive 的 max 属性：**

```vue
<!-- 最多缓存 10 个组件 -->
<KeepAlive :max="10">
  <component :is="currentComponent" />
</KeepAlive>

<!-- include/exclude 控制缓存 -->
<KeepAlive :include="['Home', 'About']" :exclude="['Login']">
  <router-view />
</KeepAlive>
```

**KeepAlive 源码中的缓存管理：**

```javascript
const KeepAlive = {
  setup(props, { slots }) {
    const cache = new Map();
    const keys = new Set(); // 用于 LRU 排序

    return () => {
      const vnode = slots.default()[0];
      const key = vnode.key || vnode.type;

      if (cache.has(key)) {
        // 命中缓存
        vnode.el = cache.get(key).el;
        vnode.component = cache.get(key).component;

        // LRU：移到最后
        keys.delete(key);
        keys.add(key);
      } else {
        // 未命中，添加到缓存
        cache.set(key, vnode);
        keys.add(key);

        // 超出 max，淘汰最久未使用的
        if (props.max && keys.size > props.max) {
          const firstKey = keys.values().next().value;
          pruneCacheEntry(cache.get(firstKey));
          cache.delete(firstKey);
          keys.delete(firstKey);
        }
      }

      // 标记为 keepAlive
      vnode.shapeFlag |= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE;

      return vnode;
    };
  }
};
```

**自定义缓存策略：**

```javascript
// 基于时间的缓存策略
function useTimedCache(ttl = 60000) {
  const cache = new Map();

  return {
    get(key) {
      const item = cache.get(key);
      if (item && Date.now() - item.time < ttl) {
        return item.value;
      }
      cache.delete(key);
      return undefined;
    },
    set(key, value) {
      cache.set(key, { value, time: Date.now() });
    },
    clear() {
      cache.clear();
    }
  };
}

// 手动控制缓存（配合 router）
const cachedViews = ref(['Home']);

function addCachedView(name) {
  if (!cachedViews.value.includes(name)) {
    cachedViews.value.push(name);
  }
}

function removeCachedView(name) {
  const index = cachedViews.value.indexOf(name);
  if (index > -1) {
    cachedViews.value.splice(index, 1);
  }
}

// 使用
<KeepAlive :include="cachedViews">
  <router-view />
</KeepAlive>
```

**🔍 追问：如何监听 KeepAlive 缓存的添加和移除？**

```javascript
// Vue 3.3+ 新增的 onCacheHit 等钩子
const KeepAlive = {
  onCacheHit(vnode) {
    console.log('Cache hit:', vnode.type.name);
  },
  onBeforeUnmount(vnode) {
    console.log('Component deactivated:', vnode.type.name);
  }
};

// 或者通过组件的 activated/deactivated
export default {
  activated() {
    console.log('Component activated from cache');
  },
  deactivated() {
    console.log('Component deactivated to cache');
  }
};
```

---

### 30. Vue 3 的 SSR 和 Hydration 是如何工作的？

**标准答案：**

**SSR 工作流程：**

```
1. 服务端：createSSRApp → renderToString → HTML 字符串
2. 传输：HTML + JS 发送到客户端
3. 客户端：createSSRApp → 挂载 → Hydration（激活）
```

**服务端渲染：**

```javascript
// server.js
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import App from './App.vue';

async function render(url) {
  const app = createSSRApp(App);

  // 路由处理
  const router = createRouter();
  app.use(router);
  await router.push(url);
  await router.isReady();

  // 渲染为 HTML 字符串
  const html = await renderToString(app);

  // 注入状态
  const state = JSON.stringify(store.state);

  return `
    <!DOCTYPE html>
    <html>
      <head><title>SSR App</title></head>
      <body>
        <div id="app">${html}</div>
        <script>window.__INITIAL_STATE__ = ${state}</script>
        <script src="/client.js"></script>
      </body>
    </html>
  `;
}
```

**Hydration（水合/激活）原理：**

```javascript
// client.js
import { createSSRApp } from 'vue';
import App from './App.vue';

const app = createSSRApp(App);

// 恢复状态
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__);
}

// 挂载时进行 Hydration
app.mount('#app');
```

**Hydration 过程：**

```javascript
// 简化的 Hydration 逻辑
function hydrate(vnode, container) {
  // 1. 获取服务端渲染的 DOM
  const el = container.firstChild;

  // 2. 将 VNode 与真实 DOM 关联
  vnode.el = el;

  // 3. 递归处理子节点
  if (vnode.children) {
    hydrateChildren(vnode.children, el);
  }

  // 4. 添加事件监听器
  if (vnode.props) {
    for (const key in vnode.props) {
      if (key.startsWith('on')) {
        el.addEventListener(key.slice(2).toLowerCase(), vnode.props[key]);
      }
    }
  }

  // 5. 建立响应式连接
  setupReactivity(vnode);
}

// Hydration 不会重新创建 DOM，只是"激活"现有 DOM
```

**Hydration Mismatch 问题：**

```javascript
// 常见的 mismatch 场景
<template>
  <!-- ❌ 客户端/服务端渲染结果不一致 -->
  <div>{{ Date.now() }}</div>
  <div>{{ Math.random() }}</div>

  <!-- ❌ 仅客户端可用的 API -->
  <div>{{ window.innerWidth }}</div>

  <!-- ✅ 使用 ClientOnly 包装 -->
  <ClientOnly>
    <div>{{ window.innerWidth }}</div>
  </ClientOnly>
</template>

// ClientOnly 组件实现
const ClientOnly = {
  setup(_, { slots }) {
    const mounted = ref(false);
    onMounted(() => { mounted.value = true; });
    return () => mounted.value ? slots.default?.() : null;
  }
};
```

**🔍 追问：Vue 3 的 SSR 相比 Vue 2 有什么改进？**

| 对比 | Vue 2 SSR | Vue 3 SSR |
|------|-----------|-----------|
| 渲染器 | vue-server-renderer | @vue/server-renderer |
| 流式渲染 | renderToStream | renderToNodeStream/renderToWebStream |
| 异步组件 | 需要 async setup | 原生支持 Suspense |
| Hydration | 静默失败 | 开发环境警告，可配置 |
| 性能 | - | 提升 2-3 倍 |

```javascript
// Vue 3 流式渲染
import { renderToNodeStream } from 'vue/server-renderer';

app.get('/', async (req, res) => {
  const stream = renderToNodeStream(app);

  res.write('<!DOCTYPE html><html><body><div id="app">');

  stream.pipe(res, { end: false });

  stream.on('end', () => {
    res.write('</div></body></html>');
    res.end();
  });
});
```
