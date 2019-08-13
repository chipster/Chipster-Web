import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { AngularSplitModule } from "angular-split";
import { UploadService } from "../../../shared/services/upload.service";
import { SharedModule } from "../../../shared/shared.module";
import { ImportSessionModalComponent } from "../open-session-file/import-session-modal.component";
import { OpenSessionFileComponent } from "../open-session-file/open-session-file.component";
import { SessionListComponent } from "../session-list.component";
import { UserEventService } from "../user-event.service";
import { DatasetService } from "./dataset.service";
import { DialogModalModule } from "./dialogmodal/dialogmodal.module";
import { GetSessionDataService } from "./get-session-data.service";
import { JobErrorModalComponent } from "./job-error-modal/job-error-modal.component";
import { JobService } from "./job.service";
import { ModifiedSessionGuard } from "./modified-session.guard";
import { SelectionHandlerService } from "./selection-handler.service";
import { SelectionPanelComponent } from "./selection-panel/selection-panel.component";
import { DatasetModule } from "./selectiondetails/dataset.module";
import { SessionDataService } from "./session-data.service";
import { SessionDetailsComponent } from "./session-details/session-details.component";
import { SessionEventService } from "./session-event.service";
import { SessionPanelModule } from "./session-panel/session-panel.module";
import { SessionComponent } from "./session.component";
import { SessionService } from "./session.service";
import { ToolSelectionService } from "./tool.selection.service";
import { ToolsModule } from "./tools/tools.module";
import { VisualizationsModule } from "./visualization/visualizations.module";

@NgModule({
  imports: [
    CommonModule,
    VisualizationsModule,
    ToolsModule,
    DatasetModule,
    SharedModule,
    SessionPanelModule,
    NgbModule,
    DialogModalModule,
    AngularSplitModule,
    RouterModule
  ],
  declarations: [
    SessionComponent,
    SessionListComponent,
    OpenSessionFileComponent,
    JobErrorModalComponent,
    SelectionPanelComponent,
    ImportSessionModalComponent,
    SessionDetailsComponent
  ],
  providers: [
    SessionEventService,
    SessionDataService,
    GetSessionDataService,
    SessionService,
    UploadService,
    SelectionHandlerService,
    ToolSelectionService,
    JobService,
    ModifiedSessionGuard,
    UserEventService,
    DatasetService
  ],
  entryComponents: [JobErrorModalComponent, ImportSessionModalComponent]
})
export class SessionModule {}
