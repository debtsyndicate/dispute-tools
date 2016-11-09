/* globals CONFIG, DisputeTool, User, Account, Collective */

const sa = require('superagent');
const expect = require('chai').expect;
const path = require('path');

const truncate = require(path.join(process.cwd(), 'tests', 'utils', 'truncate'));

const agent = sa.agent();
const url = CONFIG.env().siteURL;
const urls = CONFIG.router.helpers;

describe('DisputeToolsController', () => {
  let user;
  let _csrf;

  before(function before() {
    this.timeout(5000);

    user = new User({
      email: 'user@example.com',
      password: '12345678',
      role: 'User',
    });

    const account = new Account({
      fullname: 'Example Account Name',
      bio: '',
      state: 'Texas',
      zip: '73301',
    });

    return Collective.first().then((res) => {
      return User.transaction((trx) => {
        return user.transacting(trx).save()
          .then(() => {
            return user.transacting(trx).activate().save();
          })
          .then(() => {
            account.userId = user.id;
            account.collectiveId = res.id;
            return account.transacting(trx).save();
          });
      });
    });
  });

  after(() => {
    truncate([User, Account]);
  });

  it('Should render the index view', (done) => {
    agent.get(`${url}${urls.DisputeTools.url()}`)
      .set('Accept', 'text/html')
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('Should redirect to login when accessing a tool if not logged in', (done) => {
    DisputeTool.first()
      .then((tool) => {
        agent.get(`${url}${urls.DisputeTools.show.url(tool.id)}`)
          .set('Accept', 'text/html')
          .end((err, res) => {
            _csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);

            expect(res.status).to.equal(200);
            expect(res.redirects.length).to.be.equal(1);
            expect(res.redirects[0]).to.have.string('/login');
            done();
          });
      });
  });

  it('Should render the show view when logged in', (done) => {
    agent.post(`${url}${urls.login.url()}`)
      .set('Accept', 'text/html')
      .send({
        email: user.email,
        password: '12345678',
        _csrf,
      })
      .end(() => {
        DisputeTool.first()
          .then((tool) => {
            agent.get(`${url}${urls.DisputeTools.show.url(tool.id)}`)
              .set('Accept', 'text/html')
              .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.redirects.length).to.be.equal(0);
                expect(res.req.path).to.be.equal(urls.DisputeTools.show.url(tool.id));
                done();
              });
          });
      });
  });
});