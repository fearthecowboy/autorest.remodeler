import { Model as oai3, Dereferenced, dereference, Refable, includeXDash, } from '@azure-tools/openapi'
import * as OpenAPI from '@azure-tools/openapi';
import { items, values, Dictionary, ToDictionary } from '@azure-tools/linq';
import { HttpMethod, CodeModel, Operation, Http } from '@azure-tools/codemodel';
import { shadow, enableSourceTracking } from '@azure-tools/codegen';
import { ExternalDocumentation } from '@azure-tools/codemodel/dist/model/common/external-documentation';
import { Host, Session } from '@azure-tools/autorest-extension-base';
import { Interpretations } from './interpretations'


export function getExtensionProperties(dictionary: Dictionary<any>): Dictionary<any> {
  return ToDictionary(includeXDash(dictionary), each => dictionary[each]);
}



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
        extensions: getExtensionProperties(i)
      },
      extensions: getExtensionProperties(this.input)
    });
    this.interpret = new Interpretations(session, this.codeModel);

  }

  private processed = new Set<any>();
  private should<T>(original: T | undefined): original is T {
    if (original) {
      if (this.processed.has(original)) {
        return false;
      }
      this.processed.add(original);
      return true;
    }
    return false;
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

  async processOperation(operation: OpenAPI.HttpOperation | undefined, httpMethod: string, path: string, pathItem: OpenAPI.PathItem) {
    if (this.should(operation)) {
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

      this.resolveArray(operation.parameters).select(parameter => {
        const schema = this.resolve(parameter.schema);

      })

      /// new Operation(operation.operationId)
    }
  }

  async process() {
    if (this.input.paths) {
      for (const { key: path, value: pathItem } of this.resolveDictionary(this.input.paths).where(each => !this.processed.has(each.value))) {
        this.processed.add(pathItem);
        for (const httpMethod of [HttpMethod.Delete, HttpMethod.Get, HttpMethod.Head, HttpMethod.Options, HttpMethod.Patch, HttpMethod.Post, HttpMethod.Put, HttpMethod.Trace]) {
          await this.processOperation(pathItem[httpMethod], httpMethod, path, pathItem);
        }
      }
    }
    if (this.input.components) {
      for (const { key: name, value: header } of this.resolveDictionary(this.input.components.headers).where(each => !this.processed.has(each.value))) {
        this.processed.add(header);
      }

      for (const { key: name, value: request } of this.resolveDictionary(this.input.components.requestBodies).where(each => !this.processed.has(each.value))) {
        this.processed.add(request);

      }
      for (const { key: name, value: response } of this.resolveDictionary(this.input.components.responses).where(each => !this.processed.has(each.value))) {
        this.processed.add(response);

      }
      for (const { key: name, value: schema } of this.resolveDictionary(this.input.components.schemas).where(each => !this.processed.has(each.value))) {
        this.processed.add(schema);

      }

    }
    return this.codeModel;
  }
}