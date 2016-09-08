import upgradeAdapter from "upgradeadapter";
import { HTTP_PROVIDERS } from '@angular/http';
import './rxjs-operators';

import Login from "./views/login/login.component";
import NavigationController from "./views/navigation/navigation.controller";
import AuthenticationService from "./authentication/authenticationservice";
import ConfigService from "./services/config.service";
import ConfigurationResource from "./resources/configurationresource";
import RouteConfiguration from "./routes.config";
import ChipsterRun from "./app.run";
import ToolResource from "./resources/toolresource";
import UtilsService from "./services/utils.service";
import WorkflowGraphService from "./views/sessions/session/workflow/workflowgraph.service";
import SessionEventService from "./views/sessions/session/sessionevent.service";
import SessionDataService from "./views/sessions/session/sessiondata.service";
import SelectionService from "./views/sessions/session/selection.service";
import DatasetBoxComponent from "./views/sessions/session/dataset/datasetbox.component";
import JobBoxComponent from "./views/sessions/session/job/jobbox.component";
import searchDatasetFilter from "./common/filter/searchdataset.filter";
import FileResource from "./resources/fileresource";
import ToolsBoxComponent from "./views/sessions/session/tools/toolsbox.component";
import TableService from "./services/tableservice.factory";
import ToolService from "./views/sessions/session/tools/tool.service";
import bytes from "./common/filter/bytes.filter";
import categoryFilter from "./common/filter/category.filter";
import moduleFilter from "./common/filter/module.filter";
import toolFilter from "./common/filter/tool.filter";
import AddDatasetModalController from "./views/sessions/session/workflow/adddatasetmodal/adddatasetmodal.controller";
import secondsFilter from "./common/filter/seconds.filter";
import ParameterModalController from "./views/sessions/session/tools/parametermodal/parametermodal.controller";
import textVisualization from "./views/sessions/session/visualization/textvisualization/textvisualization.component";
import spreadsheetVisualization from "./views/sessions/session/visualization/spreadsheetvisualization/spreadsheetvisualization.component";
import imageVisualization from "./views/sessions/session/visualization/imagevisualization/imagevisualization.directive";
import htmlVisualization from "./views/sessions/session/visualization/htmlvisualization/htmlvisualization.component";
import toolCircle from "./views/sessions/session/tools/toolcircle.directive";
import phenodataVisualization from "./views/sessions/session/visualization/phenodata/phenodatavisualization.component";
import pdfVisualization from "./views/sessions/session/visualization/pdf/pdfvisualization.component";
import workflowGraph from "./views/sessions/session/workflow/workflowgraph.component";
import SourceModalController from "./views/sessions/session/tools/sourcemodal/sourcemodal.controller";
import SessionEditModalController from "./views/sessions/session/sessioneditmodal/sessioneditmodal.controller";
import JobErrorModalController from "./views/sessions/session/joberrormodal/joberrormodal.controller";
import SessionResource from "./resources/session.resource";
import DatasetHistoryModalController from "./views/sessions/session/datasethistorymodal/datasethistorymodal.controller";
import sessionList from "./views/sessions/sessionlist.component";
import ParameterListComponent from "./views/sessions/session/dataset/parameterlist.component";
import Visualization from "./views/sessions/session/visualization/visualization";
import VisualizationBoxComponent from "./views/sessions/session/visualization/visualizationbox.component";
import SessionComponent from "./views/sessions/session/session.component";
import SingleDatasetComponent from "./views/sessions/session/dataset/singledataset.component";



angular.module('chipster-web', ['ngRoute', 'ngResource', 'LocalStorageModule', 'ngAnimate', 'flow', 'restangular',
        'ngWebSocket', 'angularResizable', 'ui.bootstrap',
        'pdf', 'ngHandsontable'])

    .component('login', Login)
    .controller('NavigationController', NavigationController)
    .component('datasetBox', DatasetBoxComponent)
    .component('jobBox', JobBoxComponent)
    .component('toolsBox', ToolsBoxComponent)
    .controller('AddDatasetModalController', AddDatasetModalController)
    .controller('ParameterModalController', ParameterModalController)
    .controller('SourceModalController', SourceModalController)
    .controller('SessionEditModalController', SessionEditModalController)
    .controller('DatasetHistoryModalController', DatasetHistoryModalController)
    .controller('JobErrorModalController', JobErrorModalController)
    .service('AuthenticationService', AuthenticationService)
    .service('ConfigService', ConfigService)
    .factory('ConfigurationResource', upgradeAdapter.downgradeNg2Provider(ConfigurationResource))
    .service('ToolResource', ToolResource)
    .service('SessionEventService', SessionEventService)
    .service('SessionResource', SessionResource)
    .service('SessionDataService', SessionDataService)
    .service('SelectionService', SelectionService)
    .service('FileResource', FileResource)
    .service('Utils', UtilsService)
    .service('WorkflowGraphService', WorkflowGraphService)
    .service('TableService', TableService)
    .service('ToolService', ToolService)
    .filter('searchDatasetFilter', searchDatasetFilter)
    .filter('bytes', bytes)
    .filter('categoryFilter', categoryFilter)
    .filter('moduleFilter', moduleFilter)
    .filter('toolFilter', toolFilter)
    .filter('seconds',secondsFilter)
    .directive('imageVisualization', imageVisualization)
    .directive('toolCircle', toolCircle)
    // cast to 'any' to hide type errors about bindings https://github.com/DefinitelyTyped/DefinitelyTyped/issues/9122
    .component('spreadsheetVisualization', <any>spreadsheetVisualization)
    .component('textVisualization', <any>textVisualization)
    .component('pdfVisualization', <any>pdfVisualization)
    .component('htmlVisualization', <any>htmlVisualization)
    .component('phenodataVisualization', <any>phenodataVisualization)
    .component('workflowGraph', <any>workflowGraph)
    .component('sessionList', <any>sessionList)
    .component('parameterList', ParameterListComponent)
    .component('visualizationBox', VisualizationBoxComponent)
    .component('session', SessionComponent)
    .component('singleDataset', SingleDatasetComponent)
    .config(RouteConfiguration)
    .run(ChipsterRun);


angular.module('chipster-web').config(
    function(flowFactoryProvider: any) {

        flowFactoryProvider.defaults = {
            // continuation from different browser session not implemented
            testChunks : false,
            method : 'octet',
            uploadMethod : 'PUT',
            // upload the chunks in order
            simultaneousUploads : 1,
            // don't spend time between requests too often
            chunkSize : 50000000,
            // fail on 409 Conflict
            permanentErrors : [ 404, 409, 415, 500, 501 ],
            // make numbers easier to read (default 500)
            progressCallbacksInterval : 1000,
            // manual's recommendation for big files
            speedSmoothingFactor : 0.02
        };
        /*
         * flowFactoryProvider.on('catchAll', function(event) {
         * console.log('catchAll', arguments); });
         */
        // process errors here, because the error callback in html file
        // doesn't have the chunk parameter
        flowFactoryProvider.on('error', function(msg: string, file: any, chunk: any) {
            file.errorMessage = chunk.xhr.status + ' '
                + chunk.xhr.statusText + ': ' + msg;
            file.errorMessageDetails = chunk.xhr.responseURL;
        });

    });


upgradeAdapter.addProvider(ConfigurationResource);
upgradeAdapter.addProvider(HTTP_PROVIDERS);
upgradeAdapter.bootstrap(document.documentElement, ['chipster-web']);
