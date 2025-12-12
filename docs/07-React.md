# React 面试题

## 基础概念

### 1. React 的核心特性是什么？

**答案：**

1. **声明式编程**：描述 UI 应该是什么样子，而不是如何变化
2. **组件化**：将 UI 拆分为独立可复用的组件
3. **虚拟 DOM**：高效的 DOM 更新策略
4. **单向数据流**：数据从父组件流向子组件
5. **JSX**：JavaScript 的语法扩展，描述 UI

---

### 2. JSX 是什么？原理是什么？

**答案：**

JSX 是 JavaScript 的语法扩展，允许在 JavaScript 中编写类似 HTML 的代码。

```jsx
// JSX
const element = <h1 className="title">Hello, world!</h1>;

// Babel 编译后（React 17 之前）
const element = React.createElement(
  'h1',
  { className: 'title' },
  'Hello, world!'
);

// React 17+ 新的 JSX 转换
import { jsx as _jsx } from 'react/jsx-runtime';
const element = _jsx('h1', { className: 'title', children: 'Hello, world!' });
```

**JSX 规则：**
```jsx
// 1. 必须有一个根元素（或使用 Fragment）
<>
  <div>1</div>
  <div>2</div>
</>

// 2. 标签必须闭合
<img src="..." />

// 3. 使用 className 而不是 class
<div className="container">

// 4. 使用 htmlFor 而不是 for
<label htmlFor="input">

// 5. 事件使用驼峰命名
<button onClick={handleClick}>

// 6. 内联样式是对象
<div style={{ color: 'red', fontSize: '16px' }}>

// 7. 条件渲染
{isLoggedIn && <Dashboard />}
{isLoggedIn ? <Dashboard /> : <Login />}

// 8. 列表渲染
{items.map(item => <li key={item.id}>{item.name}</li>)}
```

---

### 3. 函数组件和类组件的区别？

**答案：**

```jsx
// 函数组件
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

// 类组件
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

| 特性 | 函数组件 | 类组件 |
|------|----------|--------|
| 语法 | 普通函数 | ES6 class |
| this | 无 | 有 |
| 状态 | useState | this.state |
| 生命周期 | useEffect | componentDidMount 等 |
| 性能 | 稍好 | 稍差 |
| 代码量 | 更少 | 更多 |
| 推荐程度 | 推荐 | 逐渐弃用 |

**函数组件闭包陷阱：**
```jsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      // 这里的 count 始终是 0（闭包捕获了初始值）
      console.log(count);
    }, 1000);
    return () => clearInterval(timer);
  }, []); // 空依赖

  // 解决方案 1：添加依赖
  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count);
    }, 1000);
    return () => clearInterval(timer);
  }, [count]);

  // 解决方案 2：使用 ref
  const countRef = useRef(count);
  countRef.current = count;
  useEffect(() => {
    const timer = setInterval(() => {
      console.log(countRef.current);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 解决方案 3：使用函数式更新
  setCount(c => c + 1);
}
```

---

### 4. React 的生命周期

**答案：**

**类组件生命周期：**
```jsx
class MyComponent extends React.Component {
  // 挂载阶段
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  static getDerivedStateFromProps(props, state) {
    // 根据 props 更新 state
    // 返回新 state 或 null
    return null;
  }

  componentDidMount() {
    // 组件挂载后
    // 适合：发起请求、订阅、操作 DOM
  }

  // 更新阶段
  shouldComponentUpdate(nextProps, nextState) {
    // 返回 false 可以阻止更新
    return true;
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    // 在 DOM 更新前获取信息
    // 返回值传给 componentDidUpdate
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // DOM 更新后
    // 注意避免死循环
    if (prevProps.id !== this.props.id) {
      this.fetchData(this.props.id);
    }
  }

  // 卸载阶段
  componentWillUnmount() {
    // 清理工作：取消订阅、清除定时器
  }

  // 错误处理
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误日志
  }

  render() {
    return <div>{this.state.count}</div>;
  }
}
```

**函数组件生命周期（Hooks）：**
```jsx
function MyComponent() {
  // 相当于 constructor
  const [count, setCount] = useState(0);

  // 相当于 componentDidMount
  useEffect(() => {
    console.log('mounted');
    return () => {
      // 相当于 componentWillUnmount
      console.log('unmounted');
    };
  }, []);

  // 相当于 componentDidUpdate（监听特定值）
  useEffect(() => {
    console.log('count updated:', count);
  }, [count]);

  // 相当于 getDerivedStateFromProps
  // 直接在渲染时计算
  const derivedValue = computeFromProps(props);

  // 相当于 shouldComponentUpdate
  // 使用 React.memo
  const MemoizedComponent = React.memo(Component);

  // 相当于 getSnapshotBeforeUpdate
  useLayoutEffect(() => {
    // 在 DOM 更新后同步执行
  }, []);

  return <div>{count}</div>;
}
```

---

## Hooks

### 5. 常用的 React Hooks 有哪些？

**答案：**

**useState - 状态管理：**
```jsx
const [count, setCount] = useState(0);
const [user, setUser] = useState({ name: '', age: 0 });

// 函数式更新（基于之前的值）
setCount(c => c + 1);

// 惰性初始化（只在首次渲染时执行）
const [data, setData] = useState(() => expensiveComputation());
```

**useEffect - 副作用处理：**
```jsx
// 每次渲染后执行
useEffect(() => {
  document.title = `Count: ${count}`;
});

// 仅在挂载时执行
useEffect(() => {
  fetchData();
}, []);

// 监听特定依赖
useEffect(() => {
  fetchUser(userId);
}, [userId]);

// 清理函数
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);
```

**useContext - 上下文：**
```jsx
const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <ThemedButton />
    </ThemeContext.Provider>
  );
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Themed Button</button>;
}
```

**useReducer - 复杂状态：**
```jsx
const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </>
  );
}
```

**useCallback - 缓存函数：**
```jsx
// 避免函数在每次渲染时重新创建
const handleClick = useCallback(() => {
  console.log('clicked', count);
}, [count]);

// 常与 React.memo 配合使用
const MemoChild = React.memo(({ onClick }) => {
  return <button onClick={onClick}>Click</button>;
});

<MemoChild onClick={handleClick} />
```

**useMemo - 缓存计算结果：**
```jsx
// 避免昂贵计算在每次渲染时执行
const expensiveResult = useMemo(() => {
  return items.filter(item => item.active).sort((a, b) => a.name.localeCompare(b.name));
}, [items]);
```

**useRef - 引用：**
```jsx
// 引用 DOM 元素
const inputRef = useRef(null);
useEffect(() => {
  inputRef.current.focus();
}, []);
<input ref={inputRef} />

// 保存可变值（不触发重新渲染）
const countRef = useRef(0);
countRef.current++;
```

**useLayoutEffect - 同步执行：**
```jsx
// 在 DOM 更新后同步执行，阻塞浏览器绘制
useLayoutEffect(() => {
  // 测量 DOM、同步修改样式
  const { height } = ref.current.getBoundingClientRect();
}, []);
```

**useImperativeHandle - 自定义 ref：**
```jsx
const FancyInput = forwardRef((props, ref) => {
  const inputRef = useRef();

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    getValue: () => inputRef.current.value
  }));

  return <input ref={inputRef} />;
});

// 父组件
const ref = useRef();
<FancyInput ref={ref} />
ref.current.focus();
```

---

### 6. useEffect 和 useLayoutEffect 的区别？

**答案：**

| 特性 | useEffect | useLayoutEffect |
|------|-----------|-----------------|
| 执行时机 | 异步，在浏览器绘制后 | 同步，在 DOM 更新后、绘制前 |
| 阻塞渲染 | 不阻塞 | 阻塞 |
| 使用场景 | 数据获取、订阅、日志 | DOM 测量、同步修改样式 |

```jsx
function Example() {
  const [width, setWidth] = useState(0);
  const ref = useRef();

  // useEffect - 可能会出现闪烁
  useEffect(() => {
    setWidth(ref.current.offsetWidth);
  }, []);

  // useLayoutEffect - 不会闪烁
  useLayoutEffect(() => {
    setWidth(ref.current.offsetWidth);
  }, []);

  return <div ref={ref} style={{ width }}>Content</div>;
}
```

---

### 7. 自定义 Hook

**答案：**

自定义 Hook 是以 `use` 开头的函数，可以调用其他 Hooks。

```jsx
// useLocalStorage - 持久化状态
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = value => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue];
}

// useFetch - 数据获取
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(url, { signal: abortController.signal });
        const json = await response.json();
        setData(json);
        setError(null);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    return () => abortController.abort();
  }, [url]);

  return { data, loading, error };
}

// useDebounce - 防抖
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// useWindowSize - 窗口尺寸
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// usePrevious - 保存前一个值
function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
```

---

### 8. Hooks 的使用规则

**答案：**

**规则 1：只在最顶层使用 Hooks**
```jsx
// ❌ 错误 - 条件语句中
if (condition) {
  useEffect(() => {});
}

// ❌ 错误 - 循环中
for (let i = 0; i < count; i++) {
  useState(i);
}

// ❌ 错误 - 嵌套函数中
function handleClick() {
  useState(0);
}

// ✅ 正确 - 顶层
function Component() {
  const [count, setCount] = useState(0);
  useEffect(() => {}, []);
  return <div>{count}</div>;
}
```

**规则 2：只在 React 函数中调用 Hooks**
```jsx
// ❌ 错误 - 普通函数
function getCount() {
  return useState(0);
}

// ✅ 正确 - React 函数组件
function Counter() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}

// ✅ 正确 - 自定义 Hook
function useCounter() {
  const [count, setCount] = useState(0);
  return { count, setCount };
}
```

**原因：**
React 依赖 Hooks 的调用顺序来正确关联状态。如果条件调用，顺序可能会变化，导致状态错乱。

---

## 状态管理

### 9. React 的状态提升和 Context

**答案：**

**状态提升：**
```jsx
// 将共享状态提升到最近的公共祖先
function Parent() {
  const [value, setValue] = useState('');

  return (
    <>
      <InputA value={value} onChange={setValue} />
      <InputB value={value} onChange={setValue} />
    </>
  );
}

function InputA({ value, onChange }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}
```

**Context：**
```jsx
// 创建 Context
const UserContext = createContext(null);

// Provider 提供数据
function App() {
  const [user, setUser] = useState({ name: '张三' });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Dashboard />
    </UserContext.Provider>
  );
}

// Consumer 消费数据
function Profile() {
  const { user, setUser } = useContext(UserContext);
  return <div>{user.name}</div>;
}

// Context 优化
// 分离不常变化的数据
const UserContext = createContext(null);
const UserDispatchContext = createContext(null);

function UserProvider({ children }) {
  const [user, setUser] = useState({ name: '张三' });

  return (
    <UserContext.Provider value={user}>
      <UserDispatchContext.Provider value={setUser}>
        {children}
      </UserDispatchContext.Provider>
    </UserContext.Provider>
  );
}
```

---

### 10. Redux 的核心概念和使用

**答案：**

**核心概念：**
- **Store**：存储状态的容器
- **Action**：描述发生了什么的对象
- **Reducer**：根据 Action 更新状态的纯函数
- **Dispatch**：触发 Action 的方法

**传统 Redux：**
```jsx
// actions.js
const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';

const increment = () => ({ type: INCREMENT });
const decrement = () => ({ type: DECREMENT });

// reducer.js
const initialState = { count: 0 };

function counterReducer(state = initialState, action) {
  switch (action.type) {
    case INCREMENT:
      return { ...state, count: state.count + 1 };
    case DECREMENT:
      return { ...state, count: state.count - 1 };
    default:
      return state;
  }
}

// store.js
import { createStore } from 'redux';
const store = createStore(counterReducer);

// 组件中使用
import { useSelector, useDispatch } from 'react-redux';

function Counter() {
  const count = useSelector(state => state.count);
  const dispatch = useDispatch();

  return (
    <>
      <span>{count}</span>
      <button onClick={() => dispatch(increment())}>+</button>
    </>
  );
}
```

**Redux Toolkit（推荐）：**
```jsx
// store/counterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: state => {
      state.value += 1; // 可以直接修改（immer）
    },
    decrement: state => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    }
  }
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;

// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer
  }
});

// 异步 Action
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (userId) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  }
);

// 在 slice 中处理异步
const usersSlice = createSlice({
  name: 'users',
  initialState: { entities: [], loading: 'idle' },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchUserById.pending, state => {
        state.loading = 'loading';
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = 'idle';
        state.entities.push(action.payload);
      })
      .addCase(fetchUserById.rejected, state => {
        state.loading = 'failed';
      });
  }
});
```

---

## 性能优化

### 11. React 性能优化方法

**答案：**

**1. React.memo - 避免不必要的重新渲染：**
```jsx
const MemoizedComponent = React.memo(function MyComponent(props) {
  return <div>{props.name}</div>;
});

// 自定义比较函数
const MemoizedComponent = React.memo(MyComponent, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id;
});
```

**2. useMemo - 缓存计算结果：**
```jsx
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
```

**3. useCallback - 缓存函数：**
```jsx
const handleClick = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

**4. 代码分割：**
```jsx
// 动态导入
const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}

// 路由懒加载
const Home = React.lazy(() => import('./routes/Home'));
const About = React.lazy(() => import('./routes/About'));
```

**5. 虚拟列表：**
```jsx
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={35}
      width={300}
    >
      {({ index, style }) => (
        <div style={style}>{items[index].name}</div>
      )}
    </FixedSizeList>
  );
}
```

**6. 避免在渲染中创建对象/函数：**
```jsx
// ❌ 每次渲染都创建新对象
<Component style={{ color: 'red' }} />

// ✅ 提取到外部或 useMemo
const style = useMemo(() => ({ color: 'red' }), []);
<Component style={style} />
```

**7. 使用 key 优化列表：**
```jsx
// ✅ 使用稳定的唯一 key
{items.map(item => <Item key={item.id} {...item} />)}
```

**8. 批量更新：**
```jsx
// React 18 自动批量更新
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 只会触发一次重新渲染
}
```

---

### 12. React.memo、useMemo、useCallback 的区别

**答案：**

| 特性 | React.memo | useMemo | useCallback |
|------|------------|---------|-------------|
| 用途 | 缓存组件 | 缓存值 | 缓存函数 |
| 类型 | HOC | Hook | Hook |
| 比较方式 | 浅比较 props | 比较依赖 | 比较依赖 |
| 返回值 | 组件 | 任意值 | 函数 |

```jsx
// React.memo - 当 props 不变时，跳过重新渲染
const MemoizedChild = React.memo(function Child({ name }) {
  console.log('Child rendered');
  return <div>{name}</div>;
});

// useMemo - 缓存计算结果
function Parent({ items }) {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  return <List items={sortedItems} />;
}

// useCallback - 缓存函数引用
function Parent() {
  const [count, setCount] = useState(0);

  // 没有 useCallback，每次渲染都是新函数
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return <MemoizedChild onClick={handleClick} />;
}
```

**最佳实践：**
```jsx
// 不需要优化的情况
// 组件简单、渲染快、props 经常变化

// 需要优化的情况
// 1. 子组件渲染昂贵
// 2. 传递给已优化子组件的回调
// 3. 作为其他 Hook 的依赖
```

---

## 虚拟 DOM 和 Diff

### 13. React 虚拟 DOM 和 Diff 算法

**答案：**

**虚拟 DOM：**
```jsx
// JSX
<div className="container">
  <h1>Title</h1>
  <p>Content</p>
</div>

// 虚拟 DOM 对象
{
  type: 'div',
  props: {
    className: 'container',
    children: [
      { type: 'h1', props: { children: 'Title' } },
      { type: 'p', props: { children: 'Content' } }
    ]
  }
}
```

**Diff 算法策略：**

1. **同层比较**：只比较同一层级的节点
2. **类型不同直接替换**：如果节点类型不同，直接销毁旧节点创建新节点
3. **key 优化**：通过 key 识别可复用的节点

```jsx
// Diff 过程
// 1. 比较根节点类型
// 2. 如果类型相同，更新属性
// 3. 递归比较子节点
// 4. 使用 key 匹配可复用的子节点

// 不加 key 的问题
// 旧: [A, B, C]
// 新: [D, A, B, C]
// React 会更新所有节点：A->D, B->A, C->B, 新增 C

// 加 key 后
// 旧: [A:1, B:2, C:3]
// 新: [D:4, A:1, B:2, C:3]
// React 只会新增 D，移动 A、B、C
```

---

## 高级特性

### 14. React 的错误边界

**答案：**

错误边界是捕获子组件树中 JavaScript 错误的组件。

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // 更新 state，下次渲染显示降级 UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误日志
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    // 发送到错误监控服务
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong.</h2>
          <details>
            <summary>Error Details</summary>
            <pre>{this.state.error?.toString()}</pre>
          </details>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 使用
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>

// 使用 react-error-boundary 库
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onReset={() => {
    // 重置应用状态
  }}
>
  <MyComponent />
</ErrorBoundary>
```

**注意：** 错误边界无法捕获以下错误：
- 事件处理器中的错误
- 异步代码（setTimeout、requestAnimationFrame）
- 服务端渲染
- 错误边界自身抛出的错误

---

### 15. React 18 新特性

**答案：**

**1. 并发特性（Concurrent Features）：**
```jsx
// useTransition - 标记非紧急更新
function SearchResults() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleChange(e) {
    // 紧急更新：输入框
    setQuery(e.target.value);

    // 非紧急更新：搜索结果
    startTransition(() => {
      setSearchQuery(e.target.value);
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending ? <Spinner /> : <Results query={searchQuery} />}
    </>
  );
}

// useDeferredValue - 延迟更新值
function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query);

  return (
    <ul>
      {results.filter(r => r.includes(deferredQuery)).map(r => (
        <li key={r}>{r}</li>
      ))}
    </ul>
  );
}
```

**2. 自动批处理（Automatic Batching）：**
```jsx
// React 18 之前，异步操作中不会批处理
setTimeout(() => {
  setCount(c => c + 1); // 触发重新渲染
  setFlag(f => !f);     // 触发重新渲染
}, 1000);

// React 18，自动批处理
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 只触发一次重新渲染
}, 1000);

// 如果需要立即更新
import { flushSync } from 'react-dom';

flushSync(() => {
  setCount(c => c + 1);
});
// DOM 已更新
flushSync(() => {
  setFlag(f => !f);
});
```

**3. Suspense 增强：**
```jsx
// 支持服务端渲染
<Suspense fallback={<Loading />}>
  <Comments />
</Suspense>

// 嵌套 Suspense
<Suspense fallback={<PageSkeleton />}>
  <Header />
  <Suspense fallback={<ContentSkeleton />}>
    <MainContent />
  </Suspense>
</Suspense>
```

**4. 新的客户端/服务端 API：**
```jsx
// 客户端
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'));
root.render(<App />);

// 服务端
import { renderToPipeableStream } from 'react-dom/server';

const stream = renderToPipeableStream(<App />, {
  onShellReady() {
    response.setHeader('content-type', 'text/html');
    stream.pipe(response);
  }
});
```

**5. useId - 生成唯一 ID：**
```jsx
function PasswordField() {
  const passwordId = useId();

  return (
    <>
      <label htmlFor={passwordId}>Password:</label>
      <input id={passwordId} type="password" />
    </>
  );
}
```

**6. useSyncExternalStore - 订阅外部 store：**
```jsx
import { useSyncExternalStore } from 'react';

function useOnlineStatus() {
  return useSyncExternalStore(
    // subscribe
    callback => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    // getSnapshot
    () => navigator.onLine,
    // getServerSnapshot
    () => true
  );
}
```

---

### 16. React Router 的使用

**答案：**

```jsx
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
  Outlet
} from 'react-router-dom';

// 基本路由
function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
          About
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users/:id" element={<User />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

// 嵌套路由
function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}

function Layout() {
  return (
    <div>
      <nav>...</nav>
      <main>
        <Outlet /> {/* 渲染子路由 */}
      </main>
    </div>
  );
}

// 路由 Hooks
function User() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleClick = () => {
    navigate('/home');
    // navigate(-1); // 返回
    // navigate('/user/1', { replace: true }); // 替换
    // navigate('/user/1', { state: { from: 'dashboard' } }); // 传递状态
  };

  return <div>User {id}</div>;
}

// 路由守卫
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

// 路由懒加载
const Dashboard = React.lazy(() => import('./Dashboard'));

<Route
  path="/dashboard"
  element={
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  }
/>
```

---

### 17. Fiber 架构是什么？

**答案：**

Fiber 是 React 16 引入的新协调引擎，实现了增量渲染。

**核心思想：**
1. **可中断渲染**：将渲染工作分解为小单元，可以暂停和恢复
2. **优先级调度**：高优先级任务可以打断低优先级任务
3. **并发模式**：支持同时处理多个更新

**Fiber 节点结构：**
```javascript
{
  type: 'div',           // 节点类型
  key: null,             // key
  props: {},             // props
  stateNode: null,       // DOM 节点或组件实例
  return: Fiber,         // 父 Fiber
  child: Fiber,          // 第一个子 Fiber
  sibling: Fiber,        // 下一个兄弟 Fiber
  alternate: Fiber,      // 双缓存中的另一个 Fiber
  effectTag: 'PLACEMENT', // 副作用标记
  // ...
}
```

**双缓存：**
```
current Fiber 树（当前屏幕显示）
         ↓
   更新时构建 workInProgress Fiber 树
         ↓
   完成后切换
         ↓
workInProgress 变成新的 current
```

**工作循环：**
```javascript
// 简化的工作循环
function workLoop(deadline) {
  while (nextUnitOfWork && deadline.timeRemaining() > 0) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }

  if (!nextUnitOfWork && workInProgressRoot) {
    commitRoot(); // 提交阶段（不可中断）
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);
```

---

### 18. React 服务端渲染（SSR）

**答案：**

**传统 SSR：**
```jsx
// server.js
import express from 'express';
import { renderToString } from 'react-dom/server';
import App from './App';

const app = express();

app.get('*', (req, res) => {
  const html = renderToString(<App />);

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>My App</title>
      </head>
      <body>
        <div id="root">${html}</div>
        <script src="/bundle.js"></script>
      </body>
    </html>
  `);
});

// client.js
import { hydrateRoot } from 'react-dom/client';
import App from './App';

hydrateRoot(document.getElementById('root'), <App />);
```

**React 18 流式 SSR：**
```jsx
import { renderToPipeableStream } from 'react-dom/server';

app.get('*', (req, res) => {
  const { pipe, abort } = renderToPipeableStream(
    <App />,
    {
      bootstrapScripts: ['/bundle.js'],
      onShellReady() {
        res.setHeader('content-type', 'text/html');
        pipe(res);
      },
      onShellError(err) {
        res.statusCode = 500;
        res.send('<!DOCTYPE html><html><body><h1>Error</h1></body></html>');
      },
      onError(err) {
        console.error(err);
      }
    }
  );

  setTimeout(() => abort(), 10000);
});
```

**Next.js 服务端渲染：**
```jsx
// pages/users/[id].js

// getServerSideProps - 每次请求时执行
export async function getServerSideProps(context) {
  const { id } = context.params;
  const user = await fetchUser(id);

  return {
    props: { user }
  };
}

// getStaticProps - 构建时执行
export async function getStaticProps() {
  const posts = await fetchPosts();

  return {
    props: { posts },
    revalidate: 60 // ISR: 60 秒后重新生成
  };
}

// getStaticPaths - 动态路由静态生成
export async function getStaticPaths() {
  const posts = await fetchPosts();

  return {
    paths: posts.map(post => ({ params: { id: post.id } })),
    fallback: 'blocking'
  };
}

export default function UserPage({ user }) {
  return <div>{user.name}</div>;
}
```

---

## 更多面试题

### 19. React 19 新特性

**答案：**

**1. React Compiler（React 编译器）：**
```jsx
// 自动优化，不再需要手动 memo、useMemo、useCallback
// React Compiler 会自动分析代码并添加必要的优化

// 之前需要手动优化
const MemoizedComponent = React.memo(function Component({ data }) {
  const processedData = useMemo(() => process(data), [data]);
  const handleClick = useCallback(() => {}, []);
  return <div onClick={handleClick}>{processedData}</div>;
});

// React 19 + Compiler 自动优化
function Component({ data }) {
  const processedData = process(data);
  const handleClick = () => {};
  return <div onClick={handleClick}>{processedData}</div>;
}
```

**2. Actions - 简化表单和数据变更：**
```jsx
// useActionState - 管理 action 状态
function UpdateName() {
  const [error, submitAction, isPending] = useActionState(
    async (previousState, formData) => {
      const error = await updateName(formData.get('name'));
      if (error) {
        return error;
      }
      redirect('/profile');
      return null;
    },
    null
  );

  return (
    <form action={submitAction}>
      <input type="text" name="name" />
      <button type="submit" disabled={isPending}>
        {isPending ? '更新中...' : '更新'}
      </button>
      {error && <p>{error}</p>}
    </form>
  );
}

// useFormStatus - 获取父级 form 状态
function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? '提交中...' : '提交'}
    </button>
  );
}
```

**3. useOptimistic - 乐观更新：**
```jsx
function TodoList({ todos, addTodo }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, { ...newTodo, pending: true }]
  );

  async function handleSubmit(formData) {
    const newTodo = { text: formData.get('text') };
    addOptimisticTodo(newTodo);
    await addTodo(newTodo);
  }

  return (
    <>
      <form action={handleSubmit}>
        <input name="text" />
        <button>添加</button>
      </form>
      <ul>
        {optimisticTodos.map((todo, i) => (
          <li key={i} style={{ opacity: todo.pending ? 0.5 : 1 }}>
            {todo.text}
          </li>
        ))}
      </ul>
    </>
  );
}
```

**4. use - 读取 Promise 和 Context：**
```jsx
// 读取 Promise
function Comments({ commentsPromise }) {
  // 在渲染中直接读取 Promise
  const comments = use(commentsPromise);
  return comments.map(c => <p key={c.id}>{c.text}</p>);
}

// 条件读取 Context
function HorizontalRule({ show }) {
  if (show) {
    const theme = use(ThemeContext);
    return <hr className={theme} />;
  }
  return null;
}
```

**5. ref 作为普通 prop：**
```jsx
// React 19 之前需要 forwardRef
const Input = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});

// React 19 可以直接使用 ref prop
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

**6. 改进的错误处理：**
```jsx
// 更好的 hydration 错误信息
// React 19 会显示不匹配内容的 diff

// 新的 onCaughtError 和 onUncaughtError
createRoot(document.getElementById('root'), {
  onCaughtError: (error, errorInfo) => {
    // 被 Error Boundary 捕获的错误
  },
  onUncaughtError: (error, errorInfo) => {
    // 未被捕获的错误
  },
  onRecoverableError: (error, errorInfo) => {
    // 可恢复的错误
  }
}).render(<App />);
```

---

### 20. React Server Components (RSC)

**答案：**

服务端组件是在服务器上渲染的组件，不会发送到客户端。

**核心概念：**
```jsx
// 服务端组件（默认）- 文件名无 'use client'
async function ServerComponent() {
  // 可以直接访问数据库、文件系统
  const data = await db.query('SELECT * FROM users');

  // 可以使用大型依赖，不会增加客户端 bundle
  import { format } from 'heavy-date-library';

  return (
    <div>
      {data.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  );
}

// 客户端组件
'use client';

import { useState } from 'react';

function ClientComponent() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

**服务端组件 vs 客户端组件：**

| 特性 | 服务端组件 | 客户端组件 |
|------|-----------|-----------|
| 数据获取 | 直接访问后端 | 通过 API |
| 状态/事件 | 不支持 | 支持 |
| Hooks | 部分支持 | 全部支持 |
| 浏览器 API | 不支持 | 支持 |
| bundle 大小 | 不增加 | 增加 |
| 渲染位置 | 仅服务器 | 两者都可 |

**组合模式：**
```jsx
// 服务端组件可以导入客户端组件
// ServerComponent.jsx
import ClientButton from './ClientButton';

async function ServerComponent() {
  const data = await fetchData();

  return (
    <div>
      <h1>{data.title}</h1>
      <ClientButton /> {/* 客户端组件 */}
    </div>
  );
}

// 客户端组件不能导入服务端组件
// 但可以通过 children 接收
'use client';

function ClientWrapper({ children }) {
  const [show, setShow] = useState(true);

  return (
    <div>
      <button onClick={() => setShow(!show)}>Toggle</button>
      {show && children} {/* 可以是服务端组件 */}
    </div>
  );
}

// 使用
<ClientWrapper>
  <ServerComponent />
</ClientWrapper>
```

---

### 21. 高阶组件（HOC）和 Render Props

**答案：**

**高阶组件（HOC）：**
```jsx
// HOC 是接收组件返回新组件的函数
function withLoading(WrappedComponent) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    return <WrappedComponent {...props} />;
  };
}

// 使用
const UserListWithLoading = withLoading(UserList);
<UserListWithLoading isLoading={loading} users={users} />

// 带参数的 HOC
function withTheme(theme) {
  return function(WrappedComponent) {
    return function ThemedComponent(props) {
      return <WrappedComponent {...props} theme={theme} />;
    };
  };
}

// 常见 HOC 模式
// 1. 属性代理
function withExtraProps(WrappedComponent) {
  return function(props) {
    const extraProps = { extra: 'data' };
    return <WrappedComponent {...props} {...extraProps} />;
  };
}

// 2. 反向继承
function withLogger(WrappedComponent) {
  return class extends WrappedComponent {
    componentDidMount() {
      console.log('Component mounted');
      super.componentDidMount?.();
    }

    render() {
      return super.render();
    }
  };
}
```

**Render Props：**
```jsx
// 通过 prop 传递渲染函数
class Mouse extends React.Component {
  state = { x: 0, y: 0 };

  handleMouseMove = (event) => {
    this.setState({
      x: event.clientX,
      y: event.clientY
    });
  };

  render() {
    return (
      <div onMouseMove={this.handleMouseMove}>
        {this.props.render(this.state)}
      </div>
    );
  }
}

// 使用
<Mouse render={({ x, y }) => (
  <h1>鼠标位置: ({x}, {y})</h1>
)} />

// 使用 children 作为函数
<Mouse>
  {({ x, y }) => <h1>鼠标位置: ({x}, {y})</h1>}
</Mouse>

// 现代替代：自定义 Hook
function useMouse() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return position;
}

// 使用
function App() {
  const { x, y } = useMouse();
  return <h1>鼠标位置: ({x}, {y})</h1>;
}
```

---

### 22. 受控组件和非受控组件

**答案：**

**受控组件：**
```jsx
// 表单数据由 React 状态控制
function ControlledForm() {
  const [value, setValue] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ value, email });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">提交</button>
    </form>
  );
}
```

**非受控组件：**
```jsx
// 表单数据由 DOM 自身管理
function UncontrolledForm() {
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(inputRef.current.value);
    console.log(fileInputRef.current.files);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* defaultValue 设置初始值 */}
      <input type="text" defaultValue="默认值" ref={inputRef} />
      {/* 文件输入始终是非受控的 */}
      <input type="file" ref={fileInputRef} />
      <button type="submit">提交</button>
    </form>
  );
}
```

**对比：**

| 特性 | 受控组件 | 非受控组件 |
|------|----------|------------|
| 数据存储 | React 状态 | DOM |
| 取值方式 | 状态变量 | ref |
| 即时验证 | 容易 | 困难 |
| 条件禁用 | 容易 | 困难 |
| 强制格式化 | 容易 | 困难 |
| 代码量 | 较多 | 较少 |
| 文件输入 | 不支持 | 支持 |

---

### 23. React 事件机制

**答案：**

**合成事件（SyntheticEvent）：**
```jsx
function handleClick(event) {
  // event 是 SyntheticEvent，不是原生事件
  console.log(event); // SyntheticEvent
  console.log(event.nativeEvent); // 原生事件

  // 阻止默认行为
  event.preventDefault();

  // 阻止冒泡
  event.stopPropagation();
}

// React 17+ 事件委托到 root 节点
// React 16 事件委托到 document
```

**事件池（React 16 及之前）：**
```jsx
// React 16 中事件对象会被复用
function handleChange(event) {
  // ❌ 错误：异步访问事件属性
  setTimeout(() => {
    console.log(event.target.value); // 可能为 null
  }, 100);

  // ✅ 正确：调用 persist() 或保存值
  event.persist();
  setTimeout(() => {
    console.log(event.target.value);
  }, 100);

  // ✅ 或者保存需要的值
  const value = event.target.value;
  setTimeout(() => {
    console.log(value);
  }, 100);
}

// React 17+ 移除了事件池，不再需要 persist()
```

**事件优先级：**
```jsx
// React 18 中的事件优先级
// 1. 离散事件（最高）：click、keydown、input
// 2. 连续事件：drag、scroll、mousemove
// 3. 默认事件：setTimeout、网络请求回调

// useTransition 可以降低更新优先级
const [isPending, startTransition] = useTransition();

function handleClick() {
  // 高优先级
  setInputValue(e.target.value);

  // 低优先级
  startTransition(() => {
    setSearchResults(filter(e.target.value));
  });
}
```

**捕获和冒泡：**
```jsx
function App() {
  return (
    <div
      onClick={() => console.log('冒泡阶段')}
      onClickCapture={() => console.log('捕获阶段')}
    >
      <button onClick={() => console.log('按钮点击')}>
        点击
      </button>
    </div>
  );
}
// 输出顺序：捕获阶段 -> 按钮点击 -> 冒泡阶段
```

---

### 24. React 与 Vue 的区别

**答案：**

| 特性 | React | Vue |
|------|-------|-----|
| 核心理念 | UI = f(state) | 响应式数据绑定 |
| 模板 | JSX（JavaScript） | 模板语法（HTML 增强） |
| 数据流 | 单向数据流 | 双向绑定 + 单向数据流 |
| 状态管理 | setState 不可变更新 | 直接修改响应式数据 |
| 组件通信 | props + callback | props + emit |
| 生态系统 | 灵活，选择多 | 官方方案较完整 |
| 学习曲线 | 需要理解 JS 高级概念 | 模板更接近 HTML |
| TypeScript | 原生支持好 | Vue 3 支持好 |
| 体积 | 较大（需 ReactDOM） | 较小 |

**响应式原理对比：**
```jsx
// React - 不可变更新
const [user, setUser] = useState({ name: 'Tom', age: 20 });
setUser({ ...user, age: 21 }); // 创建新对象

// Vue - 可变更新（响应式代理）
const user = reactive({ name: 'Tom', age: 20 });
user.age = 21; // 直接修改
```

**组件通信对比：**
```jsx
// React - 子传父通过回调
function Parent() {
  const handleChildData = (data) => console.log(data);
  return <Child onData={handleChildData} />;
}

function Child({ onData }) {
  return <button onClick={() => onData('hello')}>发送</button>;
}

// Vue - 子传父通过 emit
// Parent.vue
<Child @data="handleData" />

// Child.vue
<button @click="$emit('data', 'hello')">发送</button>
```

---

### 25. Context 性能问题及优化

**答案：**

**问题：Context 值变化会导致所有消费组件重新渲染**

```jsx
// ❌ 问题代码
const AppContext = createContext();

function App() {
  const [user, setUser] = useState({ name: 'Tom' });
  const [theme, setTheme] = useState('light');

  // 每次渲染都创建新对象，导致所有消费者重新渲染
  return (
    <AppContext.Provider value={{ user, theme, setUser, setTheme }}>
      <Children />
    </AppContext.Provider>
  );
}
```

**优化方案：**

**1. 拆分 Context：**
```jsx
const UserContext = createContext();
const ThemeContext = createContext();

function App() {
  const [user, setUser] = useState({ name: 'Tom' });
  const [theme, setTheme] = useState('light');

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <Children />
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}

// 只订阅需要的 Context
function UserProfile() {
  const { user } = useContext(UserContext);
  // theme 变化不会触发重新渲染
  return <div>{user.name}</div>;
}
```

**2. 分离状态和方法：**
```jsx
const UserStateContext = createContext();
const UserDispatchContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState({ name: 'Tom' });

  return (
    <UserStateContext.Provider value={user}>
      <UserDispatchContext.Provider value={setUser}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
}

// 只需要修改方法的组件不会因为状态变化而重新渲染
function UpdateButton() {
  const setUser = useContext(UserDispatchContext);
  return <button onClick={() => setUser({ name: 'Jerry' })}>更新</button>;
}
```

**3. 使用 useMemo 稳定 value：**
```jsx
function App() {
  const [user, setUser] = useState({ name: 'Tom' });

  const value = useMemo(() => ({ user, setUser }), [user]);

  return (
    <UserContext.Provider value={value}>
      <Children />
    </UserContext.Provider>
  );
}
```

**4. 使用选择器模式（配合状态管理库）：**
```jsx
// 使用 use-context-selector 库
import { createContext, useContextSelector } from 'use-context-selector';

const UserContext = createContext();

function UserName() {
  // 只有 name 变化时才重新渲染
  const name = useContextSelector(UserContext, (ctx) => ctx.user.name);
  return <div>{name}</div>;
}
```

---

### 26. useEffect 依赖陷阱和最佳实践

**答案：**

**常见陷阱：**

```jsx
// ❌ 陷阱 1：遗漏依赖
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults(query).then(setResults);
  }, []); // 缺少 query 依赖，不会在 query 变化时重新获取
}

// ❌ 陷阱 2：对象/函数依赖
function Component({ config }) {
  useEffect(() => {
    // config 是对象，每次渲染都是新引用
    initialize(config);
  }, [config]); // 每次都会执行
}

// ❌ 陷阱 3：闭包过时值
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count); // 始终是 0
      setCount(count + 1); // 始终设置为 1
    }, 1000);
    return () => clearInterval(timer);
  }, []);
}
```

**最佳实践：**

```jsx
// ✅ 实践 1：使用函数式更新
useEffect(() => {
  const timer = setInterval(() => {
    setCount(c => c + 1); // 基于前一个值
  }, 1000);
  return () => clearInterval(timer);
}, []);

// ✅ 实践 2：使用 useRef 保存最新值
function Component({ value }) {
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(valueRef.current); // 始终是最新值
    }, 1000);
    return () => clearInterval(timer);
  }, []);
}

// ✅ 实践 3：使用 useCallback 稳定函数
function SearchResults({ query, onResults }) {
  // 确保 onResults 引用稳定
  const handleResults = useCallback((data) => {
    onResults(data);
  }, [onResults]);

  useEffect(() => {
    fetchResults(query).then(handleResults);
  }, [query, handleResults]);
}

// ✅ 实践 4：提取依赖的原始值
function Component({ config }) {
  const { apiUrl, timeout } = config;

  useEffect(() => {
    initialize({ apiUrl, timeout });
  }, [apiUrl, timeout]); // 使用原始值作为依赖
}

// ✅ 实践 5：清理竞态条件
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    let cancelled = false;

    fetchResults(query).then(data => {
      if (!cancelled) {
        setResults(data);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [query]);
}

// ✅ 实践 6：使用 AbortController
function SearchResults({ query }) {
  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/search?q=${query}`, { signal: controller.signal })
      .then(res => res.json())
      .then(setResults)
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err);
        }
      });

    return () => controller.abort();
  }, [query]);
}
```

---

### 27. React 状态不可变性

**答案：**

**为什么需要不可变性：**

```jsx
// 1. React 通过引用比较检测变化
const [user, setUser] = useState({ name: 'Tom', age: 20 });

// ❌ 直接修改不会触发更新
user.age = 21;
setUser(user); // 引用相同，React 认为没变化

// ✅ 创建新对象
setUser({ ...user, age: 21 }); // 新引用，触发更新
```

**不可变更新模式：**

```jsx
// 对象更新
const [user, setUser] = useState({
  name: 'Tom',
  address: { city: 'Beijing', street: '123' }
});

// 浅层更新
setUser({ ...user, name: 'Jerry' });

// 深层更新
setUser({
  ...user,
  address: { ...user.address, city: 'Shanghai' }
});

// 数组更新
const [items, setItems] = useState([1, 2, 3]);

// 添加
setItems([...items, 4]);

// 删除
setItems(items.filter(item => item !== 2));

// 更新
setItems(items.map(item => item === 2 ? 20 : item));

// 插入
setItems([...items.slice(0, 1), 1.5, ...items.slice(1)]);

// 排序（先复制）
setItems([...items].sort((a, b) => b - a));
```

**使用 Immer 简化更新：**

```jsx
import { produce } from 'immer';

const [user, setUser] = useState({
  name: 'Tom',
  friends: [{ name: 'Jerry' }]
});

// 使用 Immer
setUser(produce(draft => {
  draft.name = 'Jerry';
  draft.friends[0].name = 'Tom';
  draft.friends.push({ name: 'Spike' });
}));

// 使用 use-immer hook
import { useImmer } from 'use-immer';

const [user, updateUser] = useImmer({ name: 'Tom' });

updateUser(draft => {
  draft.name = 'Jerry';
});
```

---

### 28. React 测试

**答案：**

**单元测试（Jest + React Testing Library）：**

```jsx
// Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

// 渲染测试
test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});

// 事件测试
test('calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);

  fireEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});

// 异步测试
test('loads and displays data', async () => {
  render(<UserProfile userId="1" />);

  // 等待异步内容出现
  expect(await screen.findByText('Tom')).toBeInTheDocument();
});

// 自定义 Hook 测试
import { renderHook, act } from '@testing-library/react';
import useCounter from './useCounter';

test('useCounter', () => {
  const { result } = renderHook(() => useCounter());

  expect(result.current.count).toBe(0);

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
```

**Mock 测试：**

```jsx
// Mock API
jest.mock('./api', () => ({
  fetchUser: jest.fn(() => Promise.resolve({ name: 'Tom' }))
}));

// Mock 组件
jest.mock('./ComplexComponent', () => {
  return function MockComponent() {
    return <div data-testid="mock-component">Mocked</div>;
  };
});

// Mock Hook
jest.mock('./useAuth', () => ({
  useAuth: () => ({ user: { name: 'Tom' }, isLoggedIn: true })
}));
```

**快照测试：**

```jsx
test('matches snapshot', () => {
  const { container } = render(<Button>Click me</Button>);
  expect(container).toMatchSnapshot();
});
```

---

### 29. React 组件设计模式

**答案：**

**1. 复合组件模式（Compound Components）：**

```jsx
const Tabs = ({ children, defaultIndex = 0 }) => {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
};

Tabs.List = function TabList({ children }) {
  return <div className="tabs-list">{children}</div>;
};

Tabs.Tab = function Tab({ index, children }) {
  const { activeIndex, setActiveIndex } = useContext(TabsContext);
  return (
    <button
      className={activeIndex === index ? 'active' : ''}
      onClick={() => setActiveIndex(index)}
    >
      {children}
    </button>
  );
};

Tabs.Panels = function TabPanels({ children }) {
  return <div className="tabs-panels">{children}</div>;
};

Tabs.Panel = function TabPanel({ index, children }) {
  const { activeIndex } = useContext(TabsContext);
  return activeIndex === index ? <div>{children}</div> : null;
};

// 使用
<Tabs>
  <Tabs.List>
    <Tabs.Tab index={0}>Tab 1</Tabs.Tab>
    <Tabs.Tab index={1}>Tab 2</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panels>
    <Tabs.Panel index={0}>Content 1</Tabs.Panel>
    <Tabs.Panel index={1}>Content 2</Tabs.Panel>
  </Tabs.Panels>
</Tabs>
```

**2. 控制反转模式（Inversion of Control）：**

```jsx
// 让使用者控制渲染逻辑
function List({ items, renderItem, renderEmpty }) {
  if (items.length === 0) {
    return renderEmpty?.() || <div>No items</div>;
  }

  return (
    <ul>
      {items.map((item, index) => (
        <li key={item.id}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}

// 使用
<List
  items={users}
  renderItem={(user) => <UserCard user={user} />}
  renderEmpty={() => <EmptyState message="暂无用户" />}
/>
```

**3. 状态归约模式（State Reducer）：**

```jsx
function useToggle({ reducer = (state, action) => action.changes } = {}) {
  const [{ on }, dispatch] = useReducer(
    (state, action) => {
      const changes = toggleReducer(state, action);
      return reducer(state, { ...action, changes });
    },
    { on: false }
  );

  const toggle = () => dispatch({ type: 'toggle' });
  const setOn = () => dispatch({ type: 'on' });
  const setOff = () => dispatch({ type: 'off' });

  return { on, toggle, setOn, setOff };
}

function toggleReducer(state, action) {
  switch (action.type) {
    case 'toggle': return { on: !state.on };
    case 'on': return { on: true };
    case 'off': return { on: false };
    default: return state;
  }
}

// 使用者可以控制状态变化
function App() {
  const { on, toggle } = useToggle({
    reducer: (state, action) => {
      // 最多只能开启 4 次
      if (action.type === 'toggle' && clickCount >= 4) {
        return state; // 不变化
      }
      return action.changes;
    }
  });
}
```

**4. Props Getter 模式：**

```jsx
function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const getToggleProps = (props = {}) => ({
    'aria-expanded': isOpen,
    onClick: () => {
      setIsOpen(!isOpen);
      props.onClick?.();
    },
    ...props
  });

  const getMenuProps = (props = {}) => ({
    hidden: !isOpen,
    ...props
  });

  return { isOpen, getToggleProps, getMenuProps };
}

// 使用
function Dropdown() {
  const { isOpen, getToggleProps, getMenuProps } = useDropdown();

  return (
    <div>
      <button {...getToggleProps()}>Toggle</button>
      <ul {...getMenuProps()}>
        <li>Option 1</li>
        <li>Option 2</li>
      </ul>
    </div>
  );
}
```

---

### 30. 实现简易版 React Hooks

**答案：**

```javascript
// 简化版 React 运行时
let currentComponent = null;
let hookIndex = 0;

function useState(initialValue) {
  const component = currentComponent;
  const index = hookIndex++;

  // 初始化状态
  if (component.hooks[index] === undefined) {
    component.hooks[index] = typeof initialValue === 'function'
      ? initialValue()
      : initialValue;
  }

  const setState = (newValue) => {
    const currentValue = component.hooks[index];
    const nextValue = typeof newValue === 'function'
      ? newValue(currentValue)
      : newValue;

    if (!Object.is(currentValue, nextValue)) {
      component.hooks[index] = nextValue;
      // 触发重新渲染
      scheduleRender(component);
    }
  };

  return [component.hooks[index], setState];
}

function useEffect(callback, deps) {
  const component = currentComponent;
  const index = hookIndex++;

  const prevDeps = component.hooks[index]?.deps;
  const hasChanged = !prevDeps ||
    deps.some((dep, i) => !Object.is(dep, prevDeps[i]));

  if (hasChanged) {
    // 清理上一次的副作用
    component.hooks[index]?.cleanup?.();

    // 延迟执行副作用
    queueMicrotask(() => {
      const cleanup = callback();
      component.hooks[index] = { deps, cleanup };
    });
  }
}

function useMemo(factory, deps) {
  const component = currentComponent;
  const index = hookIndex++;

  const prevDeps = component.hooks[index]?.deps;
  const hasChanged = !prevDeps ||
    deps.some((dep, i) => !Object.is(dep, prevDeps[i]));

  if (hasChanged) {
    const value = factory();
    component.hooks[index] = { value, deps };
    return value;
  }

  return component.hooks[index].value;
}

function useCallback(callback, deps) {
  return useMemo(() => callback, deps);
}

function useRef(initialValue) {
  const component = currentComponent;
  const index = hookIndex++;

  if (component.hooks[index] === undefined) {
    component.hooks[index] = { current: initialValue };
  }

  return component.hooks[index];
}

// 渲染函数组件
function renderFunctionComponent(component) {
  currentComponent = component;
  hookIndex = 0;

  const result = component.type(component.props);

  currentComponent = null;
  return result;
}
```

---

### 31. React 性能分析工具

**答案：**

**1. React DevTools Profiler：**
```jsx
// 在 React DevTools 中使用 Profiler 面板
// 可以查看：
// - 组件渲染时间
// - 渲染原因（props/state/hooks 变化）
// - 火焰图和排名图
```

**2. React.Profiler 组件：**
```jsx
function onRenderCallback(
  id,                // Profiler 的 id
  phase,             // "mount" 或 "update"
  actualDuration,    // 本次更新渲染的时间
  baseDuration,      // 估计不使用 memo 的渲染时间
  startTime,         // 开始渲染的时间
  commitTime,        // 提交的时间
  interactions       // 触发渲染的交互集合
) {
  console.log({ id, phase, actualDuration });
}

<Profiler id="Navigation" onRender={onRenderCallback}>
  <Navigation />
</Profiler>
```

**3. why-did-you-render 库：**
```jsx
// 检测不必要的重新渲染
import React from 'react';

if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}

// 标记要追踪的组件
MyComponent.whyDidYouRender = true;
```

**4. 自定义渲染追踪：**
```jsx
function useRenderCount(componentName) {
  const renderCount = useRef(0);
  renderCount.current++;

  useEffect(() => {
    console.log(`${componentName} rendered ${renderCount.current} times`);
  });
}

function MyComponent() {
  useRenderCount('MyComponent');
  // ...
}

// 追踪 props 变化
function useWhyDidUpdate(name, props) {
  const previousProps = useRef(props);

  useEffect(() => {
    const allKeys = Object.keys({ ...previousProps.current, ...props });
    const changedProps = {};

    allKeys.forEach(key => {
      if (!Object.is(previousProps.current[key], props[key])) {
        changedProps[key] = {
          from: previousProps.current[key],
          to: props[key]
        };
      }
    });

    if (Object.keys(changedProps).length) {
      console.log('[why-did-update]', name, changedProps);
    }

    previousProps.current = props;
  });
}
```

---

### 32. Suspense 和 懒加载深入

**答案：**

**基本用法：**
```jsx
import { Suspense, lazy } from 'react';

// 路由懒加载
const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}

// 命名导出
const MyComponent = lazy(() =>
  import('./MyModule').then(module => ({ default: module.MyComponent }))
);

// 预加载
const Dashboard = lazy(() => import('./Dashboard'));
// 在需要时预加载
function preloadDashboard() {
  import('./Dashboard');
}
```

**嵌套 Suspense：**
```jsx
// 细粒度加载控制
<Suspense fallback={<PageSkeleton />}>
  <Header />
  <Suspense fallback={<SidebarSkeleton />}>
    <Sidebar />
  </Suspense>
  <Suspense fallback={<ContentSkeleton />}>
    <MainContent />
  </Suspense>
</Suspense>
```

**数据获取（配合 React 18）：**
```jsx
// 使用支持 Suspense 的数据获取库
// 如 React Query、SWR、Relay

// React Query 示例
import { useSuspenseQuery } from '@tanstack/react-query';

function UserProfile({ userId }) {
  const { data: user } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId)
  });

  return <div>{user.name}</div>;
}

// 包装在 Suspense 中
<Suspense fallback={<ProfileSkeleton />}>
  <UserProfile userId={1} />
</Suspense>
```

**ErrorBoundary + Suspense：**
```jsx
import { ErrorBoundary } from 'react-error-boundary';

function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Suspense fallback={<Loading />}>
        <AsyncComponent />
      </Suspense>
    </ErrorBoundary>
  );
}

// 重试功能
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div>
      <p>出错了: {error.message}</p>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  );
}

<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onReset={() => {
    // 重置状态
    queryClient.invalidateQueries();
  }}
>
  <Suspense fallback={<Loading />}>
    <Content />
  </Suspense>
</ErrorBoundary>
```

---

### 33. React 与 TypeScript 最佳实践

**答案：**

**组件类型定义：**
```tsx
// 函数组件
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

function Button({ variant = 'primary', size = 'medium', children, ...props }: ButtonProps) {
  return <button className={`btn-${variant} btn-${size}`} {...props}>{children}</button>;
}

// 带泛型的组件
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}

// 使用
<List
  items={users}
  renderItem={(user) => <span>{user.name}</span>}
  keyExtractor={(user) => user.id}
/>
```

**Hooks 类型：**
```tsx
// useState
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);

// useReducer
type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'set'; payload: number };

function reducer(state: number, action: Action): number {
  switch (action.type) {
    case 'increment': return state + 1;
    case 'decrement': return state - 1;
    case 'set': return action.payload;
  }
}

// useRef
const inputRef = useRef<HTMLInputElement>(null);
const countRef = useRef<number>(0);

// useContext
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

**事件类型：**
```tsx
// 常见事件类型
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {};
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {};
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {};
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {};
const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {};
const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {};
```

**常用工具类型：**
```tsx
// 获取组件 Props 类型
type ButtonProps = React.ComponentProps<typeof Button>;
type InputProps = React.ComponentProps<'input'>;

// 子元素类型
interface Props {
  children: React.ReactNode;        // 任意子元素
  children: React.ReactElement;     // 单个 React 元素
  children: string;                 // 只能是字符串
}

// 样式类型
interface Props {
  style?: React.CSSProperties;
  className?: string;
}

// ref 类型
interface Props {
  ref?: React.Ref<HTMLDivElement>;
}

// 可选渲染
interface Props {
  render?: () => React.ReactNode;
}
```

---

### 34. 手写 React 核心 API

**答案：**

**手写 createElement：**
```javascript
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === 'object' ? child : createTextElement(child)
      )
    }
  };
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  };
}
```

**手写 render：**
```javascript
function render(element, container) {
  // 创建 DOM 节点
  const dom = element.type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(element.type);

  // 设置属性
  const isProperty = key => key !== 'children';
  Object.keys(element.props)
    .filter(isProperty)
    .forEach(name => {
      if (name.startsWith('on')) {
        const eventType = name.toLowerCase().substring(2);
        dom.addEventListener(eventType, element.props[name]);
      } else {
        dom[name] = element.props[name];
      }
    });

  // 递归渲染子元素
  element.props.children.forEach(child => render(child, dom));

  container.appendChild(dom);
}
```

**手写简易 useState：**
```javascript
let state = [];
let setters = [];
let cursor = 0;

function useState(initialValue) {
  const currentCursor = cursor;

  state[currentCursor] = state[currentCursor] ?? initialValue;

  const setState = (newValue) => {
    state[currentCursor] = typeof newValue === 'function'
      ? newValue(state[currentCursor])
      : newValue;
    rerender();
  };

  cursor++;
  return [state[currentCursor], setState];
}

function rerender() {
  cursor = 0;
  // 重新渲染组件
  ReactDOM.render(<App />, document.getElementById('root'));
}
```

**手写简易 useEffect：**
```javascript
let effects = [];
let effectCursor = 0;

function useEffect(callback, deps) {
  const currentCursor = effectCursor;
  const prevDeps = effects[currentCursor]?.deps;

  const hasChanged = !prevDeps ||
    deps.some((dep, i) => !Object.is(dep, prevDeps[i]));

  if (hasChanged) {
    // 清理上一次的副作用
    effects[currentCursor]?.cleanup?.();

    // 执行新的副作用
    const cleanup = callback();
    effects[currentCursor] = { deps, cleanup };
  }

  effectCursor++;
}
```

---

### 35. React 常见面试编程题

**答案：**

**1. 实现防抖输入框：**
```jsx
function DebouncedInput({ onChange, delay = 300, ...props }) {
  const [value, setValue] = useState('');
  const timeoutRef = useRef(null);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange?.(newValue);
    }, delay);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return <input value={value} onChange={handleChange} {...props} />;
}
```

**2. 实现倒计时 Hook：**
```jsx
function useCountdown(initialSeconds) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const start = useCallback(() => {
    if (!isRunning && seconds > 0) {
      setIsRunning(true);
    }
  }, [isRunning, seconds]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    }

    if (seconds === 0) {
      setIsRunning(false);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, seconds]);

  return { seconds, isRunning, start, pause, reset };
}
```

**3. 实现无限滚动列表：**
```jsx
function useInfiniteScroll(fetchMore, hasMore) {
  const observerRef = useRef(null);

  const lastElementRef = useCallback(node => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchMore();
      }
    });

    if (node) {
      observerRef.current.observe(node);
    }
  }, [fetchMore, hasMore]);

  return lastElementRef;
}

function InfiniteList() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchMore = useCallback(async () => {
    const newItems = await fetchItems(page);
    setItems(prev => [...prev, ...newItems]);
    setPage(p => p + 1);
    setHasMore(newItems.length > 0);
  }, [page]);

  const lastElementRef = useInfiniteScroll(fetchMore, hasMore);

  return (
    <ul>
      {items.map((item, index) => (
        <li
          key={item.id}
          ref={index === items.length - 1 ? lastElementRef : null}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

**4. 实现拖拽排序：**
```jsx
function useDragSort(initialItems) {
  const [items, setItems] = useState(initialItems);
  const [dragIndex, setDragIndex] = useState(null);

  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    setItems(prevItems => {
      const newItems = [...prevItems];
      const [draggedItem] = newItems.splice(dragIndex, 1);
      newItems.splice(index, 0, draggedItem);
      return newItems;
    });
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  return {
    items,
    dragIndex,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  };
}

function DragList() {
  const { items, dragIndex, handleDragStart, handleDragOver, handleDragEnd } =
    useDragSort(['Item 1', 'Item 2', 'Item 3']);

  return (
    <ul>
      {items.map((item, index) => (
        <li
          key={item}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          style={{ opacity: dragIndex === index ? 0.5 : 1 }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
```

**5. 实现表单验证 Hook：**
```jsx
function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const fieldErrors = validate({ [name]: values[name] });
    setErrors(prev => ({ ...prev, ...fieldErrors }));
  };

  const handleSubmit = (onSubmit) => async (e) => {
    e.preventDefault();

    const allErrors = validate(values);
    setErrors(allErrors);
    setTouched(Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {}));

    if (Object.keys(allErrors).length === 0) {
      setIsSubmitting(true);
      await onSubmit(values);
      setIsSubmitting(false);
    }
  };

  const getFieldProps = (name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur
  });

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleSubmit,
    getFieldProps
  };
}
```

---

## React 原理面试题精选

> 以下面试题从面试官角度设计，包含追问和深度考察点，适合中高级前端面试准备。

---

### 1. 什么是 React Fiber？为什么 React 要重写协调算法？

**标准答案：**

**Fiber 是 React 16 引入的新协调引擎**，本质上是对渲染过程的一次完全重写。

**React 15 的问题（Stack Reconciler）：**
```javascript
// 递归同步更新，无法中断
function reconcile(element, container) {
  // 一旦开始，必须递归完成整棵树
  // 大型应用会导致主线程长时间阻塞
  // 用户输入、动画等高优先级任务得不到响应
}
```

**Fiber 的核心改进：**

| 对比 | Stack Reconciler | Fiber Reconciler |
|-----|------------------|------------------|
| 执行方式 | 递归，同步，不可中断 | 循环，异步，可中断 |
| 数据结构 | 调用栈 | 链表（Fiber 树） |
| 优先级 | 无 | 支持任务优先级 |
| 时间切片 | 无 | 每帧 5ms 检查是否让出 |

**Fiber 节点结构（链表）：**
```javascript
const fiber = {
  // 静态信息
  type: ComponentType,      // 组件类型
  key: null,
  stateNode: null,          // DOM 节点或组件实例

  // 链表结构（替代递归栈）
  return: parentFiber,      // 父节点
  child: firstChildFiber,   // 第一个子节点
  sibling: nextFiber,       // 兄弟节点

  // 工作单元
  pendingProps: {},
  memoizedState: null,      // Hooks 链表
  updateQueue: null,

  // 副作用
  flags: Placement,         // 增/删/改标记

  // 双缓冲
  alternate: otherTreeFiber // 指向另一棵树
};
```

**🔍 追问 1：Fiber 的可中断是怎么实现的？**

核心是把递归改成循环 + 链表：

```javascript
function workLoopConcurrent() {
  // 有工作 && 没超时 → 继续
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
  // 超时了，让出控制权，下次继续
}

function shouldYield() {
  return getCurrentTime() >= deadline; // 每帧约 5ms
}
```

链表结构让每个节点都知道下一步去哪，中断后可以从任意位置恢复。

**🔍 追问 2：什么是双缓冲（Double Buffering）？**

React 维护两棵 Fiber 树：

```
current 树：当前屏幕显示的内容
workInProgress 树：内存中构建的新树

构建完成后：root.current = workInProgress（指针交换）
```

好处：
- 避免中间状态暴露给用户
- 复用 Fiber 节点，减少内存分配
- 类似游戏的双缓冲渲染

---

### 2. React 的 Diff 算法是怎么工作的？有什么优化策略？

**标准答案：**

**React Diff 三大策略：**

1. **同级比较**：只比较同一层级的节点，跨层级移动当作删除+创建
2. **类型优先**：不同类型的元素直接替换整棵子树
3. **Key 标识**：相同 key 的节点认为是同一个，可以复用

**单节点 Diff：**
```javascript
// 新节点是单个元素
function reconcileSingleElement(returnFiber, currentFirstChild, element) {
  let child = currentFirstChild;

  while (child !== null) {
    if (child.key === element.key) {
      if (child.type === element.type) {
        // ✅ key 和 type 都相同，复用
        deleteRemainingChildren(returnFiber, child.sibling);
        return useFiber(child, element.props);
      }
      // ❌ type 不同，删除所有旧节点
      deleteRemainingChildren(returnFiber, child);
      break;
    }
    // ❌ key 不同，删除当前节点
    deleteChild(returnFiber, child);
    child = child.sibling;
  }

  // 创建新节点
  return createFiberFromElement(element);
}
```

**多节点 Diff（两轮遍历）：**

```
旧: A → B → C → D
新: A → C → D → B

第一轮：从头比较，key 相同则复用
  A === A ✓ 复用
  B !== C ✗ 跳出

第二轮：将剩余旧节点建 Map，遍历新节点查找复用
  Map: { B: fiber, C: fiber, D: fiber }
  新 C → 找到旧 C，复用
  新 D → 找到旧 D，复用
  新 B → 找到旧 B，复用但需要移动
```

**🔍 追问 1：React 的 Diff 和 Vue 的 Diff 有什么区别？**

| 对比 | React | Vue 3 |
|-----|-------|-------|
| 算法 | 两轮遍历 | 快速 Diff（预处理 + LIS） |
| 移动策略 | lastPlacedIndex 单向比较 | 最长递增子序列，移动最少 |
| 性能特点 | 头部更新快，尾部插入慢 | 头尾更新都很快 |

```javascript
// React 的 lastPlacedIndex 策略
// 旧: A B C D  新: D A B C
// A(0) < lastPlacedIndex(3) → 移动
// B(1) < lastPlacedIndex(3) → 移动
// C(2) < lastPlacedIndex(3) → 移动
// 结果：移动了 A B C 三个（其实只需移动 D）
```

**🔍 追问 2：为什么不推荐用数组索引做 key？**

```javascript
// 问题：删除第一项后，索引全部变化
// 旧: [{id:1}, {id:2}, {id:3}]  key: 0, 1, 2
// 新: [{id:2}, {id:3}]          key: 0, 1

// React 认为：
// key=0: id:1 → id:2（更新内容）
// key=1: id:2 → id:3（更新内容）
// key=2: 删除

// 实际上只需要删除 id:1，但 React 做了大量无用更新
```

---

### 3. Hooks 的实现原理是什么？为什么不能在条件语句中使用？

**标准答案：**

**Hooks 存储结构：链表**

```javascript
// 每个 Fiber 节点有一个 memoizedState 属性
// 函数组件中，它指向 Hooks 链表

fiber.memoizedState = {
  memoizedState: 0,        // useState 的值
  queue: { pending: null }, // 更新队列
  next: {                   // 下一个 Hook
    memoizedState: () => {}, // useCallback 的值
    next: {
      memoizedState: {...},  // useEffect 的值
      next: null
    }
  }
};
```

**挂载 vs 更新：**

```javascript
// 挂载时：创建新 Hook 节点，加入链表
function mountState(initialState) {
  const hook = mountWorkInProgressHook(); // 创建并链入
  hook.memoizedState = initialState;
  // ...
  return [hook.memoizedState, dispatch];
}

// 更新时：从链表中按顺序取出
function updateState() {
  const hook = updateWorkInProgressHook(); // 取下一个
  // ...
  return [hook.memoizedState, dispatch];
}
```

**为什么不能在条件语句中使用？**

```javascript
function Component() {
  const [a, setA] = useState(1);  // Hook 1

  if (condition) {
    const [b, setB] = useState(2); // Hook 2（条件）
  }

  const [c, setC] = useState(3);  // Hook 3

  // 首次渲染（condition = true）：
  // 链表：Hook1 → Hook2 → Hook3

  // 二次渲染（condition = false）：
  // 期望：Hook1 → Hook3
  // 实际：React 按顺序取，Hook3 取到了 Hook2 的位置
  // 状态全乱了！
}
```

**🔍 追问：useState 的批量更新是怎么实现的？**

```javascript
// 更新被放入环形链表，合并后统一处理
function dispatchSetState(fiber, queue, action) {
  const update = { action, next: null };

  // 环形链表
  const pending = queue.pending;
  if (pending === null) {
    update.next = update; // 自己指向自己
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  queue.pending = update;

  // 调度更新（不是立即执行）
  scheduleUpdateOnFiber(fiber);
}

// 实际执行时，遍历链表，合并所有 action
setState(1);
setState(2);
setState(3);
// 三个 update 进入链表，最终只触发一次渲染，state = 3
```

---

### 4. useEffect 和 useLayoutEffect 有什么区别？底层是怎么实现的？

**标准答案：**

| 特性 | useEffect | useLayoutEffect |
|-----|-----------|-----------------|
| 执行时机 | DOM 更新后，异步执行 | DOM 更新后，同步执行 |
| 是否阻塞渲染 | 不阻塞 | 阻塞 |
| 适用场景 | 数据请求、订阅、日志 | DOM 测量、同步修改 DOM |

**执行时机图示：**
```
render → DOM 更新 → 绘制屏幕 → useEffect
render → DOM 更新 → useLayoutEffect → 绘制屏幕
```

**实现原理：**

```javascript
// Effect 结构
const effect = {
  tag: HookPassive,    // useEffect 标记
  // tag: HookLayout,  // useLayoutEffect 标记
  create: () => {},    // effect 函数
  destroy: undefined,  // 清理函数
  deps: [],            // 依赖数组
  next: null
};

// useEffect：commit 阶段后调度异步任务
function commitPassiveEffects() {
  // 通过 Scheduler 异步执行
  scheduleCallback(NormalPriority, flushPassiveEffects);
}

// useLayoutEffect：commit 阶段同步执行
function commitLayoutEffects() {
  // 同步执行，阻塞后续代码
  commitLayoutEffectOnFiber(fiber);
}
```

**🔍 追问：什么时候必须用 useLayoutEffect？**

当需要在浏览器绘制前同步修改 DOM，防止闪烁：

```javascript
// ❌ 会闪烁
function Tooltip() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef();

  useEffect(() => {
    const rect = ref.current.getBoundingClientRect();
    setPosition({ x: rect.right, y: rect.top });
    // 先显示默认位置，然后跳到正确位置 → 闪烁
  }, []);

  return <div ref={ref} style={{ left: position.x }}>...</div>;
}

// ✅ 不闪烁
function Tooltip() {
  useLayoutEffect(() => {
    const rect = ref.current.getBoundingClientRect();
    setPosition({ x: rect.right, y: rect.top });
    // 绘制前就计算好位置
  }, []);
}
```

---

### 5. React 的并发模式是什么？优先级调度是怎么工作的？

**标准答案：**

**并发模式核心思想**：渲染可中断，高优先级任务可以打断低优先级任务。

**优先级模型（Lanes）：**

```javascript
// 用 31 位二进制表示不同优先级
const SyncLane           = 0b0000000000000000000000000000001; // 同步
const InputContinuousLane= 0b0000000000000000000000000000100; // 连续输入
const DefaultLane        = 0b0000000000000000000000000010000; // 默认
const TransitionLane     = 0b0000000000000000000000001000000; // 过渡
const IdleLane           = 0b0100000000000000000000000000000; // 空闲

// 不同交互自动分配优先级
onClick    → SyncLane（最高）
mousemove  → InputContinuousLane
setState   → DefaultLane
transition → TransitionLane（可被打断）
```

**时间切片实现：**

```javascript
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}

function shouldYield() {
  // 每 5ms 检查一次，是否有更高优先级任务
  return getCurrentTime() >= deadline;
}
```

**使用场景：**

```javascript
function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    // 紧急更新：输入框立即响应
    setQuery(e.target.value);

    // 非紧急更新：搜索结果可以被打断
    startTransition(() => {
      setResults(search(e.target.value));
    });
  };

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending ? <Spinner /> : <ResultList results={results} />}
    </>
  );
}
```

**🔍 追问：useTransition 和 useDeferredValue 有什么区别？**

```javascript
// useTransition：包装状态更新
const [isPending, startTransition] = useTransition();
startTransition(() => {
  setState(newValue); // 这个更新是低优先级的
});

// useDeferredValue：延迟值的更新
const deferredValue = useDeferredValue(value);
// value 变化后，deferredValue 会延迟更新

// 区别：
// useTransition - 你控制什么更新是低优先级
// useDeferredValue - React 自动延迟某个值
```

---

### 6. React 事件系统和原生 DOM 事件有什么区别？

**标准答案：**

**React 合成事件特点：**

| 特性 | React 事件 | 原生事件 |
|-----|-----------|---------|
| 绑定位置 | 委托到 root 容器 | 绑定到具体元素 |
| 事件对象 | SyntheticEvent（封装） | 原生 Event |
| 事件名 | camelCase（onClick） | 小写（onclick） |
| 阻止冒泡 | e.stopPropagation() | 只阻止 React 内部 |
| 事件池 | React 17 前有池化 | 无 |

**事件委托到 root：**

```javascript
// React 17+ 委托到 createRoot 的容器
function createRoot(container) {
  listenToAllSupportedEvents(container);
  // 在 container 上注册所有事件的监听器
}

// React 17 之前委托到 document
// 问题：多个 React 版本共存时会冲突
```

**事件执行流程：**

```javascript
function dispatchEvent(nativeEvent) {
  // 1. 找到触发事件的 Fiber
  const targetFiber = getClosestFiberFromNode(nativeEvent.target);

  // 2. 收集路径上所有监听器
  const listeners = [];
  let fiber = targetFiber;
  while (fiber) {
    const listener = fiber.memoizedProps.onClick;
    if (listener) listeners.push({ fiber, listener });
    fiber = fiber.return;
  }

  // 3. 创建合成事件，模拟冒泡
  const syntheticEvent = new SyntheticEvent(nativeEvent);
  for (const { listener } of listeners) {
    listener(syntheticEvent);
    if (syntheticEvent.isPropagationStopped()) break;
  }
}
```

**🔍 追问：React 事件和原生事件的执行顺序是什么？**

```javascript
function App() {
  const ref = useRef();

  useEffect(() => {
    ref.current.addEventListener('click', () => {
      console.log('原生事件');
    });
    document.addEventListener('click', () => {
      console.log('document 原生事件');
    });
  }, []);

  return (
    <div onClick={() => console.log('React 事件')}>
      <button ref={ref}>Click</button>
    </div>
  );
}

// 点击 button，输出顺序：
// 1. 原生事件（button 上的）
// 2. React 事件（冒泡到 root，执行合成事件）
// 3. document 原生事件
```

---

### 7. Suspense 是怎么实现的？它的工作原理是什么？

**标准答案：**

**核心机制：捕获 Promise + 重新渲染**

```javascript
// 子组件抛出 Promise
function fetchData() {
  if (!cache.data) {
    throw fetchPromise; // 抛出 Promise，不是 Error
  }
  return cache.data;
}

// Suspense 捕获 Promise
function updateSuspenseComponent(workInProgress) {
  try {
    renderChildren();
  } catch (thrownValue) {
    if (isThenable(thrownValue)) {
      // 是 Promise，显示 fallback
      workInProgress.flags |= ShouldCapture;

      // 注册回调，Promise resolve 后重新渲染
      thrownValue.then(() => {
        ensureRootIsScheduled(root);
      });
    } else {
      // 是 Error，交给 ErrorBoundary
      throw thrownValue;
    }
  }
}
```

**Suspense 状态机：**

```
初始状态：尝试渲染 children
↓ 子组件抛出 Promise
Loading 状态：显示 fallback
↓ Promise resolve
完成状态：显示 children
```

**🔍 追问：Suspense 和 ErrorBoundary 有什么区别？**

```javascript
// Suspense：捕获 Promise（数据加载中）
<Suspense fallback={<Loading />}>
  <AsyncComponent />  {/* 可以抛出 Promise */}
</Suspense>

// ErrorBoundary：捕获 Error（代码出错）
class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    logError(error, errorInfo);
  }
}
```

**区别：**
- Suspense 捕获 Promise，显示 loading 状态
- ErrorBoundary 捕获 Error，显示错误 UI
- ErrorBoundary 必须是 Class 组件（有 componentDidCatch）

---

### 8. React.memo、useMemo、useCallback 分别解决什么问题？

**标准答案：**

| API | 缓存对象 | 作用 | 触发条件 |
|-----|---------|------|---------|
| React.memo | 组件 | 跳过组件重渲染 | props 浅比较不变 |
| useMemo | 计算结果 | 跳过昂贵计算 | deps 不变 |
| useCallback | 函数 | 保持函数引用稳定 | deps 不变 |

**React.memo 原理：**

```javascript
function memo(Component, compare = shallowEqual) {
  return function MemoComponent(props) {
    // 比较 props，决定是否重渲染
    if (compare(prevProps, props)) {
      return bailout(); // 跳过
    }
    return <Component {...props} />;
  };
}
```

**useMemo 原理：**

```javascript
function updateMemo(nextCreate, deps) {
  const hook = updateWorkInProgressHook();
  const prevDeps = hook.memoizedState[1];

  if (areHookInputsEqual(deps, prevDeps)) {
    return hook.memoizedState[0]; // 返回缓存值
  }

  const nextValue = nextCreate(); // 重新计算
  hook.memoizedState = [nextValue, deps];
  return nextValue;
}
```

**正确使用场景：**

```javascript
// ✅ React.memo：子组件渲染昂贵
const ExpensiveList = React.memo(function List({ items }) {
  return items.map(item => <ComplexItem key={item.id} {...item} />);
});

// ✅ useMemo：计算昂贵
const sortedItems = useMemo(() => {
  return items.slice().sort((a, b) => a.value - b.value);
}, [items]);

// ✅ useCallback：传递给 memo 组件的回调
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

<MemoizedButton onClick={handleClick} />
```

**🔍 追问：什么时候不应该用这些优化？**

```javascript
// ❌ 简单计算不需要 useMemo
const fullName = useMemo(() => `${first} ${last}`, [first, last]);
// 直接写：const fullName = `${first} ${last}`;

// ❌ 没有子组件依赖，不需要 useCallback
const handleClick = useCallback(() => {
  console.log('clicked');
}, []);
// 直接写：const handleClick = () => console.log('clicked');

// ❌ props 经常变化，memo 反而增加开销
const AlwaysChangingComponent = React.memo(({ data }) => {
  // data 每次都是新对象，memo 白做
});
```

---

### 9. React 的 Context 是怎么实现跨层级通信的？有什么性能问题？

**标准答案：**

**Context 原理：Provider 更新时，遍历子树标记消费者**

```javascript
// Provider 更新
function updateContextProvider(workInProgress) {
  const context = workInProgress.type._context;
  const newValue = workInProgress.pendingProps.value;
  const oldValue = workInProgress.memoizedProps?.value;

  if (!Object.is(newValue, oldValue)) {
    // 值变化，向下遍历，标记所有消费者
    propagateContextChange(workInProgress, context, newValue);
  }
}

// 标记消费者
function propagateContextChange(workInProgress, context, newValue) {
  let fiber = workInProgress.child;

  while (fiber !== null) {
    // 检查是否消费了这个 context
    const dependencies = fiber.dependencies;
    if (dependencies !== null) {
      for (let dep of dependencies) {
        if (dep.context === context) {
          // 标记需要更新
          fiber.lanes |= renderLanes;
        }
      }
    }
    fiber = fiber.sibling || fiber.return?.sibling;
  }
}
```

**性能问题：Context 变化会导致所有消费者重渲染**

```javascript
// ❌ 问题：任何 state 变化都会让所有消费者重渲染
function App() {
  const [user, setUser] = useState({ name: 'John', age: 25 });
  const [theme, setTheme] = useState('dark');

  // 每次 setUser 或 setTheme，整个 value 对象都是新的
  return (
    <AppContext.Provider value={{ user, theme, setUser, setTheme }}>
      <DeepTree />
    </AppContext.Provider>
  );
}
```

**🔍 追问：怎么优化 Context 的性能问题？**

**方案 1：拆分 Context**
```javascript
// 分离不同关注点
<UserContext.Provider value={user}>
  <ThemeContext.Provider value={theme}>
    <App />
  </ThemeContext.Provider>
</UserContext.Provider>
```

**方案 2：useMemo 稳定 value**
```javascript
const value = useMemo(() => ({ user, updateUser }), [user]);
return <UserContext.Provider value={value}>...</UserContext.Provider>;
```

**方案 3：状态下沉，减少消费者**
```javascript
// 不要在顶层消费 context，在需要的地方消费
function UserName() {
  const { name } = useContext(UserContext); // 只有这里重渲染
  return <span>{name}</span>;
}
```

---

### 10. SSR（服务端渲染）的原理是什么？Hydration 是什么？

**标准答案：**

**SSR 流程：**

```
服务端：
1. 执行组件，生成 HTML 字符串
2. 返回完整 HTML（用户立即看到内容）

客户端：
3. 下载 JS bundle
4. Hydration：给 HTML 绑定事件，恢复交互
```

**renderToString 简化实现：**

```javascript
function renderToString(element) {
  if (typeof element.type === 'function') {
    // 函数组件：执行得到子元素
    const child = element.type(element.props);
    return renderToString(child);
  }

  // HTML 元素
  let html = `<${element.type}`;
  for (const key in element.props) {
    if (key !== 'children') {
      html += ` ${key}="${element.props[key]}"`;
    }
  }
  html += '>';

  // 递归渲染子元素
  if (element.props.children) {
    html += renderToString(element.props.children);
  }

  html += `</${element.type}>`;
  return html;
}
```

**Hydration（水合）：**

```javascript
// 服务端返回的 HTML
<div id="root">
  <button>Click me</button>
</div>

// 客户端 Hydration
hydrateRoot(document.getElementById('root'), <App />);

// Hydration 过程：
// 1. 不重新创建 DOM，复用服务端的 DOM
// 2. 遍历 Fiber 树，给 DOM 绑定事件
// 3. 执行 useEffect 等副作用
```

**🔍 追问：Hydration 不匹配会怎样？**

```javascript
// 服务端渲染
function App() {
  return <div>{Date.now()}</div>; // 服务端时间
}

// 客户端 hydration
// Date.now() 返回不同的值
// React 警告：Hydration mismatch

// 解决方案
function App() {
  const [time, setTime] = useState(null);

  useEffect(() => {
    setTime(Date.now()); // 客户端执行
  }, []);

  return <div>{time ?? 'Loading...'}</div>;
}
```

**🔍 追问：React 18 的 Streaming SSR 是什么？**

```javascript
// 传统 SSR：必须等整个页面渲染完才返回
const html = renderToString(<App />);
res.send(html);

// Streaming SSR：边渲染边发送
const stream = renderToPipeableStream(<App />, {
  onShellReady() {
    // 外壳准备好就开始发送
    stream.pipe(res);
  }
});

// 配合 Suspense，数据没准备好的部分先显示 fallback
// 数据准备好后，通过 script 标签注入内容
```

---

### 11. useReducer 和 useState 有什么区别？什么时候用 useReducer？

**标准答案：**

**useState 本质上是简化的 useReducer：**

```javascript
// useState 底层实现
function useState(initialState) {
  return useReducer(basicStateReducer, initialState);
}

function basicStateReducer(state, action) {
  return typeof action === 'function' ? action(state) : action;
}
```

**区别对比：**

| 特性 | useState | useReducer |
|-----|----------|------------|
| 状态结构 | 简单值 | 复杂对象/多个相关状态 |
| 更新逻辑 | 分散在组件中 | 集中在 reducer 中 |
| 可测试性 | 一般 | 更好（纯函数） |
| 性能优化 | dispatch 每次都是新函数 | dispatch 引用稳定 |

**useReducer 适用场景：**

```javascript
// ❌ useState：状态逻辑分散
function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addTodo = (text) => {
    setTodos([...todos, { id: Date.now(), text, done: false }]);
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };
}

// ✅ useReducer：逻辑集中、可测试
function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [...state, { id: Date.now(), text: action.text, done: false }];
    case 'TOGGLE':
      return state.map(t => t.id === action.id ? { ...t, done: !t.done } : t);
    case 'DELETE':
      return state.filter(t => t.id !== action.id);
    default:
      return state;
  }
}

function TodoList() {
  const [todos, dispatch] = useReducer(todoReducer, []);

  // dispatch 引用稳定，可以安全传递给子组件
  return <TodoItem onToggle={(id) => dispatch({ type: 'TOGGLE', id })} />;
}
```

**🔍 追问：dispatch 为什么引用稳定？**

dispatch 在组件整个生命周期中保持同一引用，因为它绑定的是当前 Fiber 的更新队列，不依赖于闭包状态。这使得传给 memo 组件时不会导致不必要的重渲染。

---

### 12. React 的批量更新（Batching）是怎么实现的？React 18 有什么变化？

**标准答案：**

**批量更新原理：**

```javascript
// React 内部维护一个执行上下文标志
let executionContext = NoContext;

function batchedUpdates(fn) {
  const prevContext = executionContext;
  executionContext |= BatchedContext;  // 标记批量模式

  try {
    return fn();
  } finally {
    executionContext = prevContext;
    // 退出批量模式后，统一处理更新
    if (executionContext === NoContext) {
      flushSyncCallbackQueue();
    }
  }
}
```

**React 17 的问题：**

```javascript
// React 17：只有 React 事件处理器中才批量
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  // ✅ 合并为一次渲染
}

// 在 setTimeout/Promise 中不批量
setTimeout(() => {
  setCount(c => c + 1);  // 触发一次渲染
  setFlag(f => !f);      // 又触发一次渲染
}, 0);

// 解决方案：手动批量
import { unstable_batchedUpdates } from 'react-dom';
setTimeout(() => {
  unstable_batchedUpdates(() => {
    setCount(c => c + 1);
    setFlag(f => !f);
  });
}, 0);
```

**React 18：自动批量（Automatic Batching）**

```javascript
// React 18：所有更新都自动批量
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // ✅ 自动合并为一次渲染
}, 0);

fetch('/api').then(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // ✅ 自动合并
});

// 如果需要立即更新（不批量）
import { flushSync } from 'react-dom';

flushSync(() => {
  setCount(c => c + 1);  // 立即渲染
});
setFlag(f => !f);        // 又一次渲染
```

**🔍 追问：批量更新对性能有多大影响？**

假设一个组件有 3 个 setState：
- 无批量：渲染 3 次，每次都完整执行 render → commit
- 有批量：渲染 1 次，状态合并后一次 render → commit

对于复杂组件，减少渲染次数能显著提升性能。

---

### 13. React 的 key 有什么作用？为什么列表渲染需要 key？

**标准答案：**

**key 的作用：帮助 React 识别节点身份**

```javascript
// 没有 key：按索引对比
// 旧: [A, B, C]  新: [C, A, B]
// React 认为：0→0(A→C), 1→1(B→A), 2→2(C→B)
// 结果：更新三个节点的内容

// 有 key：按 key 对比
// 旧: [A:a, B:b, C:c]  新: [C:c, A:a, B:b]
// React 认为：C 移到前面，A B 不动
// 结果：只做一次 DOM 移动
```

**key 对状态的影响：**

```javascript
// ⚠️ 重要：key 变化会销毁重建组件

// 场景1：切换用户时重置表单
function App() {
  const [userId, setUserId] = useState(1);

  // ❌ 切换用户后，表单状态保留（错误）
  return <UserForm userId={userId} />;

  // ✅ 切换用户后，表单重置
  return <UserForm key={userId} userId={userId} />;
}

// 场景2：列表项状态错乱
function List({ items }) {
  return items.map((item, index) => (
    // ❌ 删除第一项后，第二项的 input 显示第一项的内容
    <input key={index} defaultValue={item.text} />

    // ✅ 正确保持状态
    <input key={item.id} defaultValue={item.text} />
  ));
}
```

**key 的工作原理：**

```javascript
// Diff 时，先建立 key → Fiber 的 Map
function mapRemainingChildren(currentFirstChild) {
  const existingChildren = new Map();
  let child = currentFirstChild;

  while (child !== null) {
    existingChildren.set(
      child.key !== null ? child.key : child.index,
      child
    );
    child = child.sibling;
  }

  return existingChildren;
}

// 遍历新节点时，通过 key 查找可复用的旧 Fiber
const existing = existingChildren.get(newChild.key);
if (existing) {
  // 复用 Fiber，只更新 props
  return useFiber(existing, newChild.props);
}
```

**🔍 追问：用随机数做 key 会怎样？**

```javascript
// ❌ 每次渲染 key 都变化
items.map(item => <Item key={Math.random()} {...item} />)

// 结果：
// 1. 每次都销毁重建所有子组件
// 2. 子组件状态丢失
// 3. 性能极差
```

---

### 14. React 的 StrictMode 有什么作用？为什么会执行两次？

**标准答案：**

**StrictMode 的作用：检测潜在问题**

```javascript
<React.StrictMode>
  <App />
</React.StrictMode>
```

**检测内容：**

1. **不安全的生命周期**
2. **过时的 API 使用**（如 findDOMNode、字符串 ref）
3. **意外的副作用**
4. **过时的 Context API**
5. **不可重用的状态**（React 18 新增）

**为什么执行两次？**

```javascript
// StrictMode 在开发环境下会：
// 1. 调用两次 render/函数组件
// 2. 调用两次 useState 初始化函数
// 3. 调用两次 useEffect（mount → unmount → mount）

function Component() {
  console.log('render');  // 打印两次

  const [state] = useState(() => {
    console.log('init');  // 打印两次
    return 0;
  });

  useEffect(() => {
    console.log('mount');   // 打印两次
    return () => console.log('unmount');  // 打印一次
  }, []);
}
```

**目的：检测副作用问题**

```javascript
// ❌ 有问题的代码（StrictMode 能暴露）
function BadComponent() {
  useEffect(() => {
    // 订阅但忘记清理
    window.addEventListener('resize', handleResize);
    // 执行两次后，会有两个监听器！
  }, []);
}

// ✅ 正确的代码
function GoodComponent() {
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // 执行两次：订阅 → 清理 → 订阅，最终只有一个监听器
  }, []);
}
```

**🔍 追问：React 18 的 StrictMode 有什么新行为？**

React 18 新增了「模拟卸载再挂载」的行为，为未来的 Offscreen API 做准备：

```javascript
// 未来场景：组件被隐藏后保留状态，再显示时恢复
<Offscreen mode="hidden">
  <TabContent />  // 隐藏但保留状态
</Offscreen>

// StrictMode 提前检测：你的组件能否正确处理这种情况？
```

---

### 15. React 和 Vue 的核心差异是什么？各有什么优缺点？

**标准答案：**

**核心理念差异：**

| 对比 | React | Vue |
|-----|-------|-----|
| 定位 | UI 库（只关注视图） | 渐进式框架（包含路由、状态管理） |
| 更新策略 | 不可变数据 + Diff | 响应式追踪 + Diff |
| 模板/JSX | JSX（JavaScript 优先） | 模板（HTML 优先） |
| 数据流 | 单向数据流 | 默认单向，支持 v-model 双向 |
| 状态更新 | 显式 setState | 自动追踪依赖 |

**响应式实现差异：**

```javascript
// React：不可变更新，手动触发
const [user, setUser] = useState({ name: 'John' });

// ❌ 直接修改不触发更新
user.name = 'Jane';

// ✅ 必须创建新对象
setUser({ ...user, name: 'Jane' });

// Vue：可变更新，自动追踪
const user = reactive({ name: 'John' });

// ✅ 直接修改，自动触发更新
user.name = 'Jane';
```

**心智模型差异：**

```javascript
// React：基于快照和闭包
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    // count 是闭包捕获的快照值
    setTimeout(() => {
      console.log(count);  // 点击时的 count 值
    }, 1000);
  };
}

// Vue：基于响应式引用
setup() {
  const count = ref(0);

  const handleClick = () => {
    // count.value 始终是最新值
    setTimeout(() => {
      console.log(count.value);  // 1 秒后的最新值
    }, 1000);
  };
}
```

**优缺点对比：**

| 方面 | React 优势 | Vue 优势 |
|-----|-----------|---------|
| 灵活性 | 高，纯 JS 表达能力强 | 中，模板有一定约束 |
| 学习曲线 | 陡，需理解函数式思想 | 缓，更接近传统前端 |
| 生态 | 丰富，选择多 | 官方方案更统一 |
| 性能 | 需手动优化（memo） | 自动依赖追踪，优化少 |
| TypeScript | 天然支持 | 3.0 后支持良好 |
| 调试 | 需理解闭包陷阱 | 更直观 |

**🔍 追问：什么场景更适合 React？什么场景更适合 Vue？**

**React 更适合：**
- 大型复杂应用
- 团队有函数式编程经验
- 需要高度自定义
- React Native 跨端需求

**Vue 更适合：**
- 中小型应用
- 快速开发原型
- 团队前端经验较浅
- 偏好模板语法

```javascript
// React 的灵活性示例：渲染逻辑完全用 JS 控制
function List({ items, renderItem }) {
  return items
    .filter(item => item.active)
    .sort((a, b) => a.order - b.order)
    .map(item => renderItem(item));
}

// Vue 的简洁性示例：模板直观表达
<template>
  <div v-for="item in sortedActiveItems" :key="item.id">
    <slot :item="item" />
  </div>
</template>
```

---

### 16. React 的 Error Boundary 是什么？如何实现和使用？

**标准答案：**

**Error Boundary 是什么：**

Error Boundary 是 React 用于捕获子组件树中 JavaScript 错误的机制，可以显示降级 UI 而不是崩溃整个应用。

**实现 Error Boundary：**

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // 静态方法：根据错误更新 state
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // 生命周期：捕获错误详情
  componentDidCatch(error, errorInfo) {
    // 记录错误日志
    console.error('Error caught:', error);
    console.error('Error info:', errorInfo.componentStack);

    // 上报错误监控
    reportErrorToService(error, errorInfo);

    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // 渲染降级 UI
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.toString()}</pre>
            <pre>{this.state.errorInfo?.componentStack}</pre>
          </details>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 使用
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

**Error Boundary 无法捕获的错误：**

```javascript
// ❌ 无法捕获
// 1. 事件处理器中的错误
function Button() {
  const handleClick = () => {
    throw new Error('Click error'); // 不会被 ErrorBoundary 捕获
  };
  return <button onClick={handleClick}>Click</button>;
}

// 2. 异步代码
useEffect(() => {
  setTimeout(() => {
    throw new Error('Async error'); // 不会被捕获
  }, 1000);
}, []);

// 3. 服务端渲染
// 4. Error Boundary 自身的错误

// ✅ 解决方案：在事件处理器中手动捕获
function Button() {
  const [error, setError] = useState(null);

  if (error) throw error; // 这会被 ErrorBoundary 捕获

  const handleClick = async () => {
    try {
      await riskyOperation();
    } catch (e) {
      setError(e); // 触发重新渲染，抛出错误
    }
  };

  return <button onClick={handleClick}>Click</button>;
}
```

**使用 react-error-boundary 库：**

```javascript
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // 重置应用状态
      }}
      onError={(error, info) => {
        // 错误日志上报
      }}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}

// Hook 方式使用
function MyComponent() {
  const { showBoundary } = useErrorBoundary();

  const handleClick = async () => {
    try {
      await fetchData();
    } catch (error) {
      showBoundary(error);
    }
  };

  return <button onClick={handleClick}>Fetch</button>;
}
```

**🔍 追问：如何设计多层级的 Error Boundary？**

```javascript
// 分层错误处理策略
<GlobalErrorBoundary fallback={<CriticalErrorPage />}>
  <App>
    <Header /> {/* 头部错误不影响主内容 */}

    <PageErrorBoundary fallback={<PageErrorFallback />}>
      <MainContent>
        <WidgetErrorBoundary fallback={<WidgetPlaceholder />}>
          <Widget /> {/* 小组件错误只影响自己 */}
        </WidgetErrorBoundary>
      </MainContent>
    </PageErrorBoundary>

    <Footer />
  </App>
</GlobalErrorBoundary>
```

---

### 17. React 的 forwardRef 和 useImperativeHandle 是什么？如何配合使用？

**标准答案：**

**forwardRef：转发 ref 到子组件**

```javascript
// 问题：函数组件无法直接接收 ref
function Input(props) {
  return <input {...props} />;
}

// ❌ ref 无法传递给函数组件
<Input ref={inputRef} />

// ✅ 使用 forwardRef
const Input = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});

// 现在可以正常使用
const inputRef = useRef(null);
<Input ref={inputRef} />
inputRef.current.focus(); // 可以访问 DOM
```

**useImperativeHandle：自定义暴露给父组件的实例值**

```javascript
const FancyInput = forwardRef((props, ref) => {
  const inputRef = useRef();
  const [value, setValue] = useState('');

  // 自定义暴露的方法
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    },
    clear: () => {
      setValue('');
    },
    getValue: () => value,
    // 不暴露整个 DOM，只暴露需要的方法
  }), [value]); // 依赖项

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={e => setValue(e.target.value)}
      {...props}
    />
  );
});

// 使用
function Parent() {
  const inputRef = useRef();

  const handleSubmit = () => {
    console.log(inputRef.current.getValue());
    inputRef.current.clear();
  };

  return (
    <>
      <FancyInput ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>Focus</button>
      <button onClick={handleSubmit}>Submit</button>
    </>
  );
}
```

**实际应用场景：**

```javascript
// 1. 表单组件
const Form = forwardRef((props, ref) => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  useImperativeHandle(ref, () => ({
    validate: () => {
      const newErrors = validateForm(values);
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    reset: () => {
      setValues({});
      setErrors({});
    },
    getValues: () => values,
    setFieldValue: (field, value) => {
      setValues(prev => ({ ...prev, [field]: value }));
    }
  }));

  return <form>{props.children}</form>;
});

// 2. 弹窗组件
const Modal = forwardRef(({ children }, ref) => {
  const [isOpen, setIsOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev)
  }));

  if (!isOpen) return null;

  return createPortal(
    <div className="modal">{children}</div>,
    document.body
  );
});

// 3. 视频播放器
const VideoPlayer = forwardRef(({ src }, ref) => {
  const videoRef = useRef();

  useImperativeHandle(ref, () => ({
    play: () => videoRef.current.play(),
    pause: () => videoRef.current.pause(),
    seek: (time) => { videoRef.current.currentTime = time; },
    getCurrentTime: () => videoRef.current.currentTime,
    getDuration: () => videoRef.current.duration
  }));

  return <video ref={videoRef} src={src} />;
});
```

**🔍 追问：React 19 中有什么变化？**

```javascript
// React 19：函数组件可以直接接收 ref 作为 props
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}

// 不再需要 forwardRef 包装
<Input ref={inputRef} />

// forwardRef 在 React 19 中被废弃，但仍可用于向后兼容
```

---

### 18. React 的 Portals 是什么？有哪些使用场景？

**标准答案：**

**Portal 允许将子节点渲染到 DOM 树的其他位置：**

```javascript
import { createPortal } from 'react-dom';

function Modal({ children, isOpen }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
      </div>
    </div>,
    document.body // 渲染目标
  );
}

// 使用：虽然在组件树中是子组件，但 DOM 渲染在 body 下
function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="app">
      <button onClick={() => setShowModal(true)}>Open Modal</button>
      <Modal isOpen={showModal}>
        <h2>Modal Content</h2>
        <button onClick={() => setShowModal(false)}>Close</button>
      </Modal>
    </div>
  );
}
```

**Portal 的特性：**

```javascript
// 1. 事件冒泡仍然按 React 组件树冒泡（而非 DOM 树）
function Parent() {
  return (
    <div onClick={() => console.log('Parent clicked')}>
      {createPortal(
        <button onClick={() => console.log('Button clicked')}>
          Click me
        </button>,
        document.body
      )}
    </div>
  );
}
// 点击按钮：先输出 "Button clicked"，再输出 "Parent clicked"

// 2. Context 仍然可以访问
const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Modal>
        <ThemeAwareContent /> {/* 可以正常访问 ThemeContext */}
      </Modal>
    </ThemeContext.Provider>
  );
}
```

**常见使用场景：**

```javascript
// 1. 模态框 / 对话框
const Dialog = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.getElementById('dialog-root')
  );
};

// 2. Tooltip / Popover（避免被 overflow: hidden 裁剪）
const Tooltip = ({ children, content, position }) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef();

  const handleMouseEnter = () => {
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({ x: rect.x, y: rect.y });
  };

  return (
    <>
      <span ref={triggerRef} onMouseEnter={handleMouseEnter}>
        {children}
      </span>
      {createPortal(
        <div
          className="tooltip"
          style={{ left: coords.x, top: coords.y }}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
};

// 3. 全局通知 / Toast
const ToastContainer = () => {
  const toasts = useToastStore(state => state.toasts);

  return createPortal(
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>,
    document.body
  );
};

// 4. 全屏覆盖层
const FullscreenLoader = ({ isLoading }) => {
  if (!isLoading) return null;

  return createPortal(
    <div className="fullscreen-loader">
      <Spinner />
    </div>,
    document.body
  );
};
```

**🔍 追问：如何确保 Portal 的可访问性？**

```javascript
// 无障碍最佳实践
function AccessibleModal({ isOpen, onClose, title, children }) {
  const modalRef = useRef();
  const previousActiveElement = useRef();

  useEffect(() => {
    if (isOpen) {
      // 保存之前聚焦的元素
      previousActiveElement.current = document.activeElement;
      // 聚焦到模态框
      modalRef.current?.focus();

      // 禁止背景滚动
      document.body.style.overflow = 'hidden';
    }

    return () => {
      // 恢复之前的聚焦
      previousActiveElement.current?.focus();
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 按 Escape 关闭
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      tabIndex={-1}
    >
      <h2 id="modal-title">{title}</h2>
      {children}
    </div>,
    document.body
  );
}
```

---

### 19. React 的 Profiler API 是什么？如何用于性能分析？

**标准答案：**

**Profiler 用于测量 React 应用的渲染性能：**

```javascript
import { Profiler } from 'react';

function onRenderCallback(
  id,                   // Profiler 树的 id
  phase,                // "mount" | "update"
  actualDuration,       // 本次更新花费的渲染时间
  baseDuration,         // 不使用 memo 时的预估渲染时间
  startTime,            // 开始渲染的时间戳
  commitTime,           // 提交更新的时间戳
  interactions          // 本次更新涉及的 interactions 集合
) {
  console.log({
    id,
    phase,
    actualDuration: `${actualDuration.toFixed(2)}ms`,
    baseDuration: `${baseDuration.toFixed(2)}ms`
  });
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Header />
      <Profiler id="MainContent" onRender={onRenderCallback}>
        <MainContent />
      </Profiler>
      <Footer />
    </Profiler>
  );
}
```

**实际性能分析示例：**

```javascript
// 收集性能数据
const performanceData = [];

function profileRender(id, phase, actualDuration, baseDuration) {
  performanceData.push({
    id,
    phase,
    actualDuration,
    baseDuration,
    timestamp: Date.now()
  });

  // 检测慢渲染
  if (actualDuration > 16) { // 超过一帧
    console.warn(`Slow render detected: ${id} took ${actualDuration}ms`);
  }

  // 检测优化效果
  const savings = baseDuration - actualDuration;
  if (savings > 0) {
    console.log(`Memo saved ${savings.toFixed(2)}ms in ${id}`);
  }
}

// 生成性能报告
function generateReport() {
  const byComponent = {};

  performanceData.forEach(data => {
    if (!byComponent[data.id]) {
      byComponent[data.id] = {
        renders: 0,
        totalTime: 0,
        avgTime: 0
      };
    }
    byComponent[data.id].renders++;
    byComponent[data.id].totalTime += data.actualDuration;
  });

  Object.keys(byComponent).forEach(id => {
    byComponent[id].avgTime =
      byComponent[id].totalTime / byComponent[id].renders;
  });

  return byComponent;
}
```

**配合 React DevTools：**

```javascript
// 在开发环境中使用 Profiler 面板
// 1. 打开 React DevTools
// 2. 切换到 Profiler 标签
// 3. 点击录制按钮
// 4. 执行操作
// 5. 停止录制，分析火焰图

// 也可以通过代码交互
if (process.env.NODE_ENV === 'development') {
  // 记录交互
  const { unstable_trace as trace } = require('scheduler/tracing');

  function handleClick() {
    trace('button click', performance.now(), () => {
      // 这个操作会被 Profiler 记录
      setState(newState);
    });
  }
}
```

**自定义 Profiler Hook：**

```javascript
function useRenderProfiler(componentName) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    const currentTime = performance.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;

    renderCount.current++;

    console.log(`[${componentName}] Render #${renderCount.current}`, {
      timeSinceLastRender: `${timeSinceLastRender.toFixed(2)}ms`
    });

    lastRenderTime.current = currentTime;
  });
}

// 使用
function MyComponent() {
  useRenderProfiler('MyComponent');
  // ...
}
```

**🔍 追问：生产环境如何进行性能监控？**

```javascript
// 1. 使用 web-vitals 监控核心指标
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify(metric);
  navigator.sendBeacon('/analytics', body);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);

// 2. 自定义性能监控
const PerformanceMonitor = {
  marks: {},

  startMeasure(name) {
    this.marks[name] = performance.now();
  },

  endMeasure(name) {
    const duration = performance.now() - this.marks[name];
    this.report(name, duration);
    delete this.marks[name];
    return duration;
  },

  report(name, duration) {
    // 上报到监控系统
    if (duration > 100) {
      fetch('/api/performance', {
        method: 'POST',
        body: JSON.stringify({ name, duration, timestamp: Date.now() })
      });
    }
  }
};
```

---

### 20. React 的 Lazy 和 Suspense 如何实现代码分割？

**标准答案：**

**基本使用：**

```javascript
import { lazy, Suspense } from 'react';

// 动态导入组件
const LazyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}
```

**实现原理：**

```javascript
// lazy 的简化实现
function lazy(factory) {
  let status = 'pending';
  let result;

  const thenable = factory().then(
    module => {
      status = 'fulfilled';
      result = module.default;
    },
    error => {
      status = 'rejected';
      result = error;
    }
  );

  return {
    $$typeof: REACT_LAZY_TYPE,
    _payload: {
      _status: status,
      _result: result
    },
    _init: () => {
      if (status === 'pending') {
        throw thenable; // 抛出 Promise，Suspense 捕获
      }
      if (status === 'rejected') {
        throw result;
      }
      return result;
    }
  };
}

// Suspense 捕获 Promise 并显示 fallback
// 当 Promise resolve 后，重新渲染真实内容
```

**路由级代码分割：**

```javascript
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  );
}
```

**带重试和错误处理：**

```javascript
// 带重试的 lazy
function lazyWithRetry(factory, retries = 3) {
  return lazy(async () => {
    for (let i = 0; i < retries; i++) {
      try {
        return await factory();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  });
}

// 带预加载的 lazy
function lazyWithPreload(factory) {
  const Component = lazy(factory);
  Component.preload = factory;
  return Component;
}

const Dashboard = lazyWithPreload(() => import('./Dashboard'));

// 鼠标悬停时预加载
<Link to="/dashboard" onMouseEnter={() => Dashboard.preload()}>
  Dashboard
</Link>
```

**命名导出的处理：**

```javascript
// 组件使用命名导出
// export const MyComponent = ...

// 需要转换为默认导出
const MyComponent = lazy(() =>
  import('./MyModule').then(module => ({
    default: module.MyComponent
  }))
);

// 或者创建工具函数
function lazyNamed(factory, name) {
  return lazy(() =>
    factory().then(module => ({ default: module[name] }))
  );
}

const MyComponent = lazyNamed(
  () => import('./MyModule'),
  'MyComponent'
);
```

**🔍 追问：如何实现基于用户行为的智能预加载？**

```javascript
// 1. 基于路由预测
const routePredictions = {
  '/': ['/dashboard', '/profile'],
  '/dashboard': ['/dashboard/settings', '/dashboard/reports']
};

function useRoutePreload(currentPath) {
  useEffect(() => {
    const predictedRoutes = routePredictions[currentPath] || [];
    predictedRoutes.forEach(route => {
      const Component = routeComponents[route];
      Component?.preload?.();
    });
  }, [currentPath]);
}

// 2. 基于可视区域预加载
function useLazyLoadOnIntersection(ref, factory) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          factory();
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);
}

// 3. 空闲时预加载
function preloadOnIdle(factory) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => factory());
  } else {
    setTimeout(factory, 200);
  }
}
```

---

### 21. React Server Components 是什么？与传统组件有什么区别？

**标准答案：**

**React Server Components (RSC) 是在服务端渲染的组件：**

```javascript
// Server Component（默认）- 在服务端执行
// app/page.js
async function BlogPost({ id }) {
  // 可以直接访问数据库
  const post = await db.posts.findUnique({ where: { id } });

  // 可以使用服务端专有的 API
  const data = await fs.readFile('./data.json');

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}

// Client Component - 需要 'use client' 指令
// components/LikeButton.js
'use client';

import { useState } from 'react';

export function LikeButton({ postId }) {
  const [liked, setLiked] = useState(false);

  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? '❤️' : '🤍'}
    </button>
  );
}
```

**Server Components vs Client Components：**

| 特性 | Server Components | Client Components |
|------|-------------------|-------------------|
| 执行环境 | 服务端 | 客户端（浏览器） |
| 打包 | 不包含在客户端 bundle | 包含在客户端 bundle |
| 数据获取 | 直接访问后端资源 | 通过 API 请求 |
| 状态/事件 | 不支持 useState/useEffect | 支持所有 Hooks |
| 交互性 | 无交互 | 完全交互 |
| 重新渲染 | 需要服务端请求 | 客户端即时更新 |

**组合使用：**

```javascript
// Server Component 可以导入 Client Component
// app/page.js (Server Component)
import { LikeButton } from './LikeButton'; // Client Component

async function BlogPost({ id }) {
  const post = await getPost(id);

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      {/* Server Component 中使用 Client Component */}
      <LikeButton postId={id} />
    </article>
  );
}

// ❌ Client Component 不能导入 Server Component
'use client';
import ServerComponent from './ServerComponent'; // 错误！

// ✅ 但可以通过 children 或 props 传递
'use client';
function ClientWrapper({ children }) {
  const [show, setShow] = useState(true);
  return show ? children : null;
}

// 在 Server Component 中
<ClientWrapper>
  <ServerComponent /> {/* 这样是可以的 */}
</ClientWrapper>
```

**RSC 的优势：**

```javascript
// 1. 零 Bundle Size - 服务端组件代码不发送到客户端
// 大型依赖只在服务端使用
import { marked } from 'marked';        // 不会打包到客户端
import { Prism } from 'prismjs';        // 不会打包到客户端
import moment from 'moment';            // 不会打包到客户端

async function MarkdownViewer({ content }) {
  const html = marked(content);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// 2. 直接数据访问
async function UserProfile({ userId }) {
  // 直接查询数据库，无需 API 层
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { posts: true }
  });

  return <Profile user={user} />;
}

// 3. 自动代码分割
// Server Components 天然实现了代码分割
// 只有需要的 Client Components 会发送到客户端
```

**🔍 追问：RSC 的数据流和缓存机制是怎样的？**

```javascript
// Next.js 中的 RSC 缓存策略

// 1. 默认缓存（静态渲染）
async function StaticPage() {
  const data = await fetch('https://api.example.com/data');
  // 默认被缓存，构建时生成
  return <div>{data}</div>;
}

// 2. 动态渲染
async function DynamicPage() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store' // 每次请求都获取新数据
  });
  return <div>{data}</div>;
}

// 3. 增量静态再生成 (ISR)
async function ISRPage() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 } // 60 秒后重新验证
  });
  return <div>{data}</div>;
}

// 4. 流式渲染
import { Suspense } from 'react';

async function Page() {
  return (
    <div>
      <h1>Page Title</h1>
      {/* 先显示标题，Comments 加载中显示 Loading */}
      <Suspense fallback={<Loading />}>
        <Comments /> {/* 异步加载，流式传输 */}
      </Suspense>
    </div>
  );
}
```

---

### 22. React 的 useTransition 和 useDeferredValue 有什么区别？

**标准答案：**

**useTransition：标记低优先级状态更新**

```javascript
import { useTransition, useState } from 'react';

function SearchResults() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    // 高优先级：立即更新输入框
    setQuery(e.target.value);

    // 低优先级：可以被中断的更新
    startTransition(() => {
      setResults(filterHugeList(e.target.value));
    });
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <List items={results} />
    </div>
  );
}
```

**useDeferredValue：延迟某个值的更新**

```javascript
import { useDeferredValue, useState, useMemo } from 'react';

function SearchResults() {
  const [query, setQuery] = useState('');
  // query 变化后，deferredQuery 会延迟更新
  const deferredQuery = useDeferredValue(query);

  // 使用 deferredQuery 计算，避免每次输入都重新计算
  const results = useMemo(
    () => filterHugeList(deferredQuery),
    [deferredQuery]
  );

  // 检测是否正在等待延迟值更新
  const isStale = query !== deferredQuery;

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        <List items={results} />
      </div>
    </div>
  );
}
```

**核心区别：**

| 特性 | useTransition | useDeferredValue |
|------|---------------|------------------|
| 作用对象 | 状态更新函数 | 状态值 |
| 控制方式 | 主动标记低优先级 | 自动延迟值更新 |
| 使用场景 | 能控制 setState 的地方 | 只能拿到值，无法控制更新 |
| isPending | 提供 | 需要手动比较 |
| 适用情况 | 组件内部状态 | Props、Context 值 |

**使用场景对比：**

```javascript
// useTransition：你控制状态更新
function TabContainer() {
  const [tab, setTab] = useState('home');
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (nextTab) => {
    startTransition(() => {
      setTab(nextTab); // 低优先级切换
    });
  };

  return (
    <>
      <TabButtons
        currentTab={tab}
        onChange={handleTabChange}
        isPending={isPending}
      />
      <TabContent tab={tab} />
    </>
  );
}

// useDeferredValue：你无法控制状态更新（如来自 props）
function SlowList({ items }) {
  // items 来自父组件，无法控制其更新
  const deferredItems = useDeferredValue(items);

  return (
    <ul>
      {deferredItems.map(item => (
        <ExpensiveItem key={item.id} item={item} />
      ))}
    </ul>
  );
}

// 父组件
function Parent() {
  const [query, setQuery] = useState('');
  const items = filterItems(query);

  return (
    <>
      <input onChange={e => setQuery(e.target.value)} />
      <SlowList items={items} /> {/* SlowList 使用 useDeferredValue */}
    </>
  );
}
```

**🔍 追问：它们与 debounce/throttle 有什么区别？**

```javascript
// debounce/throttle：固定延迟，不管设备性能
const debouncedSearch = debounce(search, 300);
// 总是等待 300ms，慢设备可能还是卡

// useTransition/useDeferredValue：响应式延迟
// - 快设备：几乎无延迟
// - 慢设备：自动延迟更多
// - 用户继续输入：自动中断旧渲染

// 最佳实践：结合使用
function Search() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  // 防抖处理网络请求
  const debouncedFetch = useMemo(
    () => debounce(fetchResults, 300),
    []
  );

  const handleChange = (e) => {
    setQuery(e.target.value);

    // useTransition 处理 UI 更新
    startTransition(() => {
      debouncedFetch(e.target.value);
    });
  };

  return /* ... */;
}
```

---

### 23. React 的 flushSync 是什么？什么时候需要使用？

**标准答案：**

**flushSync 强制同步刷新状态更新：**

```javascript
import { flushSync } from 'react-dom';

function handleClick() {
  // 正常情况：React 会批处理这些更新
  setCount(c => c + 1);
  setFlag(f => !f);
  // 到这里，DOM 还没更新

  // 使用 flushSync：立即同步更新 DOM
  flushSync(() => {
    setCount(c => c + 1);
  });
  // 到这里，DOM 已经更新

  // 这个更新在另一个批次中
  setFlag(f => !f);
}
```

**使用场景 1：需要立即读取 DOM**

```javascript
function ChatInput() {
  const [messages, setMessages] = useState([]);
  const containerRef = useRef(null);

  const handleSend = (message) => {
    // 问题：DOM 还没更新，滚动位置不对
    setMessages(prev => [...prev, message]);
    containerRef.current.scrollTop = containerRef.current.scrollHeight;

    // 解决：使用 flushSync
    flushSync(() => {
      setMessages(prev => [...prev, message]);
    });
    // 现在 DOM 已更新，可以正确滚动
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  };

  return (
    <div ref={containerRef}>
      {messages.map(m => <Message key={m.id} {...m} />)}
    </div>
  );
}
```

**使用场景 2：配合第三方 DOM 库**

```javascript
function Editor() {
  const [content, setContent] = useState('');
  const editorRef = useRef(null);

  const handleUpdate = (newContent) => {
    // 第三方编辑器需要立即看到 DOM 变化
    flushSync(() => {
      setContent(newContent);
    });

    // 现在可以安全地调用第三方库方法
    editorRef.current.thirdPartyLib.refresh();
  };
}
```

**使用场景 3：动画协调**

```javascript
function AnimatedList({ items }) {
  const handleRemove = (id) => {
    // 需要先获取元素位置，再执行删除
    const element = document.getElementById(id);
    const rect = element.getBoundingClientRect();

    // 同步更新，确保 DOM 状态正确
    flushSync(() => {
      setItems(items.filter(item => item.id !== id));
    });

    // 现在可以执行 FLIP 动画
    animateRemoval(rect);
  };
}
```

**注意事项：**

```javascript
// ⚠️ 性能影响：flushSync 会禁用批处理
function badExample() {
  // ❌ 不要在循环中使用
  items.forEach(item => {
    flushSync(() => {
      setCount(c => c + 1);
    });
  });
  // 每次循环都会重新渲染！

  // ✅ 正确做法
  flushSync(() => {
    items.forEach(item => {
      setCount(c => c + 1);
    });
  });
  // 只渲染一次
}

// ⚠️ 与 useTransition 冲突
function anotherBadExample() {
  const [isPending, startTransition] = useTransition();

  // ❌ flushSync 内不能使用 startTransition
  flushSync(() => {
    startTransition(() => {
      // 会抛出警告
    });
  });
}
```

**🔍 追问：flushSync 与 ReactDOM.flushSync 和 act 有什么关系？**

```javascript
// flushSync：生产环境使用
import { flushSync } from 'react-dom';

// act：测试环境使用，类似功能但有额外断言
import { act } from '@testing-library/react';

test('counter increments', () => {
  render(<Counter />);

  act(() => {
    fireEvent.click(screen.getByRole('button'));
  });
  // act 确保所有更新完成后再断言
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

---

### 24. React 中如何处理大列表的性能问题？

**标准答案：**

**1. 虚拟列表（Virtual List）：**

```javascript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // 预估每项高度
    overscan: 5, // 额外渲染的项数
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**2. 分页加载：**

```javascript
function PaginatedList() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    const newItems = await fetchItems(page);
    setItems(prev => [...prev, ...newItems]);
    setHasMore(newItems.length === PAGE_SIZE);
    setPage(p => p + 1);
  };

  return (
    <InfiniteScroll
      loadMore={loadMore}
      hasMore={hasMore}
      loader={<Loading />}
    >
      {items.map(item => (
        <ListItem key={item.id} {...item} />
      ))}
    </InfiniteScroll>
  );
}
```

**3. 使用 useDeferredValue 延迟渲染：**

```javascript
function FilteredList({ items, filter }) {
  const deferredFilter = useDeferredValue(filter);

  const filteredItems = useMemo(
    () => items.filter(item => item.name.includes(deferredFilter)),
    [items, deferredFilter]
  );

  const isStale = filter !== deferredFilter;

  return (
    <div style={{ opacity: isStale ? 0.7 : 1 }}>
      {filteredItems.map(item => (
        <ListItem key={item.id} {...item} />
      ))}
    </div>
  );
}
```

**4. 时间切片渲染：**

```javascript
function useChunkedRender(items, chunkSize = 20) {
  const [visibleCount, setVisibleCount] = useState(chunkSize);

  useEffect(() => {
    if (visibleCount < items.length) {
      const timer = setTimeout(() => {
        setVisibleCount(prev => Math.min(prev + chunkSize, items.length));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, items.length, chunkSize]);

  return items.slice(0, visibleCount);
}

function ChunkedList({ items }) {
  const visibleItems = useChunkedRender(items, 50);

  return (
    <ul>
      {visibleItems.map(item => (
        <ListItem key={item.id} {...item} />
      ))}
      {visibleItems.length < items.length && <Loading />}
    </ul>
  );
}
```

**5. memo + 稳定引用：**

```javascript
const ListItem = memo(function ListItem({ item, onClick }) {
  return (
    <div onClick={() => onClick(item.id)}>
      {item.name}
    </div>
  );
});

function List({ items }) {
  // 使用 useCallback 保持引用稳定
  const handleClick = useCallback((id) => {
    console.log('Clicked:', id);
  }, []);

  return (
    <ul>
      {items.map(item => (
        <ListItem
          key={item.id}
          item={item}
          onClick={handleClick}
        />
      ))}
    </ul>
  );
}
```

**🔍 追问：如何选择合适的大列表优化方案？**

| 场景 | 推荐方案 |
|------|---------|
| 超长列表（10000+） | 虚拟列表 |
| 需要 SEO | 分页 + SSR |
| 无限滚动社交流 | 分页 + 虚拟列表 |
| 搜索过滤 | useDeferredValue |
| 初始渲染慢 | 时间切片 |
| 复杂列表项 | memo + 优化子组件 |

---

### 25. React 的 useId 是什么？解决了什么问题？

**标准答案：**

**useId 生成唯一的、稳定的 ID：**

```javascript
import { useId } from 'react';

function FormField({ label }) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" />
    </div>
  );
}

// 多次使用同一组件，每个实例有不同的 ID
<FormField label="Name" />   // id: ":r0:"
<FormField label="Email" />  // id: ":r1:"
```

**解决的问题：**

```javascript
// ❌ 问题 1：手动生成 ID 在 SSR 时不匹配
let counter = 0;
function FormField({ label }) {
  const [id] = useState(() => `field-${counter++}`);
  // 服务端渲染：field-0, field-1, field-2
  // 客户端渲染：field-0, field-1, field-2（但顺序可能不同）
  // 导致 Hydration mismatch!
}

// ❌ 问题 2：useEffect 生成 ID 会闪烁
function FormField({ label }) {
  const [id, setId] = useState(null);

  useEffect(() => {
    setId(`field-${Math.random()}`);
  }, []);
  // 首次渲染没有 ID，然后突然出现

  return <input id={id} />; // 初始 id=null
}

// ✅ useId 解决方案
function FormField({ label }) {
  const id = useId();
  // - SSR 和 CSR 生成相同的 ID
  // - 无需 useEffect，首次渲染就有 ID
  // - 同一组件多实例有不同 ID
}
```

**生成多个相关 ID：**

```javascript
function ComplexForm() {
  const id = useId();

  return (
    <form>
      <label htmlFor={`${id}-name`}>Name</label>
      <input id={`${id}-name`} aria-describedby={`${id}-name-hint`} />
      <span id={`${id}-name-hint`}>Enter your full name</span>

      <label htmlFor={`${id}-email`}>Email</label>
      <input id={`${id}-email`} aria-describedby={`${id}-email-hint`} />
      <span id={`${id}-email-hint`}>We'll never share your email</span>
    </form>
  );
}
```

**ARIA 属性使用：**

```javascript
function Accordion({ title, children }) {
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        aria-expanded={isOpen}
        aria-controls={`${id}-panel`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
      </button>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-button`}
        hidden={!isOpen}
      >
        {children}
      </div>
    </div>
  );
}
```

**🔍 追问：useId 的 ID 格式是怎样的？可以自定义吗？**

```javascript
// 默认格式：":r0:", ":r1:", ":r2:" ...
// 冒号是故意的，因为 CSS 选择器中需要转义

// 不能直接自定义格式，但可以添加前缀
function FormField({ label, prefix = 'form' }) {
  const id = useId();
  const fullId = `${prefix}-${id}`;

  return (
    <div>
      <label htmlFor={fullId}>{label}</label>
      <input id={fullId} />
    </div>
  );
}

// 如果需要在 CSS 中使用，记得转义冒号
// [id=":r0:"] { } // ❌
// [id="\:r0\:"] { } // ✅
```

---

### 26. React 的 useInsertionEffect 是什么？与 useLayoutEffect 有什么区别？

**标准答案：**

**useInsertionEffect 在 DOM 变更前执行，专为 CSS-in-JS 库设计：**

```javascript
// 执行顺序
function Component() {
  useInsertionEffect(() => {
    console.log('1. useInsertionEffect'); // DOM 变更前
  });

  useLayoutEffect(() => {
    console.log('2. useLayoutEffect'); // DOM 变更后，绘制前
  });

  useEffect(() => {
    console.log('3. useEffect'); // 绘制后
  });

  return <div>Hello</div>;
}

// 输出顺序：
// 1. useInsertionEffect
// 2. useLayoutEffect
// 3. useEffect
```

**为什么需要 useInsertionEffect：**

```javascript
// CSS-in-JS 库的问题
function Button({ color }) {
  // ❌ 使用 useLayoutEffect 注入样式
  useLayoutEffect(() => {
    const style = document.createElement('style');
    style.textContent = `.btn { color: ${color}; }`;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, [color]);

  // 问题：useLayoutEffect 在 DOM 变更后执行
  // 此时元素已经存在但没有样式，可能导致闪烁
}

// ✅ 使用 useInsertionEffect
function Button({ color }) {
  useInsertionEffect(() => {
    const style = document.createElement('style');
    style.textContent = `.btn { color: ${color}; }`;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, [color]);

  // useInsertionEffect 在 DOM 变更前执行
  // 样式在元素渲染时就已经存在
  return <button className="btn">Click</button>;
}
```

**CSS-in-JS 库使用示例：**

```javascript
// styled-components 类似库的简化实现
let styleSheet = null;
const insertedRules = new Set();

function useStyles(css, className) {
  useInsertionEffect(() => {
    if (!styleSheet) {
      const style = document.createElement('style');
      document.head.appendChild(style);
      styleSheet = style.sheet;
    }

    if (!insertedRules.has(className)) {
      styleSheet.insertRule(`.${className} { ${css} }`);
      insertedRules.add(className);
    }
  }, [css, className]);
}

function StyledButton({ color, children }) {
  const className = `btn-${hash(color)}`;
  useStyles(`color: ${color}; padding: 10px;`, className);

  return <button className={className}>{children}</button>;
}
```

**三个 Effect 的对比：**

| 特性 | useInsertionEffect | useLayoutEffect | useEffect |
|------|-------------------|-----------------|-----------|
| 执行时机 | DOM 变更前 | DOM 变更后，绘制前 | 绘制后 |
| 能否读取 DOM | ❌ | ✅ | ✅ |
| 能否更新 ref | ❌ | ✅ | ✅ |
| 适用场景 | CSS 注入 | DOM 测量/同步操作 | 副作用 |
| 阻塞绘制 | 是 | 是 | 否 |

**🔍 追问：普通开发者需要使用 useInsertionEffect 吗？**

```javascript
// 通常不需要！这是为库作者准备的

// ❌ 不要这样用
useInsertionEffect(() => {
  // 普通副作用
  fetch('/api/data');
});

// ❌ 不要这样用
useInsertionEffect(() => {
  // DOM 操作
  ref.current.focus();
});

// ✅ 只在开发 CSS-in-JS 库时使用
// 普通开发者应该使用 useEffect 或 useLayoutEffect
```

---

### 27. React 中的 key 除了列表还有什么用途？

**标准答案：**

**1. 重置组件状态：**

```javascript
// 场景：切换用户时重置表单
function UserProfile({ userId }) {
  // ❌ 状态不会重置
  const [name, setName] = useState('');

  useEffect(() => {
    // 需要手动重置
    setName('');
    fetchUser(userId);
  }, [userId]);
}

// ✅ 使用 key 强制重新挂载
function App() {
  const [userId, setUserId] = useState(1);

  return (
    <UserProfile key={userId} userId={userId} />
    // userId 变化时，整个组件重新挂载，状态自动重置
  );
}
```

**2. 触发动画重播：**

```javascript
function AnimatedNotification({ message }) {
  return (
    // key 变化时重新挂载，触发 CSS 动画
    <div key={message} className="fade-in">
      {message}
    </div>
  );
}

// 或者
function Counter({ value }) {
  return (
    <span key={value} className="number-flip">
      {value}
    </span>
  );
}
```

**3. 强制重新获取数据：**

```javascript
function DataFetcher({ id }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData(id).then(setData);
  }, []); // 空依赖，只在挂载时获取

  return <div>{data?.name}</div>;
}

// id 变化时，组件重新挂载，重新获取数据
<DataFetcher key={id} id={id} />
```

**4. 切换表单模式（编辑/新建）：**

```javascript
function Form({ mode, initialData }) {
  const [data, setData] = useState(initialData);

  // ...
}

function App() {
  const [mode, setMode] = useState('create');
  const [editId, setEditId] = useState(null);

  return (
    <Form
      // mode 或 editId 变化时重置表单
      key={mode === 'edit' ? editId : 'create'}
      mode={mode}
      initialData={mode === 'edit' ? fetchItem(editId) : {}}
    />
  );
}
```

**5. 解决受控/非受控组件问题：**

```javascript
// 问题：defaultValue 只在首次渲染时生效
function EditableField({ defaultValue }) {
  return <input defaultValue={defaultValue} />;
  // defaultValue 变化不会更新 input
}

// 解决：使用 key 强制重新挂载
<EditableField key={defaultValue} defaultValue={defaultValue} />
```

**6. 列表项的独立状态：**

```javascript
function TodoItem({ todo }) {
  const [isEditing, setIsEditing] = useState(false);
  // 每个 todo 有独立的编辑状态
}

function TodoList({ todos }) {
  return todos.map(todo => (
    // 使用 id 作为 key，确保状态跟随正确的 todo
    <TodoItem key={todo.id} todo={todo} />
  ));
}
```

**🔍 追问：使用 key 重置状态有什么注意事项？**

```javascript
// ⚠️ 性能影响：key 变化会卸载并重新挂载组件
// 包括所有子组件和 DOM 节点

// ❌ 不要滥用
<HeavyComponent key={Date.now()} /> // 每次渲染都重新挂载

// ✅ 只在确实需要重置时使用
<Form key={mode === 'edit' ? editId : 'new'} />

// ✅ 复杂组件考虑手动重置而非 key
function ComplexForm({ userId }) {
  const reset = useCallback(() => {
    setName('');
    setEmail('');
    // ...
  }, []);

  useEffect(() => {
    reset();
  }, [userId]);
}
```

---

### 28. React 的 children 有哪些处理方法？React.Children API 是什么？

**标准答案：**

**children 的类型：**

```javascript
// children 可能是：
// - undefined（无子元素）
// - 单个 React 元素
// - 数组
// - 字符串/数字
// - null/boolean

function Container({ children }) {
  console.log(typeof children);
  console.log(React.Children.count(children));
}

<Container />                    // undefined, 0
<Container>text</Container>      // string, 1
<Container>{42}</Container>      // number, 1
<Container><div /></Container>   // object, 1
<Container><A /><B /></Container> // object (array), 2
```

**React.Children API：**

```javascript
import { Children, cloneElement } from 'react';

function RadioGroup({ children, value, onChange }) {
  return (
    <div>
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;

        return cloneElement(child, {
          checked: child.props.value === value,
          onChange: () => onChange(child.props.value)
        });
      })}
    </div>
  );
}

// 使用
<RadioGroup value={selected} onChange={setSelected}>
  <Radio value="a">Option A</Radio>
  <Radio value="b">Option B</Radio>
  <Radio value="c">Option C</Radio>
</RadioGroup>
```

**常用方法：**

```javascript
// 1. Children.map - 遍历并转换
Children.map(children, (child, index) => {
  return <div key={index}>{child}</div>;
});

// 2. Children.forEach - 只遍历，不返回
Children.forEach(children, (child, index) => {
  console.log(child);
});

// 3. Children.count - 计数
const count = Children.count(children);

// 4. Children.only - 验证只有一个子元素
const only = Children.only(children); // 多个会报错

// 5. Children.toArray - 转为扁平数组
const arr = Children.toArray(children);
// 会展平嵌套数组，添加稳定的 key

// 6. cloneElement - 克隆并添加/覆盖 props
cloneElement(child, { className: 'modified' });
```

**实际应用场景：**

```javascript
// 1. Tabs 组件
function Tabs({ children, activeIndex, onChange }) {
  return (
    <div>
      <div className="tab-headers">
        {Children.map(children, (child, index) => (
          <button
            className={index === activeIndex ? 'active' : ''}
            onClick={() => onChange(index)}
          >
            {child.props.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {Children.toArray(children)[activeIndex]}
      </div>
    </div>
  );
}

// 2. 表单布局
function FormLayout({ children }) {
  return (
    <form>
      {Children.map(children, child => (
        <div className="form-row">
          {cloneElement(child, { className: 'form-input' })}
        </div>
      ))}
    </form>
  );
}

// 3. 过滤特定类型的子元素
function Menu({ children }) {
  const menuItems = Children.toArray(children).filter(
    child => isValidElement(child) && child.type === MenuItem
  );

  return <ul>{menuItems}</ul>;
}
```

**🔍 追问：为什么推荐使用 Render Props 或 Compound Components 替代 Children.map？**

```javascript
// Children.map 的问题：
// 1. 子元素结构改变会破坏功能
<RadioGroup>
  <div> {/* 包装层破坏了 cloneElement */}
    <Radio value="a" />
  </div>
</RadioGroup>

// 2. TypeScript 支持差

// ✅ 更好的方案：Compound Components + Context
const RadioContext = createContext(null);

function RadioGroup({ children, value, onChange }) {
  return (
    <RadioContext.Provider value={{ value, onChange }}>
      {children}
    </RadioContext.Provider>
  );
}

function Radio({ value, children }) {
  const context = useContext(RadioContext);
  return (
    <label>
      <input
        type="radio"
        checked={context.value === value}
        onChange={() => context.onChange(value)}
      />
      {children}
    </label>
  );
}

// 现在可以自由嵌套
<RadioGroup value={selected} onChange={setSelected}>
  <div>
    <Radio value="a">Option A</Radio>
  </div>
  <Radio value="b">Option B</Radio>
</RadioGroup>
```

---

### 29. React 的性能优化有哪些常见误区？

**标准答案：**

**误区 1：过度使用 memo**

```javascript
// ❌ 误区：给所有组件加 memo
const Button = memo(({ onClick, children }) => (
  <button onClick={onClick}>{children}</button>
));

// 问题：
// 1. memo 本身有比较开销
// 2. 如果 props 总是变化，memo 反而更慢
// 3. 简单组件渲染成本可能低于 memo 比较成本

// ✅ 正确做法：只在确实需要时使用
// - 组件渲染开销大
// - 组件经常重新渲染但 props 很少变化
// - 父组件频繁更新但子组件无关
```

**误区 2：useCallback/useMemo 用于所有函数和值**

```javascript
// ❌ 误区：包装所有函数
function Component() {
  // 不必要的 useCallback
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  // 不必要的 useMemo
  const config = useMemo(() => ({ size: 'large' }), []);

  return <button onClick={handleClick}>Click</button>;
}

// 问题：
// 1. 如果没有传给 memo 组件，useCallback 没有意义
// 2. 简单计算比 useMemo 开销小
// 3. 增加了代码复杂度

// ✅ 正确做法
function Component() {
  // 普通函数即可
  const handleClick = () => console.log('clicked');

  return <button onClick={handleClick}>Click</button>;
}

// 只在需要时使用
const MemoChild = memo(({ onClick }) => <button onClick={onClick} />);

function Parent() {
  // 传给 memo 组件时才需要 useCallback
  const handleClick = useCallback(() => {}, []);
  return <MemoChild onClick={handleClick} />;
}
```

**误区 3：认为 useMemo 能阻止子组件渲染**

```javascript
// ❌ 误区
function Parent() {
  const [count, setCount] = useState(0);

  // useMemo 返回的对象引用稳定
  const data = useMemo(() => ({ value: 'fixed' }), []);

  // 但 Parent 重新渲染时，Child 仍然会渲染！
  return <Child data={data} />;
}

// useMemo 只是保持引用稳定
// 要阻止 Child 渲染，Child 需要是 memo 组件

// ✅ 正确做法
const Child = memo(({ data }) => <div>{data.value}</div>);

function Parent() {
  const data = useMemo(() => ({ value: 'fixed' }), []);
  return <Child data={data} />; // 现在 Child 不会重新渲染
}
```

**误区 4：在渲染中创建新组件**

```javascript
// ❌ 误区：在组件内定义组件
function Parent() {
  // 每次渲染都创建新的组件定义！
  const Child = () => <div>Child</div>;

  return <Child />; // 每次都是新组件，状态丢失
}

// ✅ 正确做法：组件定义移到外部
const Child = () => <div>Child</div>;

function Parent() {
  return <Child />;
}
```

**误区 5：错误的依赖数组**

```javascript
// ❌ 误区：为了避免重新创建函数而省略依赖
function Search({ query }) {
  const fetchResults = useCallback(() => {
    fetch(`/api?q=${query}`);
  }, []); // 缺少 query 依赖！

  // query 变化时仍然用旧的 query
}

// ✅ 正确做法：要么添加依赖，要么使用 ref
function Search({ query }) {
  const queryRef = useRef(query);
  queryRef.current = query;

  const fetchResults = useCallback(() => {
    fetch(`/api?q=${queryRef.current}`);
  }, []); // 现在可以用空依赖
}
```

**误区 6：过早优化**

```javascript
// ❌ 误区：没有性能问题就开始优化
function App() {
  // 到处使用 memo, useCallback, useMemo
  // 代码复杂度大幅增加
  // 实际并没有性能问题
}

// ✅ 正确做法：先测量，后优化
// 1. 使用 React DevTools Profiler 找到瓶颈
// 2. 只优化真正需要的地方
// 3. 优化后再次测量确认效果
```

**🔍 追问：如何正确判断是否需要优化？**

```javascript
// 使用 Profiler 测量
<Profiler id="Component" onRender={(id, phase, actualDuration) => {
  if (actualDuration > 16) { // 超过一帧
    console.log(`${id} 渲染慢: ${actualDuration}ms`);
  }
}}>
  <Component />
</Profiler>

// 或者使用 why-did-you-render 库
// 在开发环境自动检测不必要的重渲染
```

---

### 30. React 19 有哪些新特性？

**标准答案：**

**1. Actions - 简化异步操作：**

```javascript
// 之前：手动处理 pending/error 状态
function Form() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setIsPending(true);
    setError(null);
    try {
      await submitForm();
    } catch (e) {
      setError(e);
    } finally {
      setIsPending(false);
    }
  };
}

// React 19：使用 useTransition 自动处理
function Form() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  const handleSubmit = () => {
    startTransition(async () => {
      const error = await submitForm();
      if (error) setError(error);
    });
  };

  return (
    <form action={handleSubmit}>
      <button disabled={isPending}>Submit</button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

**2. useActionState - 表单状态管理：**

```javascript
import { useActionState } from 'react';

function Form() {
  const [state, formAction, isPending] = useActionState(
    async (previousState, formData) => {
      const error = await submitForm(formData);
      if (error) return { error };
      return { success: true };
    },
    { error: null }
  );

  return (
    <form action={formAction}>
      <input name="email" />
      <button disabled={isPending}>Submit</button>
      {state.error && <p>{state.error}</p>}
    </form>
  );
}
```

**3. useFormStatus - 获取父表单状态：**

```javascript
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();

  return (
    <button disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  );
}

function Form() {
  return (
    <form action={submitAction}>
      <input name="email" />
      <SubmitButton /> {/* 自动获取表单状态 */}
    </form>
  );
}
```

**4. useOptimistic - 乐观更新：**

```javascript
import { useOptimistic } from 'react';

function Messages({ messages, sendMessage }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage) => [...state, { ...newMessage, sending: true }]
  );

  const handleSend = async (text) => {
    addOptimisticMessage({ text, id: Date.now() });
    await sendMessage(text);
  };

  return (
    <ul>
      {optimisticMessages.map(msg => (
        <li key={msg.id} style={{ opacity: msg.sending ? 0.5 : 1 }}>
          {msg.text}
        </li>
      ))}
    </ul>
  );
}
```

**5. use - 读取 Promise 和 Context：**

```javascript
import { use, Suspense } from 'react';

// 读取 Promise
function Comments({ commentsPromise }) {
  const comments = use(commentsPromise);
  return comments.map(c => <Comment key={c.id} {...c} />);
}

// 可以在条件中使用（与 useContext 不同）
function Theme({ show }) {
  if (show) {
    const theme = use(ThemeContext);
    return <div style={{ color: theme.color }}>...</div>;
  }
  return null;
}
```

**6. ref 作为 props（无需 forwardRef）：**

```javascript
// React 19：直接接收 ref
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}

// 不再需要 forwardRef
<Input ref={inputRef} />
```

**7. 改进的 Suspense 和错误处理：**

```javascript
// 更好的错误边界集成
function App() {
  return (
    <ErrorBoundary fallback={<Error />}>
      <Suspense fallback={<Loading />}>
        <AsyncComponent />
      </Suspense>
    </ErrorBoundary>
  );
}

// Document Metadata 支持
function BlogPost({ post }) {
  return (
    <article>
      <title>{post.title}</title>
      <meta name="description" content={post.excerpt} />
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

**🔍 追问：如何平滑升级到 React 19？**

```javascript
// 1. 先升级到 React 18.3（包含废弃警告）
// 2. 修复所有废弃 API 的使用
// 3. 升级到 React 19

// 主要变化：
// - forwardRef 可选（但仍支持）
// - 字符串 ref 被移除
// - defaultProps 只用于类组件
// - 函数组件不再接收第二个 context 参数
// - 移除了一些旧的 API（如 createFactory）
```
