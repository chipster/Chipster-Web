import Dataset from "../../../../../model/session/dataset";
import {SessionDataService} from "../../sessiondata.service";
import Job from "../../../../../model/session/job";
import {Component, Input, Output, EventEmitter} from "@angular/core";
import {DatasetModalService} from "../datasetmodal.service";
import {SessionData} from "../../../../../model/session/session-data";

import {DialogModalService} from "../../dialogmodal/dialogmodal.service";
import Tool from "../../../../../model/session/tool";

@Component({
  selector: 'ch-single-dataset',
  templateUrl: './singledataset.html',
  styleUrls: ['./singledataset-component.less'],
})
export class SingleDatasetComponent {

  @Input() dataset: Dataset;
  @Input() private jobs: Map<string, Job>;
  @Input() private sessionData: SessionData;
  @Output() onDelete: EventEmitter<any> = new EventEmitter();
  sourceJob: Job;
  private tool:Tool;


  constructor(private sessionDataService: SessionDataService) {
  }

  ngOnInit() {
    this.sourceJob = this.getSourceJob(this.dataset);
  }

  ngOnChanges(changes: any) {
    this.dataset = changes.dataset.currentValue;
    this.sourceJob = this.getSourceJob(this.dataset);
    this.getUsedToolFromToolset();
  }


  deleteDatasets() {
    this.onDelete.emit();
  }

  exportDatasets() {
    this.sessionDataService.exportDatasets([this.dataset]);
  }



  getSourceJob(dataset: Dataset) {
    return this.sessionDataService.getJobById(dataset.sourceJob, this.jobs);
  }

  getUsedToolFromToolset(){
    let i=this.sessionData.tools.findIndex(x=>x.name.id==this.sourceJob.toolId);
    if(i!=-1) this.tool=this.sessionData.tools[i];
    else{
      console.log('No Tool found with this ID', this.sourceJob.toolId);
    }
    /*
    this.sessionData.tools.forEach(function(tool){
      // imported files don't have sourceJob
      if (self.sourceJob) {
        if(tool.name.id===self.sourceJob.toolId){
          self.tool=tool;
        }
      }
    });
    console.log("input tool"+this.tool);*/
  }
}
