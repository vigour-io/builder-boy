const struct = {}
const props = {}
const property = {}

props.default = (t, val, key, stamp) => property(t, val, key, stamp, struct)
props.default.struct = struct

inject(struct, [ on, types ])