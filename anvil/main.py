import os
import logging
import json

from dotenv import load_dotenv

from anvil.gen3.entities import Entities
from anvil.terra.reconciler import Reconciler
from anvil.terra.workspace import Workspace
from anvil.terra.sample import Sample
from anvil.transformers.fhir.transformer import FhirTransformer
from anvil.util.reconciler import DEFAULT_NAMESPACE

load_dotenv()

AVRO_PATH = os.getenv('AVRO_PATH', './export_2020-11-04T17_48_47.avron')
OUTPUT_DIR = os.getenv('OUTPUT_PATH', './data')

logging.basicConfig(level=logging.WARN,
                    format='%(asctime)s %(levelname)-8s %(message)s')

gen3_entities = Entities(AVRO_PATH)


TERRA_SUMMARY = f"{OUTPUT_DIR}/terra_summary.json"


def reconcile_all(user_project, consortiums, namespace=DEFAULT_NAMESPACE, output_path=OUTPUT_DIR):
    """Reconcile and aggregate results.

    e.g. bin/reconciler --user_project <your-billing-project>  --consortium CMG AnVIL_CMG.* --consortium CCDG AnVIL_CCDG.* --consortium GTEx ^AnVIL_GTEx_V8_hg38$ --consortium ThousandGenomes ^1000G-high-coverage-2019$
    """
    for (name, workspace_regex) in consortiums:
        reconciler = Reconciler(
            name, user_project, namespace, workspace_regex, AVRO_PATH)
        for workspace in reconciler.workspaces:
            transformer = FhirTransformer(workspace=workspace)
            for item in transformer.transform():
                yield item


def append_drs(sample):
    """Add ga4gh_drs_uri to blob."""
    try:
        for key in sample.blobs.keys():
            filename = key.split('/')[-1]
            gen3_file = gen3_entities.get(submitter_id=filename)
            # f"https://gen3.theanvil.io/ga4gh/drs/v1/objects/{gen3_file['object']['object_id']}"
            sample.blobs[key]['ga4gh_drs_uri'] = gen3_file['object']['ga4gh_drs_uri']
    except Exception as e:
        logging.info(f"Error sample: {sample.id} {e}")


def all_instances(clazz):
    """Return all subjects."""
    logging.info(
        "Starting aggregation for all AnVIL workspaces, this will take several minutes.")

    consortiums = (
        ('CMG', 'AnVIL_CMG_.*'),
        ('CCDG', 'AnVIL_CCDG_.*'),
        ('GTEx', '^AnVIL_GTEx_V8_hg38$'),
        ('ThousandGenomes', '^1000G-high-coverage-2019$')
    )
    for item in reconcile_all(user_project=os.environ['GOOGLE_PROJECT'], consortiums=consortiums):
        if isinstance(item, Sample):
            append_drs(item)
        if clazz is None or isinstance(item, clazz):
            yield item


def save_summary(workspace, emitter):
    """Save a workspace summary for downstream QA."""
    for subject in workspace.subjects:
        for sample in subject.samples:
            for property, blob in sample.blobs.items():
                json.dump(
                    {
                        "workspace_id": workspace.id,
                        "subject_id": subject.id,
                        "sample_id": sample.id,
                        "blob": blob['name'],
                    },
                    emitter,
                    separators=(',', ':')
                )
                emitter.write('\n')


def save_all(workspaces):
    """Save all data to the file system."""
    emitters = {}
    entity = None

    workspace_exceptions = {}
    current_workspace = None
    summary_emitter = open(f"{OUTPUT_DIR}/terra_summary.json", "w")

    for workspace in workspaces:
        current_workspace = workspace.name
        transformer = FhirTransformer(workspace=workspace)
        save_summary(workspace, summary_emitter)
        try:
            for item in transformer.transform():
                for entity in item.entity():
                    resourceType = entity['resourceType']
                    emitter = emitters.get(resourceType, None)
                    if emitter is None:
                        emitter = open(
                            f"{OUTPUT_DIR}/{resourceType}.json", "w")
                        emitters[resourceType] = emitter
                    json.dump(entity, emitter, separators=(',', ':'))
                    emitter.write('\n')
        except Exception as e:
            if current_workspace not in workspace_exceptions:
                logging.getLogger(__name__).warning(f"{current_workspace} {e}")
                workspace_exceptions[current_workspace] = True
    for stream in emitters.values():
        stream.close()
    summary_emitter.close()


def validate():
    """Ensure expected extracts exist."""
    FHIR_OUTPUT_PATHS = [f"{OUTPUT_DIR}/{p}" for p in """
    DocumentReference.json
    Organization.json
    Patient.json
    Practitioner.json
    ResearchStudy.json
    ResearchSubject.json
    Specimen.json
    Task.json""".split()]

    for path in FHIR_OUTPUT_PATHS:
        assert os.path.isfile(path), f"{path} should exist"
        with open(path, 'r') as inputs:
            for line in inputs.readlines():
                fhir_obj = json.loads(line)
                assert fhir_obj, f"json de-serialization failed {line}"
                break

    assert os.path.isfile(TERRA_SUMMARY), f"{TERRA_SUMMARY} should exist."


gen3_entities.load()

workspaces = list(all_instances(Workspace))
save_all(workspaces)

validate()
