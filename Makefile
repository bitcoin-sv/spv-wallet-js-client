# Common makefile commands & variables between projects
include .make/common.mk

## Not defined? Use default repo name which is the application
ifeq ($(REPO_NAME),)
	REPO_NAME="spv-wallet-js-client"
endif

## Not defined? Use default repo owner
ifeq ($(REPO_OWNER),)
	REPO_OWNER="bitcoin-sv"
endif

.PHONY: audit
audit: ## Checks for vulnerabilities in dependencies
	@yarn audit

.PHONY: clean
clean: ## Remove previous builds and any test cache data
	@if [ -d $(DISTRIBUTIONS_DIR) ]; then rm -r $(DISTRIBUTIONS_DIR); fi
	@if [ -d node_modules ]; then rm -r node_modules; fi

.PHONY: install
install: ## Installs the dependencies for the package
	@yarn install

.PHONY: install-all-contributors
install-all-contributors: ## Installs all contributors locally
	@echo "installing all-contributors cli tool..."
	@yarn global add all-contributors-cli

.PHONY: outdated
outdated: ## Checks for outdated packages via npm
	@yarn outdated

.PHONY: publish
publish: ## Will publish the version to npm
	@npm run deploy

.PHONY: release
release:: ## Run after releasing - deploy to npm
	@$(MAKE) publish

.PHONY: test
test: ## Will run unit tests
	@yarn run test

.PHONY: update-contributors
update-contributors: ## Regenerates the contributors html/list
	@echo "generating contributor html..."
	@all-contributors generate
