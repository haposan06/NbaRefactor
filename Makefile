# Copyright (c) 2019 PACS-SRE

DEFAULT_GOAL: help
.PHONY: push down up build clean help

export TAG=$(tag)

push:
	@TAG=${TAG} docker-compose push pacscrm-nba-$(typ)

down:
	@TAG=${TAG} docker-compose down

up:
	@TAG=${TAG} docker-compose up -d pacscrm-nba-$(typ)
	@until TAG=${TAG} docker-compose logs pacscrm-nba-$(typ) | \
		grep "1337" -C 99999; do echo "container not yet ready..."; done
	@curl -s -I localhost:1337

build:
	@TAG=${TAG} docker-compose build pacscrm-nba-$(typ)

clean:
	@rm -rf node_modules

help:
	@echo 'Dont be lazy and inspect Makefile'