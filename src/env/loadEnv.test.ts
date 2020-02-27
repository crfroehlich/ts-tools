/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import 'mocha';
import { loadEnv } from './loadEnv';

describe('Process Environment Variables', () => {
  it('loads the .env with defaults', () => {
    const env = loadEnv();
    expect(env.NODE_ENV).to.not.be.null;
  });

  it('loads the .env with custom config', () => {
    const env = loadEnv({ overrideProcessEnv: true });
    expect(env.NODE_ENV).to.not.be.null;
  });
});
