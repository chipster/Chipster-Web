import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AdminComponent} from "./admin.component";
import {StatisticsComponent} from "./statistics/statistics.component";
import {ServicesComponent} from "./services/services.component";
import {StorageComponent} from "./storage/storage.component";
import {JobsComponent} from "./jobs/jobs.component";
import {ClientsComponent} from "./clients/clients.component";
import {HistoryComponent} from "./history/history.component";
import {AdminRoutingModule} from "./admin-routing.module";
import { UsersComponent } from './users/users.component';
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    AdminRoutingModule,
  ],
  declarations: [
    AdminComponent, ServicesComponent, ClientsComponent, StorageComponent, JobsComponent, HistoryComponent, StatisticsComponent, UsersComponent,
  ]
})
export class AdminModule { }
