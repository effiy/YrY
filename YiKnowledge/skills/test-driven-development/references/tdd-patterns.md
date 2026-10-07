---
title: 各语言/框架 TDD 模式速查
updated: 2026-09-23
tags: [skill, reference, tdd, patterns]
type: reference
status: stable
---

# TDD 模式速查

## Vitest + Vue（YiVad）

### Composable 测试

```typescript
import { useCounter } from '@/composables/useCounter'

describe('useCounter', () => {
  it('starts at 0', () => {
    const { count } = useCounter()
    expect(count.value).toBe(0)
  })

  it('increments by 1', () => {
    const { count, increment } = useCounter()
    increment()
    expect(count.value).toBe(1)
  })

  it('does not go below 0', () => {
    const { count, decrement } = useCounter()
    decrement()
    expect(count.value).toBe(0)  // min=0 约束
  })
})
```

### 组件测试

```typescript
import { mount } from '@vue/test-utils'
import ThemeToggle from '@/components/ThemeToggle.vue'

describe('ThemeToggle', () => {
  it('renders current theme label', () => {
    const wrapper = mount(ThemeToggle, {
      props: { theme: 'light' }
    })
    expect(wrapper.text()).toContain('浅色')
  })

  it('emits toggle on click', async () => {
    const wrapper = mount(ThemeToggle, {
      props: { theme: 'light' }
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('toggle')).toBeTruthy()
  })
})
```

### Pinia Store 测试

```typescript
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from '@/stores/theme'

describe('themeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('defaults to system theme', () => {
    const store = useThemeStore()
    expect(store.mode).toBe('system')
  })
})
```

## pytest + httpx（YiAi）

### RPC 端点测试

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_rpc_success():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/", json={
            "module_name": "services.data.data_service",
            "method_name": "query_documents",
            "parameters": {"cname": "test", "filter": {}, "pageSize": 10}
        })
    assert response.status_code == 200
    assert response.json()["code"] == 0

@pytest.mark.asyncio
async def test_rpc_missing_required_param():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/", json={
            "module_name": "services.data.data_service",
            "method_name": "query_documents",
            "parameters": {}  # 缺 cname
        })
    assert response.json()["code"] == 1001

@pytest.mark.asyncio
async def test_rpc_invalid_param_name():
    """使用错误的参数名 query 而非 filter"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/", json={
            "module_name": "services.data.data_service",
            "method_name": "query_documents",
            "parameters": {"cname": "test", "query": {"status": "active"}}
        })
    # 应返回参数校验警告
    assert response.json()["code"] in (0, 1001)
```

### Service 层测试

```python
import pytest
from unittest.mock import AsyncMock

@pytest.mark.asyncio
async def test_query_with_filter():
    mock_repo = AsyncMock()
    mock_repo.find.return_value = [{"name": "test", "status": "active"}]
    
    service = DataService(mock_repo)
    result = await service.query_documents({
        "cname": "test",
        "filter": {"status": "active"}
    })
    
    assert len(result["items"]) == 1
    mock_repo.find.assert_called_once()

@pytest.mark.asyncio
async def test_query_empty_result():
    mock_repo = AsyncMock()
    mock_repo.find.return_value = []
    
    service = DataService(mock_repo)
    result = await service.query_documents({
        "cname": "test",
        "filter": {"status": "nonexistent"}
    })
    
    assert result["items"] == []
    assert result["total"] == 0
```

## Chrome Extension 测试（YiPet）

### API Client 测试

```typescript
import { ApiClient } from '@/api/client'

describe('ApiClient', () => {
  it('sends RPC envelope with correct shape', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ code: 0, data: {} })
    })

    const client = new ApiClient('http://localhost:10086')
    await client.call('services.data.data_service', 'query_documents', {
      cname: 'test',
      filter: {}
    })

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:10086/',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"module_name"')
      })
    )
  })
})
```

### chrome.storage Mock

```typescript
const mockStorage = new Map()

global.chrome = {
  storage: {
    local: {
      get: (keys, cb) => {
        const result = {}
        for (const key of keys) {
          result[key] = mockStorage.get(key)
        }
        cb(result)
      },
      set: (items, cb) => {
        for (const [key, value] of Object.entries(items)) {
          mockStorage.set(key, value)
        }
        cb?.()
      }
    }
  }
} as any
```

## 常用断言速查

### Vitest

```typescript
expect(value).toBe(expected)           // 严格相等
expect(value).toEqual(expected)        // 深度相等
expect(array).toContain(item)          // 包含元素
expect(fn).toHaveBeenCalled()          // 被调用过
expect(fn).toHaveBeenCalledWith(args)  // 以特定参数调用
expect(promise).rejects.toThrow()      // 异步抛出异常
expect(element).toBeTruthy()           // 存在
expect(element).toBeNull()             // null
```

### pytest

```python
assert value == expected
assert value is None
assert value is not None
assert "substring" in string
assert len(list) == expected
with pytest.raises(ValueError):
    function_that_raises()
```