import {Injectable, ChangeDetectorRef} from "@angular/core";
import {SessionResource} from "../resources/session.resource";
import {TokenService} from "../../core/authentication/token.service";
import {ConfigService} from "./config.service";
import {Observable} from 'rxjs/Rx';
import Dataset from "../../model/session/dataset";

declare let Flow: any;

@Injectable()
export class UploadService {

  constructor(
    private ConfigService: ConfigService,
    private tokenService: TokenService,
    private sessionResource: SessionResource) {
  }

  getFlow(fileAdded: (file: any, event: any, flow: any) => any, fileSuccess: (file: any) => any) {
    let flow = new Flow({
      // continuation from different browser session not implemented
      testChunks: false,
      method: 'octet',
      uploadMethod: 'PUT',
      // upload the chunks in order
      simultaneousUploads: 1,
      // don't spend time between requests too often
      chunkSize: 50000000,
      // accept 204 No content
      successStatuses: [200, 201, 202, 204],
      // fail on 409 Conflict
      permanentErrors: [404, 409, 415, 500, 501],
      // make numbers easier to read (default 500)
      progressCallbacksInterval: 1000,
      // manual's recommendation for big files
      speedSmoothingFactor: 0.02,
      // allow the same file to be uploaded again
      allowDuplicateUploads: true
    });

    if (!flow.support) {
      throw Error("flow.js not supported");
    }

    flow.on('fileAdded', (file, event) => {
      //console.log(file, event);
      this.flowFileAdded(file, event, flow);
      fileAdded(file, event, flow);
    });
    // noinspection JSUnusedLocalSymbols
    flow.on('fileSuccess', (file, message) => {
      //console.log(file, message);
      fileSuccess(file);
    });
    flow.on('fileError', (file, message) => {
      console.log(file, message);
    });

    return flow;
  }

  // noinspection JSMethodCanBeStatic
  private flowFileAdded(file: any, event: any, flow: any) {

    // each file has a unique target url
    flow.opts.target = function (file: any) {
      return file.chipsterTarget;
    };

    file.pause();
  }

  startUpload(sessionId: string, file: any) {
    Observable.forkJoin(
      this.ConfigService.getFileBrokerUrl(),
      this.createDataset(sessionId, file.name)

    ).subscribe((value: [string, Dataset]) => {
      let url = value[0];
      let dataset = value[1];
      file.chipsterTarget = `${url}/sessions/${sessionId}/datasets/${dataset.datasetId}?token=${this.tokenService.getToken()}`;
      file.chipsterSessionId = sessionId;
      file.chipsterDatasetId = dataset.datasetId;
      file.resume();
    });
  }

  private createDataset(sessionId: string, name: string): Observable<Dataset> {
    let d = new Dataset(name);
    return this.sessionResource.createDataset(sessionId, d).map((datasetId: string) => {
      d.datasetId = datasetId;
      this.sessionResource.updateDataset(sessionId, d);
      return d;
    });
  }

  /**
   * We have to poll the upload progress, because flow.js doesn't send events about it.
   *
   * Schedule a next view update after a second as long as flow.js has files.
   */
  scheduleViewUpdate(changeDetectorRef: ChangeDetectorRef, flow: any) {
    Observable.timer(1000).subscribe(() => {
      changeDetectorRef.detectChanges();

      if (flow.files.length > 0) {
        this.scheduleViewUpdate(changeDetectorRef, flow);
      }
    });
  }
}
