# builder-boy
Build and watch es modules FAST

[![Build Status](https://travis-ci.org/vigour-io/builder-boy.svg?branch=master)](https://travis-ci.org/vigour-io/builder-boy)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![npm version](https://badge.fury.io/js/builder-boy.svg)](https://badge.fury.io/js/builder-boy)
[![Coverage Status](https://coveralls.io/repos/github/vigour-io/builder-boy/badge.svg?branch=master)](https://coveralls.io/github/vigour-io/builder-boy?branch=master)


- imports / exports
- inline browser builds
- es5 + generators + fetch and async / await
- branches based on user agents
- virtual modules

###usage

**basic**

`builder-boy fileyouwantbuild.js destination.js`

**raw**

No transpilation or pollyfills

`builder-boy fileyouwantbuild.js destination.js -r`

**watch**

Watch for changes

`builder-boy fileyouwantbuild.js destination.js -w`

**env**

Replaces env variables for inline browser builds

`builder-boy fileyouwantbuild.js destanation.js -e envvar=true -e anotherone`

**target**

Choose specific targets, defaults to inline, browser, node

`builder-boy fileyouwantbuild.js destination.js -t node`

`builder-boy fileyouwantbuild.js destination.js -t node -t browser -t inline`

![boy](https://media3.giphy.com/media/3o7TKDMPKsakcn9NU4/200.gif#4)
