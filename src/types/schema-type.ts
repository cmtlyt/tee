type JsonSchemaType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array';

// 定义每个类型对应的验证属性
interface StringValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
}

interface NumberValidation {
  multipleOf?: number;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: boolean;
  exclusiveMaximum?: boolean;
}

interface BooleanValidation {}

interface ObjectValidation {
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean | JsonSchema;
  // ...其他对象验证属性
}

interface ArrayValidation {
  items?: JsonSchema | JsonSchema[];
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  contains?: JsonSchema;
}

// 定义类型到验证属性的映射
interface ValidationMap {
  string: StringValidation;
  number: NumberValidation;
  boolean: BooleanValidation;
  object: ObjectValidation;
  array: ArrayValidation;
}

// 基础JSON Schema类型（不含类型特有属性）
interface BaseSchema {
  $id?: string;
  $schema?: string;
  $anchor?: string;
  $ref?: string;
  $comment?: string;
  $defs?: Record<string, JsonSchema>;
  title?: string;
  description?: string;
  default?: any;
  examples?: any[];
  deprecated?: boolean;
  format?: string; // 共享属性
  // ...其他元数据属性
  // 组合验证
  allOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  not?: JsonSchema;
  if?: JsonSchema;
  then?: JsonSchema;
  else?: JsonSchema;
  // 定义引用
  definitions?: Record<string, JsonSchema>;
  // 格式验证
  contentMediaType?: string;
  contentEncoding?: string;
  // 枚举
  enum?: any[];
  const?: any;
}

// 根据type字段动态选择验证属性
export type TypeSpecificSchema<T extends JsonSchemaType> = {
  [K in T]: ValidationMap[K];
}[T];

// 主类型声明
export type JsonSchema = BaseSchema & (
  | { type?: never } // 不指定类型时允许所有验证属性（但实际可能需要更严格的处理）
  | { type: JsonSchemaType } & TypeSpecificSchema<JsonSchemaType> // 支持多类型时的默认行为
  | { type: 'string' } & TypeSpecificSchema<'string'>
  | { type: 'number' } & TypeSpecificSchema<'number'>
  | { type: 'boolean' } & TypeSpecificSchema<'boolean'>
  | { type: 'object' } & TypeSpecificSchema<'object'>
  | { type: 'array' } & TypeSpecificSchema<'array'>
);
