var $2244796395={
  "browser": "any",
  "version": "any",
  "prefix": "any",
  "platform": "tizen",
  "device": "tv",
  "webview": "any"
}
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

console.log('all')

// == step 1

// 1. device===phone||device===tablet||device===tv
// 2. (device[$nin=phone,tablet,tv])&&(platform===windows&&browser===firefox)&&version>20
// 3. (device[$nin=phone,tablet,tv])&&(platform===windows&&browser===firefox)&&version<=20
// 4. (device[$nin=phone,tablet,tv])&&(platform!==windows||browser!==firefox)&&version<30
// 5. (device[$nin=phone,tablet,tv])&&(platform!==windows||browser!==firefox)&&version>=30

// 1. (device===tablet)&&(browser===chrome&&version>=40)
// 2. (device===tablet)&&(browser!==chrome||version<40)
// 3. (device!==tablet)

// == step 2

// 1. (device===tablet)&&(browser===chrome&&version>=40)
// 2. (device===tablet)&&(browser!==chrome||version<40)
// 3. (device===phone||device===tv)
// 4. (device[$nin=phone,tablet,tv])&&(platform===windows&&browser===firefox)&&version>20
// 5. (device[$nin=phone,tablet,tv])&&(platform===windows&&browser===firefox)&&version<=20
// 6. (device[$nin=phone,tablet,tv])&&(platform!==windows||browser!==firefox)&&version<30
// 7. (device[$nin=phone,tablet,tv])&&(platform!==windows||browser!==firefox)&&version>=30

// browser, version, prefix, platform, device, webview
