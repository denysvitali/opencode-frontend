OPENCODE_SERVER_REPO=denysvitali/opencode
# TODO: Change to master when the server is stable
OPENCODE_SERVER_BRANCH=feature/server
generate-openapi-ts:
	npx openapi-typescript \
		"https://raw.githubusercontent.com/$(OPENCODE_SERVER_REPO)/$(OPENCODE_SERVER_BRANCH)/internal/proto/orchestrator/v1/orchestrator_openapi.yaml" \
		-o ./src/types/orchestrator.d.ts
