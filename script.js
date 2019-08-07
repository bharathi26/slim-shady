var template = document.querySelector('#customNode').innerHTML;
var numSocket = new Rete.Socket("Number");
var colorSocket = new Rete.Socket("color");
var floatSocket = new Rete.Socket("float");
var intSocket = new Rete.Socket("int");
var stringSocket = new Rete.Socket("string");
var structSocket = new Rete.Socket("struct");

numSocket.combineWith(colorSocket);
numSocket.combineWith(floatSocket);


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


var CustomSocket = {
  template: `<div class="socket"
    :class="[type, socket.name, used()?'used':''] | kebab"
    :title="socket.name+'\\n'+socket.hint"></div>`,
  props: ['type', 'socket', 'used']
}


var CustomNode = {
  template,
  mixins: [VueRenderPlugin.mixin],
  methods:{
    used(io){
      return io.connections.length;
    }
  },
  components: {
    Socket: /*VueRenderPlugin.Socket*/CustomSocket
  }
}


class PxrPatternComponent extends Rete.Component {
	constructor(PxrPattern) {
		super(PxrPattern);
		this.text = PxrPattern; //PxrCurvature
		this.data.component = CustomNode;
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
			
			var PatternInputs = new Rete.Input(PxrParams[i].getAttribute("name"), PxrParams[i].getAttribute("type") + " " + PxrParams[i].getAttribute("name"), usedSocket, true);
			PatternInputs.addControl(new NumControl(this.editor, PxrParams[i].getAttribute("name")));
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
			
			if (outputTagValue.replace( /\s/g, '') == "float"){
				usedSocket = floatSocket;
			} else if (outputTagValue.replace( /\s/g, '') == "int") {
				usedSocket = intSocket;
			} else if (outputTagValue.replace( /\s/g, '') == "color") {
				usedSocket = colorSocket;
			} else if (outputTagValue.replace( /\s/g, '') == "string") {
				usedSocket = stringSocket;
			} else if (outputTagValue.replace( /\s/g, '') == "struct") {
				usedSocket = structSocket;
			} else {
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

	var components =[]

	for (i = 0; i < PxrPatternsList.length; i++){
		components[i] = new PxrPatternComponent(PxrPatternsList[i])
	}

    var editor = new Rete.NodeEditor('demo@0.1.0', container);
    editor.use(ConnectionPlugin.default);
    editor.use(VueRenderPlugin);
    editor.use(ContextMenuPlugin);

    var engine = new Rete.Engine('demo@0.1.0');
    
    components.map(c => {
        editor.register(c);
        engine.register(c);
    });

	var PxrBlend = await components[7].createNode({ operation: 5 });
	var PxrCurvature = await components[14].createNode({ numSamples: 4 });
	var PxrDirt = await components[15].createNode({ numSamples: 4 });

	PxrCurvature.data["collapsed"] = true;

	PxrBlend.position = [800, 100];
	PxrCurvature.position = [300, 20];
	PxrDirt.position = [200, 500];

	editor.addNode(PxrBlend);
	editor.addNode(PxrCurvature);
	editor.addNode(PxrDirt);

	editor.connect(PxrCurvature.outputs.get("resultRGB"), PxrBlend.inputs.get("topRGB"));
	editor.connect(PxrDirt.outputs.get("resultRGB"), PxrBlend.inputs.get("bottomRGB"));


    editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
        await engine.abort();
        await engine.process(editor.toJSON());
    });

    editor.view.resize();
    editor.trigger('process');
})();