import FileResource from "../../../../../shared/resources/fileresource";
import SessionDataService from "../../sessiondata.service";
import Dataset from "../../../../../model/session/dataset";
import {Component, Input, Inject} from "@angular/core";
import {Response} from "@angular/http";
import VisualizationModalService from "../visualizationmodal.service";

@Component({
  selector: 'ch-text-visualization',
  template: `
    <p *ngIf="!data">Loading data...</p>
    
    <div *ngIf="data">
      <label *ngIf="!isCompleteFile()">Showing {{getSizeShown() | bytes}} of {{getSizeFull() | bytes}}</label>
      <a class="pull-right" (click)="showAll()" *ngIf="!isCompleteFile()">Show all</a>
      <pre>{{data}}</pre>
    </div>
  `,

  styles: [`
    pre {
      background-color: white;
    }
  `],
})
export class TextVisualizationComponent {

  @Input() dataset: Dataset;
  @Input() showFullData: boolean;

  private data: string;

  fileSizeLimit = 10 * 1024;

  constructor(@Inject('FileResource') private fileResource: FileResource,
              @Inject('SessionDataService') private sessionDataService: SessionDataService,
              @Inject('VisualizationModalService') private visualizationModalService: VisualizationModalService) {
  }

  ngOnInit() {
    let maxBytes = this.showFullData ? -1 : this.fileSizeLimit;

    this.fileResource.getData(this.sessionDataService.getSessionId(), this.dataset.datasetId, maxBytes).subscribe((response: any) => {
      this.data = response;
    }, (error: Response) => {
      console.error(error);
    });
  }

  getSizeShown() {
    if (this.data) {
      return this.data.length;
    }
  }

  getSizeFull() {
    return this.dataset.size;
  }

  isCompleteFile() {
    return this.getSizeShown() === this.getSizeFull();
  }

  showAll() {
    this.visualizationModalService.openVisualizationModal(this.dataset, 'text');
  }

}
