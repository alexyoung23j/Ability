import { expect } from 'chai';
import { DateTime } from 'luxon';

import { chooseYearForDateFilter } from '../QueryTransformUtil';

// TODO kedar: mock out svg imports to export null for mocha
describe('QueryTransformUtil', () => {
  describe('chooseYearForDateFilter', () => {
    it('can choose the right year', () => {
      const now = DateTime.now();
      const yesterday = now.minus({ days: 1 });
      const tomorrow = now.plus({ days: 1 });
      expect(chooseYearForDateFilter(now.day, now.month)).equal(now.year);
      expect(chooseYearForDateFilter(tomorrow.day, tomorrow.month)).equal(
        tomorrow.year
      );
      expect(chooseYearForDateFilter(yesterday.day, yesterday.month)).equal(
        now.plus({ years: 1 }).year
      );
    });
  });
});
