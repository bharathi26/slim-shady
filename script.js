var template = document.querySelector('#CustomPxrPatternNode').innerHTML;

var colorSocket = new Rete.Socket("color");
var intSocket = new Rete.Socket("int");
var floatSocket = new Rete.Socket("float");
var normalSocket = new Rete.Socket("normal");
var pointSocket = new Rete.Socket("point");
var stringSocket = new Rete.Socket("string");
var structSocket = new Rete.Socket("struct");
var vectorSocket = new Rete.Socket("vector");

var numSocket = new Rete.Socket("Number");

numSocket.combineWith(colorSocket);
numSocket.combineWith(normalSocket);
numSocket.combineWith(pointSocket);
numSocket.combineWith(vectorSocket);


var VueNumControl = {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData'],
  template: '<input :readonly="readonly" :value="value" @input="change($event)" @dblclick.stop=""/>',
  data() {
    return {
      value: 0,
    }
  },
  methods: {
    change(e){
      this.value = +e.target.value;
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
  }
}


class NumControl extends Rete.Control {

  constructor(emitter, key, readonly) {
    super(key);
    this.component = VueNumControl;
    this.props = { emitter, ikey: key, readonly };
  }

  setValue(val) {
    this.vueContext.value = val;
  }
}


var CustomPxrPatternSocket = {
  template: `<div class="socket"
    :class="[type, socket.name, used()?'used':''] | kebab"
    :title="socket.name+'\\n'+socket.hint"></div>`,
  props: ['type', 'socket', 'used']
}

var CustomPxrSurfaceMaterialSocket = {
  template: `<div class="socket"
    :class="[type, socket.name, used()?'used':''] | kebab"
    :title="socket.name+'blaa\\n'+socket.hint"></div>`,
  props: ['type', 'socket', 'used']
}

var CustomPxrPatternNode = {
	template,
	mixins: [VueRenderPlugin.mixin],
	methods:{
		used(io){
			return io.connections.length;
		}
	},
	components: {
		Socket: /*VueRenderPlugin.Socket*/CustomPxrPatternSocket
	}
}

var CustomPxrSurfaceMaterialNode = {
	template,
	mixins: [VueRenderPlugin.mixin],
	methods:{
		used(io){
			return io.connections.length;
		}
	},
	components: {
		Socket: /*VueRenderPlugin.Socket*/CustomPxrSurfaceMaterialSocket
	}
}

class PxrPatternComponent extends Rete.Component {
	constructor(PxrPattern) {
		super(PxrPattern);
		this.text = PxrPattern; //PxrCurvature
		this.data.component = CustomPxrPatternNode;
	}

	builder(node) {
		
		var PxrParams
		var PxrOutputs
		var usedSocket = numSocket
		
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var parser = new DOMParser();
				var xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
				PxrParams = xmlDoc.getElementsByTagName("param");
				PxrOutputs = xmlDoc.getElementsByTagName("output");
			}
		}
		xhr.open('GET', "https://raw.githubusercontent.com/sttng/LDD/master/args/" + this.text + ".args", false);
		xhr.send();

		//Input Nodes (Params in RenderMan)
		var i
		for (i = 0; i < PxrParams.length; i++) {
			
			switch (PxrParams[i].getAttribute("type").replace( /\s/g, '')) {
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
			
			var PatternInputs = new Rete.Input(PxrParams[i].getAttribute("type") + " " + PxrParams[i].getAttribute("name"), PxrParams[i].getAttribute("type") + " " + PxrParams[i].getAttribute("name"), usedSocket, true);
			PatternInputs.addControl(new NumControl(this.editor, PxrParams[i].getAttribute("type") + " " + PxrParams[i].getAttribute("name")));
			node.addInput(PatternInputs)
		}
		
		//Output Nodes
		for (i = 0; i < PxrOutputs.length; i++) {
			var outputTagValue = "";
			var outputTags = PxrOutputs[i].getElementsByTagName("tag");
				var j
				for (j = 0; j < outputTags.length; j++) {
					outputTagValue += outputTags[j].getAttribute("value") + " ";
			}
			
			switch (outputTagValue.replace( /\s/g, '')) {
				case "float":
					usedSocket = floatSocket;
					break;
				case "int":
					usedSocket = intSocket;
					break;
				case "color":
					usedSocket = colorSocket;
					break;
				case "string":
					usedSocket = stringSocket;
					break;
				case "struct":
					usedSocket = structSocket;
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
		outputs["num"] = node.data.num;
	}
}


class PxrSurfaceMaterialComponent extends Rete.Component {
	constructor(PxrPattern) {
		super(PxrPattern);
		this.text = PxrPattern; //PxrCurvature
		this.data.component = CustomPxrSurfaceMaterialNode;
	}

	builder(node) {
		
		var PxrParams
		var PxrOutputs
		var usedSocket = numSocket
		
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var parser = new DOMParser();
				var xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
				PxrParams = xmlDoc.getElementsByTagName("param");
				PxrOutputs = xmlDoc.getElementsByTagName("output");
			}
		}
		xhr.open('GET', "https://raw.githubusercontent.com/sttng/LDD/master/args/" + this.text + ".args", false);
		xhr.send();

		//Input Nodes (Params in RenderMan)
		var i
		for (i = 0; i < PxrParams.length; i++) {
			
			if (PxrParams[i].getAttribute("type").replace( /\s/g, '') == "float"){
				usedSocket = floatSocket;
			} else if (PxrParams[i].getAttribute("type").replace( /\s/g, '') == "int") {
				usedSocket = intSocket;
			} else if (PxrParams[i].getAttribute("type").replace( /\s/g, '') == "color") {
				usedSocket = colorSocket;
			} else if (PxrParams[i].getAttribute("type").replace( /\s/g, '') == "string") {
				usedSocket = stringSocket;
			} else if (PxrParams[i].getAttribute("type").replace( /\s/g, '') == "struct") {
				usedSocket = structSocket;
			} else {
				usedSocket = numSocket;
			}
			
			var PatternInputs = new Rete.Input(PxrParams[i].getAttribute("type") + " " + PxrParams[i].getAttribute("name"), PxrParams[i].getAttribute("type") + " " + PxrParams[i].getAttribute("name"), usedSocket, true);
			PatternInputs.addControl(new NumControl(this.editor, PxrParams[i].getAttribute("type") + " " + PxrParams[i].getAttribute("name")));
			node.addInput(PatternInputs)
		}
	
		return node
	}

	worker(node, inputs, outputs) {
		outputs["num"] = node.data.num;
	}
}


(async () => {
	var container = document.querySelector('#rete');

	var PxrPatternsList = ["aaOceanPrmanShader",
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
"PxrWorley"];

	var PxrSurfaceMaterialsList = ["PxrSurface", "PxrLayerSurface", "PxrLayer", "PxrLayerMixer", "PxrConstant"]

	var components =[]

	for (i = 0; i < PxrPatternsList.length; i++){
		components.push(new PxrPatternComponent(PxrPatternsList[i]))
	}
	
	for (i = 0; i < PxrSurfaceMaterialsList.length; i++){
		components.push(new PxrSurfaceMaterialComponent(PxrSurfaceMaterialsList[i]))
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
	console.log(editor.toJSON());
	editorJSON = editor.toJSON();
	var outputRib = ''
	var PatternString = ''
	//document.getElementById("outputs").innerHTML = JSON.stringify(editor.toJSON(), null, "\t");
		for (i in editorJSON.nodes) {
			
			switch (editorJSON.nodes[i].name) {
				case "PxrSurface":
					PatternString = "Bxdf \"" + editorJSON.nodes[i].name + "\" \"" + editorJSON.nodes[i].name + editorJSON.nodes[i].id + "\"\n"
					break;
				case "PxrLayerSurface":
					PatternString = "Bxdf \"" + editorJSON.nodes[i].name + "\" \"" + editorJSON.nodes[i].name + editorJSON.nodes[i].id + "\"\n"
					break;
				case "PxrLayer":
					PatternString = "Bxdf \"" + editorJSON.nodes[i].name + "\" \"" + editorJSON.nodes[i].name + editorJSON.nodes[i].id + "\"\n"
					break;
				case "PxrLayerMixer":
					PatternString = "Bxdf \"" + editorJSON.nodes[i].name + "\" \"" + editorJSON.nodes[i].name + editorJSON.nodes[i].id + "\"\n"
					break;
				default:
					PatternString = "Pattern \"" + editorJSON.nodes[i].name + "\" \"" + editorJSON.nodes[i].name + editorJSON.nodes[i].id + "\"\n"
			}
			
			var out2 = JSON.stringify(editorJSON.nodes[i].inputs)
			//console.log(out);
			//var keys = Object.keys(editorJSON.nodes[i].inputs);
			//for ( var j in Object.keys(editorJSON.nodes[i].inputs)) {
			//	console.log("\t\"" + keys[j] + "\" [" + editorJSON.nodes[i].data[keys[j]] + "]");
			//}
			//console.log("\n");
			var keys = Object.keys(editorJSON.nodes[i].data);
			var dataNodes = ''
			for ( var j in Object.keys(editorJSON.nodes[i].data)) {
				//console.log("\t\"" + keys[j] + "\" [" + editorJSON.nodes[i].data[keys[j]] + "]");
				dataNodes = dataNodes + "\t\"" + keys[j] + "\" [" + editorJSON.nodes[i].data[keys[j]] + "]\n"
			}
			
			var mkeys = Object.keys(editorJSON.nodes[i].inputs);
			
			connString = ''
			for ( var j in Object.keys(editorJSON.nodes[i].inputs)) {
				var conn = editorJSON.nodes[i].inputs[mkeys[j]].connections[0]
				
				if (conn) {
				connString = connString + "\t\"reference " + mkeys[j] + "\" [\"" + editorJSON.nodes[conn.node].name + conn.node + ":" + conn.output +"\"]\n"
				//console.log("\t\"reference " + mkeys[j] + "\" [\"" + editorJSON.nodes[conn.node].name + conn.node + ":" + conn.output +"\"]");
				}
			}
			
			outputRib = outputRib + PatternString + dataNodes + connString
			
		console.log("\n")
		outputRib = outputRib + "\n"
		}
	outputRib = "#Slim Shady Material\n" + outputRib;
	var data = new Blob([outputRib], {type: 'text/plain'});
	var url = window.URL.createObjectURL(data);

	document.getElementById('download_link').href = url;
	document.getElementById("outputs").innerHTML = outputRib;

	};
	
	
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
	
	var PxrNormalMap = await components[35].createNode({ 
	"float bumpScale": "-0.2",
	"normal bumpOverlay": "0 0 0",
	"int invertBump": "0",
	"int orientation": "2",
	"int flipX": "0",
	"int flipY": "0",
	"int firstChannel": "0",
	"int atlasStyle": "0",
	"int invertT": "1",
	"float blur": "0.0",
	"int lerp": "1",
	"int filter": "1",
	"int reverse": "0",
	"float adjustAmount": "0.0",
	"float surfaceNormalMix": "0.0",
	"int disable": [0]
	});
	
	var PxrSurface = await components[61].createNode({ 
	"float diffuseGain": "1.0",
	"color diffuseColor": "0.94 0.2 0.25",
	"int diffuseDoubleSided": "1",
	"color specularFaceColor": "0.1 0.1 0.15",
	"color specularIor": "1.54 1.54 1.54",
	"float specularRoughness": "0.25",
	"int specularDoubleSided": "0",
	"float presence": "1"
	});
	

	//PxrCurvature.data["collapsed"] = true;

	PxrFractal.position = [100, 20];
	PxrNormalMap.position = [400, 20];
	PxrSurface.position = [800, 20];

	editor.addNode(PxrFractal);
	editor.addNode(PxrNormalMap);
	editor.addNode(PxrSurface);

	
	editor.connect(PxrFractal.outputs.get("resultRGB"), PxrNormalMap.inputs.get("color inputRGB"));
	editor.connect(PxrNormalMap.outputs.get("resultN"), PxrSurface.inputs.get("normal bumpNormal"));


	editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
		console.log('process');
		await engine.abort();
		await engine.process(editor.toJSON());
	});

    editor.view.resize();
    editor.trigger('process');
})();