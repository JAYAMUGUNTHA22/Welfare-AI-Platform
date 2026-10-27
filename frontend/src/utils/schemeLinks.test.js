import test from 'node:test';
import assert from 'node:assert/strict';
import { getSchemeApplicationLink, getSchemeApplicationUrl } from './schemeLinks.js';

test('prefers a direct application URL from the scheme data', () => {
  assert.deepEqual(
    getSchemeApplicationLink({
      myschemeSlug: 'scheme-slug',
      applicationUrl: 'https://apply.example.gov.in/form',
    }),
    { url: 'https://apply.example.gov.in/form', type: 'application' },
  );
});

test('extracts a URL from application instructions', () => {
  assert.deepEqual(
    getSchemeApplicationLink({
      applicationProcess: 'Apply online at https://apply.example.gov.in/register',
    }),
    { url: 'https://apply.example.gov.in/register', type: 'application' },
  );
});

test('does not link to MyScheme when no direct application URL exists', () => {
  assert.equal(getSchemeApplicationLink({ myschemeSlug: 'scheme-slug' }), null);
});

test('does not link to MyScheme for backend scheme records without an application URL', () => {
  assert.equal(getSchemeApplicationLink({ sourceData: { slug: 'source-scheme' } }), null);
});

test('preserves the URL-only helper for direct application links', () => {
  assert.equal(
    getSchemeApplicationUrl({ applicationUrl: 'https://apply.example.gov.in/form' }),
    'https://apply.example.gov.in/form',
  );
});

test('ignores unsafe application URLs without falling back to MyScheme', () => {
  assert.equal(
    getSchemeApplicationLink({
      myschemeSlug: 'scheme-slug',
      applicationUrl: 'javascript:alert(1)',
    }),
    null,
  );
});

test('does not create a link when the scheme has no usable source URL or slug', () => {
  assert.equal(getSchemeApplicationLink({ id: 'local-only-scheme' }), null);
});

test('routes offline-only schemes to their application steps', () => {
  assert.deepEqual(
    getSchemeApplicationLink({
      slug: 'offline-scheme',
      application: 'Offline application: submit the completed form to the district office.',
    }),
    { to: '/schemes/offline-scheme#application-process', type: 'offline-instructions' },
  );
});

test('labels application forms and guidance PDFs according to their destination', () => {
  assert.equal(
    getSchemeApplicationLink({ applicationUrl: 'https://department.gov.in/forms/Application-Form.pdf' }).type,
    'offline-form',
  );
  assert.equal(
    getSchemeApplicationLink({ applicationUrl: 'https://department.gov.in/docs/Registration-Manual.pdf' }).type,
    'application-instructions',
  );
});
