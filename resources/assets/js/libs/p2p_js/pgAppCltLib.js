/**********************************************************
  copyright   : Copyright (C) 2012-2012, chenbichao,
                All rights reserved.
  filename    : pgAppCltLib.js
  discription : 
  modify      : create, chenbichao, 2012/5/20
**********************************************************/


///
// Debug output
function OutString(sOut)
{
    console.log(sOut);
	if (typeof(debugOutString) == "function") {
		debugOutString(sOut);
	}
}

///
// pg class name and method id.
var pgAppClass = {
	PG_CLASS_Peer:{
		Name:"PG_CLASS_Peer",
		Method:{Login:0,Logout:1,Status:2,Call:3,Message:4,SetAddr:5,GetAddr:6,DigGen:7,DigVerify:8,CheckInfo:9}
	},
	PG_CLASS_Group:{
		Name:"PG_CLASS_Group",
		Method:{Modify:0,Update:1,Master:2}
	},
	PG_CLASS_Data:{
		Name:"PG_CLASS_Data",
		Method:{Message:0}
	},
	PG_CLASS_File:{
		Name:"PG_CLASS_File",
		Method:{Put:0,Get:1,Status:2,Cancel:3}
	},
	PG_CLASS_Audio:{
		Name:"PG_CLASS_Audio",
		Method:{Open:0,Close:1,CtrlVolume:2,ShowVolume:3,Speech:4,Record:5}
	},
	PG_CLASS_Video:{
		Name:"PG_CLASS_Video",
		Method:{Open:0,Close:1,Move:2,Join:3,Leave:4,Camera:5,Record:6}
	},
	PG_CLASS_Board:{
		Name:"PG_CLASS_Board",
		Method:{Open:0,Close:1,Shape:2,Cursor:3,Save:4,Load:5,Ctrl:6}
	},
	PG_CLASS_Share:{
		Name:"PG_CLASS_Share",
		Method:{Open:0,Close:1,FileInfo:2,FileStatus:3,PeerStatus:4}
	},
	PG_CLASS_Table:{
		Name:"PG_CLASS_Table",
		Method:{Init:0,Sync:1,Index:2,Insert:3,Delete:4,Update:5,Query:6,Report:7}
	},
	PG_CLASS_Live:{
		Name:"PG_CLASS_Live",
		Method:{Open:0,Close:1,Ctrl:2,Status:3,Record:4}
	},
	PG_CLASS_Screen:{
		Name:"PG_CLASS_Screen",
		Method:{Open:0,Close:1,Ctrl:2,Event:3}
	},

	GetMeth:function(sClass, sMeth) {
		try {
			return parseInt(32 + eval("pgAppClass.PG_CLASS_" + sClass + ".Method." + sMeth));
		}
		catch (e) {
			return 0xff;
		}
	}
};

///
// Error code
var pgErrCode = {
	PG_ERR_Normal:0,
	PG_ERR_System:1,
	PG_ERR_BadParam:2,
	PG_ERR_BadClass:3,
	PG_ERR_BadMethod:4,
	PG_ERR_BadObject:5,
	PG_ERR_BadStatus:6,
	PG_ERR_BadFile:7,
	PG_ERR_BadUser:8,
	PG_ERR_BadPass:9,
	PG_ERR_NoLogin:10,
	PG_ERR_Network:11,
	PG_ERR_Timeout:12,
	PG_ERR_Reject:13,
	PG_ERR_Busy:14,
	PG_ERR_Opened:15,
	PG_ERR_Closed:16,
	PG_ERR_Exist:17,
	PG_ERR_NoExist:18,
	PG_ERR_NoSpace:19,
	PG_ERR_BadType:20,
	PG_ERR_CheckErr:21,
	PG_ERR_BadServer:22,
	PG_ERR_Unknown:0xff
};

// Error msg.
var pgErrMsg = {
	aErr:new Array("成功(PG_ERR_Normal)",
		"系统错误(PG_ERR_System)",
		"参数错误(PG_ERR_BadParam)",
		"无效的功能类(PG_ERR_BadClass)",
		"无效的方法(PG_ERR_BadMethod)",
		"无效的对象(PG_ERR_BadObject)",
		"错误的状态(PG_ERR_BadStatus)",
		"无效的文件(PG_ERR_BadFile)",
		"无效的用户(PG_ERR_BadUser)",
		"密码错误(PG_ERR_BadPass)",
		"未登录(PG_ERR_NoLogin)",
		"网络错误(PG_ERR_Network)",
		"操作超时(PG_ERR_Timeout)",
		"拒绝访问(PG_ERR_Reject)",
		"系统正忙(PG_ERR_Busy)",
		"资源已经打开(PG_ERR_Opened)",
		"资源已经关闭(PG_ERR_Closed)",
		"资源已经存在(PG_ERR_Exist)",
		"资源不存在(PG_ERR_NoExist)",
		"空间或容量限制(PG_ERR_NoSpace)",
		"无效的类型(PG_ERR_BadType)",
		"校验错误(PG_ERR_CheckErr)"),

	GetMsg:function(iErr) {
		if (iErr < 0) {
			return "Waitting";
		}
		else if (iErr < pgErrMsg.aErr.length) {
			return pgErrMsg.aErr[iErr];
		}
		else {
			return "Unknown";
		}
	}
};


///
// plugin callback map.
function _pgAppCBInfo(sCBName, sObj, uMeth, sParam, sPeer, oCBObj)
{
	this.sCBName = sCBName;
	this.sObj = sObj;
	this.uMeth = uMeth;
	this.sParam = sParam;
	this.sPeer = sPeer;
	this.oCBObj = oCBObj;
}

// Don't call the functions of the object.
var _pgAppCallback = {

	oCBObjDef:null,
	oList:new Array(),
	
	Add:function(sCBName, sObj, uMeth, sParam, sPeer, oCBObj) {

		// Check parameter invalid
		if (typeof(sCBName) != "string" || (!sCBName) || typeof(sObj) != "string" || (!sObj)
			|| typeof(uMeth) != "number" || typeof(sParam) != "string" || typeof(sPeer) != "string"
			|| (!oCBObj) || typeof(oCBObj.OnReply) != "function" || typeof(oCBObj.OnExtRequest) != "function")
		{
			var sOut = "_pgAppCallback.Add: bad parameter. sCBName=" + sCBName + ", sObj="
				+ sObj + ", uMeth=" + uMeth + ", sParam=" + sParam + ", sPeer=" + sPeer;
			OutString(sOut);
			return false;
		}
		
		// Clean the invalid unit.
		var iInd = 0;
		while (iInd < _pgAppCallback.oList.length) {
			if ((!_pgAppCallback.oList[iInd].oCBObj)
				|| typeof(_pgAppCallback.oList[iInd].oCBObj) != "object")
			{
				_pgAppCallback.oList.splice(iInd, 1);
			}
			else {
				iInd++;
			}
		}

		// Find if unit exist.
		var iLen = _pgAppCallback.oList.length;
		for (var i = 0; i < iLen; i++) {
			if (_pgAppCallback.oList[i].sCBName == sCBName && _pgAppCallback.oList[i].sObj == sObj
				&& _pgAppCallback.oList[i].uMeth == uMeth && _pgAppCallback.oList[i].sParam == sParam
				&& _pgAppCallback.oList[i].sPeer == sPeer)
			{
				//OutString("_pgAppCallback.Add, exist: sCBName=" + sCBName);
				_pgAppCallback.oList[i].oCBObj = oCBObj;
				return true;
			}
		}

		// New unit.
		//OutString("_pgAppCallback.Add, new: sCBName=" + sCBName);
		_pgAppCallback.oList[iLen] = new _pgAppCBInfo(sCBName, sObj, uMeth, sParam, sPeer, oCBObj);
		
		return true;
	},

	Delete:function(sCBName, sObj, uMeth, sParam, sPeer) {

		// Check parameter invalid
		if (typeof(sCBName) != "string" || typeof(sObj) != "string"
			|| typeof(uMeth) != "number" || typeof(sParam) != "string"
			|| typeof(sPeer) != "string")
		{
			OutString("_pgAppCallback.Delete: bad parameter");
			return;
		}

		var i = 0;
		while ( i < _pgAppCallback.oList.length) {
			var bTemp = true;
			if (sCBName && (_pgAppCallback.oList[i].sCBName != sCBName)) {
				bTemp = false;
			}
			if (bTemp && sObj && (_pgAppCallback.oList[i].sObj != sObj)) {
				bTemp = false;
			}
			if (bTemp && (uMeth < 0xff)
				&& (_pgAppCallback.oList[i].uMeth < 0xff)
				&& (_pgAppCallback.oList[i].uMeth != uMeth))
			{
				bTemp = false;
			}
			if (bTemp && sParam && _pgAppCallback.oList[i].sParam
				&& (_pgAppCallback.oList[i].sParam != sParam))
			{
				bTemp = false;
			}
			if (bTemp && sPeer && _pgAppCallback.oList[i].sPeer
				&& (_pgAppCallback.oList[i].sPeer != sPeer))
			{
				bTemp = false;
			}
			if (bTemp) {
				_pgAppCallback.oList.splice(i, 1);
			}
			else {
				i++;
			}
		}
	},
	
	Clean:function() {
		var iLen = _pgAppCallback.oList.length;
		_pgAppCallback.oList.splice(0, iLen);
		_pgAppCallback.oCBObjDef = null;
	},

	InvokeOnExtRequest:function(sObj, uMeth, sData, uHandle, sPeer) {
		OutString("InvokeOnExtRequest: sObj=" + sObj + ", uMeth=" + uMeth + ", Data=" + sData + ", sPeer=" + sPeer);
		var iMaxInd = -1;
		var uMaxMatch = 0;
		var iLen = _pgAppCallback.oList.length;
		for (var i = 0; i < iLen; i++) {
			var uMatch = 0;
			if (_pgAppCallback.oList[i].sObj && (_pgAppCallback.oList[i].sObj == sObj)) {
				uMatch |= 0x10000;
			}
			if (_pgAppCallback.oList[i].sPeer) {
				if (_pgAppCallback.oList[i].sPeer == sPeer) {
					uMatch |= 0x100;
				}
				else if ((_pgAppCallback.oList[i].sPeer.length >= sPeer.indexOf(':'))
					&& (sPeer.indexOf(_pgAppCallback.oList[i].sPeer) == 0))
				{
					// Match the peer prefix.
					uMatch |= 0x40;
				}
			}
			if ((_pgAppCallback.oList[i].uMeth < 0xff) && (_pgAppCallback.oList[i].uMeth == uMeth)) {
				uMatch |= 0x4;
			}
			if (uMatch > uMaxMatch) {
				uMaxMatch = uMatch;
				iMaxInd = i;
			}
		}
		if (iMaxInd >= 0) {
			if (typeof(_pgAppCallback.oList[iMaxInd].oCBObj) == "object"
				&& typeof(_pgAppCallback.oList[iMaxInd].oCBObj.OnExtRequest) == "function")
			{
			//	OutString("_Callback: sObj=" + sObj + ", sCBName=" + _pgAppCallback.oList[iMaxInd].sCBName);
				var iErr = _pgAppCallback.oList[iMaxInd].oCBObj.OnExtRequest(sObj,
					uMeth, sData, uHandle, sPeer, _pgAppCallback.oList[iMaxInd].sCBName);
				if (iErr != pgErrCode.PG_ERR_Unknown) {
					return iErr;
				}
			}
		}
		if (_pgAppCallback.oCBObjDef) {
			if (typeof(_pgAppCallback.oCBObjDef) == "object"
				&& typeof(_pgAppCallback.oCBObjDef.OnExtRequest) == "function")
			{
				return _pgAppCallback.oCBObjDef.OnExtRequest(sObj,
					uMeth, sData, uHandle, sPeer, "");
			}
		}
		return pgErrCode.PG_ERR_Unknown;
	},

	InvokeOnReply:function(sObj, uErr, sData, sParam) {
		OutString("InvokeOnReply: sObj=" + sObj + ", uErr=" + uErr + ", Data=" + sData + ", sParam=" + sParam);
		var sCBName = "";
		var sParamTemp = sParam;
		var iInd = sParam.indexOf('\\');
		if (iInd >= 0) {
			sCBName = sParam.substr(0, iInd);
			sParamTemp = sParam.substr(iInd + 1);
		}
		var iMaxInd = -1;
		var uMaxMatch = 0;
		var uMaxPrefix = 0;
		var iLen = _pgAppCallback.oList.length;
		for (var i = 0; i < iLen; i++) {
			var uMatch = 0;
			var uPrefix = 0;
			if (_pgAppCallback.oList[i].sCBName && (_pgAppCallback.oList[i].sCBName == sCBName)) {
				uMatch |= 0x10000;
			}
			if (_pgAppCallback.oList[i].sParam && (_pgAppCallback.oList[i].sParam == sParamTemp)) {
				uMatch |= 0x100;
			}
			if (_pgAppCallback.oList[i].sObj) {
				if ((_pgAppCallback.oList[i].sObj == sObj)) {
					uMatch |= 0x10;
				}
				else if (sObj.indexOf(_pgAppCallback.oList[i].sObj) == 0) {
					uPrefix = _pgAppCallback.oList[i].sObj.length;
				}
			}
			if (uMatch > uMaxMatch) {
				uMaxMatch = uMatch;
				iMaxInd = i;
			}
			else if ((uMatch & 0x10100) == 0) { // 0x10000 | 0x100 == 0x10100
				// Only match Obj, then match the longest prefix.
				if (uPrefix > uMaxPrefix) {
					uMaxPrefix = uPrefix;
					iMaxInd = i;
				}
			}
			//OutString("InvokeOnReply, CBName=" + _pgAppCallback.oList[i].sCBName);
		}
		if (iMaxInd >= 0) {
			if (typeof(_pgAppCallback.oList[iMaxInd].oCBObj) == "object"
				&& typeof(_pgAppCallback.oList[iMaxInd].oCBObj.OnReply) == "function")
			{
				if (_pgAppCallback.oList[iMaxInd].oCBObj.OnReply(sObj, uErr, sData, sParamTemp, _pgAppCallback.oList[iMaxInd].sCBName)) {
					return 1;
				}
			}
		}
		if (_pgAppCallback.oCBObjDef) {
			if (typeof(_pgAppCallback.oCBObjDef) == "object"
				&& typeof(_pgAppCallback.oCBObjDef.OnReply) == "function")
			{
				return _pgAppCallback.oCBObjDef.OnReply(sObj, uErr, sData, sParamTemp, sCBName);
			}
		}
		return 0;
	}
};

// null callback function.
function _CBNull(){
    return null;
}

///
// Plugin APIs.
var pgAppPlugin = {

	oPlugin:null,
	sSvrName:"",

	// Attach plugin obj
	SetPlugin:function(oPlugin) {
		pgAppPlugin.oPlugin = oPlugin;
	},

	// Init and clean.
	Initialize:function(sNodeParam, sClassList, sSvrName, sSvrAddr, sRelayList) {
		if (!pgAppPlugin.oPlugin) {
			alert("Please call to 'SetPlugin' first!");
			return false;
		}
		if (typeof(pgAppPlugin.oPlugin.Control) == "undefined") {
			if ((!!window.ActiveXObject || "ActiveXObject" in window) &&
				confirm("本计算机上还没有安装Peergine客户端，或者没有正确安装Peergine客户端，您现在要安装吗？非IE浏览器请忽略。")) {
				window.location = "http://www.peergine.com/download/pgSetup_zh.msi";
			}
			return false;
		}
		pgAppPlugin.oPlugin.Control = "Type=1";
		pgAppPlugin.oPlugin.Node = "Type=0;" + sNodeParam;
		pgAppPlugin.oPlugin.Class = sClassList;
		pgAppPlugin.oPlugin.Local = "Addr=0:0:0:127.0.0.2:0:0";
		pgAppPlugin.oPlugin.Server = "Name=" + sSvrName + ";Addr=" + sSvrAddr + ";Digest=1";
		if (sRelayList) {
			pgAppPlugin.oPlugin.Relay = sRelayList;
		}
		else {
			pgAppPlugin.oPlugin.Relay = "(Relay0){(Type){0}(Load){0}(Addr){0:0:0:118.123.6.134:443:0}}";
		}
		pgAppPlugin.oPlugin.OnExtRequest = _pgAppCallback.InvokeOnExtRequest;
		pgAppPlugin.oPlugin.OnReply = _pgAppCallback.InvokeOnReply;
		if (!pgAppPlugin.oPlugin.Start(0)) {
			OutString("Initialize failed");
			return false;
		}
		pgAppPlugin.sSvrName = sSvrName;
		OutString("Initialize success");
		return true;
	},
	Clean:function() {
		pgAppPlugin.oPlugin.OnExtRequest = _CBNull;
		pgAppPlugin.oPlugin.OnReply = _CBNull;
		pgAppPlugin.Logout();
	},

	// Login and logout.
	Login:function(sUser, sPass, sSess, sCBName) {
		var iErr = pgErrCode.PG_ERR_BadParam;
		if (sUser) {
			var sData = "(User){" + pgAppPlugin.omlEncode(sUser)
				+ "}(Pass){" + pgAppPlugin.omlEncode(sPass)
				+ "}(Param){}";
			iErr = pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Login",
				sData, "pgAppPlugin.Login", sCBName);
		}
		return iErr;
	},
	Logout:function() {
		pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Logout", "", "pgAppPlugin.Logout", "");
	},

	// Object handle methods.
	ObjectAdd:function(sObj, sClass, sGroup, uOption) {
		return pgAppPlugin.oPlugin.ObjectAdd(sObj, ("PG_CLASS_" + sClass), sGroup, uOption);
	},
	ObjectDelete:function(sObj) {
		pgAppPlugin.oPlugin.ObjectDelete(sObj);
	},
	ObjectRequest:function(sObj, sMeth, sData, sParam, sCBName) {
		var sClsName = pgAppPlugin.oPlugin.ObjectGetClass(sObj);
		if (sClsName) {
			var uMethTemp = 0xff;
			try {
				uMethTemp = parseInt(32 + eval("pgAppClass." + sClsName + ".Method." + sMeth));
			}
			catch (e) {
				pgErrCode.PG_ERR_BadParam;
			}
			var sParamTemp = "";
			if (sCBName) {
				sParamTemp = sCBName + "\\" + sParam;
			}
			else {
				sParamTemp = sParam;
			}
			return pgAppPlugin.oPlugin.ObjectRequest(sObj, uMethTemp, sData, sParamTemp);
		}
		return pgErrCode.PG_ERR_BadObject;
	},
	ObjectExtReply:function(sObj, uErr, sData, hHandle) {
		return pgAppPlugin.oPlugin.ObjectExtReply(sObj, uErr, sData, hHandle);
	},
	ObjectGetClass:function(sObj) {
		var sClass = pgAppPlugin.oPlugin.ObjectGetClass(sObj);
		if (sClass.indexOf("PG_CLASS_") == 0) {
			sClass = sClass.substr(9);
		}
		return sClass;
	},
	ObjectSetGroup:function(sObj, sGroup) {
		return pgAppPlugin.oPlugin.ObjectSetGroup(sObj, sGroup);
	},
	ObjectGetGroup:function(sObj) {
		return pgAppPlugin.oPlugin.ObjectGetGroup(sObj);
	},
	ObjectSync:function(sObj, sPeer, uAction) {
		return pgAppPlugin.oPlugin.ObjectSync(sObj, sPeer, uAction);
	},
	ObjectEnum:function(sObj, sClass) {
		var sClsTemp = ("PG_CLASS_" + sClass);
		return pgAppPlugin.oPlugin.ObjectEnum(sObj, sClsTemp);
	},

	// OML parser methods.
	omlEncode:function(sEle) {
		return pgAppPlugin.oPlugin.omlEncode(sEle);
	},
	omlDecode:function(sEle) {
		return pgAppPlugin.oPlugin.omlDecode(sEle);
	},
	omlGetName:function(sEle, sPath) {
		return pgAppPlugin.oPlugin.omlGetName(sEle, sPath);
	},
	omlGetClass:function(sEle, sPath) {
		return pgAppPlugin.oPlugin.omlGetClass(sEle, sPath);
	},
	omlGetContent:function(sEle, sPath) {
		return pgAppPlugin.oPlugin.omlGetContent(sEle, sPath);
	},
	omlGetEle:function(sEle, sPath, uSize, uPos) {
		return pgAppPlugin.oPlugin.omlGetEle(sEle, sPath, uSize, uPos);
	},
	omlNewEle:function(sName, sClass, sContent) {
		return pgAppPlugin.oPlugin.omlNewEle(sName, sClass, sContent);
	},
	omlDeleteEle:function(sEle, sPath, uSize, uPos) {
		return pgAppPlugin.oPlugin.omlDeleteEle(sEle, sPath, uSize, uPos);
	},
	omlSetName:function(sEle, sPath, sName) {
		return pgAppPlugin.oPlugin.omlSetName(sEle, sPath, sName);
	},
	omlSetClass:function(sEle, sPath, sClass) {
		return pgAppPlugin.oPlugin.omlSetClass(sEle, sPath, sClass);
	},
	omlSetContent:function(sEle, sPath, sContent) {
		return pgAppPlugin.oPlugin.omlSetContent(sEle, sPath, sContent);
	},

	// Utilize command.
	Cmd:function(sCmd, sParam) {
		return pgAppPlugin.oPlugin.utilCmd(sCmd, sParam);
	},
	
	// Callback handles
	CallbackSetDef:function(oCBObj) {
		_pgAppCallback.oCBObjDef = oCBObj;
	},
	CallbackAdd:function(sCBName, sObj, uMeth, sParam, sPeer, oCBObj) {
		return _pgAppCallback.Add(sCBName, sObj, uMeth, sParam, sPeer, oCBObj);
	},
	CallbackDelete:function(sCBName, sObj, uMeth, sParam, sPeer) {
		_pgAppCallback.Delete(sCBName, sObj, uMeth, sParam, sPeer);
	},
	CallbackClean:function() {
		pgAppPlugin.oPlugin.OnExtRequest = _CBNull;
		pgAppPlugin.oPlugin.OnReply = _CBNull;
		_pgAppCallback.Clean();
	},

	// helper functions.
	GetUserName:function(sPeer) {
		return pgAppUti.GetUserName(sPeer);
	},
	GetUserPeer:function(sPeer) {
		return pgAppUti.GetUserPeer(sPeer);
	}	
};

///
// Login session store in cookie.
var pgLoginSess = {
	GetTemp:function() {
		var date = new Date();
		var sRandom = new String((Math.random() * 10000));
		return ("_TEMP_" + parseInt(sRandom) + date.getTime());
	},
	GetSess:function() {
		var sVal = pgAppPlugin.Cmd("CookieGet", "(Name){_pgSess}");
		return pgAppPlugin.omlGetContent(sVal, "Value");
	},
	SetSess:function(sUser, sSess, uExpire) {
		var date = new Date();
		var iTimeMillisec = date.getTime() + (uExpire * 1000);
		date.setTime(iTimeMillisec);
		var sExpireVal = date.getYear() + "-" + (parseInt(date.getMonth()) + 1) + "-" + date.getDate()
			 + "," + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
		var sValue = "(User){" + sUser + "}(Sess){" + sSess + "}";
		var sParam = "(Name){_pgSess}(Value){" + pgAppPlugin.omlEncode(sValue)
			+ "}(Expire){" + sExpireVal + "}";
		OutString(sParam);
		pgAppPlugin.Cmd("CookieSet", sParam);
	},
	CleanSess:function() {
		var sParam = "(Name){_pgSess}";
		pgAppPlugin.Cmd("CookieDelete", sParam);
	},
	GetURL:function() {
		var sVal = pgAppPlugin.Cmd("CookieGet", "(Name){_pgUrl}");
		var sURL = pgAppPlugin.omlGetContent(sVal, "Value");
		var sParam = "(Name){_pgUrl}(Value){}(Expire){2000-1-1,00:00:00}";
		pgAppPlugin.Cmd("CookieSet", sParam);
		return sURL;
	},
	SetURL:function(sURL) {
		var date = new Date();
		var iTimeMillisec = date.getTime() + 8000;
		date.setTime(iTimeMillisec);
		var sExpVal = date.getYear() + "-" + (parseInt(date.getMonth()) + 1) + "-" + date.getDate()
			 + "," + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
		var sParam = "(Name){_pgUrl}(Value){" + pgAppPlugin.omlEncode(sURL)
			+ "}(Expire){" + sExpVal + "}";
		pgAppPlugin.Cmd("CookieSet", sParam);
	}
};

var pgAppCfg = {
	ValSet:function(sCk, sID, sVal) {
		var sValue = pgAppPlugin.Cmd("CookieGet", "(Name){_pgcfg_" + sCk + "}");
		var sListEle = pgAppPlugin.omlGetContent(sValue, "Value");
		var sIDTemp = "\n*" + sID;
		var sEle = pgAppPlugin.omlGetEle(sListEle, sIDTemp, 1, 0);
		if (sEle) {
			if (pgAppPlugin.omlGetContent(sEle, "") == sVal) {
				return;
			}
			sListEle = pgAppPlugin.omlDeleteEle(sListEle, sIDTemp, 1, 0);
		}
		sListEle += "(" + sID + "){" + pgAppPlugin.omlEncode(sVal) + "}";
		var sParam = "(Name){_pgcfg_" + sCk + "}(Value){" +
			pgAppPlugin.omlEncode(sListEle) + "}(Expire){2200-1-1,00:00:00}";
		pgAppPlugin.Cmd("CookieSet", sParam);
	},
	ValGet:function(sCk, sID) {
		var sValue = pgAppPlugin.Cmd("CookieGet", "(Name){_pgcfg_" + sCk + "}");
		var sListEle = pgAppPlugin.omlGetContent(sValue, "Value");
		var sIDTemp = "\n*" + sID;
		return pgAppPlugin.omlGetContent(sListEle, sIDTemp);
	},
	ValList:function(sCk) {
		var sValue = pgAppPlugin.Cmd("CookieGet", "(Name){_pgcfg_" + sCk + "}");
		return pgAppPlugin.omlGetContent(sValue, "Value");
	},
	ValClean:function(sCk) {
		pgAppPlugin.Cmd("CookieDelete", "(Name){_pgcfg_" + sCk + "}");
	}
};

///
// The functions for Common User to access User Server.
var pgUserSvrUsr = {
	
	sCBName:"",
	SetCBName:function(sCBName) {
		pgUserSvrUsr.sCBName = sCBName;
	},

	Register:function(sUser, sPass, sEmail) {
		var sData = "0:(User){" + sUser + "}(Pass){" + pgAppPlugin.omlEncode(sPass)
			+ "}(Email){" + pgAppPlugin.omlEncode(sEmail) + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrUsr.Register", pgUserSvrUsr.sCBName);
	},
	ModifyPass:function(sPass) {
		var sData = "1:(Pass){" + pgAppPlugin.omlEncode(sPass) + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrUsr.ModifyPass", pgUserSvrUsr.sCBName);
	},
	ModifyEmail:function(sEmail) {
		var sData = "2:(Email){" + pgAppPlugin.omlEncode(sEmail) + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrUsr.ModifyEmail", pgUserSvrUsr.sCBName);
	},
	GetUserInfo:function() {
		var sData = "3:";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrUsr.GetUserInfo", pgUserSvrUsr.sCBName);
	},
	DomainList:function(iSize, iPos) {
		var sData = "4:(Size){" + iSize + "}(Pos){" + iPos + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrUsr.DomainList", pgUserSvrUsr.sCBName);
	},
	MailAuth:function(sUser) {
		var sData = "5:(User){" + sUser + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrUsr.MailAuth", pgUserSvrUsr.sCBName);
	}
};

///
// The functions for Manager to access User Server
var pgUserSvrMng = {

	sCBName:"",
	SetCBName:function(sCBName) {
		pgUserSvrMng.sCBName = sCBName;
	},

	AddUser:function(sUser, sPass, sEmail, sType) {
		var sData = "32:(User){" + sUser + "}(Pass){" + sPass
			+ "}(Email){" + pgAppPlugin.omlEncode(sEmail) + "}(Type){" + sType + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.AddUser", pgUserSvrMng.sCBName);
	},
	DeleteUser:function(sUser) {
		var sData = "33:(User){" + sUser + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.DeleteUser", pgUserSvrMng.sCBName);
	},
	SearchUser:function(iOnline, sField, sValue, iSize, iPos) {
		var sData = "34:(Online){" + iOnline + "}(Field){" + sField
			+ "}(Value){" + sValue + "}(Size){" + iSize + "}(Pos){" + iPos + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.SearchUser", pgUserSvrMng.sCBName);
	},
	ModifyUserPass:function(sUser, sPass) {
		var sData = "35:(User){" + sUser + "}(Pass){" + sPass + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.ModifyUserPass", pgUserSvrMng.sCBName);
	},
	ModifyUserStatus:function(sUser, sStatus) {
		var sData = "36:(User){" + sUser + "}(Status){" + sStatus + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.ModifyUserStatus", pgUserSvrMng.sCBName);
	},
	ModifyUserType:function(sUser, uType) {
		var sData = "38:(User){" + sUser + "}(Type){" + uType + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.ModifyUserType", pgUserSvrMng.sCBName);
	},
	GetUserInfo:function(sUser) {
		var sData = "39:(User){" + sUser + "}";
		console.log(pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.GetUserInfo", pgUserSvrMng.sCBName));
	},
	GetDomainLimit:function() {
		var sData = "40:";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.GetDomainLimit", pgUserSvrMng.sCBName);
	},
	UserAclAdd:function(sUser, sPeer, uAction) {
		var sData = "41:(User){" + sUser + "}(Peer){" + sPeer + "}(Action){" + uAction + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.UserAclAdd", pgUserSvrMng.sCBName);
	},
	UserAclDelete:function(sUser, sPeer) {
		var sData = "42:(User){" + sUser + "}(Peer){" + sPeer + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.UserAclDelete", pgUserSvrMng.sCBName);
	},
	UserAclGet:function(sUser) {
		var sData = "43:(User){" + sUser + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.UserAclGet", pgUserSvrMng.sCBName);
	},
	UserTunnelSvrSet:function(sUser, sAddrListen, bEnc, bCmp) {
		var sData = "44:(User){" + sUser + "}(AddrListen){" + sAddrListen + "}(Encrypt){" + bEnc + "}(Compress){" + bCmp + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.UserTunnelSvrSet", pgUserSvrMng.sCBName);
	},
	UserTunnelSvrGet:function(sUser) {
		var sData = "45:(User){" + sUser + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.UserTunnelSvrGet", pgUserSvrMng.sCBName);
	},
	UserTunnelCltAdd:function(sUser, sTcpSvrPeer) {
		var sData = "46:(User){" + sUser + "}(TcpSvrPeer){" + sTcpSvrPeer + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.UserTunnelCltAdd", pgUserSvrMng.sCBName);
	},
	UserTunnelCltDelete:function(sUser, sTcpSvrPeer) {
		var sData = "47:(User){" + sUser + "}(TcpSvrPeer){" + sTcpSvrPeer + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.UserTunnelCltDelete", pgUserSvrMng.sCBName);
	},
	UserTunnelCltGet:function(sUser) {
		var sData = "48:(User){" + sUser + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.UserTunnelCltGet", pgUserSvrMng.sCBName);
	},
	UserFwdDNSSet:function(sUser, sFwdDNS) {
		var sData = "49:(User){" + sUser + "}(FwdDNS){" + sFwdDNS + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.UserFwdDNSSet", pgUserSvrMng.sCBName);
	},
	UserFwdDNSGet:function(sUser) {
		var sData = "50:(User){" + sUser + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.UserFwdDNSGet", pgUserSvrMng.sCBName);
	},
	UserCmmtSet:function(sUser, sCmmt) {
		var sData = "52:(User){" + sUser + "}(Cmmt){" + pgAppPlugin.omlEncode(sCmmt) + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.UserCmmtSet", pgUserSvrMng.sCBName);
	},
	UserTunnelCnntSet:function(sUser, sAddrTcpSvr, sProxy, sAllowPub) {
		var sData = "53:(User){" + sUser + "}(AddrTcpSvr){" + sAddrTcpSvr + "}(Proxy){" + sProxy + "}(AllowPub){" + sAllowPub + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.UserTunnelCnntSet", pgUserSvrMng.sCBName);
	},
	DomainList:function(iSize, iPos) {
		var sData = "55:(Size){" + iSize + "}(Pos){" + iPos + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.DomainList", pgUserSvrMng.sCBName);
	},
	BackupList:function() {
		var sData = "56:";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.BackupList", pgUserSvrMng.sCBName);
	},
	UserSetInfo:function(sUser, sField, sValue) {
		var sData = "57:(User){" + sUser + "}(Field){" + sField + "}(Value){" + pgAppPlugin.omlEncode(sValue) + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.UserSetInfo", pgUserSvrMng.sCBName);
	},
	UserGetInfo:function(sUser, sField) {
		var sData = "58:(User){" + sUser + "}(Field){" + sField + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.UserGetInfo", pgUserSvrMng.sCBName);
	},
	UserDomainSwitch:function(sUser, sDomain) {
		var sData = "59:(User){" + sUser + "}(Domain){" + sDomain + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.UserDomainSwitch", pgUserSvrMng.sCBName);
	},
	UserGetFileList:function(sUser) {
		var sData = "60:(User){" + sUser + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.UserGetFileList", pgUserSvrMng.sCBName);
	},
	UserNotify:function(sUser, sNotify, sParam) {
		var sData = "62:(User){" + sUser + "}(Notify){" + pgAppPlugin.omlEncode(sNotify) + "}(Param){" + pgAppPlugin.omlEncode(sParam) + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.UserNotify", pgUserSvrMng.sCBName);
	},
	ShutdownUserSvr:function(sPass) {
		var sData = "63:(Pass){" + sPass + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrMng.ShutdownUserSvr", pgUserSvrMng.sCBName);
	}
};

///
// The functions for domain handles.
var pgUserSvrDomain = {

	sCBName:"",
	SetCBName:function(sCBName) {
		pgUserSvrDomain.sCBName = sCBName;
	},

	Add:function(sDomain, uPrio, uOpt, sCmmt) {
		var sData = "96:(Domain){" + sDomain + "}(Prio){" + uPrio + "}(Opt){" + uOpt + "}(Cmmt){" + pgAppPlugin.omlEncode(sCmmt) + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrDomain.Add", pgUserSvrDomain.sCBName);
	},
	Delete:function(sDomain) {
		var sData = "97:(Domain){" + sDomain + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrDomain.Delete", pgUserSvrDomain.sCBName);
	},
	GetByMng:function(sMng) {
		var sData = "98:(Mng){" + sMng + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrDomain.GetByMng", pgUserSvrDomain.sCBName);
	},
	SetInfo:function(sDomain, sField, sValue) {
		var sData = "99:(Domain){" + sDomain + "}(Field){" + sField + "}(Value){" + pgAppPlugin.omlEncode(sValue) + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrDomain.SetInfo", pgUserSvrDomain.sCBName);
	},
	GetInfo:function(sDomain, sField) {
		var sData = "100:(Domain){" + sDomain + "}(Field){" + sField + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrDomain.GetInfo", pgUserSvrDomain.sCBName);
	},
	GetInfoAll:function(sDomain) {
		var sData = "101:(Domain){" + sDomain + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrDomain.GetInfoAll", pgUserSvrDomain.sCBName);
	},
	ParamAdd:function(sDomain, sName, sValue) {
		var sData = "110:(Domain){" + sDomain + "}(Name){" + sName + "}(Value){" + pgAppPlugin.omlEncode(sValue) + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrDomain.ParamAdd", pgUserSvrDomain.sCBName);
	},
	ParamDelete:function(sDomain, sName) {
		var sData = "111:(Domain){" + sDomain + "}(Name){" + sName + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrDomain.ParamDelete", pgUserSvrDomain.sCBName);
	}
};

var pgUserSvrCmd = {

	sCBName:"",
	SetCBName:function(sCBName) {
		pgUserSvrCmd.sCBName = sCBName;
	},
	
	Add:function(sID, sTitle, sCmdList, sTimeExe, sPeriodExe) {
		var sData = "128:(ID){" + sID + "}(Title){" + pgAppPlugin.omlEncode(sTitle)
			+ "}(CmdList){" + pgAppPlugin.omlEncode(sCmdList)
			+ "}(TimeExe){" + pgAppPlugin.omlEncode(sTimeExe)
			+ "}(PeriodExe){" + pgAppPlugin.omlEncode(sPeriodExe) + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrCmd.Add", pgUserSvrCmd.sCBName);
	},
	Delete:function(sID) {
		var sData = "129:(ID){" + sID + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrCmd.Delete", pgUserSvrCmd.sCBName);
	},
	GetAll:function() {
		var sData = "130:";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrCmd.GetAll", pgUserSvrCmd.sCBName);
	}
};

var pgUserSvrBackup = {

	sCBName:"",
	SetCBName:function(sCBName) {
		pgUserSvrBackup.sCBName = sCBName;
	},
	
	Add:function(sID, sTitle, sDBList, sDBUser, sDBPass) {
		var sData = "160:(ID){" + sID + "}(Title){" + pgAppPlugin.omlEncode(sTitle)
			+ "}(DBList){" + pgAppPlugin.omlEncode(sDBList)
			+ "}(DBUser){" + pgAppPlugin.omlEncode(sDBUser)
			+ "}(DBPass){" + pgAppPlugin.omlEncode(sDBPass) + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrBackup.Add", pgUserSvrBackup.sCBName);
	},
	Delete:function(sID) {
		var sData = "161:(ID){" + sID + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrBackup.Delete", pgUserSvrBackup.sCBName);
	},
	GetAll:function() {
		var sData = "162:";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrBackup.GetAll", pgUserSvrBackup.sCBName);
	}
};

var pgUserSvrCfg = {

	sCBName:"",
	SetCBName:function(sCBName) {
		pgUserSvrCfg.sCBName = sCBName;
	},
	SetValue:function(sItem, sValue) {
		var sData = "192:(Item){" + sItem + "}(Value){" + pgAppPlugin.omlEncode(sValue) + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrCfg.SetValue", pgUserSvrCfg.sCBName);
	},
	GetValue:function(sItem) {
		var sData = "193:(Item){" + sItem + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrCfg.GetValue", pgUserSvrCfg.sCBName);
	}
};

var pgUserSvrUpdate = {

	sCBName:"",
	SetCBName:function(sCBName) {
		pgUserSvrUpdate.sCBName = sCBName;
	},
	List:function() {
		var sData = "224:";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrUpdate.List", pgUserSvrUpdate.sCBName);
	},
	Delete:function(sFile) {
		var sData = "225:(File){" + pgAppPlugin.omlEncode(sFile) + "}";
		return pgAppPlugin.ObjectRequest(pgAppPlugin.sSvrName, "Call", sData, "pgUserSvrUpdate.Delete", pgUserSvrUpdate.sCBName);
	}
};

///
// The utilize functions.
var pgAppUti = {
	// uField, 1 ~ 5.
	ParseInstID:function(sInstID, uField) {
		var iPos0 = 0;
		var iPos1 = 0;
		var iCount = 0;
		while (1) {
			iPos1 = sInstID.indexOf(':', iPos0);
			if (iPos1 < 0) {
				return sInstID.substr(iPos0);
			}
			iCount++;
			if (iCount >= uField) {
				return sInstID.substr(iPos0, (iPos1 - iPos0));
			}
			iPos0 = iPos1 + 1;
		}
		return "";
	},
	ParseInstPrefix:function(sInstID) {
		var iInd = 0;
		var iPos0 = 0;
		var iPos1 = 0;
		while (iInd < 4) {
			iPos1 = sInstID.indexOf(':', iPos0);
			if (iPos1 < 0) {
				break;
			}
			iPos0 = iPos1 + 1;
			iInd++;
		}
		if (iInd < 3) {
			return "";
		}
		else if (iInd == 3) {
			return sInstID.substr(0);
		}
		else { // iInd >= 4
			return sInstID.substr(0, iPos1);
		}
	},
	GetUserName:function(sPeer) {
		var iInd = sPeer.lastIndexOf('@');
		if (iInd < 0) {
			return sPeer.substr(0);
		}
		else {
			return sPeer.substr(0, iInd);
		}
	},
	GetUserPeer:function(sPeer) {
		var iInd = sPeer.lastIndexOf(':');
		if (iInd < 0) {
			return sPeer.substr(0);
		}
		else {
			return sPeer.substr(0, iInd);
		}
	},
	GetUserDomain:function(sPeer) {
		var iInd = sPeer.lastIndexOf('@');
		if (iInd > 0) {
			iInd += 1;
			var iInd1 = sPeer.indexOf(':', iInd);
			if (iInd1 > 0) {
				return sPeer.substr(iInd, (iInd1 - iInd));
			}
			else {
				return sPeer.substr(iInd);
			}
		}
		return sPeer;
	},
	CheckPeerSync:function(sPeer) {
		var iErr = pgAppPlugin.ObjectRequest(sPeer, "CheckInfo", "(Check){1}(Value){3}(Option){}", "");
		if (iErr > pgErrCode.PG_ERR_Normal) {
			OutString("CheckPeerSync, iErr=" + iErr);
			return false;
		}
		return true;
	}
};


///
// The global variables
var pgAppCltUti = {
	sSvrName:"",
	sUserName:"",
	sUserPeer:""
};

function pgAppCltMain(oUIObj)
{
	this.sURLPrev = "";
	this.sURLHome = "";
	this.sURLLogin = "";

	this.bLogining = false;
	this.sUserPeer = "";
	this.sPassTemp = "";
	this.bManualLogin = false;
	this.uHttpSvrPort = 0;

	// Set login page's URL.
	this.SetURL = function(sURLLogin, sURLHome) {
		this.sURLLogin = sURLLogin;
		this.sURLHome = sURLHome;
	}
	this.GetHashArg = function() {
		return document.location.hash.substr(1);
	}

	// Load and save this page's URL.
	this.LoadPrevURL = function() {
		this.sURLPrev = pgLoginSess.GetURL();
	}
	this.SaveThisURL = function() {
		pgLoginSess.SetURL(document.location.href);
	}

	// Jump to login page.
	this.JumpToLogin = function(bNewWindow) {
		if (this.sURLLogin && !this.bManualLogin) {
			this.SaveThisURL();
			if (bNewWindow) {
				window.open(this.sURLLogin, "_blank");
			}
			else {
				window.open(this.sURLLogin, "_self");
			}
		}
	}

	// Use templete user name to login.
	this.TempLogin = function() {
		var sUserTemp = pgLoginSess.GetTemp();
		if (sUserTemp) {
			this.sUserName = "";
			this.bLogining = true;
			this.bManualLogin = false;
			pgAppPlugin.CallbackAdd(this.sCBName, pgAppPlugin.sSvrName, 0xff, "", "", this);
			if (pgAppPlugin.Login(sUserTemp, "", "") < 0) {
				this.bLogining = true;
				return true;
			}
			pgAppPlugin.CallbackDelete(this.sCBName, pgAppPlugin.sSvrName, 0xff, "", "");
		}
		return false;
	}

	// Login and logout.
	this.Login = function(sUser, sPass) {
		var reg = /[\\\/\?\*\:\|\"\(\)\[\]\{\}\<\>\&]+/ig;
		var aRes = sUser.match(reg);
		if (aRes) {
			alert("用户名不能能包含 \,/,?,*,:,|,\",(,),[,],{,},& 这些字符");
			return false;
		}
		if (sUser) {
			this.bLogining = false;
			this.bManualLogin = true;
			pgAppPlugin.CallbackAdd(this.sCBName, pgAppPlugin.sSvrName, 0xff, "", "", this);
			if (pgAppPlugin.Login(sUser, sPass, "", this.sCBName) < 0) {
				this.sUserPeer = sUser;
				this.sPassTemp = sPass;
				this.bLogining = true;
				return true;
			}
			pgAppPlugin.CallbackDelete(this.sCBName, pgAppPlugin.sSvrName, 0xff, "", "");
			this.bManualLogin = false;
		}
		return false;
	}
	this.Logout = function() {
		this.bLogining = false;
		pgAppPlugin.Logout();
		pgAppPlugin.Cmd("HttpConfig", "(Addr){0:0:0:0.0.0.0:0:0}");
	}

	// Register new user
	this.Register = function(sUser, sPass, sEmail) {
		var reg = /[\\\/\?\*\:\|\"\(\)\[\]\{\}\<\>\&]+/ig;
		var aRes = sUser.match(reg);
		if (aRes) {
			alert("用户名不能能包含 \,/,?,*,:,|,\",(,),[,],{,},& 这些字符");
			return false;
		}
		pgUserSvrUsr.SetCBName(this.sCBName);
		pgAppPlugin.CallbackAdd(this.sCBName, pgAppPlugin.sSvrName, 0xff, "", "", this);
		if (pgUserSvrUsr.Register(sUser, sPass, sEmail) <= 0) {
			return true;
		}
		pgAppPlugin.CallbackDelete(this.sCBName, pgAppPlugin.sSvrName, 0xff, "", "");
		return false;
	}
	this._RegisterReply = function(iErr, sData) {
		pgAppPlugin.CallbackDelete(this.sCBName, pgAppPlugin.sSvrName, 0xff, "", "");
		if (typeof(this.oUIObj.OnResult) == "function") {
			this.oUIObj.OnResult("Register", iErr, sData);
		}
	}
	
	this.DomainList = function() {
		if (pgUserSvrUsr.DomainList() <= 0) {
			return true;
		}
		return false;
	}
	this._DomainListReply = function(iErr, sData) {
		if (typeof(this.oUIObj.OnResult) == "function") {
			this.oUIObj.OnResult("DomainList", iErr, sData);
		}
		return false;
	}

	this.GetFileURL = function(sPath) {
		if (this.uHttpSvrPort == 0) {
			var uPort = 8000 + parseInt(Math.random() * 1000);
			var sParam = "(Addr){0:0:0:127.0.0.2:" + uPort + ":0}";
			if (pgAppPlugin.Cmd("HttpConfig", sParam) == "1") {
				this.uHttpSvrPort = uPort;
			}
		}
		var sURL = "";
		if (this.uHttpSvrPort != 0) {
			var sFile = sPath;
			var iPos = sPath.lastIndexOf('\\');
			if (iPos >= 0) {
				sFile = sPath.substr(iPos + 1);
			}
			var sParam = "(URL){" + pgAppPlugin.omlEncode(sFile) + "}";
			pgAppPlugin.Cmd("HttpDelete", sParam);
			sParam += "(Local){" + pgAppPlugin.omlEncode(sPath) + "}";
			if (pgAppPlugin.Cmd("HttpAdd", sParam) == "1") {
				sURL = ("http://127.0.0.2:" + this.uHttpSvrPort + "/" + encodeURIComponent(sFile));
			}
		}
		return sURL;
	}

	// Callback functions of Peergine
	this.OnExtRequest = function(sObj, uMeth, sData, uHandle, sPeer) {
		if (typeof(this.oUIObj.OnExtRequest) == "function") {
			this.oUIObj.OnExtRequest(sObj, uMeth, sData, uHandle, sPeer);
		}
		return pgErrCode.PG_ERR_Unknown;
	}
	this.OnReply = function(sObj, uErr, sData, sParam) {
		if (sObj == pgAppPlugin.sSvrName) {
			if (sParam == "pgAppPlugin.Login") {
				this._LoginReply(uErr, sData);
				return 1;
			}
			else if (sParam == "pgUserSvrUsr.DomainList") {
				this._DomainListReply(uErr, sData);
				return 1;
			}
			else if (sParam == "pgUserSvrUsr.Register") {
				this._RegisterReply(uErr, sData);
				return 1;
			}
		}
		if (typeof(this.oUIObj.OnReply) == "function") {
			this.oUIObj.OnReply(sObj, uErr, sData, sParam);
		}
		return 0;
	}

	// Objects.
	this.oUIObj = oUIObj;
	this.sCBName = "_pgAppCltMainCB";

	// Private functions.
	this._LoginReply = function(iErr, sData) {

		this.bLogining = false;

		// Store base inst id and session info.
		if (iErr == 0 && this.sUserPeer) {
			// Set uti members.
			pgAppCltUti.sSvrName = pgAppPlugin.sSvrName;
			pgAppCltUti.sUserName = pgAppUti.GetUserName(this.sUserPeer);
			pgAppCltUti.sUserPeer = this.sUserPeer;
		}

		// Report result to UI.
		if (typeof(this.oUIObj.OnResult) == "function") {
			this.oUIObj.OnResult("Login", iErr, sData);
		}
	}
}
