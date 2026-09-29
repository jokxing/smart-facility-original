import axios from 'axios';
import {createMockAdapter, DEMO_BASE_URL} from '../../../src/mock/adapter';
import {createDemoStorage, STORAGE_PREFIX} from '../../../src/mock/storage';

describe('isolated demo transport', () => {
  test('normalizes query, form arrays and transformed JSON without HTTP', async () => {
    const handle = jest.fn(request => ({code: 1, items: request}));
    const client = axios.create({baseURL: DEMO_BASE_URL, adapter: createMockAdapter([
      {method: 'POST', path: '/example', handle}
    ])});
    const form = await client.post('/example?kind=device', 'ids=1&ids=2', {params: {pageNum: 2}});
    expect(form.data.items.body.ids).toEqual(['1', '2']);
    expect(form.data.items.params).toEqual({kind: 'device', pageNum: 2});
    const json = await client.post('/example', {ids: [1, 2]});
    expect(json.data.items.body.ids).toEqual([1, 2]);
  });

  test('rejects unknown endpoints and absolute URLs, never uses XHR', async () => {
    const open = jest.spyOn(XMLHttpRequest.prototype, 'open');
    const adapter = createMockAdapter([]);
    await expect(adapter({url: '/not-implemented'})).rejects.toMatchObject({code: 'MOCK_NOT_IMPLEMENTED'});
    await expect(adapter({url: 'https://example.invalid/api'})).rejects.toMatchObject({code: 'MOCK_EXTERNAL_BLOCKED'});
    await expect(adapter({url: '//example.invalid/api'})).rejects.toMatchObject({code: 'MOCK_EXTERNAL_BLOCKED'});
    await expect(adapter({url: '/example', baseURL: 'https://example.invalid'})).rejects.toMatchObject({code: 'MOCK_EXTERNAL_BLOCKED'});
    expect(open).not.toHaveBeenCalled();
    open.mockRestore();
  });

  test('supports multipart arrays and preserves Blob responses', async () => {
    const body = new FormData();
    body.append('ids', 'a');
    body.append('ids', 'b');
    const blob = new Blob(['demo-export'], {type: 'text/plain'});
    const handle = jest.fn(request => { expect(request.body.ids).toEqual(['a', 'b']); return blob; });
    const adapter = createMockAdapter([{method: 'POST', path: '/export', handle}]);
    const response = await adapter({url: '/export', method: 'post', data: body});
    expect(response.data).toBe(blob);
  });

  test('rejects malformed JSON instead of invoking a handler', async () => {
    const handle = jest.fn();
    const adapter = createMockAdapter([{method: 'POST', path: '/example', handle}]);
    await expect(adapter({url: '/example', method: 'post', data: '{broken'})).rejects.toMatchObject({code: 'MOCK_BAD_REQUEST'});
    expect(handle).not.toHaveBeenCalled();
  });

  test('demo logout clears its own keys without reading or deleting legacy login', () => {
    window.localStorage.clear();
    window.localStorage.setItem('token', 'unrelated-test-value');
    const storage = createDemoStorage(window.localStorage);
    expect(storage.getItem('token')).toBeNull();
    storage.setItem('token', 'demo-test-value');
    expect(window.localStorage.getItem(STORAGE_PREFIX + 'token')).toBe('demo-test-value');
    storage.clear();
    expect(storage.getItem('token')).toBeNull();
    expect(window.localStorage.getItem('token')).toBe('unrelated-test-value');
  });
});
