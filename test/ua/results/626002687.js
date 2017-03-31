var $2244796395={"browser":"not-firefox","version":61,"prefix":"any","platform":"any","device":"not-phone-tablet-tv","webview":"any"}
;

if ($2244796395.device === 'phone' || $2244796395.device === 'tablet' || ($2244796395.device === 'tv' && $2244796395.platform === 'tizen')) {
  console.log('phone or tablet')
} else if ($2244796395.platform === 'windows' && $2244796395.browser === 'firefox') {
  console.log('firefox on windows non phone or tablet or tv')
  console.log($2244796395.version > 20 ? '20+' : '20-')
} else {
  console.log('other')
  console.log($2244796395.version < 30 ? '30-' : '30+')
}

if ($2244796395.device === 'tablet') {
  console.log('any tablet')
  if ($2244796395.browser === 'chrome' && $2244796395.version >= 40) {
    console.log('chrome 40+ on any tablet')
  }
}

if ($2244796395.version < 50) {

} else if ($2244796395.version < 60) {

}
