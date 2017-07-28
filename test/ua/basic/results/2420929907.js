var $2244796395={"browser":"not-firefox","version":29,"prefix":"any","platform":"any","device":"not-phone-tablet-tv","webview":"any"}
;

if ($2244796395.device === 'phone' || $2244796395.device === 'tablet' || ($2244796395.device === 'tv' && $2244796395.platform === 'tizen')) {

} else if ($2244796395.platform === 'windows' && $2244796395.browser === 'firefox') {
  console.log($2244796395.version > 20 ? '20+' : '20-')
} else {
  console.log($2244796395.version < 30 ? '30-' : '30+')
}

if ($2244796395.device === 'tablet') {
  if ($2244796395.browser === 'chrome' && $2244796395.version >= 40) {

  }
}
