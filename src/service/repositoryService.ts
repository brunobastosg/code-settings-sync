"use strict";

import { File } from "./fileService";

export interface IRepositoryService {
  userName: string;

  AddFile(list: File[], GIST_JSON_B: any): any;

  CreateEmptyGIST(
    publicGist: boolean,
    gistDescription: string
  ): Promise<string>;

  ReadGist(GIST: string): Promise<any>;

  UpdateGIST(gistObject: any, files: File[]): any;

  SaveGIST(gistObject: any): Promise<boolean>;
}
