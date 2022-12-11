import { NumberLeadZeroPipe } from './number-lead-zero.pipe';

describe('NumberLeadZeroPipe', () => {
  it('create an instance', () => {
    const pipe = new NumberLeadZeroPipe();
    expect(pipe).toBeTruthy();
  });
});
