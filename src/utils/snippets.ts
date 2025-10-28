export interface SnippetDef {
  label: string;
  description?: string;
  body: string;
}

const SNIPPETS: SnippetDef[] = [
  // MARK: Property
  {
    label: "property",
    description: "Insert a property definition",
    body: `"\${1:prop}": {
  "type": "\${2|string,object,array,number,boolean|}",
  "description": "\${3:description}"
},`,
  },
  // MARK: Object
  {
    label: "object",
    description: "Insert an object with properties",
    body: `"\${1:obj}": {
  "type": "object",
  "properties": {
    "\${2:prop}": {
      "type": "string"
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
  "items": {
    "type": "\${2|string,object,array,number,boolean|}"
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
  {
    label: "pattern",
    description: "Insert a string property with pattern",
    body: `"\${1:str}": {
  "type": "string",
  "pattern": "\${2:^[a-zA-Z]+$}",
  "description": "\${3:A string property with pattern}"
},`,
  },
];

export default SNIPPETS;
