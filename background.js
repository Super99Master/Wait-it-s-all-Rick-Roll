'use strict';

var J_Son = "None";
var J_Son_Expire = 0;
LoadJ_Sons();

chrome.webRequest.onBeforeSendHeaders.addListener(
	function(details) {
		if (details.url.includes("googlevideo.com/videoplayback?")){
			if (details.url.includes("&origin=null")){
				for (var index in details.requestHeaders){
					if (details.requestHeaders[index].name == "Origin"){
						details.requestHeaders[index].value = "https://www.youtube.com"
					}
				}
				return {requestHeaders: details.requestHeaders}
			}
		}
	},
	{urls: ["<all_urls>"]},
	["blocking","requestHeaders","extraHeaders"]
);

chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		//return {redirectUrl: link}
		var url = details.url;
		if (url.includes("googlevideo.com/videoplayback?")){

			if (url.includes("&origin=null")){
				//onBeforeRequest get's called on the new redirect
				return {redirectUrl: null};
			}

			var link = GetAwesomeVideoLink(url);

			if (link == "BLOCK"){
				//If itag is not supported or the J_Son isn't ready it blocks the call, knowing youtube will retry it soon
				console.log("blocked")
				return {cancel: true};
			}
			
			var buffer = url.slice(url.search("&cpn="))
			link = link + buffer + "&origin=null"
			return {redirectUrl: link}
		}
		return {redirectUrl: null};
	},
	{urls: ["<all_urls>"]},
	["blocking","extraHeaders"]
);

function GetAwesomeVideoLink(link){
	LoadJ_Sons();
	if (J_Son == "None"){
		return "BLOCK";
	};
	var itag = GetItagFromLink(link)
	//console.log("Requested Itag: ",itag," Mime: ",GeMimeFromItag(itag))
	for (var index in J_Son.streamingData.adaptiveFormats){
		if (J_Son.streamingData.adaptiveFormats[index].itag == itag){
			if (typeof J_Son.streamingData.adaptiveFormats[index].url != 'undefined') {
				return J_Son.streamingData.adaptiveFormats[index].url;
			}else{
				console.log("Second")
				cypher = J_Son.streamingData.adaptiveFormats[index].signatureCipher;
				throw "not done yet";
			}
		}
	}
	//console.log("Itag not supported")
	return "BLOCK";
}
function LoadJ_Sons(){
	/*Ehi you, yeah you.
	No this is not the link to never gonna give you up, it's another video.
	why? bc even tho i tested the function to reverse the cypher and it works, i don't have implemented it yet.
	right now i'm more focussed on resolving CORS errors. meanwhile enjoy Wii Shop Music.
	*/
	var date = new Date()
	if (date/1000 > J_Son_Expire){
		var New_request = new XMLHttpRequest();
		New_request.open("GET", "https://www.youtube.com/watch?v=u-X08diBUTQ", true);
		New_request.send(null);
		New_request.onreadystatechange = function() {
			if (New_request.readyState == 4){
				var New_pos = Find_ytInitial_Pos(New_request.responseText);
				if (New_pos[0] == -1){
					console.log("Awesome Video not found")
				}else{
					var New_ytInitial = New_request.responseText.slice(New_pos[0], New_pos[1]) + "}";
					New_ytInitial = New_ytInitial.replace("var ytInitialPlayerResponse = ","")
					J_Son=JSON.parse(New_ytInitial)
					J_Son_Expire = date/1000 + J_Son.streamingData.expiresInSeconds - 60 
					//since i have no idea what the actual time of the request is, i remove 1 min to be sure that the link is always valid
					console.log("Awesome Video Ready to roll!")
				}
			}
		}
	}
}

function Find_ytInitial_Pos(html){ 
	var result = []
	result.push(html.search("var ytInitialPlayerResponse ="))
	if (result[0] != -1){
		var posI = result[0]
		var ParentesiCount = 0;
		while (true){
			switch (html.charAt(posI)){
				case "{":
					ParentesiCount = ParentesiCount + 1;
					break;
				case "}":
					ParentesiCount = ParentesiCount - 1;
					break;
			}
			if ((html.charAt(posI) == "}") && (ParentesiCount == 0)){
				break;
			}else{
				posI = posI + 1;
			}
		}
		result.push(posI)
	}
    return result;
};


function GetItagFromLink(link){
	link = link.split("&")
	for (var index in link){
		if (link[index].includes("itag=")){
			return link[index].replace("itag=","")
		}
	}
}

function GeMimeFromItag(itag){
		// [Type, Resolution/FPS or Kbps, Format, Codec, 3D, HDR]
	var dict = {
		5:  ["Audio/Video",	"flv",	"240",		"U",						false,	false],
		6:  ["Audio/Video",	"flv",	"270",		"U", 						false,	false],
		17: ["Audio/Video",	"3gb",	"144",		"U",						false,	false],
		18: ["Audio/Video",	"mp4",	"360",		"avc1.42001E, mp4a.40.2",	false,	false],
		22: ["Audio/Video",	"mp4",	"720",		"U",						false,	false],
		34: ["Audio/Video",	"flv",	"360",		"U",						false,	false],
		35: ["Audio/Video",	"flv",	"480",		"U",						false,	false],
		36: ["Audio/Video",	"3gb",	"180",		"U",						false,	false],
		37: ["Audio/Video",	"mp4",	"1080",		"U",						false,	false],
		38: ["Audio/Video",	"mp4",	"3072",		"U",						false,	false], 
		43: ["Audio/Video",	"webm",	"360",		"U",						false,	false], 
		44: ["Audio/Video",	"webm",	"480",		"U",						false,	false], 
		45: ["Audio/Video",	"webm",	"720",		"U",						false,	false], 
		46: ["Audio/Video",	"webm",	"1080",		"U",						false,	false],
		82: ["Audio/Video",	"mp4",	"360",		"U",						true,	false],   
		83: ["Audio/Video",	"mp4",	"480",		"U",						true,	false],   
		84: ["Audio/Video",	"mp4",	"720",		"U",						true,	false],   
		85: ["Audio/Video",	"mp4",	"1080",		"U",						true,	false],
		92: ["Audio/Video",	"hls",	"240",		"U",						true,	false],
		93: ["Audio/Video",	"hls",	"360",		"U",						true,	false],
		94: ["Audio/Video",	"hls",	"480",		"U",						true,	false],
		95: ["Audio/Video",	"hls",	"720",		"U",						true,	false],
		96: ["Audio/Video",	"hls",	"1080",		"U",						true,	false],
		100: ["Audio/Video","webm",	"360",		"U",						true,	false],
		101: ["Audio/Video","webm",	"480",		"U",						true,	false],
		102: ["Audio/Video","webm",	"720",		"U",						true,	false],
		132: ["Audio/Video","hls",	"240",		"U",						false,	false],
		133: ["Video",		"mp4",	"240",		"avc1.4d4015",				false,	false],
		134: ["Video",		"mp4",	"360",		"avc1.4d401e",				false,	false],
		135: ["Video",		"mp4",	"480",		"avc1.4d401e",				false,	false],
		136: ["Video",      "mp4",	"720",		"avc1.4d401f",				false,	false],
		137: ["Video",		"mp4",	"1080",		"avc1.640028",				false,	false],
		138: ["Video",		"mp4",	"2160/60",	"U",						false,	false],
		139: ["Audio",		"m4a",	"48k",		"U",						false,	false],
		140: ["Audio",		"m4a",	"128k",		"mp4a.40.2",				false,	false],
		141: ["Audio",		"m4a",	"256k",		"U",						false,	false],
		151: ["Video",		"hls",	"72",		"U",						false,	false],
		160: ["Video",		"mp4",	"144",		"avc1.4d400c",				false,	false],
		167: ["Audio/Video","webm",	"360",		"U",						false,	false],
		168: ["Audio/Video","webm",	"480",		"U",						false,	false],
		169: ["Audio/Video","webm",	"1080",		"U",						false,	false],
		171: ["Audio/Video","webm",	"128k",		"U",						false,	false],
		218: ["Audio/Video","webm",	"480",		"U",						false,	false],
		219: ["Audio/Video","webm",	"144",		"U",						false,	false],
		242: ["Video",		"webm",	"240",		"vp9",						false,	false],
		243: ["Video",		"webm",	"360",		"vp9",						false,	false],
		244: ["Video",		"webm",	"480",		"vp9",						false,	false],
		245: ["Audio/Video","webm",	"480",		"U",						false,	false],
		246: ["Audio/Video","webm",	"480",		"U",						false,	false],
		247: ["Video",		"webm",	"720",		"vp9",						false,	false],
		248: ["Video",		"webm",	"1080",		"vp9",						false,	false],
		249: ["Audio",		"webm",	"50k",		"opus",						false,	false],
		250: ["Audio",		"webm",	"70k",		"opus",						false,	false],
		251: ["Audio",		"webm",	"160k",		"opus",						false,	false],
		264: ["Video",		"mp4",	"1440",		"U",						false,	false],
		266: ["Video",		"mp4",	"2160/60",	"U",						false,	false],
		271: ["Video",		"webm",	"1440",		"U",						false,	false],
		272: ["Video",		"webm",	"4320",		"U",						false,	false],
		278: ["Video",		"webm",	"144",		"vp9",						false,	false],
		298: ["Video",		"mp4",	"720/60",	"U",						false,	false],
		299: ["Video",		"mp4",	"1080/60",	"U",						false,	false],
		302: ["Video",		"webm",	"720/60",	"U",						false,	false],
		303: ["Video",		"webm",	"1080/60",	"U",						false,	false],
		308: ["Video",		"webm",	"1440/60",	"U",						false,	false],
		313: ["Video",		"webm",	"2160",		"U",						false,	false],
		315: ["Video",		"webm",	"2160/60",	"U",						false,	false],
		330: ["Video",		"webm",	"144/60",	"U",						false,	true],
		331: ["Video",		"webm",	"240/60",	"U",						false,	true],
		332: ["Video",		"webm",	"360/60",	"U",						false,	true],
		333: ["Video",		"webm",	"480/60",	"U",						false,	true],
		334: ["Video",		"webm",	"720/60",	"U",						false,	true],
		335: ["Video",		"webm",	"1080/60",	"U",						false,	true],
		336: ["Video",		"webm",	"1440/60",	"U",						false,	true],
		337: ["Video",		"webm",	"2160/60",	"U",						false,	true],
		394: ["Video",		"mp4",	"144",		"av01.0.01M.08",			false,	false],
		395: ["Video",		"mp4",	"240",		"av01.0.01M.08",			false,	false],
		396: ["Video",		"mp4",	"360",		"av01.0.01M.08",			false,	false],
		397: ["Video",		"mp4",	"480",		"av01.0.04M.08",			false,	false],
		398: ["Video",      "mp4",	"720",		"av01.0.05M.08",			false,	false],
		399: ["Video",		"mp4",	"1080",		"av01.0.08M.08",			false,	false]
	};
	var mime = dict[itag]
	if (typeof mime != 'undefined') {
		return mime;
	}
	return "I have no idea";
}