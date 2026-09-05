import { catalog } from './catalog'
import { common } from './common'
import { enums } from './enums'
import { operations } from './operations'

export const dict = {
  ...common,
  ...enums,
  ...catalog,
  ...operations,
}
