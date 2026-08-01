# Topic Index

Curated local topic index derived from the registered sources in
registered sources. Each resource is tagged with its
`[src:source-id]` so the reader can trace provenance.

**Sources:**
- `nodebestpractices` — [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

| Category | Topics | Resources |
| --- | ---: | ---: |
| Project Architecture | 2 | 6 |
| Error Handling | 2 | 13 |
| Code Style | 2 | 13 |
| Testing & Quality | 2 | 13 |
| Going To Production | 2 | 19 |
| Security | 2 | 27 |
| Draft: Performance Best Practices | 1 | 2 |
| Docker | 2 | 15 |
| **Total** | **15** | **108** |

## Project Architecture

### New & Updated (5)

- [1.1 Structure your solution by business components](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/projectstructre/breakintcomponents.md) `[src:nodebestpractices]`
- [1.2 Layer your components with 3-tiers, keep the web layer within its boundaries](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/projectstructre/createlayers.md) `[src:nodebestpractices]`
- [1.4 Use environment aware, secure and hierarchical config](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/projectstructre/configguide.md) `[src:nodebestpractices]`
- [1.5 Consider all the consequences when choosing the main framework](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/projectstructre/choose-framework.md) `[src:nodebestpractices]`
- [1.6 Use TypeScript sparingly and thoughtfully](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/projectstructre/typescript-considerations.md) `[src:nodebestpractices]`

### Practices (1)

- [1.3 Wrap common utilities as packages, consider publishing](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/projectstructre/wraputilities.md) `[src:nodebestpractices]`

## Error Handling

### Practices (6)

- [2.1 Use Async-Await or promises for async error handling](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/asyncerrorhandling.md) `[src:nodebestpractices]`
- [2.4 Handle errors centrally, not within a middleware](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/centralizedhandling.md) `[src:nodebestpractices]`
- [2.5 Document API errors using OpenAPI or GraphQL](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/documentingusingswagger.md) `[src:nodebestpractices]`
- [2.6 Exit the process gracefully when a stranger comes to town](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/shuttingtheprocess.md) `[src:nodebestpractices]`
- [2.9 Discover errors and downtime using APM products](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/apmproducts.md) `[src:nodebestpractices]`
- [2.11 Fail fast, validate arguments using a dedicated library](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/failfast.md) `[src:nodebestpractices]`

### New & Updated (7)

- [2.2 Extend the built-in Error object](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/useonlythebuiltinerror.md) `[src:nodebestpractices]`
- [2.3 Distinguish catastrophic errors from operational errors](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/operationalvsprogrammererror.md) `[src:nodebestpractices]`
- [2.7 Use a mature logger to increase errors visibility](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/usematurelogger.md) `[src:nodebestpractices]`
- [2.8 Test error flows using your favorite test framework](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/testingerrorflows.md) `[src:nodebestpractices]`
- [2.10 Catch unhandled promise rejections](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/catchunhandledpromiserejection.md) `[src:nodebestpractices]`
- [2.12 Always await promises before returning to avoid a partial stacktrace](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/returningpromises.md) `[src:nodebestpractices]`
- [2.13 Subscribe to event emitters and streams 'error' event](https://github.com/goldbergyoni/nodebestpractices#2.13-subscribe-to-event-emitters-and-streams-error-event) `[src:nodebestpractices]`

## Code Style

### Practices (10)

- [3.1 Use ESLint](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/codestylepractices/eslint_prettier.md) `[src:nodebestpractices]`
- [3.3 Start a Codeblock's Curly Braces on the Same Line](https://github.com/goldbergyoni/nodebestpractices#3.3-start-a-codeblocks-curly-braces-on-the-same-line) `[src:nodebestpractices]`
- [3.4 Separate your statements properly](https://github.com/goldbergyoni/nodebestpractices#3.4-separate-your-statements-properly) `[src:nodebestpractices]`
- [3.5 Name your functions](https://github.com/goldbergyoni/nodebestpractices#3.5-name-your-functions) `[src:nodebestpractices]`
- [3.6 Use naming conventions for variables, constants, functions and classes](https://github.com/goldbergyoni/nodebestpractices#3.6-use-naming-conventions-for-variables-constants-functions-and-classes) `[src:nodebestpractices]`
- [3.7 Prefer const over let. Ditch the var](https://github.com/goldbergyoni/nodebestpractices#3.7-prefer-const-over-let.-ditch-the-var) `[src:nodebestpractices]`
- [3.8 Require modules first, not inside functions](https://github.com/goldbergyoni/nodebestpractices#3.8-require-modules-first-not-inside-functions) `[src:nodebestpractices]`
- [3.10 Use the `===` operator](https://github.com/goldbergyoni/nodebestpractices#3.10-use-the-operator) `[src:nodebestpractices]`
- [3.11 Use Async Await, avoid callbacks](https://github.com/goldbergyoni/nodebestpractices#3.11-use-async-await-avoid-callbacks) `[src:nodebestpractices]`
- [3.12 Use arrow function expressions (=>)](https://github.com/goldbergyoni/nodebestpractices#3.12-use-arrow-function-expressions-) `[src:nodebestpractices]`

### New & Updated (3)

- [3.2 Use Node.js eslint extension plugins](https://github.com/goldbergyoni/nodebestpractices#3.2-use-node.js-eslint-extension-plugins) `[src:nodebestpractices]`
- [3.9 Set an explicit entry point to a module/folder](https://github.com/goldbergyoni/nodebestpractices#3.9-set-an-explicit-entry-point-to-a-modulefolder) `[src:nodebestpractices]`
- [3.13 Avoid effects outside of functions](https://github.com/goldbergyoni/nodebestpractices#3.13-avoid-effects-outside-of-functions) `[src:nodebestpractices]`

## Testing & Quality

### Practices (7)

- [4.1 At the very least, write API (component) testing](https://github.com/goldbergyoni/nodebestpractices#4.1-at-the-very-least-write-api-component-testing) `[src:nodebestpractices]`
- [4.5 Avoid global test fixtures and seeds, add data per-test](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/testingandquality/avoid-global-test-fixture.md) `[src:nodebestpractices]`
- [4.6 Tag your tests](https://github.com/goldbergyoni/nodebestpractices#4.6-tag-your-tests) `[src:nodebestpractices]`
- [4.7 Check your test coverage, it helps to identify wrong test patterns](https://github.com/goldbergyoni/nodebestpractices#4.7-check-your-test-coverage-it-helps-to-identify-wrong-test-patterns) `[src:nodebestpractices]`
- [4.8 Use production-like environment for e2e testing](https://github.com/goldbergyoni/nodebestpractices#4.8-use-production-like-environment-for-e2e-testing) `[src:nodebestpractices]`
- [4.9 Refactor regularly using static analysis tools](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/testingandquality/refactoring.md) `[src:nodebestpractices]`
- [4.11 Test your middlewares in isolation](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/testingandquality/test-middlewares.md) `[src:nodebestpractices]`

### New & Updated (6)

- [4.2 Include 3 parts in each test name](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/testingandquality/3-parts-in-name.md) `[src:nodebestpractices]`
- [4.3 Structure tests by the AAA pattern](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/testingandquality/aaa.md) `[src:nodebestpractices]`
- [4.4 Ensure Node version is unified](https://github.com/goldbergyoni/nodebestpractices#4.4-ensure-node-version-is-unified) `[src:nodebestpractices]`
- [4.10 Mock responses of external HTTP services](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/testingandquality/mock-external-services.md) `[src:nodebestpractices]`
- [4.12 Specify a port in production, randomize in testing](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/testingandquality/randomize-port.md) `[src:nodebestpractices]`
- [4.13 Test the five possible outcomes](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/testingandquality/test-five-outcomes.md) `[src:nodebestpractices]`

## Going To Production

### Practices (17)

- [5.1 Monitoring](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/monitoring.md) `[src:nodebestpractices]`
- [5.2 Increase the observability using smart logging](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/smartlogging.md) `[src:nodebestpractices]`
- [5.3 Delegate anything possible (e.g. gzip, SSL) to a reverse proxy](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/delegatetoproxy.md) `[src:nodebestpractices]`
- [5.4 Lock dependencies](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/lockdependencies.md) `[src:nodebestpractices]`
- [5.5 Guard process uptime using the right tool](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/guardprocess.md) `[src:nodebestpractices]`
- [5.6 Utilize all CPU cores](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/utilizecpu.md) `[src:nodebestpractices]`
- [5.7 Create a ‘maintenance endpoint’](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/createmaintenanceendpoint.md) `[src:nodebestpractices]`
- [5.9 Make your code production-ready](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/productioncode.md) `[src:nodebestpractices]`
- [5.10 Measure and guard the memory usage](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/measurememory.md) `[src:nodebestpractices]`
- [5.11 Get your frontend assets out of Node](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/frontendout.md) `[src:nodebestpractices]`
- [5.12 Strive to be stateless](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/bestateless.md) `[src:nodebestpractices]`
- [5.13 Use tools that automatically detect vulnerabilities](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/detectvulnerabilities.md) `[src:nodebestpractices]`
- [5.14 Assign a transaction id to each log statement](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/assigntransactionid.md) `[src:nodebestpractices]`
- [5.15 Set `NODE_ENV=production`](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/setnodeenv.md) `[src:nodebestpractices]`
- [5.16 Design automated, atomic and zero-downtime deployments](https://github.com/goldbergyoni/nodebestpractices#5.16-design-automated-atomic-and-zero-downtime-deployments) `[src:nodebestpractices]`
- [5.17 Use an LTS release of Node.js](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/LTSrelease.md) `[src:nodebestpractices]`
- [5.19 Install your packages with `npm ci`](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/installpackageswithnpmci.md) `[src:nodebestpractices]`

### New & Updated (2)

- [5.8 Discover the unknowns using APM products](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/apmproducts.md) `[src:nodebestpractices]`
- [5.18 Log to stdout, avoid specifying log destination within the app](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/logrouting.md) `[src:nodebestpractices]`

## Security

### Practices (26)

- [6.1 Embrace linter security rules](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/lintrules.md) `[src:nodebestpractices]`
- [6.2 Limit concurrent requests using a middleware](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/limitrequests.md) `[src:nodebestpractices]`
- [6.3 Extract secrets from config files or use packages to encrypt them](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/secretmanagement.md) `[src:nodebestpractices]`
- [6.4 Prevent query injection vulnerabilities with ORM/ODM libraries](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/ormodmusage.md) `[src:nodebestpractices]`
- [6.5 Collection of generic security best practices](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/commonsecuritybestpractices.md) `[src:nodebestpractices]`
- [6.6 Adjust the HTTP response headers for enhanced security](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/secureheaders.md) `[src:nodebestpractices]`
- [6.7 Constantly and automatically inspect for vulnerable dependencies](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/dependencysecurity.md) `[src:nodebestpractices]`
- [6.8 Protect Users' Passwords/Secrets using bcrypt or scrypt](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/userpasswords.md) `[src:nodebestpractices]`
- [6.9 Escape HTML, JS and CSS output](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/escape-output.md) `[src:nodebestpractices]`
- [6.10 Validate incoming JSON schemas](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/validation.md) `[src:nodebestpractices]`
- [6.11 Support blocklisting JWTs](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/expirejwt.md) `[src:nodebestpractices]`
- [6.12 Prevent brute-force attacks against authorization](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/login-rate-limit.md) `[src:nodebestpractices]`
- [6.13 Run Node.js as non-root user](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/non-root-user.md) `[src:nodebestpractices]`
- [6.14 Limit payload size using a reverse-proxy or a middleware](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/requestpayloadsizelimit.md) `[src:nodebestpractices]`
- [6.15 Avoid JavaScript eval statements](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/avoideval.md) `[src:nodebestpractices]`
- [6.16 Prevent evil RegEx from overloading your single thread execution](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/regex.md) `[src:nodebestpractices]`
- [6.17 Avoid module loading using a variable](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/safemoduleloading.md) `[src:nodebestpractices]`
- [6.18 Run unsafe code in a sandbox](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/sandbox.md) `[src:nodebestpractices]`
- [6.19 Take extra care when working with child processes](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/childprocesses.md) `[src:nodebestpractices]`
- [6.20 Hide error details from clients](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/hideerrors.md) `[src:nodebestpractices]`
- [6.21 Configure 2FA for npm or Yarn](https://github.com/goldbergyoni/nodebestpractices#6.21-configure-2fa-for-npm-or-yarn) `[src:nodebestpractices]`
- [6.22 Modify session middleware settings](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/sessions.md) `[src:nodebestpractices]`
- [6.23 Avoid DOS attacks by explicitly setting when a process should crash](https://github.com/goldbergyoni/nodebestpractices#6.23-avoid-dos-attacks-by-explicitly-setting-when-a-process-should-crash) `[src:nodebestpractices]`
- [6.24 Prevent unsafe redirects](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/saferedirects.md) `[src:nodebestpractices]`
- [6.25 Avoid publishing secrets to the npm registry](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/avoid_publishing_secrets.md) `[src:nodebestpractices]`
- [6.26 Inspect for outdated packages](https://github.com/goldbergyoni/nodebestpractices#6.26-inspect-for-outdated-packages) `[src:nodebestpractices]`

### New & Updated (1)

- [6.27 Import built-in modules using the 'node:' protocol](https://github.com/goldbergyoni/nodebestpractices#6.27-import-built-in-modules-using-the-node-protocol) `[src:nodebestpractices]`

## Draft: Performance Best Practices

### Practices (2)

- [7.1 Don't block the event loop](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/performance/block-loop.md) `[src:nodebestpractices]`
- [7.2 Prefer native JS methods over user-land utils like Lodash](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/performance/nativeoverutil.md) `[src:nodebestpractices]`

## Docker

### Practices (13)

- [8.1 Use multi-stage builds for leaner and more secure Docker images](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/docker/multi_stage_builds.md) `[src:nodebestpractices]`
- [8.2 Bootstrap using `node` command, avoid `npm start`](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/docker/bootstrap-using-node.md) `[src:nodebestpractices]`
- [8.3 Let the Docker runtime handle replication and uptime](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/docker/restart-and-replicate-processes.md) `[src:nodebestpractices]`
- [8.4 Use .dockerignore to prevent leaking secrets](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/docker/docker-ignore.md) `[src:nodebestpractices]`
- [8.5 Clean-up dependencies before production](https://github.com/goldbergyoni/nodebestpractices#8.5-clean-up-dependencies-before-production) `[src:nodebestpractices]`
- [8.6 Shutdown smartly and gracefully](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/docker/graceful-shutdown.md) `[src:nodebestpractices]`
- [8.7 Set memory limits using both Docker and v8](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/docker/memory-limit.md) `[src:nodebestpractices]`
- [8.8 Plan for efficient caching](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/docker/use-cache-for-shorter-build-time.md) `[src:nodebestpractices]`
- [8.9 Use explicit image reference, avoid `latest` tag](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/docker/image-tags.md) `[src:nodebestpractices]`
- [8.10 Prefer smaller Docker base images](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/docker/smaller_base_images.md) `[src:nodebestpractices]`
- [8.12 Scan images for multi layers of vulnerabilities](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/docker/scan-images.md) `[src:nodebestpractices]`
- [8.13 Clean NODE_MODULE cache](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/docker/clean-cache.md) `[src:nodebestpractices]`
- [8.14 Generic Docker practices](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/docker/generic-tips.md) `[src:nodebestpractices]`

### New & Updated (2)

- [8.11 Clean-out build-time secrets, avoid secrets in args](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/docker/avoid-build-time-secrets.md) `[src:nodebestpractices]`
- [8.15 Lint your Dockerfile](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/docker/lint-dockerfile.md) `[src:nodebestpractices]`
