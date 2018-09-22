"use strict";

import { Snippets } from "gitlab";
import { File } from "./fileService";
import { IRepositoryService } from "./repositoryService";

export class GitLabService implements IRepositoryService {
  public userName: string = null;
  private gitlab: Snippets = null;
  private GIST_JSON_EMPTY = {
    description: "Visual Studio Code Sync Settings Snippet",
    visibility: "private",
    files: {
      "settings.json": {
        content: "// Empty"
      },
      "launch.json": {
        content: "// Empty"
      },
      "keybindings.json": {
        content: "// Empty"
      },
      "extensions.json": {
        content: "// Empty"
      },
      "locale.json": {
        content: "// Empty"
      },
      "keybindingsMac.json": {
        content: "// Empty"
      },
      cloudSettings: {
        content: "// Empty"
      }
    }
  };

  constructor(userToken: string, basePath: string) {
    const gitlabConfig = {
      url: basePath || "https://gitlab.com",
      token: userToken
    };

    this.gitlab = new Snippets(gitlabConfig);
  }

  public AddFile(list: File[], GIST_JSON_B: any) {
    for (const file of list) {
      if (file.content !== "") {
        GIST_JSON_B.files[file.gistName] = {};
        GIST_JSON_B.files[file.gistName].content = file.content;
      }
    }
    return GIST_JSON_B;
  }

  public async CreateEmptyGIST(
    publicGist: boolean,
    gistDescription: string
  ): Promise<string> {
    if (publicGist) {
      this.GIST_JSON_EMPTY.visibility = "public";
    } else {
      this.GIST_JSON_EMPTY.visibility = "private";
    }
    if (gistDescription !== null && gistDescription !== "") {
      this.GIST_JSON_EMPTY.description = gistDescription;
    }

    try {
      const res = await this.gitlab.create(
        this.GIST_JSON_EMPTY.description,
        "vscode-settings",
        JSON.stringify(this.GIST_JSON_EMPTY.files),
        this.GIST_JSON_EMPTY.visibility
      );
      if (res.id) {
        return res.id.toString();
      } else {
        console.error("ID is null");
        console.log("Sync : " + "Response from GitLab is: ");
        console.log(res);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  public async ReadGist(GIST: string): Promise<any> {
    return await this.gitlab.show(GIST);
  }

  public UpdateGIST(gistObject: any, files: File[]): any {
    const allFiles: string[] = Object.keys(gistObject.data.files);
    for (const fileName of allFiles) {
      let exists = false;

      for (const settingFile of files) {
        if (settingFile.gistName === fileName) {
          exists = true;
        }
      }

      if (!exists && !fileName.startsWith("keybindings")) {
        gistObject.data.files[fileName] = null;
      }
    }

    gistObject.data = this.AddFile(files, gistObject.data);
    return gistObject;
  }

  public async SaveGIST(gistObject: any): Promise<boolean> {
    await this.gitlab.edit(gistObject.id, {}); // TODO: debug to see what kind of object 'gistObject' is
    return true;
  }
}
