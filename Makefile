# Common makefile commands & variables between projects
include .make/common.mk

## Not defined? Use default repo name which is the application
ifeq ($(REPO_NAME),)
	REPO_NAME="js-buxclient"
endif

## Not defined? Use default repo owner
ifeq ($(REPO_OWNER),)
	REPO_OWNER="BuxOrg"
endif

.PHONY: clean release test

audit: ## Checks for vulnerabilities in dependencies
	@yarn audit

clean: ## Remove previous builds and any test cache data
	@if [ -d $(DISTRIBUTIONS_DIR) ]; then rm -r $(DISTRIBUTIONS_DIR); fi
	@if [ -d node_modules ]; then rm -r node_modules; fi

install: ## Installs the dependencies for the package
	@yarn install

install-all-contributors: ## Installs all contributors locally
	@echo "installing all-contributors cli tool..."
	@yarn global add all-contributors-cli

outdated: ## Checks for outdated packages via npm
	@yarn outdated

publish: ## Will publish the version to npm
	@npm run deploy

release:: ## Run after releasing - deploy to npm
	@$(MAKE) publish

test: ## Will run unit tests
	@yarn run test

update-contributors: ## Regenerates the contributors html/list
	@echo "generating contributor html..."
	@all-contributors generate
