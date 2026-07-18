/**
 * rui-report-self-test · scene utilities
 * ----------------------------------------------------------------------
 * Small helpers shared across the scene builders. Kept in one place so
 * each `scenes/N-*.mjs` can stay focused on its facet.
 */

/**
 * Map a detected test framework to a one-line run command that
 * self-tests only the changes since the last commit. Unknown
 * frameworks fall back to `npm test`.
 */
export function frameworkCommand(fw) {
    if (!fw) return 'echo "no test framework"';
    if (fw === 'vitest') return 'npx vitest run --changed';
    if (fw === 'jest') return 'npx jest --changedSince=main';
    if (fw === 'pytest') return 'pytest --testmon';
    if (fw === 'go test') return 'go test -short ./...';
    if (fw === 'cargo test') return 'cargo test --no-fail-fast';
    if (fw === 'phpunit') return 'phpunit --filter';
    return 'npm test';
}
