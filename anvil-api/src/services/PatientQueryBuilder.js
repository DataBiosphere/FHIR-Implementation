const {
  prefixModifiers,
  stringModifiers,
  tokenModifiers,
  uriModifiers
} = require('../utils/searching');
const QueryBuilder = require('./QueryBuilder');

const { AnvilMongo } = require('.');

class PatientQueryBuilder extends QueryBuilder {
  constructor({
    fieldResolver = undefined,
    valueResolver = undefined
  } = {}) {
    super({
      fieldResolver,
      valueResolver
    });

    this.mongoService = new AnvilMongo({ collectionName: 'subject' });
  };

  idWhere(id) {
    return { id: id };
  }

  async findById(id) {
    return this.mongoService.findOne({ query: this.idWhere(id) });
  }

  async find({
    _id = '',
    _page = 1,
    _count = 20,
    _offset = 0,
    _sort = '',
    _search = {},
  }) {
    let myQuery = { };

    myQuery = this.query(_search);

    if (_id) {
      myQuery = this.idWhere(_id);
    }

    return this.mongoService.find({
      page: _page,
      size: _count,
      query: myQuery,
      projection: {},
      offset: _offset,
      sort: this.sortObject(_sort),
    });
  };
}

module.exports = PatientQueryBuilder
