const axios = require('axios');
const tcgaResponseFixture = require('../../../__fixtures__/tcgaResponse');
const TCGA = require('.');

jest.mock('axios');

describe('TCGA service tests', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  it('should get all TCGA DiagnosticReport data', async () => {
    axios.get.mockImplementation(() => ({ data: { count: 10, results: [tcgaResponseFixture] } }));

    const tcga = new TCGA();
    const [results, count] = await tcga.getAllDiagnosticReports({ page: 2, pageSize: 10 });

    expect(JSON.parse(JSON.stringify(results))).toEqual([
      {
        diagnosticReport: {
          category: [
            {
              coding: [
                {
                  code: 'GE',
                  display: 'Genetics',
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
                },
              ],
            },
          ],
          extension: [
            {
              url: 'https://build.fhir.org/extension-workflow-researchstudy.html',
              valueReference: {
                reference: 'ResearchStudy/TCGA',
                type: 'ResearchStudy',
              },
            },
          ],
          id: '291b069c-9dde-4e1e-8430-85146bc94338',
          issued: '2019-08-06T14:25:25.511101-05:00',
          meta: {
            profile: ['https://www.hl7.org/fhir/diagnosticreport-genetics.html'],
            source: 'TCGA-HNSC',
            versionId: '291b069c-9dde-4e1e-8430-85146bc94338',
          },
          resourceType: 'DiagnosticReport',
          result: [
            {
              display: 'Pharmaceutical Therapy, NOS',
              reference: 'Observation/e62a815e-6907-5bc7-acbc-932bc0a05b75',
            },
            {
              display: 'Radiation Therapy, NOS',
              reference: 'Observation/f46facb0-9a93-5077-a9b5-b8f907404520',
            },
          ],
          status: 'final',
          subject: {
            reference: 'Patient/2611cb61-6d05-5286-b94a-ce6cac2ba37b',
          },
        },

        observations: [
          {
            id: 'e62a815e-6907-5bc7-acbc-932bc0a05b75',
            meta: {
              profile: ['https://www.hl7.org/fhir/observation.html'],
              source: 'TCGA-HNSC',
              versionId: 'e62a815e-6907-5bc7-acbc-932bc0a05b75',
            },
            code: {
              text: 'Pharmaceutical Therapy, NOS',
            },
            resourceType: 'Observation',
            status: 'final',
            text: {
              div: '<div xmlns="http://www.w3.org/1999/xhtml">Pharmaceutical Therapy, NOS</div>',
              status: 'generated',
            },
          },
          {
            id: 'f46facb0-9a93-5077-a9b5-b8f907404520',
            meta: {
              profile: ['https://www.hl7.org/fhir/observation.html'],
              source: 'TCGA-HNSC',
              versionId: 'f46facb0-9a93-5077-a9b5-b8f907404520',
            },
            code: {
              coding: [
                {
                  code: '21880-0',
                  display: 'Radiation treatment therapy Cancer',
                  system: 'http://loinc.org/',
                },
              ],
              text: 'Radiation Therapy, NOS',
            },
            resourceType: 'Observation',
            status: 'final',
            text: {
              div: '<div xmlns="http://www.w3.org/1999/xhtml">Radiation Therapy, NOS</div>',
              status: 'generated',
            },
          },
        ],

        specimens: [
          {
            id: '591e99ec-46f9-442d-ac20-745dccc8a52b',
            resourceType: 'Specimen',
          },
          {
            id: '5e4e1e21-8016-4e27-8f72-2411714203e8',
            resourceType: 'Specimen',
          },
        ],
      },
    ]);
    expect(count).toEqual(10);
    expect(axios.get).toHaveBeenCalledWith('http://tcga/api/gdc', {
      params: { page: 2, pageSize: 10 },
    });
  });

  it('should get TCGA data by case ID', async () => {
    axios.get.mockImplementation(() => ({ data: tcgaResponseFixture }));

    const tcga = new TCGA();
    const results = await tcga.getDiagnosticReportById('foobar');

    expect(JSON.parse(JSON.stringify(results))).toEqual({
      diagnosticReport: {
        category: [
          {
            coding: [
              {
                code: 'GE',
                display: 'Genetics',
                system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
              },
            ],
          },
        ],
        id: '291b069c-9dde-4e1e-8430-85146bc94338',
        issued: '2019-08-06T14:25:25.511101-05:00',
        meta: {
          profile: ['https://www.hl7.org/fhir/diagnosticreport-genetics.html'],
          source: 'TCGA-HNSC',
          versionId: '291b069c-9dde-4e1e-8430-85146bc94338',
        },
        resourceType: 'DiagnosticReport',
        result: [
          {
            display: 'Pharmaceutical Therapy, NOS',
            reference: 'Observation/e62a815e-6907-5bc7-acbc-932bc0a05b75',
          },
          {
            display: 'Radiation Therapy, NOS',
            reference: 'Observation/f46facb0-9a93-5077-a9b5-b8f907404520',
          },
        ],
        status: 'final',
        subject: {
          reference: 'Patient/2611cb61-6d05-5286-b94a-ce6cac2ba37b',
        },
        extension: [
          {
            url: 'https://build.fhir.org/extension-workflow-researchstudy.html',
            valueReference: {
              reference: 'ResearchStudy/TCGA',
              type: 'ResearchStudy',
            },
          },
        ],
      },

      observations: [
        {
          id: 'e62a815e-6907-5bc7-acbc-932bc0a05b75',
          meta: {
            profile: ['https://www.hl7.org/fhir/observation.html'],
            source: 'TCGA-HNSC',
            versionId: 'e62a815e-6907-5bc7-acbc-932bc0a05b75',
          },
          code: {
            text: 'Pharmaceutical Therapy, NOS',
          },
          resourceType: 'Observation',
          status: 'final',
          text: {
            div: '<div xmlns="http://www.w3.org/1999/xhtml">Pharmaceutical Therapy, NOS</div>',
            status: 'generated',
          },
        },
        {
          id: 'f46facb0-9a93-5077-a9b5-b8f907404520',
          meta: {
            profile: ['https://www.hl7.org/fhir/observation.html'],
            source: 'TCGA-HNSC',
            versionId: 'f46facb0-9a93-5077-a9b5-b8f907404520',
          },
          code: {
            coding: [
              {
                code: '21880-0',
                display: 'Radiation treatment therapy Cancer',
                system: 'http://loinc.org/',
              },
            ],
            text: 'Radiation Therapy, NOS',
          },
          resourceType: 'Observation',
          status: 'final',
          text: {
            div: '<div xmlns="http://www.w3.org/1999/xhtml">Radiation Therapy, NOS</div>',
            status: 'generated',
          },
        },
      ],

      specimens: [
        {
          id: '591e99ec-46f9-442d-ac20-745dccc8a52b',
          resourceType: 'Specimen',
        },
        {
          id: '5e4e1e21-8016-4e27-8f72-2411714203e8',
          resourceType: 'Specimen',
        },
      ],
    });
    expect(axios.get).toHaveBeenCalledWith('http://tcga/api/gdc/foobar');
  });
});