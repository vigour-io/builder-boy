import { device, platform, browser, version } from 'vigour-ua/navigator'

if (device === 'phone' || device === 'tablet' || (device === 'tv' && platform === 'tizen')) {

} else if (platform === 'windows' && browser === 'firefox') {
  console.log(version > 20 ? '20+' : '20-')
} else {
  console.log(version < 30 ? '30-' : '30+')
}

if (device === 'tablet') {
  if (browser === 'chrome' && version >= 40) {

  }
}
