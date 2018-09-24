"use strict";

import Gitlab = require("gitlab/dist/es5");
import { File } from "./fileService";
import { IRepositoryService } from "./repositoryService";

export class GitLabService implements IRepositoryService {
  public userName: string = null;
  public name: string = null;
  private gitlab: Gitlab = null;
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

    this.gitlab = new Gitlab.default(gitlabConfig);

    this.gitlab.Users.current().then(res => {
      this.userName = res.username;
      this.name = res.name;
      console.log("Sync : Connected with user : " + "'" + this.userName + "'");
    });
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
      const res = await this.gitlab.Snippets.create(
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
    const snippet = await this.gitlab.Snippets.show(GIST);
    const gistObj = {
      data: {
        ...snippet,
        owner: {
          login: snippet.author.username
        }
      },
      public: snippet.visibility === "public"
    };
    gistObj.data.files = await this.gitlab.Snippets.content(GIST);
    return gistObj;
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
    const transformedObj = {
      id: gistObject.id,
      title: gistObject.title,
      file_name: gistObject.file_name,
      description: gistObject.description,
      visibility: gistObject.visibility,
      content: JSON.stringify(gistObject.files)
    };
    await this.gitlab.Snippets.edit(transformedObj.id, transformedObj);
    return true;
  }
}
