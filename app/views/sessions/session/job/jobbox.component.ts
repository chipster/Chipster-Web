import SelectionService from "../selection.service";
import SessionDataService from "../sessiondata.service";

class JobBoxComponent {

	static $inject = ['SelectionService', 'SessionDataService'];

	constructor(
		private SelectionService: SelectionService,
		private SessionDataService: SessionDataService) {
	}

	deleteJobs() {
		this.SessionDataService.deleteJobs(this.SelectionService.selectedJobs);
	}

	getSelectionService() {
		return this.SelectionService;
	}

	getJob() {
		return this.SelectionService.selectedJobs[0];
	}

	isJobSelected() {
		return this.SelectionService.selectedJobs.length > 0;
	}
}

export default {
	templateUrl: 'app/views/sessions/session/job/job.html',
	controller: JobBoxComponent
}

