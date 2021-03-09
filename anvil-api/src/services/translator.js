const { resolveSchema } = require('@asymmetrik/node-fhir-server-core');

const {
  buildIdentifier,
  buildCodeableConcept,
  buildCoding,
  buildReference,
  findDiseaseCodes,
  findDiseaseDisplay,
  buildSlug,
  buildSortArray,
  buildSortObject,
  translateSortObj,
} = require('../utils');

const Observation = resolveSchema('4_0_0', 'Observation');
// const DiagnosticReport = resolveSchema('4_0_0', 'DiagnosticReport');
// const Specimen = resolveSchema('4_0_0', 'Specimen');
const ResearchStudy = resolveSchema('4_0_0', 'ResearchStudy');
const Patient = resolveSchema('4_0_0', 'Patient');

const buildSubjectId = (workspace, id) => {
  return `${workspace}-Su-${id}`;
};

const buildSampleId = (workspace, id) => {
  return `${workspace}-Sa-${id}`;
};

class Translator {
  toObservation(subject) {
    const slug = buildSlug('Observation', subject.id, subject.diseaseId);

    const observation = new Observation({
      id: buildSubjectId(subject.workspaceName, subject.name),
      identifier: buildIdentifier('urn:temp:unique-string', slug),
      meta: {
        profile: ['https://www.hl7.org/fhir/observation.html'],
      },
      status: 'final',
      subject: {
        reference: `Patient/${subject.workspaceName}-Su-${subject.name}`,
      },
      Specimen: {
        reference: `Specimen/${subject.workspaceName}-Sa-${subject.name}`,
      },
      // WARN: hard coded
      valueCodeableConcept: buildCodeableConcept(
        [
          buildCoding(
            '373573001',
            'http://snomed.info/sct',
            'Clinical finding present (situation)'
          ),
        ],
        'Phenotype Present'
      ),
      // WARN: hard coded
      interpretation: [
        buildCodeableConcept(
          [
            buildCoding(
              'POS',
              'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
              'Positive'
            ),
          ],
          'Present'
        ),
      ],
    });

    const diseaseCoding = findDiseaseCodes(subject.diseaseId);
    if (diseaseCoding) {
      observation.code = buildCodeableConcept(
        [diseaseCoding],
        findDiseaseDisplay(subject.diseaseId)
      );
    }

    // TODO: look into subject.age
    return observation;
  }

  toObservationSortParams(sortFields) {
    return translateSortObj(sortFields, (sortObj, existsObj, key) => {
      switch (key) {
        case 'id':
          sortObj['workspaceName'] = sortObj[key];
          sortObj['name'] = sortObj[key];
          delete sortObj[key];
          break;
      }
    });
  }

  toResearchStudy(workspace) {
    const researchStudy = new ResearchStudy({
      id: workspace.name,
      identifier: buildIdentifier(
        'https://anvil.terra.bio/#workspaces/anvil-datastorage/',
        workspace.name
      ),
      meta: {
        profile: ['https://www.hl7.org/fhir/researchstudy.html'],
      },
      title: workspace.datasetName,
      status: 'completed',
      category: [
        {
          coding: [buildCoding('GE', 'http://terminology.hl7.org/CodeSystem/v2-0074', 'Genetics')],
        },
      ],
    });

    // if study has institute
    if (workspace.institute) {
      let institute = workspace.institute;

      // if it is an array, we extract it
      if (Array.isArray(institute)) {
        institute = institute[0];
      }

      researchStudy.sponsor = buildReference(
        `Organization/${institute}`,
        'Organization',
        institute
      );
    }

    // if study has a PI
    if (workspace.studyPi) {
      researchStudy.principalInvestigator = buildReference(
        `Practitioner/${workspace.studyPi}`,
        'Practitioner',
        workspace.studyPi
      );
    }

    return researchStudy;
  }

  toResearchStudySortParams(sortFields) {
    return translateSortObj(sortFields, (sortObj, existsObj, key) => {
      switch (key) {
        case 'title':
          sortObj['datasetName'] = sortObj[key];
          existsObj['datasetName'] = existsObj[key];
          delete sortObj[key];
          delete existsObj[key];
          break;
      }
    });
  }

  toPatient(subject) {
    const id = buildSubjectId(subject.workspaceName, subject.name);
    const slug = buildSlug('Patient', id);

    const patient = new Patient({
      id: id,
      identifier: buildIdentifier('urn:temp:unique-string', slug),
      meta: {
        profile: ['https://www.hl7.org/fhir/patient.html'],
      },
    });

    // translate AnVIL's gender system to fit FHIR
    const GENDER_SYSTEM = 'http://hl7.org/fhir/administrative-gender';
    if (subject.sex) {
      let gender = subject.sex.toLowerCase();

      switch (gender) {
        case 'male':
          gender = buildCoding('male', GENDER_SYSTEM, 'Male');
          break;
        case 'female':
          gender = buildCoding('female', GENDER_SYSTEM, 'Female');
          break;
        default:
          gender = buildCoding('unknown', GENDER_SYSTEM, 'Unknown');
      }

      patient.gender = gender;
    } else {
      patient.gender = buildCoding('unknown', GENDER_SYSTEM, 'Unknown');
    }

    // TODO: we can probably put ethnicity info in here too if we want
    return patient;
  }

  toPatientSortParams(sortFields) {
    return translateSortObj(sortFields, (sortObj, existsObj, key) => {
      switch (key) {
        case 'id':
          sortObj['workspaceName'] = sortObj[key];
          sortObj['name'] = sortObj[key];
          delete sortObj[key];
          break;
      }
    });
  }
}

module.exports = Translator;