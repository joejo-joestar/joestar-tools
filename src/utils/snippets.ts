export interface SnippetDef {
  label: string;
  description?: string;
  body: string;
}

const SNIPPETS: SnippetDef[] = [
  // MARK: Object
  {
    label: "object",
    description: "Insert an object with properties",
    body: `"\${1:obj}": {
  "type": "object",
  "description": "\${2:An object property}",
  "properties": {
    "\${3:prop}": {
      "type": "\${4|string,object,array,number,boolean|}"
    }
  }
},`,
  },
  // MARK: Array
  {
    label: "array",
    description: "Insert an array with items",
    body: `"\${1:arr}": {
  "type": "array",
  "description": "\${2:An array property}",
  "items": {
    "type": "\${3|string,object,array,number,boolean|}"
  }
},`,
  },
  // MARK: String
  {
    label: "string",
    description: "Insert a string property",
    body: `"\${1:str}": {
  "type": "string",
  "description": "\${2:A string property}" },`,
  },
  // MARK: Number
  {
    label: "number",
    description: "Insert a number property",
    body: `"\${1:num}": {
  "type": "number",
  "description": "\${2:A numeric property}" },`,
  },
  // MARK: Boolean
  {
    label: "boolean",
    description: "Insert a boolean property",
    body: `"\${1:bool}": {
  "type": "boolean",
  "description": "\${2:A boolean property}"
},`,
  },
  // MARK: Integer
  {
    label: "integer",
    description: "Insert an integer property",
    body: `"\${1:int}": {
  "type": "integer",
  "description": "\${2:An integer property}"
},`,
  },
  // MARK: Null
  {
    label: "null",
    description: "Insert a null property",
    body: `"\${1:nullProp}": {
  "type": "null",
  "description": "\${2:A null property}"
},`,
  },
  // MARK: Pattern
  {
    label: "pattern",
    description: "Insert a string property with pattern",
    body: `"\${1:patt}": {
  "type": "string",
  "pattern": "\${2:^[a-zA-Z]+$}",
  "description": "\${3:A string property with pattern}"
},`,
  },
];

export default SNIPPETS;
