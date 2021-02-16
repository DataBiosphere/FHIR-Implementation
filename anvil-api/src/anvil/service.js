const e = require('express');
const { AnvilMongo } = require('../services');

const WorkspaceService = new AnvilMongo({ collectionName: 'workspace' });
const SampleService = new AnvilMongo({ collectionName: 'sample' });
const SubjectService = new AnvilMongo({ collectionName: 'subject' });

/**
 * getAll Workspace data by page and pageSize
 *
 * @param {string} page
 * @param {string} pageSize
 */
const getAllWorkspaces = async ({ page = 1, pageSize = 25 }) => {
  const [results, count] = await WorkspaceService.find({
    page: page,
    pageSize: pageSize,
    query: {},
    projection: {},
  });

  return [results, count];
};

const getWorkspaceById = async (id) => {
  const result = await WorkspaceService.findOne({
    query: { name: id },
  });

  if (result) {
    return result;
  }
  return null;
};

const getAllSamples = async ({ workspace = '', page = 1, pageSize = 25 }) => {
  let [results, count] = await SampleService.find({
    page: page,
    pageSize: pageSize,
    query: { id: { $regex: workspace } },
    projection: {},
  });

  // TODO: remember to add some form of pagination in FHIR
  //        currently, if workspace is included
  //        it will only return 25 results

  return [results, count];
};

const getSampleById = async (id) => {
  const result = await SampleService.findOne({
    query: { id: id },
  });

  if (result) {
    return result;
  }
  return null;
};

const getAllSubjects = async ({ workspace = '', page = 1, pageSize = 25 }) => {
  let [results, count] = await SubjectService.find({
    page: page,
    pageSize: pageSize,
    query: { id: { $regex: workspace } },
    projection: {},
  });

  // TODO: remember to add some form of pagination in FHIR
  //        currently, if workspace is included
  //        it will only return 25 results

  return [results, count];
};

const getSubjectById = async (id) => {
  const result = await SubjectService.findOne({
    query: { id: id },
  });

  if (result) {
    return result;
  }
  return null;
};

module.exports = {
  getAllWorkspaces,
  getWorkspaceById,
  getAllSamples,
  getSampleById,
  getAllSubjects,
  getSubjectById,
};