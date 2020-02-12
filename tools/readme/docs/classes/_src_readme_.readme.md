[readme](../README.md) › [Globals](../globals.md) › ["src/readme"](../modules/_src_readme_.md) › [Readme](_src_readme_.readme.md)

# Class: Readme

The Readme class is responsible for representing a readme file plus programmatic manipulations and transformations of it.

## Hierarchy

* **Readme**

## Index

### Constructors

* [constructor](_src_readme_.readme.md#constructor)

### Properties

* [blocks](_src_readme_.readme.md#blocks)
* [indexedBlocks](_src_readme_.readme.md#indexedblocks)
* [path](_src_readme_.readme.md#path)

### Methods

* [append](_src_readme_.readme.md#append)
* [export](_src_readme_.readme.md#export)
* [getReadme](_src_readme_.readme.md#getreadme)
* [getSection](_src_readme_.readme.md#getsection)
* [getSections](_src_readme_.readme.md#getsections)
* [index](_src_readme_.readme.md#index)
* [insertAfter](_src_readme_.readme.md#insertafter)
* [insertBefore](_src_readme_.readme.md#insertbefore)
* [parse](_src_readme_.readme.md#parse)
* [prepend](_src_readme_.readme.md#prepend)
* [setSection](_src_readme_.readme.md#setsection)
* [toc](_src_readme_.readme.md#toc)
* [headerFound](_src_readme_.readme.md#static-headerfound)
* [isCodeEndTag](_src_readme_.readme.md#static-iscodeendtag)
* [isCodeStartTag](_src_readme_.readme.md#static-iscodestarttag)
* [isContentBlock](_src_readme_.readme.md#static-iscontentblock)
* [isHeader](_src_readme_.readme.md#static-isheader)
* [isRootNode](_src_readme_.readme.md#static-isrootnode)
* [makeLink](_src_readme_.readme.md#static-makelink)
* [repeat](_src_readme_.readme.md#static-repeat)
* [sanitize](_src_readme_.readme.md#static-sanitize)

## Constructors

###  constructor

\+ **new Readme**(`path`: string): *[Readme](_src_readme_.readme.md)*

*Defined in [src/readme.ts:61](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L61)*

**Parameters:**

Name | Type |
------ | ------ |
`path` | string |

**Returns:** *[Readme](_src_readme_.readme.md)*

## Properties

###  blocks

• **blocks**: *[Block](../modules/_src_types_.md#block)[]* = []

*Defined in [src/readme.ts:56](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L56)*

___

###  indexedBlocks

• **indexedBlocks**: *[IndexedBlocks](../modules/_src_types_.md#indexedblocks)* = new Map([])

*Defined in [src/readme.ts:61](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L61)*

___

###  path

• **path**: *string*

*Defined in [src/readme.ts:51](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L51)*

## Methods

###  append

▸ **append**(`content`: [Block](../modules/_src_types_.md#block), `strict`: boolean): *void*

*Defined in [src/readme.ts:308](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L308)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`content` | [Block](../modules/_src_types_.md#block) | - |
`strict` | boolean | false |

**Returns:** *void*

___

###  export

▸ **export**(): *string*

*Defined in [src/readme.ts:222](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L222)*

**Returns:** *string*

___

###  getReadme

▸ **getReadme**(): *Promise‹string›*

*Defined in [src/readme.ts:81](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L81)*

**Returns:** *Promise‹string›*

___

###  getSection

▸ **getSection**(`target`: [Query](../modules/_src_types_.md#query), `strict`: boolean): *[Content](../interfaces/_src_types_.content.md) | null*

*Defined in [src/readme.ts:246](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L246)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`target` | [Query](../modules/_src_types_.md#query) | - |
`strict` | boolean | false |

**Returns:** *[Content](../interfaces/_src_types_.content.md) | null*

___

###  getSections

▸ **getSections**(`target`: [Query](../modules/_src_types_.md#query), `strict`: boolean): *[Content](../interfaces/_src_types_.content.md)[]*

*Defined in [src/readme.ts:258](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L258)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`target` | [Query](../modules/_src_types_.md#query) | - |
`strict` | boolean | false |

**Returns:** *[Content](../interfaces/_src_types_.content.md)[]*

___

###  index

▸ **index**(): *void*

*Defined in [src/readme.ts:174](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L174)*

**Returns:** *void*

___

###  insertAfter

▸ **insertAfter**(`target`: [Query](../modules/_src_types_.md#query), `content`: [Block](../modules/_src_types_.md#block), `strict`: boolean): *void*

*Defined in [src/readme.ts:345](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L345)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`target` | [Query](../modules/_src_types_.md#query) | - |
`content` | [Block](../modules/_src_types_.md#block) | - |
`strict` | boolean | false |

**Returns:** *void*

___

###  insertBefore

▸ **insertBefore**(`query`: [Query](../modules/_src_types_.md#query), `content`: [Block](../modules/_src_types_.md#block), `strict`: boolean): *void*

*Defined in [src/readme.ts:321](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L321)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`query` | [Query](../modules/_src_types_.md#query) | - |
`content` | [Block](../modules/_src_types_.md#block) | - |
`strict` | boolean | false |

**Returns:** *void*

___

###  parse

▸ **parse**(): *Promise‹[Readme](_src_readme_.readme.md)›*

*Defined in [src/readme.ts:105](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L105)*

**Returns:** *Promise‹[Readme](_src_readme_.readme.md)›*

___

###  prepend

▸ **prepend**(`content`: [Block](../modules/_src_types_.md#block), `strict`: boolean): *void*

*Defined in [src/readme.ts:295](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L295)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`content` | [Block](../modules/_src_types_.md#block) | - |
`strict` | boolean | false |

**Returns:** *void*

___

###  setSection

▸ **setSection**(`target`: [Query](../modules/_src_types_.md#query), `content`: string): *void*

*Defined in [src/readme.ts:368](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L368)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`target` | [Query](../modules/_src_types_.md#query) | - |
`content` | string | "" |

**Returns:** *void*

___

###  toc

▸ **toc**(`indent`: string): *string*

*Defined in [src/readme.ts:202](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L202)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`indent` | string | "  " |

**Returns:** *string*

___

### `Static` headerFound

▸ **headerFound**(`header`: string, `query`: [Query](../modules/_src_types_.md#query), `strict`: boolean): *Boolean*

*Defined in [src/readme.ts:28](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L28)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`header` | string | - |
`query` | [Query](../modules/_src_types_.md#query) | - |
`strict` | boolean | false |

**Returns:** *Boolean*

___

### `Static` isCodeEndTag

▸ **isCodeEndTag**(`line`: string): *boolean*

*Defined in [src/readme.ts:21](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L21)*

**Parameters:**

Name | Type |
------ | ------ |
`line` | string |

**Returns:** *boolean*

___

### `Static` isCodeStartTag

▸ **isCodeStartTag**(`line`: string): *boolean*

*Defined in [src/readme.ts:20](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L20)*

**Parameters:**

Name | Type |
------ | ------ |
`line` | string |

**Returns:** *boolean*

___

### `Static` isContentBlock

▸ **isContentBlock**(`block`: [Block](../modules/_src_types_.md#block)): *block is Content*

*Defined in [src/readme.ts:23](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L23)*

**Parameters:**

Name | Type |
------ | ------ |
`block` | [Block](../modules/_src_types_.md#block) |

**Returns:** *block is Content*

___

### `Static` isHeader

▸ **isHeader**(`line`: string): *boolean*

*Defined in [src/readme.ts:19](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L19)*

**Parameters:**

Name | Type |
------ | ------ |
`line` | string |

**Returns:** *boolean*

___

### `Static` isRootNode

▸ **isRootNode**(`block`: [Block](../modules/_src_types_.md#block)): *boolean*

*Defined in [src/readme.ts:22](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L22)*

**Parameters:**

Name | Type |
------ | ------ |
`block` | [Block](../modules/_src_types_.md#block) |

**Returns:** *boolean*

___

### `Static` makeLink

▸ **makeLink**(`text`: string): *string*

*Defined in [src/readme.ts:26](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L26)*

**Parameters:**

Name | Type |
------ | ------ |
`text` | string |

**Returns:** *string*

___

### `Static` repeat

▸ **repeat**(`s`: string, `count`: number): *string*

*Defined in [src/readme.ts:25](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L25)*

**Parameters:**

Name | Type |
------ | ------ |
`s` | string |
`count` | number |

**Returns:** *string*

___

### `Static` sanitize

▸ **sanitize**(`line`: string): *string*

*Defined in [src/readme.ts:24](https://github.com/ns8inc/protect-js-tools/blob/621f9cc/tools/readme/src/readme.ts#L24)*

**Parameters:**

Name | Type |
------ | ------ |
`line` | string |

**Returns:** *string*
