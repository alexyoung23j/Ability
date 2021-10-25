import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';

chai.use(dirtyChai);

describe('hello', () => {
  it('can do stuff', () => {
    expect(true).true();
  });
});
