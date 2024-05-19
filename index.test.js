'use strict'; // Add 'use strict' directive to enforce strict mode

const fs = require('fs-extra');
const path = require('path');
const test = require('ava');
const globby = require('globby'); // Change to require since import cannot be used here

const lqip = require('.');

const outputDir = 'output';

test.before(async () => {
  await fs.ensureDir(outputDir);
});

// Define an async function to import globby
async function importGlobby() {
  return await import('globby');
}

(async () => {
  const importedGlobby = await importGlobby();
  const fixtures = importedGlobby.sync('fixtures/*.{jpg,jpeg,webp,png}');

  for (const fixture of fixtures) {
    const name = fixture.split('/').pop().split('.').shift();

    test(`${fixture} => webp`, async (t) => {
      const result = await lqip(fixture);
      t.truthy(result);
      t.true(Buffer.isBuffer(result.content));
      t.true(result.metadata.width < result.metadata.originalWidth);
      t.true(result.metadata.height < result.metadata.originalHeight);

      await fs.writeFile(path.join(outputDir, `${name}.webp`), result.content);

      console.log(fixture, result.metadata);
      t.snapshot(result.metadata);
    });

    test(`${fixture} => jpeg`, async (t) => {
      const result = await lqip(fixture, { outputFormat: 'jpeg' });
      t.truthy(result);
      t.true(Buffer.isBuffer(result.content));
      t.true(result.metadata.width < result.metadata.originalWidth);
      t.true(result.metadata.height < result.metadata.originalHeight);

      await fs.writeFile(path.join(outputDir, `${name}.jpg`), result.content);

      console.log(fixture, result.metadata);
      t.snapshot(result.metadata);
    });
  }

  test('array of inputs', async (t) => {
    const results = await lqip(fixtures);
    t.true(Array.isArray(results));
    t.is(results.length, fixtures.length);

    for (const result of results) {
      t.true(Buffer.isBuffer(result.content));
      t.true(result.metadata.width < result.metadata.originalWidth);
      t.true(result.metadata.height < result.metadata.originalHeight);
    }
  });
})();
