# wrangler-build-time-fs-assets-polyfilling

This monorepo contains the code for the `@flarelabs-net/wrangler-build-time-fs-assets-polyfilling`
package.

The package in a nutshell generates files at built time that define what static assets
a Cloudflare worker has access to alongside fs polyfills that make sure to such files
to provide support for some `fs` functions.

A more proper documentation will be added later here if beneficial 🙂

## How to use the monorepo

> [!note]
> Make sure to use node.js v23

Install the various dependencies with `npm i` a `postinstall` script also builds the package.

Then you can go in one of the examples and run `npm run dev` to run it (the examples should be self-explanatory).

You can build the package by running `npm run build` or `npm run build:watch` in the `package` directory.

And you can run the various tests with `npm test`.
