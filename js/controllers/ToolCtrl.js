/**
 * @desc Tool controller for controlling tool json requests and load the tool
 *       data in UI
 * @example <div ng-controller="ToolCtrl"></div>
 */
chipsterWeb.controller('ToolCtrl', function($scope, $q, ToolRestangular, $filter, Utils, WorkflowGraphService) {

	//initialization
	$scope.activeTab=0;//defines which tab is displayed as active tab in the beginning
	$scope.selectedCategoryIndex = -1;
	$scope.selectedCategory = null;
	$scope.selectedToolIndex = -1;
	
	$scope.getTools = function() {
		var promises = [ ToolRestangular.all('modules').getList(),
				ToolRestangular.all('tools').getList() ];
		$q.all(promises).then(function(response) {
			$scope.modules = response[0].data;
			$scope.tools = response[1].data;
			$scope.categories = $scope.modules[$scope.activeTab].categories;
		});
	};

	$scope.setTab=function($index){
		$scope.activeTab = $index;
		$scope.categories = $scope.modules[$index].categories;
		$scope.selectedCategory = null;
		$scope.selectedCategoryIndex = -1;
	};
	
	$scope.isSet=function($index){
		return $scope.activeTab === $index;
	};
	
	//defines which tool category the user have selected
	$scope.selectCategory = function(category, $index) {
		$scope.selectedCategoryIndex = $index;
		$scope.selectedCategory = category;
	};

	$scope.selectTool = function(toolId, $index) {

		$scope.selectedToolIndex = $index;

		//find the relevant tool
		angular.forEach($scope.tools, function(tool) {
			if(tool.name.id === toolId) {
				$scope.selectedTool = tool;

				if(tool.parameters.length>0){
					$scope.selected_t_parameter_list=tool.parameters;
				}else{
					$scope.enable_t_parameter=false;
				}
			}
		});
	};

	$scope.isRunEnabled = function() {
		return $scope.selectedDatasets.length > 0 && $scope.selectedTool;
	};

	$scope.isParametersEnabled = function() {
		return $scope.selectedTool && $scope.selectedTool.parameters.length > 0
	};

	$scope.isCompatible = function(dataset, type) {

		// other than GENERIC should have more strict checks, like in  ChipsterInputTypes.isTypeOf()
		var alwaysCompatible = ['GENERIC', 'CDNA', 'GENE_EXPRS', 'GENELIST', 'PHENODATA'];

		if (alwaysCompatible.indexOf(type) !== -1) {
			return true;
		}

		var types = {
			// from BasicModule.plugContentTypes()
			TEXT: ['txt', 'dat', 'wee', 'seq', 'log', 'sam', 'fastq'],
			TSV: ['tsv'],
			CSV: ['csv'],
			PNG: ['png'],
			GIF: ['gif'],
			JPEG: ['jpg', 'jpeg'],
			PDF: ['pdf'],
			HTML: ['html', 'html'],
			// from MicroarrayModule.plugContentTypes()
			TRE: ['tre'],
			AFFY: ['cel'],
			BED: ['bed'],
			GTF: ['gtf', 'gff', 'gff2', 'gff3'],
			FASTA: ['fasta', 'fa', 'fna', 'fsa', 'mpfa'],
			FASTQ: ['fastq', 'fq'],
			GZIP: ['gz'],
			VCF: ['vcf'],
			BAM: ['bam'],
			QUAL: ['qual'],
			MOTHUR_OLIGOS: ['oligos'],
			MOTHUR_NAMES: ['names'],
			MOTHUR_GROUPS: ['groups'],
			SFF: ['sff']
		};

		var extension = Utils.getFileExtension(dataset.name);
		return types[type].indexOf(extension) !== -1;
	};

	$scope.bindInputs = function(tool, datasets) {
		// see OperationDefinition.bindInputs()
		//TODO handle multi-inputs

		var jobInputs = [];
		for (var j = 0; j < tool.inputs.length; j++) {
			var toolInput = tool.inputs[j];

			if (toolInput.type === 'PHENODATA') {
				// should we check that it exists?
				continue;
			}

			var found = false;

			for (var i = 0; i < datasets.length; i++) {

				var dataset = datasets[i];
				if ($scope.isCompatible(dataset, toolInput.type.name)) {
					console.log(toolInput);
					var jobInput = {
						inputId: toolInput.name.id,
						description: toolInput.description,
						datasetId: dataset.datasetId,
						displayName: dataset.name
					};
					jobInputs.push(jobInput);
					found = true;
					break;
				}
			}
			if (!found) {
				// suitable datasets not found
				return null;
			}
		}
		return jobInputs;
	};

	// Method for submitting a job
	$scope.runJob = function () {

		var newJob = {
			toolId: $scope.selectedTool.name.id,
			toolCategory: $scope.selectedCategory.name,
			toolName: $scope.selectedTool.name.displayName,
			toolDescription: $scope.selectedTool.description,
			state: 'NEW',
			inputs: $scope.bindInputs($scope.selectedTool, $scope.selectedDatasets)
		};

		console.log(newJob);

		$scope.$broadcast('changeNodeCheck', {});

		// Calculate the possible progress node position from
		// the input datasets positions
		var progressNode = WorkflowGraphService
			.getProgressNode($scope.selectedDatasets);

		// Show the running job progress
		var progressLinks = WorkflowGraphService
			.createDummyLinks($scope.selectedDatasets,
				progressNode);

		// As progress spinner node, we just need to send the
		// progress node info as other input nodes are already
		// creating the json data for progress showing node and
		// links from the input nodes
		var dummyLinkData = {
			node: progressNode,
			dummyLinks: progressLinks
		};

		// Sending event for drawing dummyLinks
		$scope.$broadcast('addDummyLinks', {
			data: dummyLinkData
		});
		// Sending event for adding progress spinner
		$scope.$broadcast('addProgressBar', {
			data: progressNode
		});

		var postJobUrl = $scope.sessionUrl.one('jobs');
		postJobUrl.customPOST(newJob).then(function (response) {
			console.log(response);
		});

		// when job finished event is received,remove the
		// progressbar
		setTimeout(function () {
			$scope.$broadcast('removeProgressBar', {});
		}, 10000);
	};
});


/**
 * Filter function to search for tool
 */

chipsterWeb.filter('searchFor',function(){
	
	return function(arr,searchTool){
		if(!searchTool)
			return arr;
	
	var result=[];
	angular.forEach(arr,function(item){
		
		if(item.name.indexOf(searchTool)!==-1){
			result.push(item);
		}
	});
	
	console.log(result);
	return result;
	}
	
});
