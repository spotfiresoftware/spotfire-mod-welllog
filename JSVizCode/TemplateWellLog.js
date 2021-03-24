/*
 Copyright (c) 2016 TIBCO Software Inc

 THIS SOFTWARE IS PROVIDED BY TIBCO SOFTWARE INC. ''AS IS'' AND ANY EXPRESS OR
 IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT 
 SHALL TIBCO SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, 
 EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, 
 OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

//////////////////////////////////////////////////////////////////////////////
// #region Drawing Code
//

var pPerfilEixoY;
var zoneLogTrackWidth = 120;
//var pPerfilHeightMultiplier;

var y_function;
var sfData;



function getCurveIndex(curveName, sfData) {
    for (var nCol = 0; nCol < sfData.columns.length; nCol++ )
    {
        if (curveName == sfData.columns[nCol]) {
			return nCol;
		}
    }
    return null;
}



function getCurveData(lineIndex, curveName, sfData) {

    for (var nCol = 0; nCol < sfData.columns.length; nCol++ )
    {
        if (curveName == sfData.columns[nCol]) {
			var item = sfData.data[lineIndex].items[nCol];
			return item;
		}
    }
    return null;
}
	
	



//
// Main Drawing Method
//
function renderCore(sfdata) {
	//well = sfdata["config"]["pPerfilNomePoco"];
	
	
    if (resizing) {
        return;
    }
	
	sfData = sfdata;
	
    if (sfdata.data.length <= 1) {
      let noDIV = d3.select("js_chart").selectAll("div").remove();
      let noSVG = d3.select("js_chart").selectAll("svg").remove();
	  return;
	}
	
	
	var escala = 'linear'
	var scwidth = window.innerWidth -30;
    var scheight = window.innerHeight -30;

	//Propriedades do gráfico:
	var pPerfilHeightMultiplier = sfdata["config"]["pPerfilHeightMultiplier"];
	pPerfilEixoY = sfdata["config"]["pPerfilEixoY"]; //'Profundidade' ou 'Cora'
	var pPerfilIndicadorCurvasBR = sfdata["config"]["pPerfilIndicadorCurvasBR"];
	
	var zoneLogTrackWidth = 120;
	var numberOfTracks = 4;
	
	var trackWidth = (scwidth - zoneLogTrackWidth - zoneLogTrackWidth)/(numberOfTracks);
	
	console.log(JSON.stringify(sfdata["config"]));
	
	//Track 01: ----------------------------------------------------------------------------------
	var pPerfilTrack01EspessuraCurva01 = sfdata["config"]["pPerfilTrack01EspessuraCurva01"];
	var pPerfilTrack01TracoCurva01 = sfdata["config"]["pPerfilTrack01TracoCurva01"];
	var pPerfilTrack01CorCurva01 = sfdata["config"]["pPerfilTrack01CorCurva01"];
	var pPerfilTrack01PreenchimentoArea01 = sfdata["config"]["pPerfilTrack01PreenchimentoArea01"];
	var pPerfilTrack01CorArea01 = sfdata["config"]["pPerfilTrack01CorArea01"];
	var pPerfilTrack01EscalaMinCurva01 = sfdata["config"]["pPerfilTrack01EscalaMinCurva01"];
	var pPerfilTrack01EscalaMaxCurva01 = sfdata["config"]["pPerfilTrack01EscalaMaxCurva01"];
	var pPerfilTrack01Limite01Curva01 = sfdata["config"]["pPerfilTrack01Limite01Curva01"];
	var pPerfilTrack01Limite02Curva01 = sfdata["config"]["pPerfilTrack01Limite02Curva01"];
	var pPerfilTrack01TipoEscalaCurva01 =  sfdata["config"]["pPerfilTrack01TipoEscalaCurva01"];

	var pPerfilTrack01EspessuraCurva02 = sfdata["config"]["pPerfilTrack01EspessuraCurva02"];
	var pPerfilTrack01TracoCurva02 = sfdata["config"]["pPerfilTrack01TracoCurva02"];
	var pPerfilTrack01CorCurva02 = sfdata["config"]["pPerfilTrack01CorCurva02"];
	var pPerfilTrack01PreenchimentoArea02 = sfdata["config"]["pPerfilTrack01PreenchimentoArea02"];
	var pPerfilTrack01CorArea02 = sfdata["config"]["pPerfilTrack01CorArea02"];
	var pPerfilTrack01EscalaMinCurva02 = sfdata["config"]["pPerfilTrack01EscalaMinCurva02"];
	var pPerfilTrack01EscalaMaxCurva02 = sfdata["config"]["pPerfilTrack01EscalaMaxCurva02"];
	var pPerfilTrack01Limite01Curva02 = sfdata["config"]["pPerfilTrack01Limite01Curva02"];
	var pPerfilTrack01Limite02Curva02 = sfdata["config"]["pPerfilTrack01Limite02Curva02"];
    var pPerfilTrack01TipoEscalaCurva02 =  sfdata["config"]["pPerfilTrack01TipoEscalaCurva02"];
	
	
	//Track 02: ----------------------------------------------------------------------------------
	var pPerfilTrack02EspessuraCurva01 = sfdata["config"]["pPerfilTrack02EspessuraCurva01"];
	var pPerfilTrack02TracoCurva01 = sfdata["config"]["pPerfilTrack02TracoCurva01"];
	var pPerfilTrack02CorCurva01 = sfdata["config"]["pPerfilTrack02CorCurva01"];
	var pPerfilTrack02PreenchimentoArea01 = sfdata["config"]["pPerfilTrack02PreenchimentoArea01"];
	var pPerfilTrack02CorArea01 = sfdata["config"]["pPerfilTrack02CorArea01"];
	var pPerfilTrack02EscalaMinCurva01 = sfdata["config"]["pPerfilTrack02EscalaMinCurva01"];
	var pPerfilTrack02EscalaMaxCurva01 = sfdata["config"]["pPerfilTrack02EscalaMaxCurva01"];
	var pPerfilTrack02Limite01Curva01 = sfdata["config"]["pPerfilTrack02Limite01Curva01"];
	var pPerfilTrack02Limite02Curva01 = sfdata["config"]["pPerfilTrack02Limite02Curva01"];
	var pPerfilTrack02TipoEscalaCurva01 =  sfdata["config"]["pPerfilTrack02TipoEscalaCurva01"];
	
	var pPerfilTrack02EspessuraCurva02 = sfdata["config"]["pPerfilTrack02EspessuraCurva02"];
	var pPerfilTrack02TracoCurva02 = sfdata["config"]["pPerfilTrack02TracoCurva02"];
	var pPerfilTrack02CorCurva02 = sfdata["config"]["pPerfilTrack02CorCurva02"];
	var pPerfilTrack02PreenchimentoArea02 = sfdata["config"]["pPerfilTrack02PreenchimentoArea02"];
	var pPerfilTrack02CorArea02 = sfdata["config"]["pPerfilTrack02CorArea02"];
	var pPerfilTrack02EscalaMinCurva02 = sfdata["config"]["pPerfilTrack02EscalaMinCurva02"];
	var pPerfilTrack02EscalaMaxCurva02 = sfdata["config"]["pPerfilTrack02EscalaMaxCurva02"];
	var pPerfilTrack02Limite01Curva02 = sfdata["config"]["pPerfilTrack02Limite01Curva02"];
	var pPerfilTrack02Limite02Curva02 = sfdata["config"]["pPerfilTrack02Limite02Curva02"];
	var pPerfilTrack02TipoEscalaCurva02 =  sfdata["config"]["pPerfilTrack02TipoEscalaCurva02"];
	
	
	//Track 03: ----------------------------------------------------------------------------------
	var pPerfilTrack03EspessuraCurva01 = sfdata["config"]["pPerfilTrack03EspessuraCurva01"];
	var pPerfilTrack03TracoCurva01 = sfdata["config"]["pPerfilTrack03TracoCurva01"];
	var pPerfilTrack03CorCurva01 = sfdata["config"]["pPerfilTrack03CorCurva01"];
	var pPerfilTrack03PreenchimentoArea01 = sfdata["config"]["pPerfilTrack03PreenchimentoArea01"];
	var pPerfilTrack03CorArea01 = sfdata["config"]["pPerfilTrack03CorArea01"];
	var pPerfilTrack03EscalaMinCurva01 = sfdata["config"]["pPerfilTrack03EscalaMinCurva01"];
	var pPerfilTrack03EscalaMaxCurva01 = sfdata["config"]["pPerfilTrack03EscalaMaxCurva01"];
	var pPerfilTrack03Limite01Curva01 = sfdata["config"]["pPerfilTrack03Limite01Curva01"];
	var pPerfilTrack03Limite02Curva01 = sfdata["config"]["pPerfilTrack03Limite02Curva01"];
	var pPerfilTrack03TipoEscalaCurva01 =  sfdata["config"]["pPerfilTrack03TipoEscalaCurva01"];

	var pPerfilTrack03EspessuraCurva02 = sfdata["config"]["pPerfilTrack03EspessuraCurva02"];
	var pPerfilTrack03TracoCurva02 = sfdata["config"]["pPerfilTrack03TracoCurva02"];
	var pPerfilTrack03CorCurva02 = sfdata["config"]["pPerfilTrack03CorCurva02"];
	var pPerfilTrack03PreenchimentoArea02 = sfdata["config"]["pPerfilTrack03PreenchimentoArea02"];
	var pPerfilTrack03CorArea02 = sfdata["config"]["pPerfilTrack03CorArea02"];
	var pPerfilTrack03EscalaMinCurva02 = sfdata["config"]["pPerfilTrack03EscalaMinCurva02"];
	var pPerfilTrack03EscalaMaxCurva02 = sfdata["config"]["pPerfilTrack03EscalaMaxCurva02"];
	var pPerfilTrack03Limite01Curva02 = sfdata["config"]["pPerfilTrack03Limite01Curva02"];
	var pPerfilTrack03Limite02Curva02 = sfdata["config"]["pPerfilTrack03Limite02Curva02"];
	var pPerfilTrack03TipoEscalaCurva02 =  sfdata["config"]["pPerfilTrack03TipoEscalaCurva02"];
	
	
	//Track 04: ----------------------------------------------------------------------------------
	var pPerfilTrack04EspessuraCurva01 = sfdata["config"]["pPerfilTrack04EspessuraCurva01"];
	var pPerfilTrack04TracoCurva01 = sfdata["config"]["pPerfilTrack04TracoCurva01"];
	var pPerfilTrack04CorCurva01 = sfdata["config"]["pPerfilTrack04CorCurva01"];
	var pPerfilTrack04PreenchimentoArea01 = sfdata["config"]["pPerfilTrack04PreenchimentoArea01"];
	var pPerfilTrack04CorArea01 = sfdata["config"]["pPerfilTrack04CorArea01"];
	var pPerfilTrack04EscalaMinCurva01 = sfdata["config"]["pPerfilTrack04EscalaMinCurva01"];
	var pPerfilTrack04EscalaMaxCurva01 = sfdata["config"]["pPerfilTrack04EscalaMaxCurva01"];
	var pPerfilTrack04Limite01Curva01 = sfdata["config"]["pPerfilTrack04Limite01Curva01"];
	var pPerfilTrack04Limite02Curva01 = sfdata["config"]["pPerfilTrack04Limite02Curva01"];
	var pPerfilTrack04TipoEscalaCurva01 =  sfdata["config"]["pPerfilTrack04TipoEscalaCurva01"];

	var pPerfilTrack04EspessuraCurva02 = sfdata["config"]["pPerfilTrack04EspessuraCurva02"];
	var pPerfilTrack04TracoCurva02 = sfdata["config"]["pPerfilTrack04TracoCurva02"];
	var pPerfilTrack04CorCurva02 = sfdata["config"]["pPerfilTrack04CorCurva02"];
	var pPerfilTrack04PreenchimentoArea02 = sfdata["config"]["pPerfilTrack04PreenchimentoArea02"];
	var pPerfilTrack04CorArea02 = sfdata["config"]["pPerfilTrack04CorArea02"];
	var pPerfilTrack04EscalaMinCurva02 = sfdata["config"]["pPerfilTrack04EscalaMinCurva02"];
	var pPerfilTrack04EscalaMaxCurva02 = sfdata["config"]["pPerfilTrack04EscalaMaxCurva02"];
	var pPerfilTrack04Limite01Curva02 = sfdata["config"]["pPerfilTrack04Limite01Curva02"];
	var pPerfilTrack04Limite02Curva02 = sfdata["config"]["pPerfilTrack04Limite02Curva02"];
	var pPerfilTrack04TipoEscalaCurva02 =  sfdata["config"]["pPerfilTrack04TipoEscalaCurva02"];
	
	//Track 05: ----------------------------------------------------------------------------------
	var pPerfilTrack05EspessuraCurva01 = sfdata["config"]["pPerfilTrack05EspessuraCurva01"];
	var pPerfilTrack05TracoCurva01 = sfdata["config"]["pPerfilTrack05TracoCurva01"];
	var pPerfilTrack05CorCurva01 = sfdata["config"]["pPerfilTrack05CorCurva01"];
	var pPerfilTrack05PreenchimentoArea01 = sfdata["config"]["pPerfilTrack05PreenchimentoArea01"];
	var pPerfilTrack05CorArea01 = sfdata["config"]["pPerfilTrack05CorArea01"];
	var pPerfilTrack05EscalaMinCurva01 = sfdata["config"]["pPerfilTrack05EscalaMinCurva01"];
	var pPerfilTrack05EscalaMaxCurva01 = sfdata["config"]["pPerfilTrack05EscalaMaxCurva01"];
	var pPerfilTrack05Limite01Curva01 = sfdata["config"]["pPerfilTrack05Limite01Curva01"];
	var pPerfilTrack05Limite02Curva01 = sfdata["config"]["pPerfilTrack05Limite02Curva01"];
	var pPerfilTrack05TipoEscalaCurva01 =  sfdata["config"]["pPerfilTrack05TipoEscalaCurva01"];

	var pPerfilTrack05EspessuraCurva02 = sfdata["config"]["pPerfilTrack05EspessuraCurva02"];
	var pPerfilTrack05TracoCurva02 = sfdata["config"]["pPerfilTrack05TracoCurva02"];
	var pPerfilTrack05CorCurva02 = sfdata["config"]["pPerfilTrack05CorCurva02"];
	var pPerfilTrack05PreenchimentoArea02 = sfdata["config"]["pPerfilTrack05PreenchimentoArea02"];
	var pPerfilTrack05CorArea02 = sfdata["config"]["pPerfilTrack05CorArea02"];
	var pPerfilTrack05EscalaMinCurva02 = sfdata["config"]["pPerfilTrack05EscalaMinCurva02"];
	var pPerfilTrack05EscalaMaxCurva02 = sfdata["config"]["pPerfilTrack05EscalaMaxCurva02"];
	var pPerfilTrack05Limite01Curva02 = sfdata["config"]["pPerfilTrack05Limite01Curva02"];
	var pPerfilTrack05Limite02Curva02 = sfdata["config"]["pPerfilTrack05Limite02Curva02"];
	var pPerfilTrack05TipoEscalaCurva02 =  sfdata["config"]["pPerfilTrack05TipoEscalaCurva02"];
	
	
	//Track 06: ----------------------------------------------------------------------------------
	var pPerfilTrack06Curva01 = sfdata["config"]["pPerfilTrack06Curva01"].trim() != '' ? sfdata["config"]["pPerfilTrack06Curva01"] : null;
	var pPerfilTrack06EspessuraCurva01 = sfdata["config"]["pPerfilTrack06EspessuraCurva01"];
	var pPerfilTrack06TracoCurva01 = sfdata["config"]["pPerfilTrack06TracoCurva01"];
	var pPerfilTrack06CorCurva01 = sfdata["config"]["pPerfilTrack06CorCurva01"];
	var pPerfilTrack06PreenchimentoArea01 = sfdata["config"]["pPerfilTrack06PreenchimentoArea01"];
	var pPerfilTrack06CorArea01 = sfdata["config"]["pPerfilTrack06CorArea01"];
	var pPerfilTrack06EscalaMinCurva01 = sfdata["config"]["pPerfilTrack06EscalaMinCurva01"];
	var pPerfilTrack06EscalaMaxCurva01 = sfdata["config"]["pPerfilTrack06EscalaMaxCurva01"];
	var pPerfilTrack06Limite01Curva01 = sfdata["config"]["pPerfilTrack06Limite01Curva01"];
	var pPerfilTrack06Limite02Curva01 = sfdata["config"]["pPerfilTrack06Limite02Curva01"];
	var pPerfilTrack06TipoEscalaCurva01 =  sfdata["config"]["pPerfilTrack06TipoEscalaCurva01"];

	var pPerfilTrack06Curva02 = sfdata["config"]["pPerfilTrack06Curva02"].trim() != '' ? sfdata["config"]["pPerfilTrack06Curva02"] : null;
	var pPerfilTrack06EspessuraCurva02 = sfdata["config"]["pPerfilTrack06EspessuraCurva02"];
	var pPerfilTrack06TracoCurva02 = sfdata["config"]["pPerfilTrack06TracoCurva02"];
	var pPerfilTrack06CorCurva02 = sfdata["config"]["pPerfilTrack06CorCurva02"];
	var pPerfilTrack06PreenchimentoArea02 = sfdata["config"]["pPerfilTrack06PreenchimentoArea02"];
	var pPerfilTrack06CorArea02 = sfdata["config"]["pPerfilTrack06CorArea02"];
	var pPerfilTrack06EscalaMinCurva02 = sfdata["config"]["pPerfilTrack06EscalaMinCurva02"];
	var pPerfilTrack06EscalaMaxCurva02 = sfdata["config"]["pPerfilTrack06EscalaMaxCurva02"];
	var pPerfilTrack06Limite01Curva02 = sfdata["config"]["pPerfilTrack06Limite01Curva02"];
	var pPerfilTrack06Limite02Curva02 = sfdata["config"]["pPerfilTrack06Limite02Curva02"];
	var pPerfilTrack06TipoEscalaCurva02 =  sfdata["config"]["pPerfilTrack06TipoEscalaCurva02"];
	
	
	
	function EspessuraLinhaTrack(espessura) {
		if (espessura == 'PEQUENA') { return 0.5; }
		else if (espessura == 'MEDIA') { return 1; }
		else if (espessura == 'GRANDE') { return 2; }
		else { return 1; }
	}
	
	function TracoLinhaTrack(traco) {
		if (traco == 'SOLIDO') { return "solid"; }
		else if (traco == 'PONTILHADO') { return "2,2"; }
		else if (traco == 'TRACEJADO') { return "5,5"; }
		else { return "solid"; }
	}	
	
	function CorLinhaTrack(cor) {
		if (cor == 'PRETO') { return "black"; }
		else if (cor == 'VERDE') { return "green"; }
		else if (cor == 'AZUL') { return "blue"; }
		else if (cor == 'VERMELHO') { return "red"; }
		else if (cor == 'MAGENTA') { return "fuchsia"; }
		else if (cor == 'AMARELO') { return "yellow"; }
		else if (cor == 'ROXO') { return "purple"; }		
		else { return "black"; }
	}	
	
	function PreenchimentoAreaTrack(preenchimento) {
		if (preenchimento == 'ESQUERDA') { return "yes"; }
		else if (preenchimento == 'DIREITA') { return "yes"; }
		else if (preenchimento == 'ENTRE') { return "yes"; }
		else { return "no"; }
	}	

	function DirecaoPreenchimentoAreaTrack(preenchimento) {
		if (preenchimento == 'ESQUERDA') { return "left"; }
		else if (preenchimento == 'DIREITA') { return "right"; }
		else if (preenchimento == 'ENTRE') { return "between"; }
		else { return "left"; }
	}	

	function CorPreenchimentoAreaTrack(corPreenchimento) {
		if (corPreenchimento == 'PRETO') { return "black"; }
		else if (corPreenchimento == 'VERDE') { return "green"; }
		else if (corPreenchimento == 'AZUL') { return "blue"; }
		else if (corPreenchimento == 'VERMELHO') { return "red"; }
		else if (corPreenchimento == 'MAGENTA') { return "fuchsia"; }
		else if (corPreenchimento == 'AMARELO') { return "yellow"; }
		else if (corPreenchimento == 'CIANO') { return "cyan"; }
		else if (corPreenchimento == 'MARROM') { return "brown"; }
		else if (corPreenchimento == 'VERDE ESCURO') { return "darkgreen"; }
		else if (corPreenchimento == 'ROXO') { return "purple"; }
		else if (corPreenchimento == 'GRADIENTE ESPECTRO') { return "gradient"; }
		else if (corPreenchimento == 'GRADIENTE VERMELHO') { return "gradient"; }
		else if (corPreenchimento == 'GRADIENTE AZUL') { return "gradient"; }
		else { return "gray"; }
	}	
	
	function GradientePreenchimentoAreaTrack(corPreenchimento) {
		if (corPreenchimento == 'PRETO') { return null; }
		else if (corPreenchimento == 'VERDE') { return null; }
		else if (corPreenchimento == 'AZUL') { return null; }
		else if (corPreenchimento == 'VERMELHO') { return null; }
		else if (corPreenchimento == 'MAGENTA') { return null; }
		else if (corPreenchimento == 'AMARELO') { return null; }
		else if (corPreenchimento == 'CIANO') { return null; }
		else if (corPreenchimento == 'MARROM') { return null; }
		else if (corPreenchimento == 'ROXO') { return null; }
		else if (corPreenchimento == 'VERDE ESCURO') { return null; }
		else if (corPreenchimento == 'GRADIENTE ESPECTRO') { return d3.interpolateSpectral; }
		else if (corPreenchimento == 'GRADIENTE VERMELHO') { return d3.interpolateReds; }
		else if (corPreenchimento == 'GRADIENTE AZUL') { return d3.interpolateBlues; }
		else { return d3.interpolateSpectral; }
	}	
		
	
	function getColor(name, type) {
		
		if (name == 'black') { 
			if (type == 'light') { return "#484848"; }
			else if (type == 'dark') { return "#000000"; }
			else { return "#212121"; }
		}
		else if (name == 'green') { 
			if (type == 'light') { return "#80e27e"; }
			else if (type == 'dark') { return "#087f23"; }
			else { return "#4caf50"; }
		}
		else if (name == 'blue') {
			if (type == 'light') { return "#757de8"; }
			else if (type == 'dark') { return "#002984"; }
			else { return "#3f51b5"; }
		}
		else if (name == 'red') {
			if (type == 'light') { return "#ff7961"; }
			else if (type == 'dark') { return "#ba000d"; }
			else { return "#f44336"; }
		}
		else if (name == 'fuchsia') {
			if (type == 'light') { return "#e35183"; }
			else if (type == 'dark') { return "#78002e"; }
			else { return "#ad1457"; }
		}
		else if (name == 'yellow') {
			if (type == 'light') { return "#ffff72"; }
			else if (type == 'dark') { return "#c8b900"; }
			else { return "#ffeb3b"; }
		}
		
		
		else if (name == 'cyan') {
			if (type == 'light') { return "#00FFFF"; }
			else if (type == 'dark') { return "#008B8B"; }
			else { return "#40E0D0"; }
		}
		else if (name == 'brown') {
			if (type == 'light') { return "#CD853F"; }
			else if (type == 'dark') { return "#8B4513"; }
			else { return "#A0522D"; }
		}
		else if (name == 'darkgreen') {
			if (type == 'light') { return "#556B2F"; }
			else if (type == 'dark') { return "#004d00"; }
			else { return "#006400"; }
		}
		
		
		
		else if (name == 'purple') {
			if (type == 'light') { return "#d05ce3"; }
			else if (type == 'dark') { return "#6a0080"; }
			else { return "#9c27b0"; }
		}
		else if (name.search('gradient') >= 0) {
			if (type == 'light') { return "RGBA(255,255,255, 0.25)"; }
			else if (type == 'dark') { return "RGBA(0,0,0, 0.25)"; }
			else { return "gradient"; }
		}
	}
	
	
    var WELL = '';
		
	var ZONE = new Array(sfdata.data.length);
	var FACIES = new Array(sfdata.data.length);

	
	
	//var COTA = new Array(sfdata.data.length);
	//var ZONA = new Array(sfdata.data.length);
	var profundidade = null;
	var zonaDepthFirst = null;
	var zonaDepthLast = null;
	var nomeZona = null;
	var ZONAS_RECT = [];
	var ZONAS_DOMINIO = [];
	
	var facieDepthFirst = null;
	var facieDepthLast = null;
	var nomeFacie = null;
	var FACIES_RECT = [];
	var FACIES_DOMINIO = [];
	
	
	
	

	var index =0;
	var zoneMarkIds = [];
	var faciesMarkIds = [];	
	
    for (index = 0; index < sfdata.data.length; index++) {
		
    		item = sfdata.data[index];
			
            nextItem = null;
	        if (sfdata.data[index+1]) { nextItem = sfdata.data[index+1]; }
			
			profundidade = (pPerfilEixoY == 'Cota') ? item.items[1] : item.items[0];
			nextProfundidade = null;
			if (nextItem) { 
				nextProfundidade = (pPerfilEixoY == 'Cota') ? nextItem.items[1] : nextItem.items[0]; 
			}
			else { nextProfundidade =  profundidade}
			
			if (!isNaN(profundidade) && (profundidade !== null)) {
                ZONE[index] =   (item.items[7] ? item.items[7] : null);
                FACIES[index] =  (item.items[8] ? item.items[8] : null);
	
				if (nomeZona == item.items[7]) {
					zonaDepthLast = nextProfundidade;
				}
				
				if (nomeZona != item.items[7] || index == sfdata.data.length -1)  { 
				    if (nomeZona) {
						ZONAS_DOMINIO.push(nomeZona);
						ZONAS_RECT.push({"data_type": "rectangle",
									"depth_top": zonaDepthFirst,
									"depth_bottom": zonaDepthLast,
									"x_starting_upper_left_corner": 0,
									"fill": "red",
									"opacity": 0.5,
									"label": nomeZona,
									"label_orientation": "horizontal",
									"lable_position": "left",
									"markIds": [...zoneMarkIds]
								});
					    
					}
  					zonaDepthFirst = profundidade;
	    			zonaDepthLast = nextProfundidade;
					zoneMarkIds = [];

				}
				nomeZona = item.items[7];
				zoneMarkIds.push(item.hints.index);
				
				if (nomeFacie == item.items[8]) {
					facieDepthLast = nextProfundidade;
				}
				
				if (nomeFacie != item.items[8] || index == sfdata.data.length-1)  { 
				    if (nomeFacie) {
						FACIES_DOMINIO.push(nomeFacie);
						FACIES_RECT.push({"data_type": "rectangle",
									"depth_top": facieDepthFirst,
									"depth_bottom": facieDepthLast,
									"x_starting_upper_left_corner": 0,
									"fill": "red",
									"opacity": 0.5,
									"label": nomeFacie,
									"label_orientation": "horizontal",
									"lable_position": "left",
									"markIds": [...faciesMarkIds]
								});
					    										
					}
  					facieDepthFirst = profundidade;
	    			facieDepthLast = nextProfundidade;
					faciesMarkIds = [];
			
				}
				nomeFacie = item.items[8];
				faciesMarkIds.push(item.hints.index);
				
				
			}
    }	


	colorZone = d3.scaleOrdinal(d3.schemeCategory10).domain(ZONAS_DOMINIO);
	
	ZONAS_RECT.forEach ( function ( item ) {
		let itemZona = item;
		itemZona.fill = colorZone(itemZona.label);
	})
	
	colorFacie = d3.scaleOrdinal(d3.schemeCategory10).domain(FACIES_DOMINIO);
	
	FACIES_RECT.forEach ( function ( item ) {
		let itemFacie = item;
		itemFacie.fill = colorFacie(itemFacie.label); 
	})

	
	

	//var example_template = curveBoxTemplateExamples('example');
	//example_template[0].curve_box["height_multiplier_components"] = pPerfilHeightMultiplier;
	

	

	
	var plot_template_1 = [{
                     "components": [{
                       "curves": [ {"curve_colors": [getColor(CorLinhaTrack(pPerfilTrack01CorCurva01),'normal')],
                                    "curve_names": ["GR"],
								    "curve_stroke_dasharray": [TracoLinhaTrack(pPerfilTrack01TracoCurva01)],
								    "curve_units": [""],
								    "data_type": "curve",
								    "depth_curve_name": "DEPTH",
								    "depth_units_string": [""],
								    "fill": [{
                                        "curve2": "",
                                        "curve_name": "GR",
                                        "cutoffs": [-99999999,pPerfilTrack01Limite01Curva01,pPerfilTrack01Limite02Curva01],
                                        "fill": PreenchimentoAreaTrack(pPerfilTrack01PreenchimentoArea01),
                                        "fill_colors": [getColor(CorPreenchimentoAreaTrack(pPerfilTrack01CorArea01),'normal'),
				                                        getColor(CorPreenchimentoAreaTrack(pPerfilTrack01CorArea01),'dark'), 
								                        getColor(CorPreenchimentoAreaTrack(pPerfilTrack01CorArea01),'light')],
                                        "fill_direction": DirecaoPreenchimentoAreaTrack(pPerfilTrack01PreenchimentoArea01),
                                        "gradient_color_scale": [GradientePreenchimentoAreaTrack(pPerfilTrack01CorArea01), null, null],
                                        "max_scale_x": pPerfilTrack01EscalaMaxCurva01,
                                        "min_scale_x": pPerfilTrack01EscalaMinCurva01							 
									    }],
								    "scale_linear_log_or_yours": [pPerfilTrack01TipoEscalaCurva01],
								    "stroke_linecap": ["butt"],
								    "stroke_width": [EspessuraLinhaTrack(pPerfilTrack01EspessuraCurva01)],
							        "well_names": [WELL]
					               }
                                 ]
                        }],
                        "curve_box": { "width": trackWidth,
                                       "height": scheight, 
                                       "height_multiplier_components": pPerfilHeightMultiplier, 
                                       "div_id": "well_holder_track_01",
                                       "margin": {"top": 20, "right": 10, "bottom": 20, "left": 40}

                        }
                     }];
	
			   
			   
	var plot_template_2 = [{
                     "components": [{
                       "curves": [ {"curve_colors": [getColor(CorLinhaTrack(pPerfilTrack02CorCurva01),'normal')],
                                    "curve_names": ["CAL"],
								    "curve_stroke_dasharray": [TracoLinhaTrack(pPerfilTrack02TracoCurva01)],
								    "curve_units": [""],
								    "data_type": "curve",
								    "depth_curve_name": "DEPTH",
								    "depth_units_string": [""],
								    "fill": [{
                                        "curve2": "",
                                        "curve_name": "CAL",
                                        "cutoffs": [-99999999,pPerfilTrack02Limite01Curva01,pPerfilTrack02Limite02Curva01],
                                        "fill": PreenchimentoAreaTrack(pPerfilTrack02PreenchimentoArea01),
                                        "fill_colors": [getColor(CorPreenchimentoAreaTrack(pPerfilTrack02CorArea01),'normal'),
				                                        getColor(CorPreenchimentoAreaTrack(pPerfilTrack02CorArea01),'dark'),
								                        getColor(CorPreenchimentoAreaTrack(pPerfilTrack02CorArea01),'light')],
				                        "gradient_color_scale": [GradientePreenchimentoAreaTrack(pPerfilTrack02CorArea01), null, null],
                                        "fill_direction": DirecaoPreenchimentoAreaTrack(pPerfilTrack02PreenchimentoArea01),
                                        "gradient_color_scale": [GradientePreenchimentoAreaTrack(pPerfilTrack02CorArea01), null, null],
                                        "max_scale_x": pPerfilTrack02EscalaMaxCurva01,
                                        "min_scale_x": pPerfilTrack02EscalaMinCurva01							 
									    }],
								    "scale_linear_log_or_yours": [pPerfilTrack02TipoEscalaCurva01],
								    "stroke_linecap": ["butt"],
								    "stroke_width": [EspessuraLinhaTrack(pPerfilTrack02EspessuraCurva01)],
							        "well_names": [WELL]
					               }
                                 ]
                        }],
                        "curve_box": { "width": trackWidth,
                                       "height": scheight, 
                                       "height_multiplier_components": pPerfilHeightMultiplier, 
                                       "div_id": "well_holder_track_02",
                                       "margin": {"top": 20, "right": 10, "bottom": 20, "left": 40}

                        }
                     }];			   
			   
			   
			   
	var plot_template_3 = [{
                     "components": [{
                       "curves": [ {"curve_colors": [getColor(CorLinhaTrack(pPerfilTrack03CorCurva01),'normal'), getColor(CorLinhaTrack(pPerfilTrack03CorCurva02),'normal')],
                                    "curve_names": ["PHIN","PHID"],
								    "curve_stroke_dasharray": [TracoLinhaTrack(pPerfilTrack03TracoCurva01),TracoLinhaTrack(pPerfilTrack03TracoCurva02)],
								    "curve_units": [""],
								    "data_type": "curve",
								    "depth_curve_name": "DEPTH",
								    "depth_units_string": [""],
								    "fill": [{
                   "curve_name":"PHIN",
                   "fill": PreenchimentoAreaTrack(pPerfilTrack03PreenchimentoArea01),
                   "fill_direction": DirecaoPreenchimentoAreaTrack(pPerfilTrack03PreenchimentoArea01),
                   "cutoffs": [-99999999, pPerfilTrack03Limite01Curva01, pPerfilTrack03Limite02Curva01],
                   "fill_colors": [getColor(CorPreenchimentoAreaTrack(pPerfilTrack03CorArea01),'normal'),
				                   getColor(CorPreenchimentoAreaTrack(pPerfilTrack03CorArea01),'dark'),
								   getColor(CorPreenchimentoAreaTrack(pPerfilTrack03CorArea01),'light')],
				   "gradient_color_scale": [GradientePreenchimentoAreaTrack(pPerfilTrack03CorArea01), null, null],
                   "max_scale_x": pPerfilTrack03EscalaMaxCurva01,
                   "min_scale_x": pPerfilTrack03EscalaMinCurva01,
                   "curve2":"PHID"
                 },
                 {
                   "curve_name":"PHID",
                   "fill": PreenchimentoAreaTrack(pPerfilTrack03PreenchimentoArea02),
                   "fill_direction": DirecaoPreenchimentoAreaTrack(pPerfilTrack03PreenchimentoArea02),
                   "cutoffs": [-99999999, pPerfilTrack03Limite01Curva02, pPerfilTrack03Limite02Curva02],
                   "fill_colors": [getColor(CorPreenchimentoAreaTrack(pPerfilTrack03CorArea02),'normal'),
				                   getColor(CorPreenchimentoAreaTrack(pPerfilTrack03CorArea02),'dark'),
								   getColor(CorPreenchimentoAreaTrack(pPerfilTrack03CorArea02),'light')],
				   "gradient_color_scale": [GradientePreenchimentoAreaTrack(pPerfilTrack03CorArea02), null, null],
                   "max_scale_x": pPerfilTrack03EscalaMaxCurva02,
                   "min_scale_x": pPerfilTrack03EscalaMinCurva02,				   
                   "curve2":"PHIN"
                 }
               ],
								    "scale_linear_log_or_yours": [pPerfilTrack03TipoEscalaCurva01, pPerfilTrack03TipoEscalaCurva02],
								    "stroke_linecap": ["butt"],
								    "stroke_width": [EspessuraLinhaTrack(pPerfilTrack03EspessuraCurva01), EspessuraLinhaTrack(pPerfilTrack03EspessuraCurva02)],
							        "well_names": [WELL]
					               }
                                 ]
                        }],
                        "curve_box": { "width": trackWidth,
                                       "height": scheight, 
                                       "height_multiplier_components": pPerfilHeightMultiplier, 
                                       "div_id": "well_holder_track_02",
                                       "margin": {"top": 20, "right": 10, "bottom": 20, "left": 40}

                        }
                     }];						   
			   

			   
	var plot_template_4 = [{
                     "components": [{
                       "curves": [ {"curve_colors": [getColor(CorLinhaTrack(pPerfilTrack04CorCurva01),'normal')],
                                    "curve_names": ["RESD"],
								    "curve_stroke_dasharray": [TracoLinhaTrack(pPerfilTrack04TracoCurva01)],
								    "curve_units": [""],
								    "data_type": "curve",
								    "depth_curve_name": "DEPTH",
								    "depth_units_string": [""],
								    "fill": [{
                                        "curve2": "",
                                        "curve_name": "RESD",
                                        "cutoffs": [-99999999,pPerfilTrack04Limite01Curva01,pPerfilTrack04Limite02Curva01],
                                        "fill": PreenchimentoAreaTrack(pPerfilTrack04PreenchimentoArea01),
                                        "fill_colors": [getColor(CorPreenchimentoAreaTrack(pPerfilTrack04CorArea01),'normal'),
				                                        getColor(CorPreenchimentoAreaTrack(pPerfilTrack04CorArea01),'dark'),
								                        getColor(CorPreenchimentoAreaTrack(pPerfilTrack04CorArea01),'light')],
				                        "gradient_color_scale": [GradientePreenchimentoAreaTrack(pPerfilTrack04CorArea01), null, null],
                                        "fill_direction": DirecaoPreenchimentoAreaTrack(pPerfilTrack04PreenchimentoArea01),
                                        "gradient_color_scale": [GradientePreenchimentoAreaTrack(pPerfilTrack04CorArea01), null, null],
                                        "max_scale_x": pPerfilTrack04EscalaMaxCurva01,
                                        "min_scale_x": pPerfilTrack04EscalaMinCurva01							 
									    }],
								    "scale_linear_log_or_yours": [pPerfilTrack04TipoEscalaCurva01],
								    "stroke_linecap": ["butt"],
								    "stroke_width": [EspessuraLinhaTrack(pPerfilTrack04EspessuraCurva01)],
							        "well_names": [WELL]
					               }
                                 ]
                        }],
                        "curve_box": { "width": trackWidth,
                                       "height": scheight, 
                                       "height_multiplier_components": pPerfilHeightMultiplier, 
                                       "div_id": "well_holder_track_02",
                                       "margin": {"top": 20, "right": 10, "bottom": 20, "left": 40}

                        }
                     }];					   
			   
			   
			   
			   

			   
	 
	
	var plot_template_Zone = [{
                     "components": [{
                       "rectangles": ZONAS_RECT,
					   "curves": [ {"curve_colors": [null,null,null],
                                    "curve_names": ["ZONE"],
								    "curve_stroke_dasharray": [null],
								    "curve_units": [""],
								    "data_type": "curve",
								    "depth_curve_name": "DEPTH",
								    "depth_units_string": [""],
								    "fill": [{
                                        "curve2": "",
                                        "curve_name": "",
                                        "cutoffs": [null,null,null],
                                        "fill": "no",
                                        "fill_colors": [null,null,null],
				                        "gradient_color_scale": [null,null,null],
                                        "fill_direction": "",
                                        "max_scale_x": "",
                                        "min_scale_x": ""							 
									    }],
                                    "scale_linear_log_or_yours": [null],
								    "stroke_linecap": ["butt"],
								    "stroke_width": [null],
							        "well_names": [WELL]										
					              }]
                        }],
                        "curve_box": { "width": zoneLogTrackWidth,
                                       "height": scheight, 
                                       "height_multiplier_components": pPerfilHeightMultiplier, 
                                       "div_id": "zone_well_holder",
                                       "margin": {"top": 20, "right": 10, "bottom": 20, "left": 40}

                        }
                     }];		 
	 
	 
	 	 
	 
 
	 

	 

	var plot_template_Facies = [{
                     "components": [{
                       "rectangles": FACIES_RECT,
					   "curves": [ {"curve_colors": [null,null,null],
                                    "curve_names": ["FACIES"],
								    "curve_stroke_dasharray": [null],
								    "curve_units": [""],
								    "data_type": "curve",
								    "depth_curve_name": "DEPTH",
								    "depth_units_string": [""],
								    "fill": [{
                                        "curve2": "",
                                        "curve_name": "",
                                        "cutoffs": [null,null,null],
                                        "fill": "no",
                                        "fill_colors": [null,null,null],
				                        "gradient_color_scale": [null,null,null],
                                        "fill_direction": "",
                                        "max_scale_x": "",
                                        "min_scale_x": ""							 
									    }],
                                    "scale_linear_log_or_yours": [null],
								    "stroke_linecap": ["butt"],
								    "stroke_width": [null],
							        "well_names": [WELL]										
					              }]
                        }],
                        "curve_box": { "width": zoneLogTrackWidth,
                                       "height": scheight, 
                                       "height_multiplier_components": pPerfilHeightMultiplier, 
                                       "div_id": "zone_well_holder",
                                       "margin": {"top": 20, "right": 10, "bottom": 20, "left": 40}

                        }
                     }];		 
	 
	 
	 
	 
	
	result_1 = multipleLogPlot("js_chart",
	                           [plot_template_1, plot_template_2, plot_template_3, plot_template_4, plot_template_Zone, plot_template_Facies],
							   sfdata);
	
    //displayWelcomeMessage ( document.getElementById ( "js_chart" ), sfdata );
	
	
    wait ( sfdata.wait, sfdata.static );

}

// 
// #endregion Drawing Code
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// #region Marking Code
//

//
// This method receives the marking mode and marking rectangle coordinates
// on mouse-up when drawing a marking rectangle
//
function markModel(markMode, rectangle)
{
	// Implementation of logic to call markIndices or markIndices2 goes here
	
    var indicesToMark = [];
    var markData = {};
    markData.markMode = markMode;

	
	var y0 = y_function.invert(rectangle.y -110);
	var y1 = y_function.invert(-110 + rectangle.y + rectangle.height);

	var depthIndex = getCurveIndex('DEPTH', sfData);	
	
    var bisectData = d3.bisector( function(d) { return d.items[depthIndex]; } ).left; 

	var i = bisectData(sfData.data, y0);
	
    var d1 = sfData.data[i];
    var d0 = sfData.data[i - 1];                              

	var d = null;
		
	if (d0 && d1) {
	    if (d0[depthIndex] && d1[depthIndex]) {		
             d = (y0 - d0[depthIndex] > d1[depthIndex] - y0) ? d1 : d0;
	    }
	}
	if (d == null) { d = d1; }
	if (d == null) { d = d0; }

	var j = d.hints.index;
	
	//console.log("sfData.data[j].items[depthIndex]:");
	//console.log( sfData.data[j].items[depthIndex]);	
	
	while (sfData.data[j].items[depthIndex] <= y1) {
		indicesToMark.push(sfData.data[j].hints.index);
		j = j+1;
	}
	

    markData.indexSet = indicesToMark;
    markIndices ( markData );	
}

//
// Legacy mark function 2014 HF2
//
function mark(event)
{
}

// 
// #endregion Marking Code
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// #region Resizing Code
//

var resizing = false;

window.onresize = function (event) {
    resizing = true;
    if ($("#js_chart")) {
		location.reload();
    }
    resizing = false;
}

// 
// #endregion Resizing Code
//////////////////////////////////////////////////////////////////////////////











function curveBox(template_for_plotting, sfData){
	

    //////////////  DEFINING VARIABLES so the longer name doesn't have to be used ////////////// 
    //// These parts of the function establish variables from the config JSON in shorter variable names
    //// If they are necessary for plotting & there is a chance the template might not include them, then default values might be defined here for cases where they are accidentally not defined
    // default values might be defined here for cases where they are accidentally not defined
    
    let template_overall = template_for_plotting[0]["curve_box"]
    let template_components = template_for_plotting[0]["components"]

    let template_curves = template_components[0]["curves"][0]
    let template_lines = template_components[0]["lines"]
    let template_rectangles = template_components[0]["rectangles"]
	
	

    /// Parameters that define shape & size of overall curve box
	
    let div_id = template_overall["div_id"];
    d3.select("#"+div_id).selectAll("*").remove();	
    let height_multiplier_components = 1
    if  (template_overall["height_multiplier_components"]){
         height_multiplier_components = template_overall["height_multiplier_components"]
         }
    let height = template_overall["height"]*height_multiplier_components 
    let height_components = template_overall["height"]
	let width = template_overall["width"]
    let margin = template_overall["margin"]
    let gridlines_color = "#D3D3D3";
    let gridlines_stroke_width = 0.2;
    //// Data is in d3.js form. An array of objects consisting of single level key:value pairs
    let data = template_curves["data"];
    let curve_names = template_curves["curve_names"]
    let curve_colors = template_curves["curve_colors"]
    let curve_stroke_dasharray = template_curves["curve_stroke_dasharray"] 
    let scale_linear_log_or_yours = template_curves["scale_linear_log_or_yours"];
    let depth_curve_name = template_curves["depth_curve_name"];	
	
	let curve_units = "";
    if(template_curves["curve_units"]){curve_units = template_curves["curve_units"]};

    let depth_units_string = "";
    if(template_curves["depth_units_string"]){ depth_units_string = template_curves["depth_units_string"]};
    
	
	
     ///////// NEED TO FIX DEPTHS AS THERE ARE MULTIPLE DEPTH LIMITS AND THEY NEED TO BE CALCULATED PROPERLY !!!!! //////////////////////////
//       //// Calculate depth min and max if depth min and/or max is not given explicitly in the template





    let depth_min = d3.min(sfData.data, function(d,i) { return getCurveData(i, depth_curve_name, sfData); });
    let depth_max = d3.max(sfData.data, function(d,i) { return getCurveData(i, depth_curve_name, sfData); });
	  


    //////////////  Initiate Divs + SVGs. Different depending single SVG or header separate =>////////////// 
    let svg = ""
    let svg_holder = ""
    let svg_header = ""

		
      svg_holder = d3.select("#"+div_id).append("div")
        .attr("class","svg_holder")
        .style("overflow-x","visible")
		.style("overflow-y","visible")
		.style("position","sticky")
		.style("top",0)
		.style("background-color","white")
		.style("z-index",1)
		//.style("margin", 0)
		.style("margin-bottom", "10px");		
		
		
		
		
      svg_header = d3.select("#"+div_id+" div.svg_holder").append("svg")
      svg_header.attr("class","header")
      svg_header.attr("width",width)
	       .attr("height","100px"); 
           //.attr("height","8.3em"); 
      svg_header.append("g")
      svg_header.style("display","block");
      

      



      const curveBox_main_div = d3.select("#"+div_id).append("div")
      curveBox_main_div
          .attr("height",height_components+"px")
          .attr("class","component_outter")
          .style('display','flex')
          .style('position','relative')
		  .style("margin", 0)
     	  .style("padding", 0)
	      .style("border", 0) 
          .style('box-sizing','border-box')
   

		  
		  
      const curveBox_sub_div = d3.select("#"+div_id+" div.component_outter").append("div")
      curveBox_sub_div
          .attr("class","component_inner")
          //.style('overflow-y',"auto")
          .style('position','relative')
          //.style('max-height',height_components+"px")		  
		  
		  
      
      svg = d3.select("#"+div_id+" div.component_outter div.component_inner").append("svg")

   

//   //// This will help save the x axis function for first curve if there are more than one curve 
//   /// and they are at different scales. We need this in order to use the 'between' method of fill!
//   let x_for_k_is_0 
//   //// This will help save the x axis function for second curve if there are more than one curve 
//   /// and they are at different scales. We need this in order to use the 'between' method of fill!
//   let x_for_k_is_1
//   //// This will help save the x axis function for third curve if there are more than one curve 
//   /// and they are at different scales. We need this in order to use the 'between' method of fill!
//   let x_for_k_is_2
//   //// This will help save the x axis function for fourth curve if there are more than one curve 
//   /// and they are at different scales. We need this in order to use the 'between' method of fill!
//   let x_for_k_is_3
  
  let x_functions_for_each_curvename = {}; //// populate with {"curvename":curvename,"x_func":func}
  
  let mins = []
  let maxes = []
  let curvesDescription = '';
  let y
  let yAxis 
  let yAxis2

    //////////////////// define y scale, aka the one for the depth  ////////////////////
	
	
    y = d3.scaleLinear().domain([depth_max, depth_min]).range([height - margin.bottom - margin.top,margin.top]);
	
    
    yAxis = function(g) { return g.attr("transform", "translate("+ margin.left +",0)")
	                              .call(d3.axisLeft(y))
	                              .call(function(g) { return g.select(".domain");}); }
								  
	y_function = y;
								  
								  
    //yAxis2= function(g) { return g.attr("transform", `translate(${margin.left-35},0)`)
	//                              .call(d3.axisLeft(y))
	//                              .call(function(g) { return g.select(".domain");}); }
	
	
	
	

	
	
  //////////////  Building curves within curvebox =>////////////// 
  for (let k = 0; k < curve_names.length; k++) {
  //// code that creates a line for each Curve in order provided and applies 
  //// the color in the color array in order provided
	
    var max_scale_x = null; 
	var min_scale_x = null;
	var gradient_color_fills = [];
	

	if (template_curves["fill"] && k < template_curves["fill"].length) {
		min_scale_x = template_curves["fill"][k]["min_scale_x"] ? template_curves["fill"][k]["min_scale_x"] : null;
		max_scale_x = template_curves["fill"][k]["max_scale_x"] ? template_curves["fill"][k]["max_scale_x"] : null;
		gradient_color_fills = template_curves["fill"][k]["gradient_color_scale"];
	}
  
	
	let min_this = d3.min(sfData.data, function(d,i) { return getCurveData(i, curve_names[k], sfData) }); 
    let max_this = d3.max(sfData.data, function(d,i) { return getCurveData(i, curve_names[k], sfData) }); 
	
	
	
	
    mins.push(min_this);
    maxes.push(max_this);	
	
	//escala fixa
	if (min_scale_x) { min_this = min_scale_x; }
	if (max_scale_x) { max_this = max_scale_x; }

	
	let x_func
    let x
    let xAxis_header
    let xAxis
	
	
    x = d3.scaleLinear().domain([min_this,max_this]).nice().range([margin.left, width - margin.right])
    if(scale_linear_log_or_yours[k] == "log"){
         x = d3.scaleLog().domain([min_this,max_this]).range([margin.left, width - margin.right])
    }
	else if (!min_this && !max_this) {
		 x = d3.scaleOrdinal().domain(['',' ']).range([margin.left, width - margin.right]);
	}
    else if(scale_linear_log_or_yours[k] == "linear"){}
    if(k==0){
        x_func == x
    }
	
    //// This creates an object to hold multiple x axis scale functions 
    //// that will be used if 'between' style fill is selected.
    x_functions_for_each_curvename[curve_names[k]] = x;
	

																	 
}										



  for (let k = 0; k < curve_names.length; k++) {
	
    let min = mins[k];
    let max = maxes[k];
    
    let header_text_line = curve_names[k];
	
    curvesDescription = curvesDescription + '-' + curve_names[k];
	
    let curveUnit = "";
    if (curve_units[k]){curveUnit = curve_units[k]}   
	
	
	
	if (!isNaN(min) && !isNaN(max) ) {
	   header_text_line = min.toFixed(1)+" - "+curve_names[k]+" "+curveUnit+" - "+max.toFixed(1);
	}
	else { header_text_line = curve_names[k]; }

		
    //////////////  Building curvebox parts that aren't header. First define size & title =>////////////// 
    svg.attr("class","components")
       .attr("width",width)
       .attr("height",height)
       .style("margin","0 auto")
       .style('overflow',"scroll");
    


    let y_axis_text = depth_curve_name + (depth_units_string != "" ? " (" + depth_units_string + ")" : "");
    svg.append("g")
        .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("dy", ".75em")
          .attr("y", 0 - (margin.left*0.9))
          .attr("x",((height)/-2)+margin.top)
          .style("text-anchor", "end")
          .text(y_axis_text)
          .style("fill","#2b2929");
  

  
    //// Code that assumes multiple curves are plotted in same curvebox  

	

	

  

    var gridlines_obj = d3.axisTop()
                      .ticks((width-margin.left-margin.right)/25)
                      .tickFormat("")
                      .tickSize(-height+margin.top+10)
                      .scale(x_functions_for_each_curvename[curve_names[0]]);
    svg.append("g")
         .attr("class", "grid")
         .call(gridlines_obj)
         .style("stroke",gridlines_color)
         .style("stroke-width",gridlines_stroke_width) 
	
	
    //////////////  Header text, two way depending on  =>////////////// 

      let distance_from_top = (1+(k*3.5)).toString()+"em"
      svg_header.append("text")
          .attr("x", (margin.left+width)/2)          
          .attr("y", 0 + distance_from_top)
          .attr("text-anchor", "middle")  
          .style("font-size", "11px") 
          .style("text-decoration", "underline")  
          .style('fill',curve_colors[k])
          .text(header_text_line); 
		  
      let translate_string = "translate(0,"+(17+(k*38.5)).toString()+")";
	  
      xAxis_header = function(g) { return  g.attr("transform", translate_string)
	                                        .call(d3.axisBottom(x_functions_for_each_curvename[curve_names[k]])
						                    .ticks((width-margin.left-margin.right)/25)
	                                        .tickSizeOuter(0)) };
						   

      svg_header.append("g")
        .call(xAxis_header)
          .append("text");


	
    //////////////   define the area filled under the curve =>////////////// 
    


  
  var defs = svg.append("defs");
  
  var filter = defs.append("filter")
                  .attr("id", "tooltip_background")
                  .attr("x", 0)
                  .attr("y", 0)
                  .attr("width", 1 )
                  .attr("height", 1);
	   
	   filter.append("feFlood")
	         .attr("flood-color", "rgba(255, 255, 255,0.8)" )
             .attr("result", "bg");
			 
  var feMerge = filter.append("feMerge")
	                  .attr("flood-color", "yellow" )
                      .attr("result", "bg");
					  
    feMerge.append("feMergeNode")					  
	       .attr("in", "bg" );
		   
    feMerge.append("feMergeNode")					  
	       .attr("in", "SourceGraphic" );
  
			
    defs.append("clipPath")
       .attr("id", "clip")
       .append("rect")
       .attr("x", margin.left)
       .attr("y",margin.top)
       .attr("width", width - margin.right - margin.left )
       .attr("height", y(depth_max) - y(depth_min));
							
							
        function opacityFunc(n, threshold_curve1, threshold_curve2) { 
			 if (n == 0) return 1;
		     else if (threshold_curve1) return 1;
			 else if (threshold_curve2) return 1;
			 else return 0;
		}


				

			
					
					

	
	
    for (let i = 0; i < template_curves["fill"].length; i++) {
        //let i = k
        if (template_curves["fill"][i]["fill"] == "yes"){        
            let number_colors = template_curves["fill"][i]["fill_colors"].length;
            let curve_name1 = template_curves["fill"][i]["curve_name"];
			
            for (let j = 0; j < number_colors; j++) {
                let area1 = d3.area()
                let threshold = -99999999;
                let fill_color = "gray";
				let gradient_color_interpolation = d3.interpolateSpectral;
				
				
                if (number_colors !== 0){
                    threshold = template_curves["fill"][i]["cutoffs"][j];
                    fill_color = template_curves["fill"][i]["fill_colors"][j];
					gradient_color_interpolation = template_curves["fill"][i]["gradient_color_scale"][j];
                }
				
					
				if (fill_color == 'gradient' && gradient_color_interpolation) {
					
					//let gradient_color_fill_interpolation = d3.interpolateSpectral;
					
					///if (template_curves["fill"][i]["gradient_color_scale"]) {
					//	if (template_curves["fill"][i]["gradient_color_scale"][0]) {
					//	    gradient_color_fill_interpolation = template_curves["fill"][i]["gradient_color_scale"][0];
					//	}
					//}
					
	                let color_gradient_functions_for_each_curvename = {};
					
				
	                if(scale_linear_log_or_yours[k] == "linear")  {
						//color_gradient_functions_for_each_curvename[curve_name1] = function(d) { return 'red' };
	                	color_gradient_functions_for_each_curvename[curve_name1+'_'+j] =  d3.scaleSequential(gradient_color_interpolation)
		                                                                                    .domain(x_functions_for_each_curvename[curve_name1].domain());
	                }
	                else if(scale_linear_log_or_yours[k] == "log") {
						//color_gradient_functions_for_each_curvename[curve_name1] = function(d) { return 'blue' };
                        color_gradient_functions_for_each_curvename[curve_name1+'_'+j] = d3.scaleSequentialLog(gradient_color_interpolation)
                                                                                           .domain(x_functions_for_each_curvename[curve_name1].domain());
                    }					
					
					
				    var grd = svg.append("defs").append("linearGradient")
	                   .attr("id", "linear-gradient-"+curve_name1+'_'+j)
                       .attr("gradientUnits", "userSpaceOnUse")
                       .attr("x1", 0)
                       .attr("x2", 0)
                       .attr("y1", y(depth_min) )
                       .attr("y2", y(depth_max) )	
                       .selectAll("stop")
                       .data(sfData.data)
                       .join("stop")
                       .attr("offset", function(d,i) { 
						   
                           return(( ( y(getCurveData(i, depth_curve_name, sfData)) - y(depth_min) ) / ( y(depth_max) - y(depth_min) ) * 100.0 ) + '%');						   
						   
                        })
                       .attr('stop-color', function(d,i){ 
						   
						   return(!isNaN(getCurveData(i, curve_name1, sfData)) ? color_gradient_functions_for_each_curvename[curve_name1+'_'+j](getCurveData(i, curve_name1, sfData)) : "rgba(0,0,0,0)");
						   
						}); 
					
					
					   
		            if (color_gradient_functions_for_each_curvename[curve_name1+'_'+j]) {
				        svg.append("defs").append("linearGradient")
                           .attr("id", "linear-gradient-legend-"+curve_name1+'_'+j)
                           .attr("gradientUnits", "userSpaceOnUse")
                           .attr("x1", margin.left)
                           .attr("x2", width - margin.right)
                           .attr("y1", 0)
                           .attr("y2", 0)			  
                           .selectAll("stop")
                           .data(d3.range(x_functions_for_each_curvename[curve_name1].domain()[0], x_functions_for_each_curvename[curve_name1].domain()[1]))
                           .join("stop")
                           .attr("offset", function(d) { return  ((d - x_functions_for_each_curvename[curve_name1].domain()[0]) / (x_functions_for_each_curvename[curve_name1].domain()[1] - x_functions_for_each_curvename[curve_name1].domain()[0] -1) * 100) + "%"; })
                           .attr("stop-color", function(d) { return  color_gradient_functions_for_each_curvename[curve_name1+'_'+j](d); } );
					
                        svg_header.append("rect")
                           .attr("x", margin.left)          
                           .attr("y", margin.top + 60)
                           .attr("width", width - margin.left - margin.right)
                           .attr("height", 18/(j+1))
                           .attr('fill','url(#linear-gradient-legend-'+curve_name1+'_'+j+')')
                           .attr('stroke','black')
                           .attr('stroke-width',0.5);
						   
					}
						
				  fill_color = 'url(#linear-gradient-'+curve_name1+'_'+j+')';
				  
			    }					
				
                if(template_curves["fill"][i]["fill_direction"] == "left"){
                  let start_from_left = template_overall["margin"]["left"]
                  area1
                      .x1(function(d,i) { return  x_functions_for_each_curvename[curve_name1](getCurveData(i, curve_name1, sfData));} )
                      .x0(function(d,i) { return  start_from_left;} )
                      .defined(function(d,i) { return (getCurveData(i, curve_name1, sfData) > threshold);} )
                      .y(function(d,i) { return y(getCurveData(i, depth_curve_name, sfData)); });

					  
                  svg.append("path")      
                    .datum(sfData.data)
                    .attr("class", "area")
					.attr("clip-path", "url('#clip')")
                    .attr("d", area1)
                    .attr("stroke", "none")
                    .attr("fill",fill_color)
                    .attr("fill-opacity", opacityFunc(j, threshold, null) )
					
					
                }
                if(template_curves["fill"][i]["fill_direction"] == "right"){
                  let start_from_right = template_overall["margin"]["right"]
                  let start_from_left = template_overall["margin"]["left"]
                  area1
                        .x1(function(d,i) { return  width-start_from_right; })
                        .defined(function(d,i) { return (getCurveData(i, curve_name1, sfData) > threshold); }  )
						.x0(function(d,i) { return  x_functions_for_each_curvename[curve_name1](getCurveData(i, curve_name1, sfData)); })
                        .y(function(d,i) { return  y(getCurveData(i, depth_curve_name, sfData)); });

						
                  svg.append("path")      
                    .datum(sfData.data)
                    .attr("class", "area")
					.attr("clip-path", "url('#clip')")
                    .attr("d", area1)
                    .attr("stroke", "none")
                    .attr("fill",fill_color)
                    .attr("fill-opacity", opacityFunc(j, threshold, null) );
					
						
                }
                if(template_curves["fill"][i]["fill_direction"] == "between"){
                  let between_2_curve = template_curves["fill"][i]["curve2"]; 
				  
				  var indexCurve2;
				  for (let c = 0; c < curve_names.length; c++) {
					  if (between_2_curve == curve_names[c]) { indexCurve2 = c;
					                                           break; }
				  }
				  
				  
				  let curve_2_color = template_curves["fill"][indexCurve2]["fill_colors"][j];
				  let curve_2_threshold = template_curves["fill"][indexCurve2]["cutoffs"][j];


                  //// for through x_functions_for_each_curvename object and find the key that
                  //// matches between_2_curve which should be a curvename
                  //// get the x function for the second curve and the curve that is curvenames[k]
                  let second_curve_x_func = x_functions_for_each_curvename[between_2_curve];
                  let first_curve_x_func = x_functions_for_each_curvename[curve_name1];
				  
                  area1
                    .x1(function(d,i) { return  first_curve_x_func(getCurveData(i, curve_name1, sfData)); })
                    .x0(function(d,i) { return  second_curve_x_func(getCurveData(i, between_2_curve, sfData) ); })
					.defined(function(d,i) { return ((getCurveData(i, curve_name1, sfData) > threshold) 
					                               && getCurveData(i, between_2_curve, sfData) > curve_2_threshold)
					                               && first_curve_x_func(getCurveData(i, curve_name1, sfData)) > second_curve_x_func(getCurveData(i, between_2_curve, sfData)); })
                    .y(function(d,i) { return  y(getCurveData(i, depth_curve_name, sfData)); });
					
				  svg.append("path")      
                    .datum(sfData.data)
                    .attr("class", "area")
					.attr("clip-path", "url('#clip')")
                    .attr("d", area1)
                    .attr("stroke", "none")
                    .attr("fill",fill_color)
                    .attr("fill-opacity", opacityFunc(j, threshold, curve_2_threshold) );
					
                  let area2 = d3.area();
                  area2
                    .x1(function(d,i) { return  first_curve_x_func(getCurveData(i, curve_name1, sfData)); })
                    .x0(function(d,i) { return  second_curve_x_func(getCurveData(i, between_2_curve, sfData)); })
					.defined(function(d,i) { return ((getCurveData(i, curve_name1, sfData) > threshold)
					                               && getCurveData(i, between_2_curve, sfData) > curve_2_threshold ) 
					                               && first_curve_x_func(getCurveData(i, curve_name1, sfData)) < second_curve_x_func(getCurveData(i, between_2_curve, sfData)); })
                    .y(function(d,i) { return y(getCurveData(i, depth_curve_name, sfData)); });
				  
				  svg.append("path")      
                    .datum(sfData.data)
                    .attr("class", "area")
					.attr("clip-path", "url('#clip')")
                    .attr("d", area2)
                    .attr("stroke", "none")
                    .attr("fill",curve_2_color)
                    .attr("fill-opacity", opacityFunc(j, threshold, curve_2_threshold));
					
                }
					
		
           }    

        }
    }
	
						 					 
						 
						 
					 
						 
    //////////////  Appends a curve line but doesn't include fill yet =>////////////// 
    let another_line = d3.line()
	                     .x(function(d,i) { 
							 
							 return x_functions_for_each_curvename[curve_names[k]](getCurveData(i, curve_names[k], sfData)); 
						 })
						 .y(function(d,i) { return  y(getCurveData(i, depth_curve_name, sfData)); })
						 .defined(function(d,i) { return  getCurveData(i, curve_names[k], sfData) ? true : false; });
						 //.defined(function(d,i) { return  (getCurveData(i, curve_names[k], sfData) !== null	) && !isNaN(getCurveData(i, curve_names[k], sfData)); });

    svg.append("path")
        .datum(sfData.data)
		//.datum(sfData.data.filter(another_line.defined()))
        .attr("fill", "none")
		
		.attr("clip-path", "url('#clip')")
        .attr("stroke", curve_colors[k])
        .attr("stroke-width", template_curves["stroke_width"][k])
		//template_curves["fill"][k]["fill"] == "yes" ? 1.5 : 0.5) 
		//template_curves["stroke_width"][k])
        .attr("stroke-linecap", template_curves["stroke_linecap"][k])
        .attr("stroke-dasharray",curve_stroke_dasharray[k])
        .attr("d", function (d,i) { return another_line(d,i); } );

 }
  

 					
					
					
					
 
 
	
      //////////////  Rectangles for ZoneLog =>////////////// 
      try {
		if (template_rectangles) {
            for (let i = 0; i < template_rectangles.length; i++) {
               let this_rectangle = template_rectangles[i];


                svg.append('rect')
    			    .datum(sfData.data)
                    .attr("x", margin.left) 
                    .attr("y", y(this_rectangle.depth_top))
                    .attr("width", width - margin.right - margin.left)
				    .attr("height", function(d) { //console.log("y: " + y(this_rectangle.depth_bottom) - y(this_rectangle.depth_top));
					                          //return y(d);
											  return Math.abs( y(this_rectangle.depth_top) - y(this_rectangle.depth_bottom) );
											  //return y(Math.min(this_rectangle.depth_bottom,depth_max)) - y(Math.max(this_rectangle.depth_top,depth_min));
											  })
				
				
                    .style("fill", this_rectangle.fill)
                    .style("opacity", this_rectangle.opacity)
					.style("cursor", "pointer")
					.on("mouseover", function(d) {console.log('mouseover'); } )
					.on("click", function(d) {
						             console.log('onclick');
						             console.dir(d);
						         }
					);

                svg.append("text")
		    	  .attr("class","wrapme")
                  .attr("x", margin.left + (width - margin.right - margin.left)*0.5   )   
			      .attr("width", width - margin.right - margin.left)
                  .attr("y", function(d) { return y(this_rectangle.depth_top) + Math.abs( y(this_rectangle.depth_top) - y(this_rectangle.depth_bottom) )/2 }) 
                  .style("font-size", "10px")  
                  .attr("text-anchor", "middle")  
                  .text(this_rectangle.label.trim())
			      .call(wrap)
			      .attr("transform", function (d) { //return "translate(0,0)";
				                                    return "translate(0,"+ ( this.getBBox().height/2 -1 ) +")"; 
			                                      });
			  
		  
            }
		}
      }
      catch (err){
        console.log("could not do rectangle in curveBox function for some reason. error= ",err)
      }
	  
	
/* Marking Representation */
 

                 var areaMark = d3.area()
                                  .x1(width- margin.right)
                                  .x0(margin.left+1)
                                  .defined(function(d,i) { return d.hints.marked; } )
                                  .y(function(d,i) { return y(getCurveData(i, depth_curve_name, sfData)); });

					  
                 var areaPath = svg.append("path")      
                    .datum(sfData.data)
                    .attr("class", "area")
					.attr("clip-path", "url('#clip')")
                    .attr("d", areaMark)
                    .attr("stroke", "none")
                    .attr("fill","rgb(0,0,0)")
                    .attr("fill-opacity", 0.2 )
                    //.style("stroke-dasharray", ("7,3")) // make the stroke dashed
                    //.style("stroke", "rgba(0,0,0,0.4)")   // set the line colour
					;

  
	  
	  
	
	
	
  ////////////////      TOOLTIP Part 1       ///////////////////

	  
	function getTooltipXCoordinate(xFunction, xArgument) {
		if (xFunction && xArgument && xFunction(xArgument)) { 
			return xFunction(xArgument); 
		}
		else if (margin.left) {
			return margin.left;
		}
		else {
			return 1;
		}
	}
	  
	  
    //// statements to make sure the mouseover_curvename is a present curve and if not use first curve
    //if(mouseover_curvename == "default"){mouseover_curvename = curve_names[0]}
    //else if (curve_names.includes(mouseover_curvename)){mouseover_curvename = mouseover_curvename}
    //else{mouseover_curvename = curve_names[0]}
	
	let curve_x_func = x_functions_for_each_curvename[curve_names[0]];
	
	var second_curve = null;
	var second_curve_x_func = null;
	
	if(template_curves["fill"][0]["curve2"]) { 
		
		second_curve = template_curves["fill"][0]["curve2"];
		second_curve_x_func = x_functions_for_each_curvename[second_curve];
	}
	
    
    //// statement to handle color of curve text and circle on hover
    let curve_on_mouseover_color = curve_colors[0];

    
    //// appends start of mouseover rectange used for showing hover content
    var focus = svg.append("g")                                
      .style("display", "none");

    
  
    //// function called to change hover style & contents when mouseover rectangle appended to svg svg
    function mousemove(evt) {    
		
       depthIndex = getCurveIndex(depth_curve_name, sfData);	
	   curve1Index =  getCurveIndex(curve_names[0], sfData);
	   curve2Index =  getCurveIndex(curve_names[1], sfData);
	   
       var bisectData = d3.bisector( function(d) { return d.items[depthIndex]; } ).left; 

	   
	   var y0 = y.invert(d3.pointer(evt)[1]);
	   var i = bisectData(sfData.data, y0);  

		
        var d1 = sfData.data[i];
        var d0 = sfData.data[i - 1];                              

		var d = null;
		
		if (d0 && d1) {
		    if (d0[depthIndex] && d1[depthIndex]) {		
              d = (y0 - d0[depthIndex] > d1[depthIndex] - y0) ? d1 : d0;
		    }
		}
		if (d == null) { d = d1; }
		if (d == null) { d = d0; }

		

        //// depth value
        focus.select("text.y2")
		    .attr("filter", "url(#tooltip_background)")
            .attr("transform",
                  "translate(" + getTooltipXCoordinate(curve_x_func,d.items[curve1Index]) + "," +
                                 y(d.items[depthIndex]) + ")")
            .text(d.items[depthIndex]? d.items[depthIndex].toFixed(2) : '');
        
        //// curve value
        focus.select("text.y4")
		     .attr("filter", "url(#tooltip_background)")
             .attr("width", width - margin.right - margin.left)	
			 .attr("x", getTooltipXCoordinate(curve_x_func,d.items[curve1Index]) + 7 )
			 .attr("y", y(d.items[depthIndex]) + 12)
             .text(d.items[curve1Index] ? d.items[curve1Index] : '')
			 .call(wrapTooltip);
			 
			 
			
		if(second_curve) {
            focus.select("text.y6")
			    .attr("filter", "url(#tooltip_background)")
                .attr("transform",
                      "translate(" + getTooltipXCoordinate(curve_x_func,d.items[curve1Index]) + "," +
                                     y(d.items[depthIndex]) + ")")
                .text(d.items[curve2Index] ? d.items[curve2Index] : '');
		}
			
			

        focus.select(".x")
            .attr("transform",
                  "translate(" + getTooltipXCoordinate(curve_x_func,d.items[curve1Index]) + "," + 0+
                                  ")")
            .attr("y2", height);
					   
			
			
			
        //// circle y class part 2
        focus.select(".y")
            .attr("transform",
                  "translate(" + getTooltipXCoordinate(curve_x_func,d.items[curve1Index]) + "," +
                                 y(d.items[depthIndex]) + ")")
            .text(d.items[curve1Index] ? d.items[curve1Index] : '');
			
      focus.select(".yl")
            .attr("transform",
                  "translate(" + 0 + "," +
                                 y(d.items[depthIndex]) + ")")
            .text(d.items[curve1Index] ? d.items[curve1Index] : '');
    }             
    // append the x line
    focus.append("line")
        .attr("class", "x")
        .style("stroke", "red")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("y1", 0)
		.attr("y2", width);

    // append the y line
    focus.append("line")
        .attr("class", "yl")
        .style("stroke", "blue")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("x1", 0)
        .attr("x2", height);
    
    // append the circle at the intersection         
    focus.append("circle")                                
        .attr("class", "y")                               
        .style("fill", "none")                             
        .style("stroke", curve_on_mouseover_color ? curve_on_mouseover_color : 'black' )                          
        .attr("r", 3);       

     //// depth value on hover
     //if(mouseover_depth_or_depth_and_curve == "depth" || mouseover_depth_or_depth_and_curve == "depth_and_curve"){
       focus.append("text")
            .attr("class", "y2")
            .attr("dx", 6)
            .attr("dy", "-.7em")
			.attr("text-anchor", "left")
			.style("font-size","0.8em")
			//.text(function(d) { return "teste teste"; }).call(getBB); 
     //}
     
     //// curve value on hover
     //if(mouseover_depth_or_depth_and_curve == "curve" || mouseover_depth_or_depth_and_curve == "depth_and_curve"){
       focus.append("text")
            .attr("class", "y4")
            //.attr("dx", 0)
            //.attr("dy", "1.3em")
			.attr("text-anchor", "left")
            .style("font-size","0.8em")
			.style('fill', curve_on_mouseover_color ? curve_on_mouseover_color : 'black')
			.style('font-weight','bold');
            //.style("stroke", curve_on_mouseover_color ? curve_on_mouseover_color : 'black' ) 
            //.style("stroke-width", "0.5px");
			
			if (second_curve) {
                focus.append("text")
                     .attr("class", "y6")
                     .attr("dx", 6)
                     .attr("dy", "2.4em")
			         .attr("text-anchor", "left")
                     .style("font-size","0.8em")
					 .style('fill', curve_colors[1] ? curve_colors[1] : 'black')
					 .style('font-weight','bold');
                     //.style("stroke", curve_colors[1]) 
                     //.style("stroke-width", "0.5px");
			}
     //}
	 
	 
	 
	 
 
     // append the rectangle to capture mouse               // **********
     svg.append("rect")                                     // **********
            .attr("width", width)                              // **********
            .attr("height", height)                          // **********
            .style("fill", "none")                             // **********
            .style("pointer-events", "all")                    // **********
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); })
            .on("mousemove", mousemove);                       // **********
  
  
 

    //////////////  Calling node. Only returning svg node for saving single SVG file purposes =>////////////// 
    svg_holder.node()
    svg_header.node()
    return svg.node();
}

  
function wrapTooltip(text) {
    text.each(function() {
        var text = d3.select(this);
        var words = text.text().split(/[ ,.]+/).reverse();//.split(/\s+/).reverse();
        var lineHeight = 12;
        var width = parseFloat(text.attr('width'));
		
		
		
        var y = parseFloat(text.attr('y'));
        var x = text.attr('x');
        var anchor = text.attr('text-anchor');
        var tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('text-anchor', anchor);
        var lineNumber = 0;
        var line = [];
        var word = words.pop();
		
        while (word) {
            line.push(word);
            tspan.text(line.join(' '));
            if (tspan.node().getComputedTextLength() > width) {
                lineNumber += 1;
                line.pop();
                tspan.text(line.join(' '));
                line = [word];
                //tspan = text.append('tspan').attr('x', x).attr('y', y + lineNumber * lineHeight).attr('text-anchor', anchor).text(word);
				tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', lineNumber * lineHeight).attr('text-anchor', anchor).text(word);
            }
            word = words.pop();
        }
    });

}

function wrap(text) {	
    text.each(function() {
        var text = d3.select(this);
        var words = text.text().split(/[ ,.]+/).reverse();//.split(/\s+/).reverse();
        var lineHeight = 10;
        var width = parseFloat(text.attr('width'));
		var height = parseInt(d3.select(this).node().previousElementSibling.getBoundingClientRect().height);
        var y = parseFloat(text.attr('y'));
        var x = text.attr('x');
        var anchor = text.attr('text-anchor');
        var tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('text-anchor', anchor);
        var lineNumber = 0;
        var line = [];
        var word = words.pop();

        while (word) {
            line.push(word);
            tspan.text(line.join(' '));
            if (tspan.node().getComputedTextLength() > width) {
                lineNumber += 1;
                line.pop();
                tspan.text(line.join(' '));
                line = [word];
                tspan = text.append('tspan').attr('x', x).attr('y', y + lineNumber * lineHeight).attr('anchor', anchor).text(word);
            }
            word = words.pop();
        }
		
		if ((lineNumber+1) * lineHeight > height * 0.9) {
			text.selectAll("tspan").remove();
		}
		
    });
}
  
  
  
  
function getBB(selection) {
    selection.each(function(d){d.bbox = this.getBBox();})
}


function multipleLogPlot(div_id,templates, sfData){
  
  d3.select("#"+div_id) 
    .style("margin", "0" )
	.style("padding", "0" )
	.style("border", "0" );	 
	 
  let noDIV = d3.select("#"+div_id).selectAll("div").remove();
  let noSVG = d3.select("#"+div_id).selectAll("svg").remove();
  //if(spinner) { spinner.stop(); }
  
  //d3.select("#js_chart").attr("class","StyledScrollbar");
  
  let new_templates = []
  for (let i = 0; i < templates.length; i++) {
	if (templates[i]) {
		let curvebox_holder = d3.select("#"+div_id).append("div");
	
		curvebox_holder.style("vertical-align","middle")
		               .attr("id",div_id+"curvebox_holder"+i)
		               .style("display","inline-block");
      
		templates[i][0]["curve_box"]["div_id"] = div_id+"curvebox_holder"+i;
		new_templates.push(templates[i]);
		let template = templates[i];
		let check = curveBox(template, sfData);
	}
  }
  return new_templates
}