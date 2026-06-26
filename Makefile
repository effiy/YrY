# YrY — unified developer command entry
# 见 CONTRIBUTING.md「常用命令」段。所有命令均可通过 `npm run <script>` 或 `make <target>` 调用。

.PHONY: install test test-watch test-ui test-coverage test-coverage-check \
        lint lint-skills lint-all lint-fix typecheck arch-check health \
        format format-check version bump-patch bump-minor bump-major \
        ci-local clean

NODE_BIN := npx

install:
	npm ci

test:
	$(NODE_BIN) vitest run

test-watch:
	$(NODE_BIN) vitest

test-ui:
	$(NODE_BIN) vitest --ui

test-coverage:
	$(NODE_BIN) vitest run --coverage

test-coverage-check:
	$(NODE_BIN) vitest run --coverage \
		--coverage.thresholds.lines=8 \
		--coverage.thresholds.statements=8 \
		--coverage.thresholds.functions=10 \
		--coverage.thresholds.branches=10

lint:
	$(NODE_BIN) eslint lib/

lint-skills:
	$(NODE_BIN) eslint skills/

# CI 等价命令：lib/ + skills/ 全量 0 errors + 0 warnings
lint-all:
	$(NODE_BIN) eslint lib/ skills/ --max-warnings 0

lint-fix:
	$(NODE_BIN) eslint lib/ --fix

typecheck:
	$(NODE_BIN) tsc --noEmit

arch-check:
	node lib/arch-check.mjs

health:
	node skills/rui-bot/send.mjs health

format:
	$(NODE_BIN) prettier --write "lib/**/*.mjs" "skills/**/*.mjs"

format-check:
	$(NODE_BIN) prettier --check "lib/**/*.mjs" "skills/**/*.mjs"

version:
	node -e "console.log(require('./package.json').version)"

bump-patch:
	node scripts/bump-version.mjs patch

bump-minor:
	node scripts/bump-version.mjs minor

bump-major:
	node scripts/bump-version.mjs major

# 本地跑 CI 等价检查：lint（阻断）+ typecheck（阻断）+ test（阻断）+ arch-check（阻断）
ci-local:
	$(NODE_BIN) eslint lib/ skills/ --max-warnings 0
	$(NODE_BIN) tsc --noEmit
	$(NODE_BIN) vitest run
	node lib/arch-check.mjs
	@echo "✅ CI-local 完成（lint + typecheck + test + arch-check 全绿）"

clean:
	rm -rf coverage node_modules/.cache
