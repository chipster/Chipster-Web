// Super class for scatterplot and volcanoplot

import { OnChanges, Input, HostListener, OnDestroy } from "@angular/core";
import { FileResource } from "../resources/fileresource";
import { SessionDataService } from "../../views/sessions/session/session-data.service";
import { Dataset } from "chipster-js-common";
import TSVFile from "../../model/tsv/TSVFile";
import { PlotData } from "../../views/sessions/session/visualization/model/plotData";
import * as d3 from "d3";
import Point from "../../views/sessions/session/visualization/model/point";
import TSVRow from "../../model/tsv/TSVRow";
import { RestErrorService } from "../../core/errorhandler/rest-error.service";
import { AppInjector } from "../../app-injector";
import { Subject } from "rxjs/Subject";
import { LoadState, State } from "../../model/loadstate";

export abstract class PlotComponent implements OnChanges, OnDestroy {
  @Input()
  dataset: Dataset;
  tsv: TSVFile;
  plotData: Array<PlotData> = [];
  plot;
  svg;
  selectedXAxisHeader: string;
  selectedYAxisHeader: string;
  dataSelectionModeEnable = false;
  dragStartPoint: Point;
  dragEndPoint: Point;
  selectedDataPointIds: Array<string>;
  selectedDataRows: Array<TSVRow> = [];
  startPoint: Point;
  svgPadding = 50;
  protected fileResource: FileResource;
  protected sessionDataService: SessionDataService;
  private restErrorService: RestErrorService;

  protected unsubscribe: Subject<any> = new Subject();
  state: LoadState;

  constructor(
    fileResource: FileResource,
    sessionDataService: SessionDataService
  ) {
    this.fileResource = fileResource;
    this.sessionDataService = sessionDataService;
    this.restErrorService = AppInjector.get(RestErrorService);
  }

  ngOnChanges() {
    // unsubscribe from previous subscriptions
    this.unsubscribe.next();
    this.state = new LoadState(State.Loading, "Loading data...");

    this.clearPlot();

    const rowLimit = 5000;
    const datasetName = this.dataset.name;

    // Get the file, this can be in a shared dataservice
    this.fileResource
      .getData(this.sessionDataService.getSessionId(), this.dataset)
      .takeUntil(this.unsubscribe)
      .subscribe(
        (result: any) => {
          const parsedTSV = d3.tsvParseRows(result);
          this.tsv = new TSVFile(
            parsedTSV,
            this.dataset.datasetId,
            datasetName
          );
          if (this.tsv.body.size() > rowLimit) {
            this.state = new LoadState(
              State.Fail,
              "Plot Visualization is not allowed for TSV files with more than 5000 data points"
            );
          } else {
            this.checkTSVHeaders(); // will set this.state
          }
        },
        (error: any) => {
          this.state = new LoadState(State.Fail, "Loading data failed");
          this.restErrorService.showError(this.state.message, error);
        }
      );
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  /** @description To check whether the file has the required column headers to create the visualization**/
  checkTSVHeaders() {}
  /** @description Extract the data to draw the plot**/
  populatePlotData() {}

  /** @description manipulation of the svg**/
  drawPlot() {
    this.dataSelectionModeEnable = false;

    // creating drag element
    const drag = d3.drag();
    this.svg.call(drag);

    // Creating the selection area
    const dragGroup = this.svg.append("g").attr("id", "dragGroup");

    const band = dragGroup
      .append("rect")
      .attr("width", 0)
      .attr("height", 0)
      .attr("x", 0)
      .attr("y", 0)
      .attr("class", "band")
      .attr("id", "band")
      .style("fill", "none")
      .style("stroke", "blue")
      .style("stroke-width", 1);

    const bandPos = [-1, -1];
    this.startPoint = new Point(-1, -1);

    // Register for drag handlers
    drag.on("drag", () => {
      this.dataSelectionModeEnable = true; // change the tab for showing selected gene
      const pos = d3.mouse(document.getElementById("dragGroup"));
      const endPoint = new Point(pos[0], pos[1]);
      if (endPoint.x < this.startPoint.x) {
        d3.select(".band").attr(
          "transform",
          "translate(" + endPoint.x + "," + this.startPoint.y + ")"
        );
      }
      if (endPoint.y < this.startPoint.y) {
        d3.select(".band").attr(
          "transform",
          "translate(" + endPoint.x + "," + this.startPoint.y + ")"
        );
      }
      if (endPoint.y < this.startPoint.y && endPoint.x > this.startPoint.x) {
        d3.select(".band").attr(
          "transform",
          "translate(" + this.startPoint.x + "," + endPoint.y + ")"
        );
      }

      // Set new position of band
      if (this.startPoint.x === -1) {
        this.startPoint = new Point(endPoint.x, endPoint.y);
        d3.select(".band").attr(
          "transform",
          "translate(" + this.startPoint.x + "," + this.startPoint.y + ")"
        );
      }
      d3.select(".band")
        .transition()
        .duration(1)
        .attr("width", Math.abs(this.startPoint.x - endPoint.x))
        .attr("height", Math.abs(this.startPoint.y - endPoint.y));
    });

    drag.on("end", () => {
      const pos = d3.mouse(document.getElementById("dragGroup"));
      const endPoint = new Point(pos[0], pos[1]);
      // need to get the points that included in the band
      if (
        this.startPoint.x !== -1 &&
        this.startPoint.y !== -1 &&
        (this.startPoint.x !== endPoint.x && this.startPoint.y !== endPoint.y)
      ) {
        // this.resetSelections();
        // define the points that are within the drag boundary
        this.dragEndPoint = new Point(endPoint.x, endPoint.y);
        this.dragStartPoint = new Point(this.startPoint.x, this.startPoint.y);
        this.getSelectedDataSet();
        this.resetSelectionRectangle();
      }
    });
  }

  resetSelectionRectangle() {
    this.startPoint = new Point(-1, -1);
    d3.select(".band")
      .attr("width", 0)
      .attr("height", 0)
      .attr("x", 0)
      .attr("y", 0);
  }
  getSelectedDataSet() {}

  setSelectionStyle(id: string) {}

  removeSelectionStyle(id: string) {}

  resetSelections(): void {
    for (const id of this.selectedDataPointIds) {
      this.removeSelectionStyle(id);
    }
    this.selectedDataRows = [];
  }

  setXAxisHeader(event) {
    this.selectedXAxisHeader = event;
    this.redrawPlot();
  }

  setYAxisHeader(event) {
    this.selectedYAxisHeader = event;
    this.redrawPlot();
  }

  abstract redrawPlot();

  clearPlot() {
    if (this.plot) {
      this.plot.selectAll("svg").remove();
    }
  }

  /** @description New Dataset Creation  from selected data points **/
  createDatasetFromSelected() {}

  // Redraw the svg with the changed width of the window
  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.redrawPlot();
  }
}
