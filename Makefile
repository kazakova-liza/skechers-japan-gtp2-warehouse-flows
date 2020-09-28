install:
	npm install

server:
	node src/server/runServer.js

calc:
	node src/server/phases/calculations.js

publish:
	npm publish --dry-run

lint:
	npx eslint ./

lint-fix:
	npx eslint --fix ./

test:
	npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8