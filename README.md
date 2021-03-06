# CRM Next Batch Action (NBA)

Next Batch Action...

## Tooling

If you are using OSX or *Nix based OS you can make use of the  `Makefile` to build the application.

The sample command below will take down the currently running local with tagged as `test` container 
(if there are any), build the image, start the container then curl the service.

```
make tag=test typ=local down build up
```

<br/>

## Versioning

You may want to specify the version value below in `.sre/ecosystem.yaml`. The resulting value
of the expression below will be used for Git tagging, Docker image tagging.

`.sre/ecosystem.file`

```
variable:
    version: 1.0.0
```

Postfixes below allows you to indentify  artifacts generated by PACSSRE or the application owner.

- `*-test` - artifacts generated by PACS SRE
- `*-release` - artifacts generated by application owners

<br/>

## Behaviour

The table below describes what actions are performed when the pipeline is triggered against a specific branch.

| Branch   | NPM Install | Test | SonarQube Scan | Build Image | Annotate |
|----------|-------------|------|----------------|-------------|----------|
| others   | n/a         | n/a  | n/a            | n/a         | n/a      |
| master   | yes         | off  | yes            | yes         | yes      |

<br/>

## Resources

- [SonarQube Report](https://pacs-sonarqube-sre.ocpapps-dev.pru.intranet.asia/dashboard?id=pacscrm-nba)
- [Docker Image](https://artifactory.pruconnect.net/artifactory/webapp/#/artifacts/browse/simple/General/docker-pacs-crm-local/pacscrm/nba)