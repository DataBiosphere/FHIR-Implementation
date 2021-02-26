const observationCodeMappings = [
  {
    regex: /Radiation Therapy/,
    codes: [
      {
        system: 'http://loinc.org/',
        code: '21880-0',
        display: 'Radiation treatment therapy Cancer',
      },
    ],
  },
  {
    regex: /Pharmaceutical Therapy, NOS/,
    text: 'Pharmaceutical Therapy, NOS',
  },
];

const tcgaFieldMappings = {
  RESEARCHSTUDY: { title: 'proj__name' },
  PATIENT: { gender: 'demo__gender' },
};

module.exports = { observationCodeMappings, tcgaFieldMappings };
