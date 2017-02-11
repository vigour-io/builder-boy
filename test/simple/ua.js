var bla = blurf
if (typeof window === 'undefined') {
  bla.platform = 'node'
} else {
  bla(window.navigator.userAgent, exports)
}
