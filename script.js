var PxrJSON = {};

var template = document.querySelector('#CustomPxrPatternNode').innerHTML;

var colorSocket = new Rete.Socket("color");
var intSocket = new Rete.Socket("int");
var floatSocket = new Rete.Socket("float");
var normalSocket = new Rete.Socket("normal");
var pointSocket = new Rete.Socket("point");
var stringSocket = new Rete.Socket("string");
var structSocket = new Rete.Socket("struct");
var vectorSocket = new Rete.Socket("vector");
var noconnectSocket = new Rete.Socket("noconnect");

var numSocket = new Rete.Socket("Number");

numSocket.combineWith(colorSocket);
numSocket.combineWith(normalSocket);
numSocket.combineWith(pointSocket);
numSocket.combineWith(vectorSocket);
numSocket.combineWith(structSocket);


var VueNumControl = {
  props: ['readonly', 'defaultVal', 'emitter', 'ikey', 'getData', 'putData'],
  template: '<input type="text" :readonly="readonly" :value="value" @input="change($event)" @dblclick.stop=""/>',
  data() {
    return {
      value: 0,
    }
  },
  methods: {
    change(e){
      this.value = e.target.value;
      this.update();
    },
    update() {
      if (this.ikey)
        this.putData(this.ikey, this.value)
      this.emitter.trigger('process');
    }
  },
  mounted() {
    this.value = this.getData(this.ikey);
	let val = this.getData(this.ikey);
	this.value =  val === undefined ? this.defaultVal : val;
	this.update();
  }
}

var VueIntControl = {
  props: ['readonly', 'defaultVal', 'emitter', 'ikey', 'getData', 'putData'],
  template: '<input type="number" :readonly="readonly" :value="value" @input="change($event)" @dblclick.stop=""/>',
  data() {
    return {
      value: 0,
    }
  },
  methods: {
    change(e){
      this.value = e.target.value;
      this.update();
    },
    update() {
      if (this.ikey)
        this.putData(this.ikey, this.value)
      this.emitter.trigger('process');
    }
  },
  mounted() {
    this.value = this.getData(this.ikey);
	let val = this.getData(this.ikey);
	this.value =  val === undefined ? this.defaultVal : val;
	this.update();
  }
}

var VueFloatControl = {
  props: ['readonly', 'defaultVal', 'emitter', 'ikey', 'getData', 'putData'],
  template: '<input type="number" step="0.01" :readonly="readonly" :value="value" @input="change($event)" @dblclick.stop=""/>',
  data() {
    return {
      value: 0,
    }
  },
  methods: {
    change(e){
      this.value = e.target.value;
      this.update();
    },
    update() {
      if (this.ikey)
        this.putData(this.ikey, this.value)
      this.emitter.trigger('process');
    }
  },
  mounted() {
    this.value = this.getData(this.ikey);
	let val = this.getData(this.ikey);
	this.value =  val === undefined ? this.defaultVal : val;
	this.update();
  }
}

var VueHiddenControl = {
  props: ['readonly', 'defaultVal', 'emitter', 'ikey', 'getData', 'putData'],
  template: '<input type="hidden" step="0.01" :readonly="readonly" :value="value" @input="change($event)" @dblclick.stop=""/>',
  data() {
    return {
      value: 0,
    }
  },
  methods: {
    change(e){
      this.value = e.target.value;
      this.update();
    },
    update() {
      if (this.ikey)
        this.putData(this.ikey, this.value)
      this.emitter.trigger('process');
    }
  },
  mounted() {
    this.value = this.getData(this.ikey);
	let val = this.getData(this.ikey);
	this.value =  val === undefined ? this.defaultVal : val;
	this.update();
  }
}

class PxrControl extends Rete.Control {
	constructor(emitter, key, readonly, vueComponent, defaultVal) {
		super(key);
		this.component = vueComponent;
		this.props = { emitter, ikey: key, readonly, defaultVal};
	}

	setValue(val) {
		this.vueContext.value = val;
	}
}

var CustomPxrXmlArgsSocket = {
  template: `<div class="socket"
    :class="[type, socket.name, used()?'used':''] | kebab"
    :title="socket.name+'\\n'+socket.hint"></div>`,
  props: ['type', 'socket', 'used']
}


var CustomPxrXmlArgsNode = {
	template,
	mixins: [VueRenderPlugin.mixin],
	methods:{
		used(io){
			return io.connections.length;
		}
	},
	components: {
		Socket: /*VueRenderPlugin.Socket*/CustomPxrXmlArgsSocket
	}
}


class PxrXmlArgsComponent extends Rete.Component {
	constructor(PxrPattern) {
		super(PxrPattern);
		this.text = PxrPattern; //PxrCurvature
		this.data.component = CustomPxrXmlArgsNode;
	}

	builder(node) {
		
		var PxrParams
		var PxrOutputs
		var PxrShaderType
		var usedSocket = numSocket
		var xmlDoc
		
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var parser = new DOMParser();
				xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
				PxrParams = xmlDoc.getElementsByTagName("param");
				PxrOutputs = xmlDoc.getElementsByTagName("output");
				PxrShaderType = xmlDoc.getElementsByTagName("shaderType")[0].getElementsByTagName("tag")[0].getAttribute("value")
				PxrShaderType = PxrShaderType[0].toUpperCase() + PxrShaderType.slice(1); //Capitalize 1st letter.
			}
		}
		xhr.open('GET', "https://raw.githubusercontent.com/sttng/LDD/master/args/" + this.text + ".args", false);
		xhr.send();
		
		var oSerializer = new XMLSerializer();
		var stringXML = oSerializer.serializeToString(xmlDoc);
		stringXML = stringXML.replace(/\s+/g, ' '); // Keep only one space character
		stringXML = stringXML.replace(/>\s*/g, '>'); // Remove space after >
		stringXML = stringXML.replace(/\s*</g, '<'); // Remove space before <

		var oParser = new DOMParser();
		xmlDoc = oParser.parseFromString(stringXML, "application/xml");
		
		var jsonText = xmlToJson(xmlDoc);
		var PxrPattern = this.text
		jsonText.PxrPatternName = PxrPattern //A little redundant, but makes it easier later.
		
		// PxrJSON will store all used PxrXmlArgs in a JSON file (for latter vstruct handling)
		PxrJSON[PxrPattern] = jsonText;
		
		// Read shader type (pattern, bxdf, etc) from xml args file and store it in the Rete.js data node
		node.data.PxrShaderType = PxrShaderType;
		
		//Input Nodes (called Params in RenderMan)
		var i
		for (i = 0; i < PxrParams.length; i++) {
			var VstructMember = PxrParams[i].getAttribute("vstructmember");
			var WidgetMember = PxrParams[i].getAttribute("widget");
			
			if (VstructMember && WidgetMember == "null") {
				continue; //ignore input nodes which are part of vstructs AND where widget == null
			}
			
			var patternType = PxrParams[i].getAttribute("type").replace( /\s/g, '')
			
			if (typeof PxrParams[i].getElementsByTagName("tag")[0] != 'undefined') {
				patternType = PxrParams[i].getElementsByTagName("tag")[0].getAttribute("value")
			}
			
			var isConnectable = PxrParams[i].getAttribute("connectable")
			if (isConnectable == "False") { //Nodes which are marked as "non-connectable"
				usedSocket = noconnectSocket;
			}
			else if (WidgetMember == "null") {
				usedSocket = noconnectSocket;
			}
			else {
			
				switch (patternType) {
					case "color":
						usedSocket = colorSocket;
						break;
					case "float":
						usedSocket = floatSocket;
						break;
					case "int":
						usedSocket = intSocket;
						break;
					case "normal":
						usedSocket = normalSocket;
						break;
					case "point":
						usedSocket = pointSocket;
						break;
					case "string":
						usedSocket = stringSocket;
						break;
					case "struct":
						usedSocket = structSocket;
						break;
					case "vector":
						usedSocket = vectorSocket;
						break;
					default:
						usedSocket = numSocket;
				}
			}
			
			var defaultVal = PxrParams[i].getAttribute("default")
			
			if (WidgetMember == "null") {
				var PatternInputs = new Rete.Input(patternType + " " + PxrParams[i].getAttribute("name"), "- " + patternType + " " + PxrParams[i].getAttribute("name"), usedSocket, false);
				
				var usedControl
				if (defaultVal != ""){
					usedControl = new PxrControl(this.editor, patternType + " " + PxrParams[i].getAttribute("name"), true, VueHiddenControl, defaultVal)
				}
				else {
					usedControl = new PxrControl(this.editor, patternType + " " + PxrParams[i].getAttribute("name"), true, VueHiddenControl)
				}
				PatternInputs.addControl(usedControl); // User disallowed to edit Widget "Null" items 
			}
			
			else {
				var PatternInputs = new Rete.Input(patternType + " " + PxrParams[i].getAttribute("name"), patternType + " " + PxrParams[i].getAttribute("name"), usedSocket, false);
				if (defaultVal != ""){
					
					switch (patternType) {
						case "color":
							PatternInputs.addControl(new PxrControl(this.editor, patternType + " " + PxrParams[i].getAttribute("name"), false, VueNumControl, defaultVal));
							break;
						case "float":
							PatternInputs.addControl(new PxrControl(this.editor, patternType + " " + PxrParams[i].getAttribute("name"), false, VueFloatControl, defaultVal));
							break;
						case "int":
							PatternInputs.addControl(new PxrControl(this.editor, patternType + " " + PxrParams[i].getAttribute("name"), false, VueIntControl, defaultVal));
							break;
						case "normal":
							PatternInputs.addControl(new PxrControl(this.editor, patternType + " " + PxrParams[i].getAttribute("name"), false, VueNumControl, defaultVal));
							break;
						case "point":
							PatternInputs.addControl(new PxrControl(this.editor, patternType + " " + PxrParams[i].getAttribute("name"), false, VueNumControl, defaultVal));
							break;
						case "string":
							PatternInputs.addControl(new PxrControl(this.editor, patternType + " " + PxrParams[i].getAttribute("name"), false, VueNumControl, defaultVal));
							break;
						case "struct":
							PatternInputs.addControl(new PxrControl(this.editor, patternType + " " + PxrParams[i].getAttribute("name"), false, VueNumControl, defaultVal));
							break;
						case "vector":
							PatternInputs.addControl(new PxrControl(this.editor, patternType + " " + PxrParams[i].getAttribute("name"), false, VueNumControl, defaultVal));
							break;
						default:
							PatternInputs.addControl(new PxrControl(this.editor, patternType + " " + PxrParams[i].getAttribute("name"), false, VueNumControl, defaultVal));
					}
				}
				
				else {
					
					switch (patternType) {
						case "color":
							PatternInputs.addControl(new PxrControl(this.editor, patternType + " " + PxrParams[i].getAttribute("name"), false, VueNumControl));
							break;
						case "float":
							PatternInputs.addControl(new PxrControl(this.editor, patternType + " " + PxrParams[i].getAttribute("name"), false, VueFloatControl));
							break;
						case "int":
							PatternInputs.addControl(new PxrControl(this.editor, patternType + " " + PxrParams[i].getAttribute("name"), false, VueIntControl));
							break;
						case "normal":
							PatternInputs.addControl(new PxrControl(this.editor, patternType + " " + PxrParams[i].getAttribute("name"), false, VueNumControl));
							break;
						case "point":
							PatternInputs.addControl(new PxrControl(this.editor, patternType + " " + PxrParams[i].getAttribute("name"), false, VueNumControl));
							break;
						case "string":
							PatternInputs.addControl(new PxrControl(this.editor, patternType + " " + PxrParams[i].getAttribute("name"), false, VueNumControl));
							break;
						case "struct":
							PatternInputs.addControl(new PxrControl(this.editor, patternType + " " + PxrParams[i].getAttribute("name"), false, VueNumControl));
							break;
						case "vector":
							PatternInputs.addControl(new PxrControl(this.editor, patternType + " " + PxrParams[i].getAttribute("name"), false, VueNumControl));
							break;
						default:
							PatternInputs.addControl(new PxrControl(this.editor, patternType + " " + PxrParams[i].getAttribute("name"), false, VueNumControl));
					}
				}
			}
			node.addInput(PatternInputs)
		}
		
		//Output Nodes
		for (i = 0; i < PxrOutputs.length; i++) {
			var outputTagValue = "";
			var VstructMember = PxrOutputs[i].getAttribute("vstructmember");
			
			if (VstructMember) {
				continue; //ignore output nodes which are part of vstructs
			}
			
			var outputTags = PxrOutputs[i].getElementsByTagName("tag");
				var j
				for (j = 0; j < outputTags.length; j++) {
					outputTagValue += outputTags[j].getAttribute("value") + " ";
			}
			
			switch (outputTagValue.replace( /\s/g, '')) {
				case "color":
					usedSocket = colorSocket;
					break;
				case "float":
					usedSocket = floatSocket;
					break;
				case "int":
					usedSocket = intSocket;
					break;
				case "normal":
					usedSocket = normalSocket;
					break;
				case "point":
					usedSocket = pointSocket;
					break;
				case "string":
					usedSocket = stringSocket;
					break;
				case "struct":
					usedSocket = structSocket;
					break;
				case "vector":
					usedSocket = vectorSocket;
					break;
				default:
					usedSocket = numSocket;
			}
			
			var PatternOutputs = new Rete.Output(PxrOutputs[i].getAttribute("name"), outputTagValue + PxrOutputs[i].getAttribute("name"), usedSocket);
			node.addOutput(PatternOutputs);
		}
	
		return node
	}
	
	worker(node, inputs, outputs) {
		//this.editor.nodes.find(n => n.id == node.id).controls.get('preview').setValue("bla");
	}
}


(async () => {
	var container = document.querySelector('#rete');

	var PxrXmlArgsList = ["aaOceanPrmanShader",
"OSL Patterns",
"PxrAdjustNormal",
"PxrAttribute",
"PxrBakePointCloud",
"PxrBakeTexture",
"PxrBlackBody",
"PxrBlend",
"PxrBump",
"PxrBumpManifold2D",
"PxrChecker",
"PxrClamp",
"PxrColorCorrect",
"PxrCross",
"PxrCurvature",
"PxrDirt",
"PxrDispScalarLayer",
"PxrDispTransform",
"PxrDispVectorLayer",
"PxrDot",
"PxrExposure",
"PxrFacingRatio",
"PxrFlakes",
"PxrFractal",
"PxrGamma",
"PxrGeometricAOV",
"PxrHairColor",
"PxrHSL",
"PxrInvert",
"PxrLayeredBlend",
"PxrManifold2D",
"PxrManifold3D",
"PxrMatteID",
"PxrMix",
"PxrMultiTexture",
"PxrNormalMap",
"PxrPrimvar",
"PxrProjectionLayer",
"PxrProjectionStack",
"PxrProjector",
"PxrPtexture",
"PxrRamp",
"PxrRandomTextureManifold",
"PxrRemap",
"PxrRoundCube",
"PxrSeExpr",
"PxrShadedSide",
"PxrSwitch",
"PxrTangentField",
"PxrTee",
"PxrTexture",
"PxrThinFilm",
"PxrThreshold",
"PxrTileManifold",
"PxrToFloat",
"PxrToFloat3",
"PxrVariable",
"PxrVary",
"PxrVoronoise",
"PxrWireframe",
"PxrWorley",
"PxrSurface",
"PxrLayerSurface",
"PxrConstant",
"PxrLayer",
"PxrLayerMixer"];

	var components =[]

	for (i = 0; i < PxrXmlArgsList.length; i++){
		components.push(new PxrXmlArgsComponent(PxrXmlArgsList[i]))
	}

    var editor = new Rete.NodeEditor('demo@0.1.0', container);
    editor.use(ConnectionPlugin.default);
    editor.use(VueRenderPlugin);
	editor.use(ConnectionPathPlugin, { arrow: false });
    editor.use(ContextMenuPlugin, {
    searchBar: true, // true by default
    searchKeep: title => true, // leave item when searching, optional. For example, title => ['Refresh'].includes(title)
    delay: 500,
    allocate(component) {
        return ['Submenu'];
    },
    rename(component) {
        return component.name;
    },
    items: {
        'Click me'(){ console.log('Works!') }
    },
    nodeItems: {
        'Click me'(){ console.log('Works for node!') }
    }
});

    var engine = new Rete.Engine('demo@0.1.0');
    
    components.map(c => {
        editor.register(c);
        engine.register(c);
    });
	
	document.getElementById("download_link").onclick = async ()=> {
	editorJSON = editor.toJSON();
	var outputRib = ''
	var PatternString = ''

		for (i in editorJSON.nodes) {
			PatternString = editorJSON.nodes[i].data.PxrShaderType +" \"" + editorJSON.nodes[i].name + "\" \"" + editorJSON.nodes[i].name + editorJSON.nodes[i].id + "\"\n"
			
			//var keys = Object.keys(editorJSON.nodes[i].inputs);
			//for ( var j in Object.keys(editorJSON.nodes[i].inputs)) {
			//	console.log("\t\"" + keys[j] + "\" [" + editorJSON.nodes[i].data[keys[j]] + "]");
			//}
			var keys = Object.keys(editorJSON.nodes[i].data);
			var dataNodes = ''
			for ( var j in Object.keys(editorJSON.nodes[i].data)) {
				if (keys[j] == "PxrShaderType") {
					 continue; // "PxrShaderType" is not a input node but stores if the current PxrXmlArgs is "pattern", "bxdf", etc. Thats why its skipped here.
				}
				if (editorJSON.nodes[i].inputs[keys[j]]){
					if (editorJSON.nodes[i].inputs[keys[j]].connections.length > 0){
						//console.log(editorJSON.nodes[i].inputs[keys[j]]);
						continue;//Check here if Input Control Data from user is there AND an input connection also exists for this control. In this case input connection should overrule and not in the user entered data written to the rib.
					}
				}
				if (editorJSON.nodes[i].data[keys[j]]) {
					dataNodes = dataNodes + "\t\"" + keys[j] + "\" [" + editorJSON.nodes[i].data[keys[j]] + "]\n"
				}
			}
			
			var mkeys = Object.keys(editorJSON.nodes[i].inputs);
			
			connString = ''
			for ( var j in Object.keys(editorJSON.nodes[i].inputs)) {
				var InputConnections = editorJSON.nodes[i].inputs[mkeys[j]].connections[0]
				var isVstruct =  mkeys[j].split(" ");
				var currentNodeName = isVstruct[1];
				isVstruct = isVstruct[0];
				var isVstructNotice = ''
				if (InputConnections) { //Current input node has input connections
					
					if (isVstruct == 'vstruct'){ // Current input node has input connections AND is a vstruct.
						isVstructNotice = "\n\t##Need vstruct handling !! reference " + mkeys[j] + "\" [\"" + editorJSON.nodes[InputConnections.node].name + InputConnections.node + ":" + InputConnections.output +"\"]\n"
						
						var potentialVstructOutput = PxrJSON[editorJSON.nodes[InputConnections.node].name].args.output 
						
						for(var k = 0; k < potentialVstructOutput.length; k++) {
							
							if (potentialVstructOutput[k]["@attributes"].vstructmember){ // potentialVstructOutput is really a vstructmember
								
								var currentOutputVstructMemberName = potentialVstructOutput[k]["@attributes"].vstructmember.split(".");
								currentOutputVstructMemberName = currentOutputVstructMemberName[0]
								
								if (currentOutputVstructMemberName == InputConnections.output){ //In the case we have more then one vstruct output nodes, we need to be sure to only go through those members to which we are currently connected.
									
									var evalVstructAction = evaluateVstructConditionalExpr(potentialVstructOutput[k]["@attributes"].vstructConditionalExpr, editorJSON.nodes[InputConnections.node]) // evaluate the vstructConditionalExpr formula of the actual instance of PxrXmlArgs which is "sending"
									//console.log(JSON.stringify(potentialVstructOutput[k]))
									
									if (evalVstructAction["action"] == "connect") {
										
										var vstructmemberSecondPart = potentialVstructOutput[k]["@attributes"].vstructmember.split(".");
										vstructmemberSecondPart = vstructmemberSecondPart[1]
										
										//dirty loop to push the params below or under page item down to the "normal" params
										for (var m = 0; m < PxrJSON[editorJSON.nodes[i].name].args.page.length; m++) {
											for (var n = 0; n < PxrJSON[editorJSON.nodes[i].name].args.page[m].param.length; n++) {
												PxrJSON[editorJSON.nodes[i].name].args.param.push(PxrJSON[editorJSON.nodes[i].name].args.page[m].param[n])
											}
										}
										
										var filteredPxrJSON = PxrJSON[editorJSON.nodes[i].name].args.param.filter(x => x["@attributes"].vstructmember === currentNodeName + "." + vstructmemberSecondPart); //check if for the actual sending virtual connection there is an input existing.
										if (filteredPxrJSON.length > 0) {
											//console.log(filteredPxrJSON[0]["@attributes"].name)
											isVstructNotice = isVstructNotice + "\t\"reference " + filteredPxrJSON[0]["@attributes"].type + " " + filteredPxrJSON[0]["@attributes"].name + "\" [\"" + editorJSON.nodes[InputConnections.node].name + InputConnections.node + ":" + potentialVstructOutput[k]["@attributes"].name +"\"]\n"
										}
										
										else if (PxrJSON[editorJSON.nodes[i].name].args.page.filter(x => x["@attributes"].vstructmember === currentNodeName + "." + vstructmemberSecondPart).length > 0) { //PxrLayerSurface has a slightly different XML dialect and has a page tag for some!! param..... ouch
											
										}
									}
									
									else if (evalVstructAction["action"] == "set") {
									
										var vstructmemberSecondPart = potentialVstructOutput[k]["@attributes"].vstructmember.split(".");
										vstructmemberSecondPart = vstructmemberSecondPart[1]
										
										//dirty loop to push the params below or under page item down to the "normal" params
										for (var m = 0; m < PxrJSON[editorJSON.nodes[i].name].args.page.length; m++) {
											for (var n = 0; n < PxrJSON[editorJSON.nodes[i].name].args.page[m].param.length; n++) {
												PxrJSON[editorJSON.nodes[i].name].args.param.push(PxrJSON[editorJSON.nodes[i].name].args.page[m].param[n])
											}
										}
										
										var filteredPxrJSON = PxrJSON[editorJSON.nodes[i].name].args.param.filter(x => x["@attributes"].vstructmember === currentNodeName + "." + vstructmemberSecondPart); //check if for the actual sending virtual connection there is an input existing.
										if (filteredPxrJSON.length > 0) {
											//console.log(filteredPxrJSON[0]["@attributes"].name)
											isVstructNotice = isVstructNotice + "\t\"" + filteredPxrJSON[0]["@attributes"].type + " " + filteredPxrJSON[0]["@attributes"].name + "\" [" + evalVstructAction["value"] +"]\n"
										}
										
										else if (PxrJSON[editorJSON.nodes[i].name].args.page.filter(x => x["@attributes"].vstructmember === currentNodeName + "." + vstructmemberSecondPart).length > 0) { //PxrLayerSurface has a slightly different XML dialect and has a page tag for some!! param..... ouch
											
										}
										
									}
								}
							}
						}
						//console.log(PxrJSON[editorJSON.nodes[InputConnections.node].name]);
						connString = connString + isVstructNotice
						continue;
					}
					
					
				connString = connString  + "\t\"reference " + mkeys[j] + "\" [\"" + editorJSON.nodes[InputConnections.node].name + InputConnections.node + ":" + InputConnections.output +"\"]\n"
				}
			}
			
			outputRib = outputRib + PatternString + dataNodes + connString
			
		outputRib = outputRib + "\n"
		}
	
	var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	var dateTime = date + ' ' + time;
	
	outputRib = "#Slim Shady Material generated on: " + dateTime + "\n\n" + outputRib;
	var data = new Blob([outputRib], {type: 'text/plain'});
	var url = window.URL.createObjectURL(data);

	document.getElementById('download_link').href = url;
	};
	
	
	document.getElementById('save_link').onclick = async ()=> {
		const savedata = JSON.stringify(editor.toJSON());
		var data = new Blob([savedata], {type: 'text/plain'});
		var url = window.URL.createObjectURL(data);
		document.getElementById('save_link').href = url;
	};
	
	
	document.getElementById('file-input').onchange = async ()=> {
		var file = self.document.getElementById('file-input').files[0];
		
		if (!file) {return;}
		var reader = new FileReader();
		reader.onload = async function(e) {
			let LoadEditorObj = JSON.parse(e.target.result);
			await editor.fromJSON(LoadEditorObj);
			//for (i in LoadEditorObj.nodes){
			//	console.log(LoadEditorObj.nodes[i]);
			//	var nodeId= PxrXmlArgsList.indexOf(LoadEditorObj.nodes[i].name);
			//	//console.log(nodeId);
			//	//console.log(components[nodeId]);
			//	var PxrNode = await components[nodeId].createNode(LoadEditorObj.nodes[i].data);
			//	var nodePosX = LoadEditorObj.nodes[i].position[0]
			//	var nodePosY = LoadEditorObj.nodes[i].position[1]
			//	PxrNode.position = [nodePosX, nodePosY];
			//	editor.addNode(PxrNode);
			//}
		};
		reader.readAsText(file);
		
		while (editor.nodes.length){ // delete all nodes
			var nodeInstance = editor.nodes[0];
			editor.removeNode(nodeInstance)
		}
		
	};
	
	
	document.getElementById('reset-input').onclick = async ()=> {
		while (editor.nodes.length){ // delete all nodes
			var nodeInstance = editor.nodes[0];
			editor.removeNode(nodeInstance)
		}		
	};
	
	var PxrWireframe = await components[59].createNode({ 
	"color wireColor": "0 0 0",
	"color backColor": "1 1 1",
	"float wireOpacity": "1",
	"float wireWidth": "2"
	});
	
	var PxrWireframe1 = await components[59].createNode({ 
	"color wireColor": "0 0 1",
	"color backColor": "1 1 1",
	"float wireOpacity": "1",
	"float wireWidth": "2"
	});
	
	var PxrWireLayer = await components[64].createNode({ 
	});
	
	var PxrExposure = await components[20].createNode({ 
	"float stops": "1"
	});
	
	var PxrColorCorrect = await components[12].createNode({ 
	"vector gamma": "0.1 0.1 0.1"
	});
	
	var PxrInvert = await components[28].createNode({ 
	});
	
	var PxrToFloat = await components[54].createNode({ 
	});
	
	var PxrLayer1 = await components[64].createNode({ 
	"int enableDiffuseAlways" : "1",
	"float diffuseGain": "1.0",
	"color diffuseColor": "0.94 0.2 0.25",
	"int diffuseDoubleSided": "1",
	"color specularFaceColor": "0.1 0.1 0.15",
	"color specularIor": "1.54 1.54 1.54",
	"float specularRoughness": "0.25",
	"int specularDoubleSided": "0",
	"float presence": "1"
	});
	
	var PxrLayerMixer = await components[65].createNode({ 
	"int enableDiffuseAlways": "1",
	"int layer1Enabled": "1"
	});
	
	var PxrLayerSurface = await components[62].createNode({ 
	});
	
	var PxrFractal = await components[23].createNode({ 
	"int surfacePosition": 0, 
	"int layers": "1", 
	"float frequency": "2.5",
	"float lacunarity": "16.0",
	"float dimension": "1.0",
	"float erosion": "0.0",
	"float variation": "1.0",
	"int turbulent": "0"
	});
	
	//var PxrNormalMap = await components[35].createNode({ "float bumpScale": "-0.2","normal bumpOverlay": "0 0 0","int invertBump": "0","int orientation": "2","int flipX": "0","int flipY": "0","int firstChannel": "0","int atlasStyle": "0","int invertT": "1","float blur": "0.0","int lerp": "1","int filter": "1","int reverse": "0","float adjustAmount": "0.0","float surfaceNormalMix": "0.0","int disable": [0]});
	
	//var PxrSurface = await components[61].createNode({ "float diffuseGain": "1.0","color diffuseColor": "0.94 0.2 0.25","int diffuseDoubleSided": "1","color specularFaceColor": "0.1 0.1 0.15","color specularIor": "1.54 1.54 1.54","float specularRoughness": "0.25","int specularDoubleSided": "0","float presence": "1"});
	
	//PxrCurvature.data["collapsed"] = true;
	
	PxrWireframe.position = [10, 40];
	PxrWireframe1.position = [550, 700];
	PxrWireLayer.position = [860, 350];
	PxrExposure.position = [220, 40];
	PxrColorCorrect.position = [535, 15];
	PxrInvert.position = [880, 50];
	PxrToFloat.position = [1300, 60];
	PxrLayer1.position = [1205, 155];
	PxrLayerMixer.position = [1550, 105];
	PxrLayerSurface.position = [1850, 90];
	
	editor.addNode(PxrWireframe);
	editor.addNode(PxrWireframe1);
	editor.addNode(PxrWireLayer);
	editor.addNode(PxrExposure);
	editor.addNode(PxrColorCorrect);
	editor.addNode(PxrInvert);
	editor.addNode(PxrToFloat);
	editor.addNode(PxrLayer1);
	editor.addNode(PxrLayerMixer);
	editor.addNode(PxrLayerSurface);
	
	
	editor.connect(PxrWireframe.outputs.get("Cout"), PxrExposure.inputs.get("color inputRGB"));
	editor.connect(PxrWireframe1.outputs.get("Cout"), PxrWireLayer.inputs.get("color diffuseColor"));
	editor.connect(PxrExposure.outputs.get("resultRGB"), PxrColorCorrect.inputs.get("color inputRGB"));
	editor.connect(PxrColorCorrect.outputs.get("resultRGB"), PxrInvert.inputs.get("color inputRGB"));
	editor.connect(PxrInvert.outputs.get("resultRGB"), PxrToFloat.inputs.get("color input"));
	//editor.connect(PxrLayer1.outputs.get("pxrMaterialOut_diffuseGain"), PxrLayerMixer.inputs.get("float baselayer_diffuseGain"));
	//editor.connect(PxrLayer1.outputs.get("pxrMaterialOut_diffuseColor"), PxrLayerMixer.inputs.get("color baselayer_diffuseColor"));
	editor.connect(PxrLayer1.outputs.get("pxrMaterialOut"), PxrLayerMixer.inputs.get("vstruct baselayer"));
	//editor.connect(PxrWireLayer.outputs.get("pxrMaterialOut_diffuseColor"), PxrLayerMixer.inputs.get("color layer1_diffuseColor"));
	editor.connect(PxrWireLayer.outputs.get("pxrMaterialOut"), PxrLayerMixer.inputs.get("vstruct layer1"));
	editor.connect(PxrToFloat.outputs.get("resultF"), PxrLayerMixer.inputs.get("float layer1Mask"));
	
	//editor.connect(PxrLayerMixer.outputs.get("pxrMaterialOut_diffuseGain"), PxrLayerSurface.inputs.get("float diffuseGain"));
	//editor.connect(PxrLayerMixer.outputs.get("pxrMaterialOut_diffuseColor"), PxrLayerSurface.inputs.get("color diffuseColor"));
	//editor.connect(PxrLayerMixer.outputs.get("pxrMaterialOut_diffuseRoughness"), PxrLayerSurface.inputs.get("float diffuseRoughness"));
	//editor.connect(PxrLayerMixer.outputs.get("pxrMaterialOut_diffuseBackColor"), PxrLayerSurface.inputs.get("color diffuseBackColor"));
	//editor.connect(PxrLayerMixer.outputs.get("pxrMaterialOut_diffuseTransmitGain"), PxrLayerSurface.inputs.get("float diffuseTransmitGain"));
	//editor.connect(PxrLayerMixer.outputs.get("pxrMaterialOut_diffuseTransmitColor"), PxrLayerSurface.inputs.get("color diffuseTransmitColor"));
	//editor.connect(PxrLayerMixer.outputs.get("pxrMaterialOut_specularFaceColor"), PxrLayerSurface.inputs.get("color specularFaceColor"));
	//editor.connect(PxrLayerMixer.outputs.get("pxrMaterialOut_specularEdgeColor"), PxrLayerSurface.inputs.get("color specularEdgeColor"));
	//editor.connect(PxrLayerMixer.outputs.get("pxrMaterialOut_specularIor"), PxrLayerSurface.inputs.get("color specularIor"));
	//editor.connect(PxrLayerMixer.outputs.get("pxrMaterialOut_specularExtinctionCoeff"), PxrLayerSurface.inputs.get("color specularExtinctionCoeff"));
	//editor.connect(PxrLayerMixer.outputs.get("pxrMaterialOut_specularRoughness"), PxrLayerSurface.inputs.get("float specularRoughness"));
	//editor.connect(PxrLayerMixer.outputs.get("pxrMaterialOut_specularAnisotropy"), PxrLayerSurface.inputs.get("float specularAnisotropy"));
	editor.connect(PxrLayerMixer.outputs.get("pxrMaterialOut"), PxrLayerSurface.inputs.get("vstruct inputMaterial"));
	
	//editor.connect(PxrFractal.outputs.get("resultRGB"), PxrNormalMap.inputs.get("color inputRGB"));
	//editor.connect(PxrNormalMap.outputs.get("resultN"), PxrSurface.inputs.get("normal bumpNormal"));


	editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
		console.log('process');
		await engine.abort();
		await engine.process(editor.toJSON());
	});

    editor.view.resize();
    editor.trigger('process');
})();



const readUploadedFileAsText = (inputFile) => {
  const temporaryFileReader = new FileReader();

  return new Promise((resolve, reject) => {
    temporaryFileReader.onerror = () => {
      temporaryFileReader.abort();
      reject(new DOMException("Problem parsing input file."));
    };

    temporaryFileReader.onload = () => {
      resolve(temporaryFileReader.result);
    };
    temporaryFileReader.readAsText(inputFile);
  });
};


// converts XML to JSON
function xmlToJson(xml) {
	
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue.replace(/[\n\t\r]/g,"").trim();
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue.replace(/[\n\t\r]/g,"").trim();
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
};

function evaluateVstructConditionalExpr(vstructConditionalExprString, editorJSONnodes) {
	var paramvalue = {}
	var x;
	
	//Check if nodes are connected
	for (x in editorJSONnodes.inputs) {
		var key = x.split(" ");
		key = key[1]
		var val = editorJSONnodes.inputs[x].connections;
		if (val.length > 0 ) {
			//console.log("Key:"+ key + " Value:" + JSON.stringify(val))
			paramvalue[key] = "connected"
		}
		else {
			paramvalue[key] = "not_connected"
		}
	}
	
	//Get values of Nodes with data
	for (x in editorJSONnodes.data) {
		var key = x.split(" ");
		key = key[1]
		var val = editorJSONnodes.data[x];
		//console.log("Key:"+ key + " Value:" + val)
		paramvalue[key] = val
	}
	
	parser.yy = { parameval: function(t) {
		//console.log("Param: " + t + " Value: " + paramvalue[t])
		return paramvalue[t];
	}
	};
	
	output = parser.parse(vstructConditionalExprString)
	//console.log(JSON.stringify(editorJSONnodes.inputs))
	console.log("VStruct: " + vstructConditionalExprString + " Output: " + JSON.stringify(output));
	return output
}
