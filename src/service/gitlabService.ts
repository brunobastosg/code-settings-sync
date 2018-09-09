"use strict";

import { File } from "./fileService";
import { IRepositoryService } from "./repositoryService";

export class GitlabService implements IRepositoryService {
  public userName: string = null;

  constructor(userToken: string, basePath: string) {
    // TODO: implement
  }

  public AddFile(list: File[], GIST_JSON_B: any) {
    return null;
  }

  public async CreateEmptyGIST(
    publicGist: boolean,
    gistDescription: string
  ): Promise<string> {
    // TODO: implement
    return null;
  }

  public async ReadGist(GIST: string): Promise<any> {
    // TODO: implement
    return null;
  }

  public UpdateGIST(gistObject: any, files: File[]): any {
    // TODO: implement
    return null;
  }

  public async SaveGIST(gistObject: any): Promise<boolean> {
    // TODO: implement
    return null;
  }
}
