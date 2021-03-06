const logger = require('../logger');
const service = require('./service');
const { getSearchParameters } = require('../utils/searching');

const getAllResearchStudies = async (req, res) => {
  logger.info('ANVIL >>> getAllResearchStudies');
  const { _id, _page, _count, _sort, _offset } = req.query;
  const searchFields = getSearchParameters(req.query);
  try {
    const [results, count] = await service.getAllResearchStudies({ _id, _page, _count, _sort, _offset, _search: searchFields });
    res.json({
      results,
      count,
    });
  } catch (e) {
    logger.info('ANVIL >>> ' + e);
    res.sendStatus(500);
  }
};
const getResearchStudyById = async (req, res) => {
  logger.info('ANVIL >>> getResearchStudyById');
  const { id } = req.params;
  try {
    const results = await service.getResearchStudyById(id);
    if (!results) {
      res.sendStatus(404);
    } else {
      res.json(results);
    }
  } catch (e) {
    logger.info('ANVIL >>> ' + e);
    res.sendStatus(500);
  }
};

const getAllSamples = async (req, res) => {
  logger.info('ANVIL >>> getAllSamples');

  const { _id, _page, _count } = req.query;
  const searchFields = getSearchParameters(req.query);

  try {
    const [results, count] = await service.getAllSamples({ _id, _page, _count, _search: searchFields });
    res.json({
      results,
      count,
    });
  } catch (e) {
    logger.info('ANVIL >>> ' + e);
    res.sendStatus(500);
  }
};
const getSampleById = async (req, res) => {
  logger.info('ANVIL >>> getSampleById');
  const { workspace, id } = req.params;
  try {
    const results = await service.getSampleById({ workspace, id });
    if (!results) {
      res.sendStatus(404);
    } else {
      res.json(results);
    }
  } catch (e) {
    logger.info('ANVIL >>> ' + e);
    res.sendStatus(500);
  }
};

const getAllPatients = async (req, res) => {
  logger.info('ANVIL >>> getAllPatients');

  const { _id, _page, _count, _sort, _offset } = req.query;
  const searchFields = getSearchParameters(req.query);

  try {
    const [results, count] = await service.getAllPatients({
      _id,
      _page,
      _count,
      _sort,
      _offset,
      _search: searchFields
    });
    res.json({
      results,
      count,
    });
  } catch (e) {
    logger.info('ANVIL >>> ' + e);
    res.sendStatus(500);
  }
};
const getPatientById = async (req, res) => {
  logger.info('ANVIL >>> getPatientById');
  const { id } = req.params;
  try {
    const results = await service.getPatientById({ id });
    if (!results) {
      res.sendStatus(404);
    } else {
      res.json(results);
    }
  } catch (e) {
    logger.info('ANVIL >>> ' + e);
    res.sendStatus(500);
  }
};

const getAllObservations = async (req, res) => {
  logger.info('ANVIL >>> getAllObservations');

  const { _id, _page, _count, _sort, _offset } = req.query;
  const searchFields = getSearchParameters(req.query);

  try {
    const [results, count] = await service.getAllObservations({
      _id,
      _page,
      _count,
      _sort,
      _offset,
      _search: searchFields
    });
    res.json({
      results,
      count,
    });
  } catch (e) {
    logger.info('ANVIL >>> ' + e);
    res.sendStatus(500);
  }
};
const getObservationById = async (req, res) => {
  logger.info('ANVIL >>> getObservationById');
  const { id } = req.params;
  try {
    const results = await service.getObservationById({ id });
    if (!results) {
      res.sendStatus(404);
    } else {
      res.json(results);
    }
  } catch (e) {
    logger.info('ANVIL >>> ' + e);
    res.sendStatus(500);
  }
};

module.exports = {
  getAllResearchStudies,
  getResearchStudyById,
  getAllSamples,
  getSampleById,
  getAllPatients,
  getPatientById,
  getAllObservations,
  getObservationById,
};
