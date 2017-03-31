import { device, platform, browser, version } from 'vigour-ua/navigator'
// import 'brisky-render'

if (device === 'phone' || device === 'tablet' || (device === 'tv' && platform === 'tizen')) {
  console.log('phone or tablet')
} else if (platform === 'windows' && browser === 'firefox') {
  console.log('firefox on windows non phone or tablet or tv')
  console.log(version > 20 ? '20+' : '20-')
} else {
  console.log('other')
  console.log(version < 30 ? '30-' : '30+')
}

if (device === 'tablet') {
  console.log('any tablet')
  if (browser === 'chrome' && version >= 40) {
    console.log('chrome 40+ on any tablet')
  }
}

if (version < 50) {

} else if (version < 60) {

}
