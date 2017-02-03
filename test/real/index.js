// import bs from 'brisky-stamp' // external

import { create } from 'brisky-stamp'
import local from './local.js'

console.log('local', local)
// console.log('stamp', bs.create())
console.log('stamp', create)

// now rewrite --- import { create } from bs

// if external do this
// $3545536638.create