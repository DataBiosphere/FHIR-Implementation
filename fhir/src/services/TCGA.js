const axios = require('axios');
const memoizee = require('memoizee');
const { resolveSchema } = require('@asymmetrik/node-fhir-server-core');

const DiagnosticReport = resolveSchema('4_0_0', 'DiagnosticReport');
const Observation = resolveSchema('4_0_0', 'Observation');

const { TCGA_URL } = process.env;

/**
 * Convert a single TCGA Result to a DiagnosticResource
 *
 * @param {object} tcgaResult
 */
const translateSingleGdcResultsToFhir = (tcgaResult) => {
  const diagnosticReport = new DiagnosticReport({
    resourceType: 'DiagnosticReport',
    id: tcgaResult.case_id,
    meta: {
      versionId: tcgaResult.case_id,
      source: tcgaResult.proj__project_id,
      profile: 'https://www.hl7.org/fhir/diagnosticreport-genetics.html',
    },
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
            code: 'GE',
            display: 'Genetics',
          },
        ],
      },
    ],
    subject: {
      reference: `Patient/${tcgaResult.demo__demographic_id}`,
    },
    result: tcgaResult.diagnoses.map((diagnosis) => {
      return {
        reference: `Observation/${diagnosis.diag__diagnosis_id}`,
        display: diagnosis.diag__treat__treatment_type,
      };
    }),

    issued: tcgaResult.updated_datetime,
    effectiveDatetime: tcgaResult.updated_datetime,
  });

  const observations = tcgaResult.diagnoses.map((diagnosis) => {
    return new Observation({
      resourceType: 'Observation',
      id: diagnosis.diag__diagnosis_id,
      text: {
        status: 'generated',
        div: `<div xmlns="http://www.w3.org/1999/xhtml">${diagnosis.diag__treat__treatment_type}</div>`,
      },
      meta: {
        versionId: diagnosis.diag__diagnosis_id,
        source: tcgaResult.proj__project_id,
        profile: ['https://www.hl7.org/fhir/observation.html'],
      },
      issued: tcgaResult.diag__treat__updated_datetime,
      effectiveDateTime: tcgaResult.diag__treat__updated_datetime,
      status: 'final',
    });
  });

  return { diagnosticReport, observations };
};

/**
 * Convert a list of TCGA Results to DiagnosticReports
 *
 * @param {array} tcgaResults
 */
const translateGdcResultsToFhir = (tcgaResults) => {
  return tcgaResults.map(translateSingleGdcResultsToFhir);
};

const get = memoizee(axios.get, { maxAge: 10000, length: false });

class TCGA {
  async getAllDiagnosticReports({ page, pageSize } = {}) {
    const { data } = await get(`${TCGA_URL}/api/gdc`, { params: { page, pageSize } });
    const { results, count } = data;
    return [translateGdcResultsToFhir(results), count];
  }

  async getDiagnosticReportById(id) {
    const { data } = await get(`${TCGA_URL}/api/gdc/${id}`);
    return translateSingleGdcResultsToFhir(data);
  }

  async getAllDiagnoses({ page, pageSize } = {}) {
    const { data } = await get(`${TCGA_URL}/api/diagnosis`, { params: { page, pageSize } });
    const { results, count } = data;
    return [results, count];
  }

  async getDiagnosisById(id) {
    const { data } = await get(`${TCGA_URL}/api/diagnosis/${id}`);
    return data;
  }
}

module.exports = TCGA;
