import fs from 'fs'
import exotic from './exotic'

const gzip2 = val => fs.gzip(val, (err, val) => {})

const gzip3 = val => {
  exotic.gzip(val, (err, val) => {})
}
