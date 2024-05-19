'use strict';

const fs = require('fs-extra');
const path = require('path');
const test = require('ava');

// Dynamically import globby using import()
const importGlobby = () => import('globby');

const lqip = require('.');

const outputDir = 'output';

test.before(async () => {
  await fs.ensureDir(outputDir);
});

test.before(async (t) => {
  // Wait for the dynamic import of globby
  t.context.globby = await importGlobby();
});

test.serial('Generate LQIP for images', async (t) => {
  const fixtures = t.context.globby.sync('fixtures/*.{jpg,jpeg,webp,png}');

  for (const fixture of fixtures) {
    const name = fixture.split('/').pop().split('.').shift();

    await testLqipGeneration(fixture, name, t);
  }
});

async function testLqipGeneration(fixture, name, t) {
  const result = await lqip(fixture);
  t.truthy(result);
  t.true(Buffer.isBuffer(result.content));
  t.true(result.metadata.width < result.metadata.originalWidth);
  t.true(result.metadata.height < result.metadata.originalHeight);

  await fs.writeFile(path.join(outputDir, `${name}.webp`), result.content);

  console.log(fixture, result.metadata);
  t.snapshot(result.metadata);
}
