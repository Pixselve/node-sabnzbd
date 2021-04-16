import got from "got";
import { URL } from "url";
import { Queue } from "./Queue";
import { History } from "./History";

export class SABnzbd {
  private readonly url: URL;

  /**
   * Base SABnzbd class
   * @param host SABnzbd Host
   * @param port SABnzbd Port
   * @param apiKey API Key
   * @example
   *
   * # Instantiating a new class
   * ```ts
   * new SABnzbd("127.0.0.1", "8080", "6e961fd677a74326a07f1df4c06e3f38")
   * ```
   */
  constructor(
    private readonly host: string,
    private readonly port: string,
    private readonly apiKey: string
  ) {
    this.url = new URL(`http://${host}:${port}/sabnzbd/api`);
    this.url.searchParams.set("apikey", this.apiKey);
    this.url.searchParams.set("output", "json");
  }

  /**
   * Get version of running SABnzbd
   */
  public async version(): Promise<string> {
    const params = new URLSearchParams({ mode: "version" });
    const { version } = (await this.request(params)) as { version: string };
    return version;
  }

  /**
   * Add NZB by URL
   * @param url URL-encoded version of the link to the NZB to be fetched
   * @param params Input parameter
   */
  public async addURL(
    url: string,
    params: AddURLParams = {}
  ): Promise<string[]> {
    const searchParams = new URLSearchParams({ mode: "addurl", name: url });
    for (let paramsKey in params) {
      if (params.hasOwnProperty(paramsKey)) {
        searchParams.set(paramsKey, params[paramsKey]);
      }
    }
    const { nzo_ids } = (await this.request(searchParams)) as {
      status: boolean;
      nzo_ids: string[];
    };
    return nzo_ids;
  }

  /**
   * Full queue output with details about all jobs.
   * @param ids Filter jobs by ids
   */
  public async queue(ids?: string[]): Promise<Queue> {
    const searchParams = new URLSearchParams({ mode: "queue" });
    if (ids) {
      searchParams.set("nzo_ids", ids.join(","));
    }
    const { queue } = (await this.request(searchParams)) as { queue: Queue };
    return queue;
  }

  /**
   * Add NZB by URL and wait for it to finish download. It will throw if the download is paused.
   * @param url URL-encoded version of the link to the NZB to be fetched
   * @param params Input parameter
   */
  public async addFileAndWaitTillFinish(
    url: string,
    params: AddURLParams = {}
  ): Promise<string[]> {
    const ids = await this.addURL(url, params);
    while (true) {
      if (await this.isDownloadFinished(ids)) {
        return ids;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    // let isDownloading = false;
    // while (true) {
    //   const queue = await this.queue(ids);
    //   if (queue.status === "Downloading") {
    //     isDownloading = true;
    //   } else if (queue.status === "Idle" && isDownloading) {
    //     break;
    //   } else if (queue.status !== "Idle") {
    //     return reject;
    //   }
    //   await new Promise(resolve => setTimeout(resolve, 1000));
    // }
    // while (true) {
    //   const history = await this.history(ids);
    //   let everythingFinished = true;
    //   for (let slot of history.slots) {
    //     if (slot.status === "Failed") {
    //       return reject;
    //     } else if (slot.status !== "Completed") {
    //       everythingFinished = false;
    //     }
    //   }
    //   if (everythingFinished) {
    //     return resolve(ids);
    //   }
    //   await new Promise(resolve => setTimeout(resolve, 1000));
    // }
  }

  public async isDownloadFinished(ids: string[]): Promise<boolean> {
    //  Check the queue
    const queue = await this.queue(ids);
    if (queue.slots.length > 0) return false;
    //  Check the history
    const history = await this.history(ids);
    for (let slot of history.slots) {
      if (slot.status === "Failed") throw new Error("download failed");
      if (slot.status !== "Completed") return false;
    }
    return true;
  }

  /**
   * Full history output with details about all jobs.
   * @param ids Filter jobs by ids
   */
  public async history(ids: string[] = []): Promise<History> {
    const searchParams = new URLSearchParams({ mode: "history" });
    if (ids.length > 0) {
      searchParams.set("nzo_ids", ids.join(","));
    }
    const { history } = (await this.request(searchParams)) as {
      history: History;
    };
    return history;
  }

  private async request(params: URLSearchParams): Promise<unknown> {
    const url = new URL(this.url.toString());
    params.forEach((value, key) => url.searchParams.set(key, value));
    const { body } = await got.post(url, { responseType: "json" });
    return body;
  }
}

export interface AddURLParams {
  /**
   * Name of the job, if empty the NZB filename is used.
   */
  nzbname?: string;
  /**
   * Password to use when unpacking the job (new in 3.0.0+).
   */
  password?: string;
  /**
   * Category to be assigned, * means Default. List of available categories can be retrieved from get_cats.
   */
  cat?: string;
  /**
   * Script to be assigned, Default will use the script assigned to the category. List of available scripts can be retrieved from get_scripts.
   */
  script?: string;
  /**
   * Priority to be assigned:
   * - -100 = Default Priority (of category)
   * - -3 = Duplicate
   * - -2 = Paused
   * - -1 = Low Priority
   * - 0 = Normal Priority
   * - 1 = High Priority
   * - 2 = Force
   */
  priority?: number;
  /**
   * Post-processing options:
   * - -1 = Default (of category)
   * - 0 = None
   * - 1 = +Repair
   * - 2 = +Repair/Unpack
   * - 3 = +Repair/Unpack/Delete
   */
  pp?: number;
}
