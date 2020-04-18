/**********************************************************
  copyright   : Copyright (C) 2012-2012, chenbichao,
                All rights reserved.
  filename    : pgAppUILib.js
  discription : 
  modify      : create, chenbichao, 2012/8/5
**********************************************************/


var pgAppWin = {
	
	iW:0,
	iH:0,
	iX:0,
	iY:0,
	
	// Fix the IE bug, catching excaptions of resizeTo() and moveTo().
	resizeTo:function(iW, iH) {
		try {
			window.resizeTo(iW, iH);
		}
		catch(e) {
			pgAppWin.iW = iW;
			pgAppWin.iH = iH;
			iTimerResizeTo = window.setTimeout("pgAppWin.resizeToTry()", 200);
		}
	},
	resizeToTry:function() {
		try {
			window.resizeTo(pgAppWin.iW, pgAppWin.iH);
		}
		catch(e) {
			window.setTimeout("pgAppWin.resizeToTry()", 200);
		}
	},
	moveTo:function(iX, iY) {
		try {
			window.moveTo(iX, iY);
		}
		catch(e) {
			pgAppWin.iX = iX;
			pgAppWin.iY = iY;
			window.setTimeout("pgAppWin.moveToTry()", 200);
		}
	},
	moveToTry:function() {
		try {
			window.moveTo(pgAppWin.iX, pgAppWin.iY);
		}
		catch(e) {
			window.setTimeout("pgAppWin.moveToTry()", 200);
		}
	},
	
	// Popup dailog or window
	PopupDlg:function(sURL, sElsArg, iW, iH) {
		var sFeatures = "dialogWidth:" + iW + "px;dialogHeight:" + iH
			+ "px;center:yes;status:no;help:no;scroll:no;resizable:yes;";
		var vRet = window.showModalDialog(sURL, sElsArg, sFeatures);
		if (vRet) {
			return vRet;
		}
		return "";
	},
	PopupWin:function(sURL, sElsArg, bFlag) {
		var sSessEle = "(SessEle){(User){" + pgAppCltUti.sUserPeer
			+ "}(Sess){" + pgAppCltUti.sLoginSess + "}}";
		var sURLTemp = sURL + "#" + sSessEle + sElsArg;
		var sFeatures = "";
		if (bFlag) {
			sFeatures = "location:no;menubar:no;status:no;titlebar:no;toolbar:no;";
		}
		var oWin = window.open(sURLTemp, "_blank", sFeatures);
		if (oWin) {
			oWin.opener = window.self;
		}
		return oWin;
	},

	// Fit the window's size to a div element.
	FitToRect:function(oRect, bCenter) {
		pgAppWin.FitToSize(oRect.offsetWidth, oRect.offsetHeight, bCenter);
	},
	FitToSize:function(iW, iH, bCenter) {
		var bOffsetChange = pgAppWin._FitToSize(iW, iH, bCenter);
		pgAppWin.ExtShow();
		return bOffsetChange;
	},
	_FitToSize:function(iW, iH, bCenter) {
		var sBorder = pgAppWin._LoadWinBorder();
		if (!sBorder) {
			sBorder = pgAppWin._TestWinBorder();
		}
		var uOffsetW = parseInt(pgAppPlugin.omlGetContent(sBorder, "W"));
		var uOffsetH = parseInt(pgAppPlugin.omlGetContent(sBorder, "H"));
		if (uOffsetW <= 0 || uOffsetH <= 0) {
			sBorder = pgAppWin._TestWinBorder();
			uOffsetW = parseInt(pgAppPlugin.omlGetContent(sBorder, "W"));
			uOffsetH = parseInt(pgAppPlugin.omlGetContent(sBorder, "H"));
		}

		document.body.style.margin = "0";
		document.body.style.padding = "0";
		document.body.style.borderWidth = "0";

		var iWWin = iW + uOffsetW;
		var iHWin = iH + uOffsetH;
		pgAppWin.resizeTo(iWWin, iHWin);

		if (bCenter) {
			var iX = (window.screen.availWidth - iWWin) / 2;
			var iY = (window.screen.availHeight - iHWin) / 2;
			pgAppWin.moveTo(iX, iY);
		}
		else {
			var iX = window.screenLeft;
			var iY = window.screenTop;
			if ((iX + iWWin) > window.screen.availWidth) {
				if (window.screen.availWidth > iWWin) {
					iX = window.screen.availWidth - iWWin;
				}
				else {
					iX = 0;
				}
			}
			if ((iY + iHWin) > window.screen.availHeight) {
				if (window.screen.availHeight > iHWin) {
					iY = window.screen.availHeight - iHWin;
				}
				else {
					iY = 0;
				}
			}
			if (iX != window.screenLeft || iY != window.screenTop) {
				pgAppWin.moveTo(iX, iY);
			}
		}

		var uOffsetW1 = uOffsetW;
		if (iWWin > document.body.offsetWidth) {
			uOffsetW1 = iWWin - document.body.offsetWidth;
		}
		var uOffsetH1 = uOffsetH;
		if (iHWin > document.body.offsetHeight) {
			uOffsetH1 = iHWin - document.body.offsetHeight;
		}
		var bOffsetChange = false;
		if (uOffsetW != uOffsetW1 || uOffsetH != uOffsetH1) {
			pgAppWin._SaveWinBorder(uOffsetW1, uOffsetH1);
			bOffsetChange = true;
		}
		return bOffsetChange;
	},

	_TestWinBorder:function() {
		var iX = window.screenLeft - 2;
		var iY = window.screenTop - 22;
		pgAppWin.moveTo(iX, iY);
		var iXOffset = window.screenLeft - iX;
		var iYOffset = window.screenTop - iY;
		var uOffsetW = (iXOffset + 5) * 2;
		var uOffsetH = iYOffset + (iXOffset + 50);
		return "(W){" + uOffsetW + "}(H){" + uOffsetH + "}";
	},
	_LoadWinBorder:function() {
		if (pgAppPlugin.oPlugin) {
			var sParam = "(Name){ieWinBorder}";
			var sVal = pgAppPlugin.Cmd("CookieGet", sParam);
			return pgAppPlugin.omlGetContent(sVal, "Value");
		}
		return "";
	},
	_SaveWinBorder:function(uOffsetW, uOffsetH) {
		if (pgAppPlugin.oPlugin) {
			var sBorder = "(W){" + uOffsetW + "}(H){" + uOffsetH + "}";
			var sParam = "(Name){ieWinBorder}(Value){"
				+ pgAppPlugin.omlEncode(sBorder) + "}(Expire){2200-1-1,00:00:00}";
			pgAppPlugin.Cmd("CookieSet", sParam);
			return true;
		}
		return false;
	},

	// Save and load the window's position.
	PosLoad:function(sID) {
		if (pgAppPlugin.oPlugin) {
			var sParam = "(Name){_winpos_" + sID + "}";
			var sValue = pgAppPlugin.Cmd("CookieGet", sParam);
			var sPos = pgAppPlugin.omlGetContent(sValue, "Value");
			if (sPos) {
				var iW = pgAppPlugin.omlGetContent(sPos, "W");
				if (iW < 260) {
					iW = 260;
				}
				var iH = pgAppPlugin.omlGetContent(sPos, "H");
				if (iH < 500) {
					iH = 500;
				}
				var iX = pgAppPlugin.omlGetContent(sPos, "X");
				if (iX < 0) {
					iX = 10;
				}
				var iY = pgAppPlugin.omlGetContent(sPos, "Y");
				if (iY < 0) {
					iY = 10;
				}
				pgAppWin.moveTo(iX, iY);
				pgAppWin.resizeTo(iW, iH);
				return true;
			}
		}
		return false;
	},
	PosSave:function(sID) {
		if (typeof(window.external.WndPosGet) != "undefined" && pgAppPlugin.oPlugin) {
			var iX = window.external.WndPosGet("X");
			if (iX < 0) {
				iX = 10;
			}
			var iY = window.external.WndPosGet("Y");
			if (iY < 0) {
				iY = 10;
			}
			var iW = window.external.WndPosGet("W");
			if (iW < 260) {
				iW = 260;
			}
			var iH = window.external.WndPosGet("H");
			if (iH < 500) {
				iH = 500;
			}
			var sPos = "(X){" + iX + "}(Y){" + iY + "}(W){" + iW + "}(H){" + iH + "}";
			var sParam = "(Name){_winpos_" + sID + "}(Value){"
				+ pgAppPlugin.omlEncode(sPos) + "}(Expire){2200-1-1,00:00:00}";
			pgAppPlugin.Cmd("CookieSet", sParam);
			return true;
		}
		return false;
	},

	// Show window in different mode.
	Flash:function() {
		pgAppWin._ShowAct("Flash");
	},
	Maximize:function() {
		pgAppWin._ShowAct("Maximize");
	},
	Minimize:function() {
		pgAppWin._ShowAct("Minimize");
	},
	Restore:function() {
		pgAppWin._ShowAct("Restore");
	},
	Show:function() {
		pgAppWin._ShowAct("Show");
	},
	Hide:function() {
		pgAppWin._ShowAct("Hide");
	},
	_ShowAct:function(sAct) {
		if (pgAppPlugin.oPlugin) {
			var sParam = "(Action){" + sAct + "}";
			pgAppPlugin.Cmd("Wnd", sParam);
		}
	},
	
	// Track a popup menu.
	PopupMenu:function(sMenuItem) {
		if (pgAppPlugin.oPlugin) {
			var sParam = "(MenuItem){" + sMenuItem + "}";
			pgAppPlugin.Cmd("PopupMenu", sParam);
		}
	},
	
	// External methods of pgBrowser.
	// sType = 'Status', 1:Maximize, 2:Minimize, 3:Restore
	PosGet:function(sType) {
		if (typeof(window.external.WndPosGet) != "undefined") {
			return window.external.WndPosGet(sType);
		}
		return -1;
	},
	SetNotify:function(fnOnNotify) {
		if (typeof(fnOnNotify) == "function"
			&& typeof(window.external.WndNotify) != "undefined")
		{
			window.external.WndNotify = fnOnNotify;
			return true;
		}
		return false;
	},
	TaskIcon:function(bFlag) {
		if (typeof(window.external.TaskIcon) != "undefined") {
			window.external.TaskIcon(bFlag);
		}
	},
	
	// Show window in different mode with external method of pgBrowser.
	ExtFlash:function() {
		pgAppWin._ExtShow(5);
	},
	ExtMaximize:function() {
		pgAppWin._ExtShow(2);
	},
	ExtMinimize:function() {
		pgAppWin._ExtShow(3);
	},
	ExtRestore:function() {
		pgAppWin._ExtShow(4);
	},
	ExtShow:function() {
		pgAppWin._ExtShow(1);
	},
	ExtHide:function() {
		pgAppWin._ExtShow(0);
	},
	ExtForeground:function() {
		pgAppWin._ExtShow(6);
	},
	ExtToolWnd:function() {
		pgAppWin._ExtShow(7);
	},
	_ExtShow:function(lOption) {
		if (typeof(window.external.WndShow) != "undefined") {
			window.external.WndShow(lOption);
		}
	},

	// Standard interface for sub window call to the parent window.
	CallOpener:function(sMeth) {
		if (eval("window.opener")) {
			if (eval("window.opener.pgOnOpener")) {
				if (eval("window.opener.pgOnOpener." + sMeth)) {
					var sMethSel = "window.opener.pgOnOpener." + sMeth + "(";
					for (var i = 1; i < arguments.length; i++) {
						if (i > 1) {
							sMethSel += ",";
						}
						sMethSel += "arguments[" + i + "]";
					}
					sMethSel += ")";
					if (eval(sMethSel)) {
						alert("操作成功");
					}
					return;
				}
				alert("CallOpener: Not find 'window.opener.pgOnOpener." + sMeth + "'");
			}
			alert("CallOpener: Not find 'window.opener.pgOnOpener'");
		}
		alert("CallOpener: Not find 'window.opener'");
	}

};

var pgPopMenu = {
	aExeList:null,
	bMenuPop:false,

	Popup:function(sItemList, uMode) {
		var xTemp = event.screenX - window.screenLeft + document.body.scrollLeft;
		var yTemp = event.screenY - window.screenTop + document.body.scrollTop;
		pgPopMenu.PopupWithPos(sItemList, uMode, xTemp, yTemp);
	},

	PopupWithPos:function(sItemList, uMode, iX, iY) {

		pgPopMenu.OnDocClick();
		var oPopMenu = document.getElementById("idPopMenu");
		if (oPopMenu) {
			oPopMenu.removeNode(true);
		}

		var sHtml = "<div id=\"idPopMenu\" style=\"border:1px solid #666688;position:absolute;left:"
			+ iX + "px;top:" + iY + "px;padding:1px;background-color:#ffffff;z-index:10000;overflow:hidden;visibility:hidden;\">"
			+ "<table border=\"0\" cellpadding=\"3\" cellspacing=\"0\">";

		pgPopMenu.aExeList = new Array();

		var i = 0;
		while (1) {
			var sEle = pgAppPlugin.omlGetEle(sItemList, "", 1, i);
			if (!sEle) {
				break;
			}
			var sImg = pgAppPlugin.omlGetContent(sEle, ".Img");
			var sTxt = pgAppPlugin.omlGetContent(sEle, ".Txt");
			var sExe = pgAppPlugin.omlGetContent(sEle, ".Exe");
			sHtml += "<tr height=\"16\" style=\"cursor:hand;color:#444488;\""
				+ " onMouseOver=\"this.style.backgroundColor='#ddddff';\""
	        	+ " onMouseOut=\"this.style.backgroundColor='transparent';\""
	        	+ " onclick=\"pgPopMenu.OnItemClick(" + i + ")\"><td width=\"16\">"
			if (sImg) {
				sHtml += "<img width=\"16\" height=\"16\" src=\"" + sImg + "\">";
			}
			sHtml += "</td><td class=\"txt_uti\">" + sTxt + "</td><td width=\"10\">&nbsp;</td></tr>";
			pgPopMenu.aExeList[i] = sExe;
			i++;
		}
		sHtml += "</table><iframe style='position:absolute;left:0px;top:0px;width:100%;height:100%;z-index:-1;' frameborder='0'></iframe></div>";

		document.body.insertAdjacentHTML("beforeEnd", sHtml);
		document.attachEvent("onmousedown", pgPopMenu.OnDocClick);
		window.attachEvent("onblur", pgPopMenu.OnDocClick);

		window.setTimeout("pgPopMenu._ShowPop(" + uMode + ")", 1);
	},

	_ShowPop:function(uMode) {
		var oPopMenu = document.getElementById("idPopMenu");
		if (oPopMenu) {
			if (uMode) {
				oPopMenu.style.left = (parseInt(oPopMenu.style.left) - parseInt(oPopMenu.offsetWidth)) + "px";
			}
			oPopMenu.style.visibility = "inherit";
			pgPopMenu.bMenuPop = true;
		}
	},

	OnItemClick:function(i) {
		var oPopMenu = document.getElementById("idPopMenu");
		if (oPopMenu) {
			oPopMenu.removeNode(true);
		}
		pgPopMenu.bMenuPop = false;
		try {
			eval(pgPopMenu.aExeList[i]);
		}
		catch (e) {
			alert(e);
		}
	},
	OnDocClick:function() {
		if (pgPopMenu.bMenuPop) {
			var oNodeTemp = event.srcElement;
			while (oNodeTemp) {
				var sID = oNodeTemp.id;
				if (sID && sID.indexOf("idPopMenu") == 0) {
					return;
				}
				oNodeTemp = oNodeTemp.parentNode;
			}
			var oPopMenu = document.getElementById("idPopMenu");
			if (oPopMenu) {
				oPopMenu.removeNode(true);
			}
			pgPopMenu.bMenuPop = false;
		}
		document.detachEvent("onmousedown", pgPopMenu.OnDocClick);
		window.detachEvent("onblur", pgPopMenu.OnDocClick);
	}
};

var pgAlert = {
	Add:function(sID, sHtml) {
		var oAlert = document.getElementById("idUIAlert");
		if (!oAlert) {
			var sHtmlTemp = "<div id=\"idUIAlert\" style=\"position:absolute;right:20px;bottom:-1px;width:200px;background-color:#ffffff;"
				+ "z-index:20000;border-width:1px;border-style:solid;border-color:#6666dd;overflow-x:hidden;visibility:hidden;\">"
				+ "<div style=\"width:100%;height:100%;\">"
				+ "<table width=\"100%\" height=\"20px\" border=\"0\" cellpadding=\"2\" cellspacing=\"0\" style=\"background-color:#ccccff;\"><tr>"
				+ "<td style=\"font-size:12px;font-family:'微软雅黑';font-weight:bold;\">提示消息</td>"
				+ "<td width=\"20px\" align=\"center\" onclick=\"pgAlert._Close()\" style=\"font-size:12px;font-weight:bold;color:#ff6666;cursor:hand;\">"
				+ "<span style=\"font-family:Webdings;\">r</span></td></tr></table>"
				+ "<table id=\"idUIAlertList\" width=\"100%\" border=\"0\" cellpadding=\"5\" cellspacing=\"0\"></table></div>"
				+ "</div>";
			document.body.insertAdjacentHTML("beforeEnd", sHtmlTemp);
			oAlert = document.getElementById("idUIAlert");
		}
		if (oAlert) {
			var iRowInd = idUIAlertList.rows.length;
			var oRow = idUIAlertList.insertRow(iRowInd);
			oRow.id = "idUIAlertItem_" + sID;
			var oCell = oRow.insertCell(0);
			if (iRowInd > 0) {
				oCell.innerHTML = "<div style=\"width=100%;height:1px;overflow:hidden;\" align=\"center\"><div style=\"width=180px;overflow:hidden;border-top-width:1px;border-top-style:solid;border-top-color:#cccccc;\"></div>"
					+ "</div><div style=\"width:100%;padding-top:12px;padding-bottom:8px;word-wrap:break-word;word-break:break-all;\">" + sHtml + "</div>";
			}
			else {
				oCell.innerHTML = "<div style=\"width:100%;padding-top:8px;padding-bottom:8px;word-wrap:break-word;word-break:break-all;\">" + sHtml + "</div>";
			}
			if (iRowInd <= 0) {
				window.setTimeout("pgAlert._Show()", 1);
			}
		}
	},
	Delete:function(sID) {
		var oItem = document.getElementById("idUIAlertItem_" + sID);
		if (oItem) {
			var iRowInd = oItem.rowIndex;
			idUIAlertList.deleteRow(iRowInd);
			if (idUIAlertList.rows.length <= 0) {
				pgAlert._Close();
			}
		}
	},
	_Show:function() {
		var oAlert = document.getElementById("idUIAlert");
		if (oAlert) {
			oAlert.style.visibility = "inherit";
		}
	},
	_Close:function() {
		var oAlert = document.getElementById("idUIAlert");
		if (oAlert) {
			oAlert.removeNode(true);
		}
	}
};

var pgSound = {
	bFlag:true,
	Play:function(sSound, iLoop) {
		if (pgSound.bFlag) {
			var oSound = document.getElementById("idSound");
			if (oSound) {
				oSound.src = "";
				if (sSound) {
					oSound.loop = iLoop;
					oSound.src = sSound;
				}
			}
		}
	},
	Enable:function(bFlag) {
		pgSound.bFlag = bFlag;
	}
};