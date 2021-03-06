const { testGetPage } = require('../../utils');
const { expect } = require('chai');

describe('https', () => {
  before(() => {
    process.env.NODE_ENV = 'production';
  });

  after(() => {
    process.env.NODE_ENV = 'test';
  });

  it('should redirect when running in production mode', () => {
    const req = testGetPage('/');

    return req
      .redirects(0)
      .then(() => {
        // This shouldn't execute since we are blocking redirects
        expect.fail();
      })
      .catch(err => {
        expect(err.status).eq(302);
      });
  });

  it('should not redirect when going to the /health-check route', () => {
    const req = testGetPage('/health-check');

    return req
      .redirects(0)
      .then(res => {
        expect(res.status).eq(200);
      })
      .catch(() => {
        expect.fail();
      });
  });
});
