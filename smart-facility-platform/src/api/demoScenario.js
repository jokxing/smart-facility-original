import {get, post} from '@/utils/axios.js';

export const fetchDemoScenario = () => get('/demo/scenario');

export const updateDemoScenario = scenario =>
  post('/demo/scenario', {scenario}, {
    headers: {'content-type': 'application/json'}
  });
