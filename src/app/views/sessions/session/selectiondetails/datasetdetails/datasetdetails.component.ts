import SelectionService from "../../selection.service";
import SessionDataService from "../../sessiondata.service";
import {Component, Output, EventEmitter} from "@angular/core";

@Component({
  selector: 'ch-dataset-details',
  templateUrl: './datasetdetails.html',
  styleUrls: ['./datasetdetails.less']
})
export class DatasetDetailsComponent {

  @Output() onDelete: EventEmitter<any> = new EventEmitter();

	constructor(
		private selectionService: SelectionService,
		private SessionDataService: SessionDataService) {
	}

  deleteDatasets() {
    this.onDelete.emit();
  }

	exportDatasets() {
		this.SessionDataService.exportDatasets(this.selectionService.selectedDatasets);
	}
}
