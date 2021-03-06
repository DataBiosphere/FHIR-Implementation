#!/usr/bin/env bash

#configure to mongo cluster
gcloud container clusters get-credentials broad-fhir-anvil-mongo-cluster --zone us-east1-b

kubectl apply -f storage.yml

kubectl apply -f mongodb-secret.yml

kubectl apply -f mongodb-deployment.yml

kubectl apply -f mongodb-configmap.yml
