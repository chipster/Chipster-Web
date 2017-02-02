import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {WorkflowGraphComponent} from "./workflowgraph/workflowgraph.component";
import {SharedModule} from "../../../../shared/shared.module";
import WorkflowGraphService from "./workflowgraph/workflowgraph.service";
import {LeftPanelComponent} from "./leftpanel.component";
import {FormsModule} from "@angular/forms";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {SessionEditModalComponent} from "./sessioneditmodal/sessioneditmodal.component";

@NgModule({
  imports: [ CommonModule, SharedModule, FormsModule, NgbModule ],
  declarations: [WorkflowGraphComponent, LeftPanelComponent, SessionEditModalComponent],
  providers: [WorkflowGraphService],
  exports: [LeftPanelComponent]
})
export class LeftPanelModule { }
