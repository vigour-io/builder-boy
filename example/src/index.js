// when only one child no array...
// const Bla = props => <div>{props.children + '!' + props.sidenote}</div>
// const X = props => <Bla sidenote={props.x.bla}>{props.title + ' ' + props.subtitle}</Bla>
const { create } = require('brisky-struct')

const compute = (target, field) => {
  if (target.isValue) {
    if (!target.value) {
      target = compute(target.props)
    } else {
      if (target.value.parse) {
        target = target.value.parse(target.props, target.value.fields)
      }
    }
  } else {
    if (field) {
      if (isStruct(target)) {
        target = target.get(field, false).compute()
      } else {
        for (let i = 0, len = field.length; target && i < len; i++) {
          target = target[field[i]]
        }
        if (target && target.isValue) {
          target = compute(target)
        }
      }
    }
  }
  if (isStruct(target)) {
    target = target.compute()
  }
  return target
}

const isStruct = target => target && typeof target === 'object' && target.inherits

/*
 subs.title = {
      val: true,
      _: {
        update: [ component.update, parsed, id ]
      }
    }
*/

const parseSubs = (subs, parsed, component, id, top) => {
  if (!top) top = parsed
  if (parsed.isValue) {
    if (parsed.value) {
      let target = parsed.props
      for (let i in parsed.value.fields) {
        const field = parsed.value.fields[i]
        for (let i = 0, len = field.length; target && i < len; i++) {
          if (isStruct(target)) {
            let s = subs
            for (let j = i, len = field.length; j < len; j++) {
              s = s[field] = {}
              if (j === len - 1) {
                s.val = true
                s._ = {
                  update: [ component.update, top, id ]
                }
              }
            }
            console.log('      hello', subs)
            break
          } else {
            target = target[field[i]]
          }
          if (target && target.isValue) {
            console.log('2 parse it its a value', target)
            parseSubs(subs, target, component, id, top)
          }
        }
      }
    } else {
      parseSubs(subs, parsed.props, component, id, top)
    }
  }
}

const register = (props, value, component, registery, subs, id) => {
  const parsed = prop(props, value)
  if (component.update) {
    parseSubs(subs, parsed, component, id)
  }
  return parsed
}

const prop = (props, value) => {
  // can do all kinds of checks here
  return {
    isValue: true,
    props,
    value
  }
}

const incId = (id, add) => (id * 33 ^ add) >>> 0

// ----- posiblity to create complete custom components like this one -----
const Text = {
  id: 32312312132,
  create: (component, props, id, parent, registery, subs) => {
    const elem = registery[id] = document.createTextNode(compute(register(props, false, component, registery, subs, id)))
    parent.appendChild(elem)
  },
  update: (props, id, registery) => {
    registery[id].nodeValue = compute(props)
  }
}

// ----- results -----
const Bla = {
  id: 42312312132,
  values: {
    id1: {
      fields: {
        id1: [ 'children' ],
        id2: [ 'sidenote' ]
      },
      parse: (props, fields) => {
        const id1 = compute(props, fields.id1)
        const id2 = compute(props, fields.id2)
        return id1 + '!' + id2
      }
    }
  },
  create: (component, props, id, parent, registery, subs) => {
    const elem = registery[id] = document.createElement('div')
    Text.create(Text, prop(props, component.values.id1), incId(id, Text.id), elem, registery, subs)
    parent.appendChild(elem)
  }
}

const X = {
  id: 12312312132,
  values: {
    id1: {
      fields: {
        id1: [ 'title' ],
        id2: [ 'subtitle' ]
      },
      parse: (props, fields) => {
        const title = compute(props, fields.id1)
        const subtitle = compute(props, fields.id2)
        return title + ' ' + subtitle
      }
    },
    id2: {
      fields: {
        id1: [ 'x', 'bla' ]
      },
      parse: (props, fields) => {
        const id1 = compute(props, fields.id1)
        return id1
      }
    }
  },
  create: (component, props, id, parent, registery, subs) => {
    const elem = registery[id] || (registery[id] = document.createElement('div'))
    Bla.create(Bla, {
      children: prop(props, component.values.id1),
      sidenote: prop(props, component.values.id2)
    }, incId(id, Bla.id), elem, registery, subs)
    parent.appendChild(elem)
  }
}

// ----- data -----
const data = create({
  title: 'hello',
  subtitle: 'bye',
  x: {
    bla: 'blurf'
  }
})

const subs = {}
const registery = {}

const update = (t, type, subs) => {
  if (subs._) {
    if (subs._.update) {
      for (let i = 0, len = subs._.update.length; i < len - 2; i += 3) {
        // register will hapen as well!
        subs._.update[i](subs._.update[i + 1], subs._.update[i + 2], registery)
      }
    }
  }
}

data.subscribe(subs, update, true)

X.create(X, data, 5038, document.body, registery, subs)

// subs.title = { val: true }

data.title.set('232332')
// data.subtitle.set('232332')
