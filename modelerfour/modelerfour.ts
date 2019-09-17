import { Model as oai3, Dereferenced, dereference, Refable, includeXDash, JsonType, IntegerFormat, StringFormat, NumberFormat } from '@azure-tools/openapi'
import * as OpenAPI from '@azure-tools/openapi';
import { items, values, Dictionary, ToDictionary, length } from '@azure-tools/linq';
import { HttpMethod, CodeModel, Operation, Http, BooleanSchema, Schema, NumberSchema, ArraySchema, Parameter, ChoiceSchema, StringSchema, ObjectSchema, ByteArraySchema, CharSchema, DateSchema, DateTimeSchema, DurationSchema, UuidSchema, UriSchema, CredentialSchema, ODataQuerySchema, UnixTimeSchema, SchemaType, OrSchema, AndSchema, XorSchema, DictionarySchema } from '@azure-tools/codemodel';
import { Host, Session } from '@azure-tools/autorest-extension-base';
import { Interpretations } from './interpretations'
import { fail } from '@azure-tools/codegen';



export class ModelerFour {
  codeModel: CodeModel
  private input: oai3;
  protected interpret: Interpretations;

  constructor(protected session: Session<oai3>) {
    this.input = session.model;// shadow(session.model, filename);

    const i = this.input.info;

    this.codeModel = new CodeModel(i.title || 'MISSING-TITLE', false, {
      info: {
        description: i.description,
        contact: i.contact,
        license: i.license,
        termsOfService: i.termsOfService,
        externalDocs: this.input.externalDocs,
        extensions: Interpretations.getExtensionProperties(i)
      },
      extensions: Interpretations.getExtensionProperties(this.input)
    });
    this.interpret = new Interpretations(session, this.codeModel);

  }

  private processed = new Map<any, any>();
  private async should<T, O>(original: T | undefined, processIt: (orig: T) => Promise<O>): Promise<O | undefined> {
    if (original) {
      const result: O = this.processed.get(original) || await processIt(original);
      this.processed.set(original, result)
      return result;
    }
    return undefined;
  }

  private resolve<T>(item: Refable<T>): Dereferenced<T> {
    return dereference(this.input, item);
  }

  resolveArray<T>(source?: Refable<T>[]) {
    return values(source).select(each => dereference(this.input, each).instance)
  }

  resolveDictionary<T>(source?: Dictionary<Refable<T>>) {
    return items(source).linq.select(each => ({
      key: each.key,
      value: dereference(this.input, each.value).instance
    }));
  }

  async processBooleanSchema(name: string, schema: OpenAPI.Schema): Promise<BooleanSchema> {
    return this.codeModel.schemas.addPrimitive(new BooleanSchema(name, this.interpret.getDescription('MISSING-SCHEMA-DESCRIPTION-BOOLEAN', schema), {
      extensions: this.interpret.getExtensionProperties(schema),
      summary: schema.title,
      defaultValue: schema.default,
      deprecated: this.interpret.getDeprecation(schema),
      apiVersions: this.interpret.getApiVersions(schema),
      example: this.interpret.getExample(schema),
      externalDocs: this.interpret.getExternalDocs(schema),
      serialization: {
        xml: this.interpret.getXmlSerialization(schema)
      }
    }));
  }
  async processIntegerSchema(name: string, schema: OpenAPI.Schema): Promise<NumberSchema> {
    return this.codeModel.schemas.addPrimitive(new NumberSchema(name, this.interpret.getDescription('MISSING-SCHEMA-DESCRIPTION-INTEGER', schema), SchemaType.Integer, schema.format === IntegerFormat.Int64 ? 64 : 32, {
      extensions: this.interpret.getExtensionProperties(schema),
      summary: schema.title,
      defaultValue: schema.default,
      deprecated: this.interpret.getDeprecation(schema),
      apiVersions: this.interpret.getApiVersions(schema),
      example: this.interpret.getExample(schema),
      externalDocs: this.interpret.getExternalDocs(schema),
      serialization: {
        xml: this.interpret.getXmlSerialization(schema)
      },
      maximum: schema.maximum,
      minimum: schema.minimum,
      multipleOf: schema.multipleOf,
      exclusiveMaximum: schema.exclusiveMaximum,
      exclusiveMinimum: schema.exclusiveMinimum
    }));
  }
  async processNumberSchema(name: string, schema: OpenAPI.Schema): Promise<NumberSchema> {
    return this.codeModel.schemas.addPrimitive(new NumberSchema(name, this.interpret.getDescription('MISSING-SCHEMA-DESCRIPTION-NUMBER', schema), SchemaType.Number,
      schema.format === NumberFormat.Decimal ? 128 : schema.format == NumberFormat.Double ? 64 : 32, {
      extensions: this.interpret.getExtensionProperties(schema),
      summary: schema.title,
      defaultValue: schema.default,
      deprecated: this.interpret.getDeprecation(schema),
      apiVersions: this.interpret.getApiVersions(schema),
      example: this.interpret.getExample(schema),
      externalDocs: this.interpret.getExternalDocs(schema),
      serialization: {
        xml: this.interpret.getXmlSerialization(schema)
      },
      maximum: schema.maximum,
      minimum: schema.minimum,
      multipleOf: schema.multipleOf,
      exclusiveMaximum: schema.exclusiveMaximum,
      exclusiveMinimum: schema.exclusiveMinimum
    }));
  }
  async processStringSchema(name: string, schema: OpenAPI.Schema): Promise<StringSchema> {
    return this.codeModel.schemas.addPrimitive(new StringSchema(name, this.interpret.getDescription('MISSING-SCHEMA-DESCRIPTION-STRING', schema), {
      extensions: this.interpret.getExtensionProperties(schema),
      summary: schema.title,
      defaultValue: schema.default,
      deprecated: this.interpret.getDeprecation(schema),
      apiVersions: this.interpret.getApiVersions(schema),
      example: this.interpret.getExample(schema),
      externalDocs: this.interpret.getExternalDocs(schema),
      serialization: {
        xml: this.interpret.getXmlSerialization(schema)
      },
      maxLength: schema.maxLength ? Number(schema.maxLength) : undefined,
      minLength: schema.minLength ? Number(schema.minLength) : undefined,
      pattern: schema.pattern ? String(schema.pattern) : undefined
    }));
  }
  async processCredentialSchema(name: string, schema: OpenAPI.Schema): Promise<CredentialSchema> {
    return this.codeModel.schemas.addPrimitive(new CredentialSchema(name, this.interpret.getDescription('MISSING-SCHEMA-DESCRIPTION-CREDENTIAL', schema), {
      extensions: this.interpret.getExtensionProperties(schema),
      summary: schema.title,
      defaultValue: schema.default,
      deprecated: this.interpret.getDeprecation(schema),
      apiVersions: this.interpret.getApiVersions(schema),
      example: this.interpret.getExample(schema),
      externalDocs: this.interpret.getExternalDocs(schema),
      serialization: {
        xml: this.interpret.getXmlSerialization(schema)
      },
      maxLength: schema.maxLength ? Number(schema.maxLength) : undefined,
      minLength: schema.minLength ? Number(schema.minLength) : undefined,
      pattern: schema.pattern ? String(schema.pattern) : undefined
    }));
  }
  async processUriSchema(name: string, schema: OpenAPI.Schema): Promise<UriSchema> {
    return this.codeModel.schemas.addPrimitive(new UriSchema(name, this.interpret.getDescription('MISSING-SCHEMA-DESCRIPTION-URI', schema), {
      extensions: this.interpret.getExtensionProperties(schema),
      summary: schema.title,
      defaultValue: schema.default,
      deprecated: this.interpret.getDeprecation(schema),
      apiVersions: this.interpret.getApiVersions(schema),
      example: this.interpret.getExample(schema),
      externalDocs: this.interpret.getExternalDocs(schema),
      serialization: {
        xml: this.interpret.getXmlSerialization(schema)
      },
      maxLength: schema.maxLength ? Number(schema.maxLength) : undefined,
      minLength: schema.minLength ? Number(schema.minLength) : undefined,
      pattern: schema.pattern ? String(schema.pattern) : undefined
    }));
  }
  async processUuidSchema(name: string, schema: OpenAPI.Schema): Promise<UuidSchema> {
    return this.codeModel.schemas.addPrimitive(new UuidSchema(name, this.interpret.getDescription('MISSING-SCHEMA-DESCRIPTION-UUID', schema), {
      extensions: this.interpret.getExtensionProperties(schema),
      summary: schema.title,
      defaultValue: schema.default,
      deprecated: this.interpret.getDeprecation(schema),
      apiVersions: this.interpret.getApiVersions(schema),
      example: this.interpret.getExample(schema),
      externalDocs: this.interpret.getExternalDocs(schema),
      serialization: {
        xml: this.interpret.getXmlSerialization(schema)
      }
    }));
  }
  async processDurationSchema(name: string, schema: OpenAPI.Schema): Promise<DurationSchema> {
    return this.codeModel.schemas.addPrimitive(new DurationSchema(name, this.interpret.getDescription('MISSING-SCHEMA-DESCRIPTION-DURATION', schema), {
      extensions: this.interpret.getExtensionProperties(schema),
      summary: schema.title,
      defaultValue: schema.default,
      deprecated: this.interpret.getDeprecation(schema),
      apiVersions: this.interpret.getApiVersions(schema),
      example: this.interpret.getExample(schema),
      externalDocs: this.interpret.getExternalDocs(schema),
      serialization: {
        xml: this.interpret.getXmlSerialization(schema)
      },
    }));
  }
  async processDateTimeSchema(name: string, schema: OpenAPI.Schema): Promise<DateTimeSchema> {
    return this.codeModel.schemas.addPrimitive(new DateTimeSchema(name, this.interpret.getDescription('MISSING-SCHEMA-DESCRIPTION-DATETIME', schema), {
      extensions: this.interpret.getExtensionProperties(schema),
      summary: schema.title,
      defaultValue: schema.default,
      deprecated: this.interpret.getDeprecation(schema),
      apiVersions: this.interpret.getApiVersions(schema),
      example: this.interpret.getExample(schema),
      externalDocs: this.interpret.getExternalDocs(schema),
      serialization: {
        xml: this.interpret.getXmlSerialization(schema)
      },
      format: schema.format === StringFormat.DateTimeRfc1123 ? StringFormat.DateTimeRfc1123 : StringFormat.DateTime,
    }));
  }
  async processDateSchema(name: string, schema: OpenAPI.Schema): Promise<DateSchema> {
    return this.codeModel.schemas.addPrimitive(new DateSchema(name, this.interpret.getDescription('MISSING-SCHEMA-DESCRIPTION-DATE', schema), {
      extensions: this.interpret.getExtensionProperties(schema),
      summary: schema.title,
      defaultValue: schema.default,
      deprecated: this.interpret.getDeprecation(schema),
      apiVersions: this.interpret.getApiVersions(schema),
      example: this.interpret.getExample(schema),
      externalDocs: this.interpret.getExternalDocs(schema),
      serialization: {
        xml: this.interpret.getXmlSerialization(schema)
      },
    }));
  }
  async processCharacterSchema(name: string, schema: OpenAPI.Schema): Promise<CharSchema> {
    return this.codeModel.schemas.addPrimitive(new CharSchema(name, this.interpret.getDescription('MISSING-SCHEMA-DESCRIPTION-CHAR', schema), {
      extensions: this.interpret.getExtensionProperties(schema),
      summary: schema.title,
      defaultValue: schema.default,
      deprecated: this.interpret.getDeprecation(schema),
      apiVersions: this.interpret.getApiVersions(schema),
      example: this.interpret.getExample(schema),
      externalDocs: this.interpret.getExternalDocs(schema),
      serialization: {
        xml: this.interpret.getXmlSerialization(schema)
      },
    }));
  }
  async processByteArraySchema(name: string, schema: OpenAPI.Schema): Promise<ByteArraySchema> {
    return this.codeModel.schemas.addPrimitive(new ByteArraySchema(name, this.interpret.getDescription('MISSING-SCHEMA-DESCRIPTION-BYTEARRAY', schema), {
      extensions: this.interpret.getExtensionProperties(schema),
      summary: schema.title,
      defaultValue: schema.default,
      deprecated: this.interpret.getDeprecation(schema),
      apiVersions: this.interpret.getApiVersions(schema),
      example: this.interpret.getExample(schema),
      externalDocs: this.interpret.getExternalDocs(schema),
      serialization: {
        xml: this.interpret.getXmlSerialization(schema)
      },
      format: schema.format === StringFormat.Base64Url ? StringFormat.Base64Url : StringFormat.Byte
    }));
  }
  async processArraySchema(name: string, schema: OpenAPI.Schema): Promise<ArraySchema> {
    const itemSchema = this.resolve(schema.items);
    if (itemSchema.instance === undefined) {
      this.session.error(`Array schema '${name}' is missing schema for items`, ['Modeler', 'MissingArrayElementType'], schema);
      throw Error();
    }
    const elementType = await this.processSchema(itemSchema.name || 'array:itemschema', itemSchema.instance)
    return this.codeModel.schemas.addPrimitive(new ArraySchema(name, this.interpret.getDescription('MISSING-SCHEMA-DESCRIPTION-ARRAYSCHEMA', schema), elementType, {
      extensions: this.interpret.getExtensionProperties(schema),
      summary: schema.title,
      defaultValue: schema.default,
      deprecated: this.interpret.getDeprecation(schema),
      apiVersions: this.interpret.getApiVersions(schema),
      example: this.interpret.getExample(schema),
      externalDocs: this.interpret.getExternalDocs(schema),
      serialization: {
        xml: this.interpret.getXmlSerialization(schema)
      },
      maxItems: schema.maxItems ? Number(schema.maxItems) : undefined,
      minItems: schema.minItems ? Number(schema.minItems) : undefined,
      uniqueItems: schema.uniqueItems ? true : undefined
    }));
  }


  async processChoiceSchema(name: string, schema: OpenAPI.Schema): Promise<ChoiceSchema> {
    throw new Error('Method not implemented.');
  }
  async processOrSchema(name: string, schema: OpenAPI.Schema): Promise<OrSchema> {
    throw new Error('Method not implemented.');
  }
  async processAndSchema(name: string, schema: OpenAPI.Schema): Promise<AndSchema> {
    throw new Error('Method not implemented.');
  }
  async processXorSchema(name: string, schema: OpenAPI.Schema): Promise<XorSchema> {
    throw new Error('Method not implemented.');
  }
  async processDictionarySchema(name: string, schema: OpenAPI.Schema): Promise<DictionarySchema> {
    throw new Error('Method not implemented.');
  }
  async processObjectSchema(name: string, schema: OpenAPI.Schema): Promise<ObjectSchema | DictionarySchema | OrSchema | XorSchema | AndSchema> {
    if (schema.oneOf) {
      // oneOf is a Xor compound type
      throw new Error(`oneOf not supported`);
    }

    // allOf & anyOf are object compound types
    // their items must be all object types.

    if (schema.additionalProperties) {
      if (length(schema.properties) === 0) {
        // this is an honest-to-goodness dictionary schema 
        return this.processDictionarySchema(name, schema)
      }
    }

    if ( )


      if (schema.properties) {
        // this has object properties
        // it's an actual object
      }

    throw new Error('Method not implemented.');
  }
  async processOdataSchema(name: string, schema: OpenAPI.Schema): Promise<ODataQuerySchema> {
    throw new Error('Method not implemented.');
  }

  async processUnixTimeSchema(name: string, schema: OpenAPI.Schema): Promise<UnixTimeSchema> {
    return this.codeModel.schemas.addPrimitive(new UnixTimeSchema(name, this.interpret.getDescription('MISSING-SCHEMA-DESCRIPTION-UNIXTIME', schema), {
      extensions: this.interpret.getExtensionProperties(schema),
      summary: schema.title,
      defaultValue: schema.default,
      deprecated: this.interpret.getDeprecation(schema),
      apiVersions: this.interpret.getApiVersions(schema),
      example: this.interpret.getExample(schema),
      externalDocs: this.interpret.getExternalDocs(schema),
      serialization: {
        xml: this.interpret.getXmlSerialization(schema)
      }
    }));
  }

  async processSchema(name: string, schema: OpenAPI.Schema): Promise<Schema> {
    return await this.should(schema, async (schema) => {
      // handle enums differently early
      if (schema.enum || schema['x-ms-enum']) {
        return await this.processChoiceSchema(name, schema);
      }

      if (schema.format === 'file') {
        // handle inconsistency in file format handling.
        this.session.warning(
          'The schema type \'file\' is not a OAI standard type. This has been auto-corrected to \'type:string\' and \'format:binary\'',
          ['Modeler', 'TypeFileNotValid'], schema);
        schema.type = OpenAPI.JsonType.String;
        schema.format = StringFormat.Binary;
      }

      // if they haven't set the schema.type then we're going to have to guess what
      // they meant to do.
      switch (schema.type) {
        case undefined:
        case null:
          if (schema.properties) {
            // if the model has properties, then we're going to assume they meant to say JsonType.object 
            // but we're going to warn them anyway.
            this.session.warning(`The schema '${name}' with an undefined type and decalared properties is a bit ambigious. This has been auto-corrected to 'type:object'`, ['Modeler', 'MissingType'], schema);
            schema.type = OpenAPI.JsonType.Object;
            break;
          }

          if (schema.additionalProperties) {
            // this looks like it's going to be a dictionary
            // we'll mark it as object and let the processObjectSchema sort it out.
            this.session.warning(`The schema '${name}' with an undefined type and additionalProperties is a bit ambigious. This has been auto-corrected to 'type:object'`, ['Modeler'], schema);
            schema.type = OpenAPI.JsonType.Object;
            break;
          }

          if (schema.allOf || schema.anyOf || schema.oneOf) {
            // if the model has properties, then we're going to assume they meant to say JsonType.object 
            // but we're going to warn them anyway.
            this.session.warning(`The schema '${name}' with an undefined type and 'allOf'/'anyOf'/'oneOf' is a bit ambigious. This has been auto-corrected to 'type:object'`, ['Modeler', 'MissingType'], schema);
            schema.type = OpenAPI.JsonType.Object;
            break;
          }
      }

      // ok, figure out what kind of schema this is.
      switch (schema.type) {
        case JsonType.Array:
          switch (schema.format) {
            case undefined:
              return await this.processArraySchema(name, schema);
            default:
              this.session.error(`Array schema '${name}' with unknown format: '${schema.format}' is not valid`, ['Modeler'], schema);
          }

        case JsonType.Boolean:
          switch (schema.format) {
            case undefined:
              return await this.processBooleanSchema(name, schema);
            default:
              this.session.error(`Boolean schema '${name}' with unknown format: '${schema.format}' is not valid`, ['Modeler'], schema);
          }

        case JsonType.Integer:
          switch (schema.format) {
            case IntegerFormat.UnixTime:
              return await this.processUnixTimeSchema(name, schema);

            case IntegerFormat.Int64:
            case IntegerFormat.Int32:
            case IntegerFormat.None:
            case undefined:
              return await this.processIntegerSchema(name, schema);

            default:
              this.session.error(`Integer schema '${name}' with unknown format: '${schema.format}' is not valid`, ['Modeler'], schema);
          }

        case JsonType.Number:
          switch (schema.format) {
            case undefined:
            case NumberFormat.None:
            case NumberFormat.Double:
            case NumberFormat.Float:
            case NumberFormat.Decimal:
              return await this.processNumberSchema(name, schema);

            default:
              this.session.error(`Number schema '${name}' with unknown format: '${schema.format}' is not valid`, ['Modeler'], schema);
          }

        case JsonType.Object:
          return await this.processObjectSchema(name, schema);

        case JsonType.String:
          switch (schema.format) {
            // member should be byte array
            // on wire format should be base64url
            case StringFormat.Base64Url:
            case StringFormat.Byte:
            case StringFormat.Certificate:
              return await this.processByteArraySchema(name, schema);

            case StringFormat.Binary:
              // represent as a stream
              // wire format is stream of bytes
              // This is actually a different kind of response or request
              // and should not be treated as a trivial 'type'
              // TODO: 
              break;

            case StringFormat.Char:
              // a single character
              return await this.processCharacterSchema(name, schema);

            case StringFormat.Date:
              return await this.processDateSchema(name, schema);

            case StringFormat.DateTime:
            case StringFormat.DateTimeRfc1123:
              return await this.processDateTimeSchema(name, schema);

            case StringFormat.Duration:
              return await this.processDurationSchema(name, schema);

            case StringFormat.Uuid:
              return await this.processUuidSchema(name, schema);

            case StringFormat.Url:
              return await this.processUriSchema(name, schema);

            case StringFormat.Password:
              return await this.processCredentialSchema(name, schema);

            case StringFormat.OData:
              return await this.processOdataSchema(name, schema);

            case StringFormat.None:
            case undefined:
            case null:
              return await this.processStringSchema(name, schema);

            default:
              this.session.error(`String schema '${name}' with unknown format: '${schema.format}' is not valid`, ['Modeler'], schema);
          }
      }
      this.session.error(`The model ${name} does not have a recognized schema type '${schema.type}'`, ['Modeler', 'UnknownSchemaType']);
      throw new Error(`Unrecognized schema type '${schema.type}'`)
    }) || fail(`Unable to process schema.`);
  }

  processOperation(operation: OpenAPI.HttpOperation | undefined, httpMethod: string, path: string, pathItem: OpenAPI.PathItem) {
    return this.should(operation, async (operation) => {
      const { group, member } = this.interpret.getOperationId(httpMethod, path, operation);
      // get group and operation name
      // const opGroup = this.codeModel.
      const opGroup = this.codeModel.getOperationGroup(group)
      const op = opGroup.addOperation(new Operation(member, this.interpret.getDescription('MISSING-OPERATION-DESCRIPTION', operation)));
      op.protocol.http = <Http.OperationProtocol>{
        method: httpMethod,
        path: this.interpret.getPath(pathItem, operation, path),
        servers: this.interpret.getServers(operation)
      }

      // get all the parameters for the operation
      for await (const p of this.resolveArray(operation.parameters).select(async parameter => {
        const schema = this.resolve(parameter.schema);
        const parameterSchema = (schema.instance) ? await this.processSchema(schema.name || '', schema.instance) : <never>null;
        const result = new Parameter(parameter.name, this.interpret.getDescription('MISSING-PARAMETER-DESCRIPTION', parameter), {
          schema: <any>parameterSchema,

        });

        return result;
      })) {
        op.addParameter(p);
      };


    });
  }

  async process() {
    if (this.input.paths) {
      for (const { key: path, value: pathItem } of this.resolveDictionary(this.input.paths).where(each => !this.processed.has(each.value))) {
        this.should(pathItem, async (pathItem) => {
          for (const httpMethod of [HttpMethod.Delete, HttpMethod.Get, HttpMethod.Head, HttpMethod.Options, HttpMethod.Patch, HttpMethod.Post, HttpMethod.Put, HttpMethod.Trace]) {
            await this.processOperation(pathItem[httpMethod], httpMethod, path, pathItem);
          }
        })
      }
    }
    if (this.input.components) {
      for (const { key: name, value: header } of this.resolveDictionary(this.input.components.headers).where(each => !this.processed.has(each.value))) {
        // this.processed.add(header);
      }

      for (const { key: name, value: request } of this.resolveDictionary(this.input.components.requestBodies).where(each => !this.processed.has(each.value))) {
        // this.processed.add(request);

      }
      for (const { key: name, value: response } of this.resolveDictionary(this.input.components.responses).where(each => !this.processed.has(each.value))) {
        // this.processed.add(response);

      }
      for (const { key: name, value: schema } of this.resolveDictionary(this.input.components.schemas).where(each => !this.processed.has(each.value))) {
        // this.processed.add(schema);

      }

    }
    return this.codeModel;
  }
}