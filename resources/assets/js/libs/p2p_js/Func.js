function pgOver()
{
	this.style.backgroundColor='#ffeeaa';
//	this.style.color="#ff0000";
}
function pgOut()
{
	this.style.backgroundColor="";
//	this.style.color="";
}

var pgMenu = {
	uCurMenu:1,
	sCurID:"idMng_UserList",	
	SelMenu:function(uMenu, sID) {
		idMenu.rows(0).cells(pgMenu.uCurMenu).className = "pgmenu_unsel";
		idMenu.rows(0).cells(uMenu).className = "pgmenu_sel";
		pgMenu.uCurMenu = uMenu;
		var oTab1 = document.getElementById(pgMenu.sCurID);
		if (oTab1) {
			oTab1.style.visibility = "hidden";
		}
		var oTab2 = document.getElementById(sID);
		if (oTab2) {
			oTab2.style.visibility = "inherit";
		}
		pgMenu.sCurID = sID;
		pgMain.MenuSwitch(sID);
	}
}

function debugOutString(sOut)
{
	// if (debugSwitch.checked) {
	// 	var sHtml = "<pre style={font-size:12px;word-wrap:break-word;word-break:break-all;white-space:normal;}>" + sOut + "</pre>";
	// 	debugOut.document.body.insertAdjacentHTML("beforeEnd", sHtml);
	// 	debugOut.document.body.doScroll("pageDown");
	// }
}

function pgInitialize()
{
	pgAppPlugin.SetPlugin(pgAtx);

//	pgAppPlugin.Initialize("Option=1;MaxPeer=1024;MaxGroup=256;MaxObject=2048;MaxMCast=4096",
//		"PG_CLASS_Table:4;PG_CLASS_Screen:16", "pgTunnelSvr0", "0:0:0:127.0.0.1:10009:0", "");

	pgAppPlugin.Initialize("Option=1;MaxPeer=1024;MaxGroup=256;MaxObject=2048;MaxMCast=4096",
		"PG_CLASS_Table:4;PG_CLASS_Screen:16", "pgTunnelSvr0", "www.800ns.com:47881", "");


	pgMain.Init();
}

function pgClean()
{
	pgMain.Clean();
	pgAppPlugin.Clean();
}

function OnWndNotify(lEvent)
{
	if (lEvent == 0) {
		pgAppPlugin.CallbackClean();
		pgMain.Clean();
		return 0;
	}
	else {
		return 0;
	}
}

var pgEvent = {
	OnShow:function() {
		window.setTimeout("pgMain.ShowWin()", 1);
	}
};

var pgMain = {
	oCltMain:null,

	iPrioDMM:244,
	
	sUserName:"",
	sUserPass:"",

	iUserPageInd:0,
	iUserCount:0,
	iSearchOnl:0,
	iSearchP2P:0,

	iDomainPageInd:0,
	iDomainCount:0,

	sDomainList:"",
	sDomainLimitList:"",
	
	iViewCapImgInd:0,
	sViewCapIDList:"",

	Init:function() {
		pgAppPlugin.CallbackSetDef(pgMain);
		pgMain.oCltMain = new pgAppCltMain(pgMain);
		pgMain.oCltMain.SetURL("im_userlogin.htm", "");
		var sEleArg = document.location.hash.substr(1);
		var sSessVal = pgAppPlugin.omlGetEle(sEleArg, "SessEle.", 10, 0);

		if (sSessVal) {
			if (pgMain.oCltMain.AutoLogin()) {
				return;
			}
			//OutString("Auto login failed: " + iErr);
		}

		var sCachePath = pgAppPlugin.Cmd("PathGet", "(Type){pgTunnelM}(Create){1}");
		//OutString("pgTunnelM cache path: " + sCachePath);	

		//pgMain.LoginDlg();
		pgMain.oCltMain.Login('admin@admin', '12341234');
	},
	Clean:function() {
		if (window.opener && window.opener.pgApp) {
			window.opener.pgApp.MngToolClose();
		}
		if (pgMain.oCltMain) {
			pgMain.oCltMain.Logout();
			pgMain.oCltMain = null;
		}
	},
	
	ShowWin:function() {
		if (pgAppWin.PosGet("Status") == 2) {
			pgAppWin.Restore();
		}
		else {
			pgAppWin.Show();
		}
	},

	MenuSwitch:function(sID) {
		if (sID == "idMng_UserList") {
			pgMain.UserList(0);
		}
		else if (sID == "idMng_UserEdit") {
			var sEdit = idMng_UserEditName.getAttribute("edit");
			var sTemp = idMng_UserEditName.innerText;
			if (sEdit == "1" && sTemp) {
				pgUserSvrMng.GetUserInfo(sTemp);
				pgMain.UserEditDomainCfgList();
			}
		}
		else if (sID == "idMng_CmdExec") {
			var sExec = idMng_CmdExecUser.getAttribute("exec");
			if (sExec == "1") {
				pgMain.CmdExecList();
			}
		}
		else if (sID == "idMng_BackupData") {
			var sExec = idMng_BackupDataUser.getAttribute("exec");
			if (sExec == "1") {
				pgMain.BackupDataList();
			}
		}
		else if (sID == "idMng_BackupFile") {
			var sExec = idMng_BackupFileUser.getAttribute("exec");
			if (sExec == "1") {
				pgMain.BackupFileRefresh();
			}
		}
		else if (sID == "idMng_UpdateFile") {
			var sExec = idMng_UpdateFileUser.getAttribute("exec");
			if (sExec == "1") {
				pgMain.UpdateFileRefresh();
			}
		}
		else if (sID == "idMng_ViewCap") {
			var sShow = idMng_ViewCapUser.getAttribute("show");
			if (sShow == "1") {
				pgMain.ViewCapRefresh();
			}
		}
		else if (sID == "idMng_DomainList") {
			pgMain.DomainList(0);
		}
		else if (sID == "idMng_DomainEdit") {
			var sEdit = idMng_DomainEditName.getAttribute("edit");
			var sTemp = idMng_DomainEditName.innerText;
			if (sEdit == "1" && sTemp) {
				pgUserSvrDomain.GetInfoAll(sTemp);
			}
		}
	},
	
	LoginDlg:function() {
		//pgDlg.Open("DlgLogin", "用户登录", 260, 120, idHtml_DlgLogin.innerHTML);
		var oUserName = 'admin@admin';
		if (oUserName) {
			oUserName.value = pgMain.sUserName;
		}
		var oUserPass = '12341234';
		if (oUserPass) {
			oUserPass.value = pgMain.sUserPass;
		}
	},
	LoginFinish:function() {
		var oUserName = document.getElementById("idDlg_UserName");
		var oUserPass = document.getElementById("idDlg_UserPass");
		if (!oUserName || !oUserPass) {
			return;
		}
		if (!pgMain.oCltMain.Login(oUserName.value, oUserPass.value)) {
			pgDlg.Close("DlgLogin");
			window.setTimeout("pgMain.LoginDlg()", 500);
		}
		else {
			pgMain.sUserName = oUserName.value;
			pgMain.sUserPass = oUserPass.value;
			pgDlg.Close("DlgLogin");
		}
	},
	LogoutClean:function() {
		if (pgMain.oCltMain) {
			pgMain.oCltMain.Logout();
		}
		pgMain.iUserPageInd = 0;
		pgMain.iDomainPageInd = 0;	
	},

	UserCheck:function(dPrio) {
		if (!$("#User_EditName").text()) {
			alert("请先选择要编辑的用户！");
			return false;
		}
		//var sUser = idMng_UserEditName.innerText;
		//var sDomain = pgAppUti.GetUserDomain(sUser);
		//var iPrio = pgMain.DomainGetPrio(sDomain);
        var iPrio = dPrio;
		if (iPrio < 0) {
			return false;
		}
		if (iPrio == 248) { // The appsvr.
			if (!confirm("重要提醒：当前编辑的是应用服务器的登录帐号。修改的配置必需与该应用服务器的配置一致，否则将导致应用服务器停止工作！")) {
				return false;
			}
		}
		return true;
	},
	UserModifyPass:function(dPrio) {
		if (pgMain.UserCheck(dPrio)) {
            var username = $("#User_EditName").text();
            var psd = $("#User_EditPassWord").val();
			var iErr= pgUserSvrMng.ModifyUserPass(username, psd);
			if (iErr > pgErrCode.PG_ERR_Normal) {
				alert("修改用户密码失败：" + pgErrMsg.GetMsg(iErr));
			}
		}
	},
	UserModifyType:function() {
		if (pgMain.UserCheck()) {
			var iErr = pgUserSvrMng.ModifyUserType(idMng_UserEditName.innerText, idMng_UserEditType.value);
			if (iErr > pgErrCode.PG_ERR_Normal) {
				alert("修改用户类型失败：" + pgErrMsg.GetMsg(iErr));
			}
		}
	},
	UserModifyStatus:function(dPrio) {
		if (pgMain.UserCheck(dPrio)) {
			//var sStatus = "";
            var sStatus = $("#User_EditState").val();
            var username = $("#User_EditName").text();
            //if (idMng_UserEditStatus.selectedIndex < idMng_UserEditStatus.options.length) {
			//	sStatus = idMng_UserEditStatus.options(idMng_UserEditStatus.selectedIndex).value;
			//}
			var iErr = pgUserSvrMng.ModifyUserStatus(username, sStatus);
			if (iErr > pgErrCode.PG_ERR_Normal) {
				alert("修改用户状态失败：" + pgErrMsg.GetMsg(iErr));
			}
		}
	},
	UserModifyFwdDNS:function(dPrio) {
		if (pgMain.UserCheck(dPrio)) {
            var DNS = $("#User_EditFwdDNS").val();
            var username = $("#User_EditName").text();
            var iErr = pgUserSvrMng.UserFwdDNSSet(username, DNS);
			if (iErr > pgErrCode.PG_ERR_Normal) {
				alert("修改用户转发域名失败：" + pgErrMsg.GetMsg(iErr));
			}
		}
	},
	UserModifyCmmt:function(dPrio) {
		if (pgMain.UserCheck(dPrio)) {
            var des = $("#User_EditDes").val();
            var phone = $("#User_EditPhone").val();
            var username = $("#User_EditName").text();
            var sCmmt = "#V1#:(Cmmt){" + des + "}(PhoneNO){" + phone + "}";
			var iErr = pgUserSvrMng.UserCmmtSet(username, sCmmt);
			if (iErr > pgErrCode.PG_ERR_Normal) {
				alert("修改用户说明失败：" + pgErrMsg.GetMsg(iErr));
			}
		}
	},

	UserEditTunnelSvrSet:function(dPrio) {
		if (pgMain.UserCheck(dPrio)) {
            var state = $("#User_EditTunnelState").val();
            var username = $("#User_EditName").text();
            var port = $("#User_EditEntryPort").val();
            if(state == 0) {
                var bEnc = 1;
                var bCmp = 0;
            } else {
                var bEnc =0;
                var bCmp =1;
            }
			//var bEnc = 0;
			//if (idMng_UserEditTunnelSvr_Enc.checked) {
			//	bEnc = 1;
			//}
			//var bCmp = 0;
			//if (idMng_UserEditTunnelSvr_Cmp.checked) {
			//	bCmp = 1;
			//}
			var iErr = pgUserSvrMng.UserTunnelSvrSet(username,
				port, bEnc, bCmp);
			if (iErr > pgErrCode.PG_ERR_Normal) {
				alert("修改用户TunnelSvr失败：" + pgErrMsg.GetMsg(iErr));
			}
		}
	},
	UserEditTunnelSvrShow:function(sData) {
		var sAddrListen = pgAppPlugin.omlGetContent(sData, "AddrListen");
		var sEncrypt = pgAppPlugin.omlGetContent(sData, "Encrypt");
		var sCompress = pgAppPlugin.omlGetContent(sData, "Compress");
		idMng_UserEditTunnelSvr_Addr.value = sAddrListen;
		idMng_UserEditTunnelSvr_Enc.checked = (sEncrypt != "" && sEncrypt != "0");
		idMng_UserEditTunnelSvr_Cmp.checked = (sCompress != "" && sCompress != "0");
	},
	UserEditTunnelSvrClean:function() {
		idMng_UserEditTunnelSvr_Addr.value = "";
		idMng_UserEditTunnelSvr_Enc.checked = false;
		idMng_UserEditTunnelSvr_Cmp.checked = false;
	},

	UserEditTunnelCltAdd:function(dPrio) {
		if (pgMain.UserCheck(dPrio)) {
            var username = $("#User_EditName").text();
            var port = $("#User_EditServerPort").val();
            var iErr = pgUserSvrMng.UserTunnelCltAdd(username, port);
			if (iErr > pgErrCode.PG_ERR_Normal) {
				alert("添加用户TunnelClt失败：" + pgErrMsg.GetMsg(iErr));
			}
		}
	},
	UserEditTunnelCltDelete:function(sTcpSvrPeer) {
		if (pgMain.UserCheck()) {
			var iErr = pgUserSvrMng.UserTunnelCltDelete(idMng_UserEditName.innerText, sTcpSvrPeer);
			if (iErr > pgErrCode.PG_ERR_Normal) {
				alert("删除用户TunnelClt失败：" + pgErrMsg.GetMsg(iErr));
			}
		}
	},
	UserEditTunnelCltList:function() {
		if (pgMain.UserCheck()) {
			var iErr = pgUserSvrMng.UserTunnelCltGet(idMng_UserEditName.innerText);
			if (iErr > pgErrCode.PG_ERR_Normal) {
				alert("获取用户TunnelClt失败：" + pgErrMsg.GetMsg(iErr));
			}
		}
	},
	UserEditTunnelCltListShow:function(sData) {
		while (idMng_UserEditTunnelCltList.rows.length > 1) {
			idMng_UserEditTunnelCltList.deleteRow(1);
		}

		var i = 0;
		while (true) {
			var sEle = pgAppPlugin.omlGetEle(sData, "", 1, i);
			if (!sEle) {
				break;
			}

			var sTcpSvrPeer = pgAppPlugin.omlGetName(sEle, "");

			var oRow = idMng_UserEditTunnelCltList.insertRow(idMng_UserEditTunnelCltList.rows.length);
			var oCell = oRow.insertCell(0);
			oCell.width = "120px";
			oCell.innerText = sTcpSvrPeer;
			oCell = oRow.insertCell(1);
			oCell.width = "60px";
			oCell.innerHTML = "<a href=\"#\" onclick=\"pgMain.UserEditTunnelCltDelete('" + sTcpSvrPeer + "')\">删除</a>";
			i++;
		}
	},
	UserEditTunnelCltClean:function() {
		while (idMng_UserEditTunnelCltList.rows.length > 1) {
			idMng_UserEditTunnelCltList.deleteRow(1);
		}
		idMng_UserEditTunnelClt_TcpSvrPeer.value = "";
	},

	UserEditTunnelCnntSet:function(dPrio) {
		if (pgMain.UserCheck(dPrio)) {
            var sProxy = $("#User_EditHTTPProxy").val();
            var sAllowPub = $("#User_EditPublicNetwork").val();
            var TCP = $("#User_EditTCPPort").val();
            var username = $("#User_EditName").text();

            //var sProxy = "";
			//if (idMng_UserEditTunnelCnnt_Proxy[1].checked) {
			//	sProxy = "1";
			//}
			//else if (idMng_UserEditTunnelCnnt_Proxy[2].checked) {
			//	sProxy = "0";
			//}
			//var sAllowPub = "";
			//if (idMng_UserEditTunnelCnnt_AllowPub[1].checked) {
			//	sAllowPub = "1";
			//}
			//else if (idMng_UserEditTunnelCnnt_AllowPub[2].checked) {
			//	sAllowPub = "0";
			//}
			var iErr = pgUserSvrMng.UserTunnelCnntSet(username,	TCP, sProxy, sAllowPub);
			if (iErr > pgErrCode.PG_ERR_Normal) {
				alert("修改用户TunnelCnnt失败：" + pgErrMsg.GetMsg(iErr));
			}
		}
	},
	UserEditTunnelCnntShow:function(sData) {
		var sProxy = pgAppPlugin.omlGetContent(sData, "Proxy");
		var sAllowPub = pgAppPlugin.omlGetContent(sData, "AllowPub");
		var sAddrTcpSvr = pgAppPlugin.omlGetContent(sData, "AddrTcpSvr");
		idMng_UserEditTunnelCnnt_AddrTcpSvr.value = sAddrTcpSvr;
		if (sProxy != "") {
			if (sProxy != "0") {
				idMng_UserEditTunnelCnnt_Proxy[1].checked = true;
			}
			else {
				idMng_UserEditTunnelCnnt_Proxy[2].checked = true;
			}
		}
		else {
			idMng_UserEditTunnelCnnt_Proxy[0].checked = true;
		}
		if (sAllowPub != "") {
			if (sAllowPub != "0") {
				idMng_UserEditTunnelCnnt_AllowPub[1].checked = true;
			}
			else {
				idMng_UserEditTunnelCnnt_AllowPub[2].checked = true;
			}
		}
		else {
			idMng_UserEditTunnelCnnt_AllowPub[0].checked = true;
		}
	},
	UserEditTunnelCnntClean:function() {
		idMng_UserEditTunnelCnnt_AddrTcpSvr.value = "";
		idMng_UserEditTunnelCnnt_Proxy[0].checked = true;
		idMng_UserEditTunnelCnnt_Proxy[1].checked = false;
		idMng_UserEditTunnelCnnt_Proxy[2].checked = false;
		idMng_UserEditTunnelCnnt_AllowPub[0].checked = true;
		idMng_UserEditTunnelCnnt_AllowPub[1].checked = false;
		idMng_UserEditTunnelCnnt_AllowPub[2].checked = false;
	},

	UserEditAclAdd:function(dPrio) {
		if (pgMain.UserCheck(dPrio)) {
            var bAction = $("#User_EditProxyPublic").val();
            var node = $("#User_EditNodeName").val();
            var username = $("#User_EditName").text();

            //var bAction = 0;
			//if (idMng_UserEditAcl_Action[0].checked) {
			//	bAction = 1;
			//}
			var iErr = pgUserSvrMng.UserAclAdd(username,
				node, bAction);
			if (iErr > pgErrCode.PG_ERR_Normal) {
				alert("添加用户Acl失败：" + pgErrMsg.GetMsg(iErr));
			}
		}
	},
	UserEditAclDelete:function(sPeer) {
		if (pgMain.UserCheck()) {

			var iErr = pgUserSvrMng.UserAclDelete(idMng_UserEditName.innerText, sPeer);
			if (iErr > pgErrCode.PG_ERR_Normal) {
				alert("删除用户Acl失败：" + pgErrMsg.GetMsg(iErr));
			}
		}
	},
	UserEditAclList:function() {
		if (pgMain.UserCheck()) {
            //var username = $("#User_EditName").text();
            var iErr = pgUserSvrMng.UserAclGet(idMng_UserEditName.innerText);
			if (iErr > pgErrCode.PG_ERR_Normal) {
				alert("获取用户Acl失败：" + pgErrMsg.GetMsg(iErr));
			}
		}
	},
	UserEditAclListShow:function(sData) {
		while (idMng_UserEditAclList.rows.length > 1) {
			idMng_UserEditAclList.deleteRow(1);
		}

		var i = 0;
		while (true) {
			var sEle = pgAppPlugin.omlGetEle(sData, "", 1, i);
			if (!sEle) {
				break;
			}

			var sPeer = pgAppPlugin.omlGetName(sEle, "");
			var sAction = pgAppPlugin.omlGetContent(sEle, "");
			
			var sActText = "";
			if (sAction != "" && sAction != "0") {
				sActText = "允许";
			}
			else {
				sActText = "禁止";
			}

			var oRow = idMng_UserEditAclList.insertRow(idMng_UserEditAclList.rows.length);
			var oCell = oRow.insertCell(0);
			oCell.width = "180px";
			oCell.innerText = sPeer;
			oCell = oRow.insertCell(1);
			oCell.width = "80px";
			oCell.innerText = sActText;
			oCell = oRow.insertCell(2);
			oCell.width = "60px";
			oCell.innerHTML = "<a href=\"#\" onclick=\"pgMain.UserEditAclDelete('" + sPeer + "')\">删除</a>";
			i++;
		}
	},
	UserEditAclClean:function() {
		while (idMng_UserEditAclList.rows.length > 1) {
			idMng_UserEditAclList.deleteRow(1);
		}
		idMng_UserEditAcl_Peer.value = "";
		idMng_UserEditAcl_Action[0].checked = true;
		idMng_UserEditAcl_Action[1].checked = false;
	},

	UserEditDomainCfgList:function() {
		pgUserSvrMng.SetCBName("DomainCfg");
		var iErr = pgUserSvrMng.DomainList(1024, 0);
		pgUserSvrMng.SetCBName("");
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("查询域失败：" + pgErrMsg.GetMsg(iErr));
		}
	},
	UserEditDomainCfgListShow:function(sData) {
		while (idMng_UserEditDomainCfg.options.length > 0) {
			idMng_UserEditDomainCfg.remove(0);
		}

		var i = 0;
		while (true) {
			var sEle = pgAppPlugin.omlGetEle(sData, "", 1, i);
			if (!sEle) {
				break;
			}

			var sPrio = pgAppPlugin.omlGetContent(sEle, ".Prio");
			if (sPrio < 244) {
				var sDomain = pgAppPlugin.omlGetContent(sEle, ".Domain");
				var sFwdDNS = pgAppPlugin.omlGetContent(sEle, ".FwdDNS");
				var sCmmt = pgAppPlugin.omlGetContent(sEle, ".Cmmt");
	
				var oOption = document.createElement("OPTION");
				idMng_UserEditDomainCfg.options.add(oOption);
				oOption.innerText = sDomain + "(" + sFwdDNS + ")";
				oOption.value = sDomain;
			}

			i++;
		}

		var sUserPeer = idMng_UserEditName.innerText;
		var sDomain = pgAppUti.GetUserDomain(sUserPeer);
		if (sDomain) {
			idMng_UserEditDomainCfg.value = sDomain;
		}
	},
	UserEditDomainCfgSet:function() {
		var sDomainNew = "";
		if (idMng_UserEditDomainCfg.selectedIndex < idMng_UserEditDomainCfg.options.length) {
			sDomainNew = idMng_UserEditDomainCfg.options(idMng_UserEditDomainCfg.selectedIndex).value;
		}
		var sUserPeer = idMng_UserEditName.innerText;
		var sDomain = pgAppUti.GetUserDomain(sUserPeer);
		if (sDomainNew && sDomain) {
			if (confirm("确定把此隧道用户切换到域: " + sDomainNew)) {
				var sStatus = idMng_UserEditName.getAttribute("status");
				if (sStatus != "online") {
					alert("需要用户在线时才能下发配置");
					return;
				}
				var iErr = pgUserSvrMng.UserDomainSwitch(sUserPeer, sDomainNew);
				if (iErr > pgErrCode.PG_ERR_Normal) {
					alert("切换域失败：" + pgErrMsg.GetMsg(iErr));
				}
			}
		}		
	},
	UserEditPeerInfoShow:function(sData) {
        var list = $("#User_EditCmmList").get(0);
        if(list) {
            while (list.rows.length > 1) {
                list.deleteRow(1);
            }
        }

		var iInd = 0;
		while (true) {
			var sEle = pgAppPlugin.omlGetEle(sData, "", 1, iInd);
			if (!sEle) {
				break;
			}
			var sPeer = pgAppPlugin.omlGetName(sEle, "");
			var sThrough = pgAppPlugin.omlGetContent(sEle, ".Through");
			var sAddrLcl = pgAppPlugin.omlGetContent(sEle, ".AddrLcl");
			var sAddrRmt = pgAppPlugin.omlGetContent(sEle, ".AddrRmt");
			var sTunnelLcl = pgAppPlugin.omlGetContent(sEle, ".TunnelLcl");
			var sTunnelRmt = pgAppPlugin.omlGetContent(sEle, ".TunnelRmt");
			
			var oRow = list.insertRow(list.rows.length);
			var oCell = oRow.insertCell();
			oCell.innerText = sPeer;
			var oCell = oRow.insertCell();
			oCell.innerText = (sThrough < 16) ? "穿透" : "转发";
			var oCell = oRow.insertCell();
			oCell.innerText = sAddrLcl;
			var oCell = oRow.insertCell();
			oCell.innerText = sTunnelLcl;
			var oCell = oRow.insertCell();
			oCell.innerText = sAddrRmt;
			var oCell = oRow.insertCell();
			oCell.innerText = sTunnelRmt;

			iInd++;
		}
	},

	UserAdd:function() {
		pgDlg.Open("DlgUserAdd", "添加用户", 380, 160, idHtml_DlgUserAdd.innerHTML);
		var oUserName = document.getElementById("idDlg_UserAddName");
		if (oUserName) {
			oUserName.value = "";
		}
		var oUserDomain = document.getElementById("idDlg_UserAddDomain");
		if (oUserDomain) {
			var iInd = 0;
			while (true) {
				var sEle = pgAppPlugin.omlGetEle(pgMain.sDomainList, "", 1, iInd);
				if (!sEle) {
					break;
				}
				var sDomain = pgAppPlugin.omlGetContent(sEle, ".Domain");
				var oOption = document.createElement("OPTION");
				oUserDomain.options.add(oOption);
				oOption.innerText = sDomain;
				oOption.value = sDomain;
				iInd++;
			}
		}
	},
	UserAddFinish:function() {
		if (!idDlg_UserAddName || !idDlg_UserAddPass || !idDlg_UserAddEmail) {
			return;
		}
		var sDomain = "";
		var oUserDomain = document.getElementById("idDlg_UserAddDomain");
		if (oUserDomain) {
			if (oUserDomain.selectedIndex < oUserDomain.options.length) {
				sDomain = oUserDomain.options(oUserDomain.selectedIndex).value;
			}
		}
		if (!sDomain) {
			alert("请选择一个域后缀！");
			return
		}

		var sEmail = idDlg_UserAddEmail.value;
		if (sEmail.indexOf('@') <= 0) {
			alert("用户的邮箱地址不合法！");
			return
		}

		var iErr = pgUserSvrMng.AddUser((idDlg_UserAddName.value + "@" + sDomain),
			idDlg_UserAddPass.value, idDlg_UserAddEmail.value, "0");
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("添加用户失败：" + pgErrMsg.GetMsg(iErr));
		}

		pgDlg.Close("DlgUserAdd");
	},

	UserDelete:function(sUser) {
		if (confirm("确认要删除用户：" + sUser)) {
			var iErr = pgUserSvrMng.DeleteUser(sUser);
			if (iErr > pgErrCode.PG_ERR_Normal) {
				alert("删除用户失败：" + pgErrMsg.GetMsg(iErr));
			}
		}
	},
	UserRestart:function(sUser) {
		if (confirm("确认要重启隧道：" + sUser)) {
			var iErr = pgUserSvrMng.UserNotify(sUser, "Restart", "");
			if (iErr > pgErrCode.PG_ERR_Normal) {
				alert("发送重启命令失败：" + pgErrMsg.GetMsg(iErr));
			}
		}
	},
	UserFwdUpdate:function(sUser) {
		if (confirm("确认要刷新转发列表：" + sUser)) {
			var iErr = pgUserSvrMng.UserNotify(sUser, "FwdUpdate", "");
			if (iErr > pgErrCode.PG_ERR_Normal) {
				alert("发送刷新转发列表命令失败：" + pgErrMsg.GetMsg(iErr));
			}
		}
	},
	
	UserEdit:function(sUser, sStatus) {
		idMng_UserEditName.setAttribute("edit", "1");
		idMng_UserEditName.setAttribute("status", sStatus);
		idMng_UserEditName.innerText = sUser;
		pgMenu.SelMenu(3, 'idMng_UserEdit');
	},
	UserEditRefresh:function() {
		var sTemp = idMng_UserEditName.innerText;
		if (sTemp) {
			pgUserSvrMng.GetUserInfo(sTemp);
		}
	},
	UserEditReturn:function() {
		pgMain.UserInfoClean();
		pgMenu.SelMenu(1, 'idMng_UserList');
	},
	UserList:function(iAct) {
		if (iAct < 0) {
			if (pgMain.iUserPageInd > 0) {
				pgMain.iUserPageInd--;
			}
		}
		else if (iAct > 0) {
			if (pgMain.iUserCount > 0) {
				pgMain.iUserPageInd++;
			}
		}

		var sField = "";
		if (idMng_SearchMode[0].checked) {
			if (pgMain.iSearchP2P) {
				sField = "User";
			}
			else {
				sField = "Cmmt";
			}
		}
		else if (idMng_SearchMode[1].checked) {
			sField = "User";
		}

		var iPos = pgMain.iUserPageInd * 24;
		var iErr = pgUserSvrMng.SearchUser(pgMain.iSearchOnl, sField, idMng_UserSearchText.value, 24, iPos);
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("搜索用户失败：" + pgErrMsg.GetMsg(iErr));
		}
	},
	UserSearch:function() {
		pgMain.iUserPageInd = 0;
		pgMain.UserList(0);
	},
	UserSearchOnl:function() {
		if (idMng_SearchOnl.checked) {
			pgMain.iSearchOnl = 1;
		}
		else {
			pgMain.iSearchOnl = 0;
		}
		pgMain.UserSearch();
	},
	UserSearchP2P:function() {
		if (idMng_SearchP2P.checked) {
			pgMain.iSearchP2P = 1;
		}
		else {
			pgMain.iSearchP2P = 0;
		}
		pgMain.UserList(0);
	},

	UserListShow:function(sData) {
		while (idMng_UserListShow.rows.length > 0) {
			idMng_UserListShow.deleteRow(0);
		}

		var i = 0;
		while (true) {
			var sEle = pgAppPlugin.omlGetEle(sData, "", 1, i);
			if (!sEle) {
				break;
			}

			var sUser = pgAppPlugin.omlGetContent(sEle, ".User");
			var sType = pgAppPlugin.omlGetContent(sEle, ".Type");
			var sStatus = pgAppPlugin.omlGetContent(sEle, ".Status");
			var sClient = pgAppPlugin.omlGetContent(sEle, ".Client");
			var sCmmt = pgAppPlugin.omlGetContent(sEle, ".Cmmt");
			
			var sCmmtTxt = "";
			var sPhoneNO = "";
			if (sCmmt.indexOf("#V1#") == 0) {
				sCmmtTxt = pgAppPlugin.omlGetContent(sCmmt, "Cmmt");
				sPhoneNO = pgAppPlugin.omlGetContent(sCmmt, "PhoneNO");
			}
			else {
				sCmmtTxt = sCmmt;
			}
			
			if (sType == "1") {
				sStatus = "online";
			}
			
			var oRow = idMng_UserListShow.insertRow(idMng_UserListShow.rows.length);
			oRow.onmouseover = pgOver;
			oRow.onmouseout = pgOut;
			oRow.id = "id_" + sUser;
			oRow.setAttribute("p2puser", sUser);

			var oCell = oRow.insertCell(0);
			oCell.width = "340px";
			oCell.style.wordWrap = "break-word";
			oCell.style.wordBreak = "break-all";
			oCell.innerText = pgMain.UserNameText(sUser, sCmmtTxt);
			oCell = oRow.insertCell(1);
			oCell.width = "80px";
			oCell.innerText = pgMain.UserStatusText(sStatus);
			oCell = oRow.insertCell(2);
			oCell.width = "100px";
			oCell.style.wordWrap = "break-word";
			oCell.style.wordBreak = "break-all";
			oCell.innerText = pgMain.UserClientText(sUser, sClient);
			oCell = oRow.insertCell(3);
			oCell.width = "180px";
			oCell.innerText = sPhoneNO;
			oCell = oRow.insertCell(4);
			oCell.innerHTML = pgMain.UserOpareHTML(sUser, sStatus, sClient);
			i++;
		}
		
		pgMain.iUserCount = i;		
		pgMain.UserServerCtrl();
	},

	UserOpareHTML:function(sUser, sStatus, sClient) {
		var sOperaHTML = "<span class=\"txt_button\" onclick=\"pgMain.UserEdit('" + sUser + "','" + sStatus + "')\" "
			+ "onmouseover=\"this.style.color='#ee5533'\" onmouseout=\"this.style.color=''\">编辑</span>"
			+ "&nbsp;&nbsp;<span class=\"txt_button\" onclick=\"pgMain.UserDelete('" + sUser + "')\" "
			+ "onmouseover=\"this.style.color='#ee5533'\" onmouseout=\"this.style.color=''\">删除</span>";
		if (sStatus == "online") {
			if (sClient.indexOf("pgTunnel") == 0) {
				sOperaHTML += "&nbsp;&nbsp;<span class=\"txt_button\" onclick=\"pgMain.UserRestart('" + sUser + "')\" "
					+ "onmouseover=\"this.style.color='#ee5533'\" onmouseout=\"this.style.color=''\">重启</span>";
			}
			if (sClient.indexOf("pgTunnel/Forward") == 0) {
				sOperaHTML += "&nbsp;&nbsp;<span class=\"txt_button\" onclick=\"pgMain.UserFwdUpdate('" + sUser + "')\" "
					+ "onmouseover=\"this.style.color='#ee5533'\" onmouseout=\"this.style.color=''\">刷新</span>";
			}
			else if (sClient.indexOf("pgTunnel/Server") == 0) {
				sOperaHTML += "&nbsp;&nbsp;<span class=\"txt_button\" onclick=\"pgMain.UserOperate('" + sUser + "', 0)\""
					+ "onmouseover=\"this.style.color='#ee5533'\" onmouseout=\"this.style.color=''\">操作</span> ";
			}
			else if (sClient.indexOf("pgTunnel/Client") == 0) {
				sOperaHTML += "&nbsp;&nbsp;<span class=\"txt_button\" onclick=\"pgMain.UserOperate('" + sUser + "', 1)\""
					+ "onmouseover=\"this.style.color='#ee5533'\" onmouseout=\"this.style.color=''\">操作</span>";
			}
			else if (sClient.indexOf("pgTunnel/Update") == 0) {
				sOperaHTML += "&nbsp;&nbsp;<span class=\"txt_button\" onclick=\"pgMain.UserOperate('" + sUser + "', 4)\""
					+ "onmouseover=\"this.style.color='#ee5533'\" onmouseout=\"this.style.color=''\">操作</span>";
			}
		}
		else if (sStatus != "disable") {
			if (sUser.indexOf("_CODE_SVR") == 0) {
				sOperaHTML += "&nbsp;&nbsp;<span class=\"txt_button\" onclick=\"pgMain.UserOperate('" + sUser + "', 16)\""
					+ "onmouseover=\"this.style.color='#ee5533'\" onmouseout=\"this.style.color=''\">操作</span> ";
			}
			else if (sUser.indexOf("_CODE_CLT") == 0) {
				sOperaHTML += "&nbsp;&nbsp;<span class=\"txt_button\" onclick=\"pgMain.UserOperate('" + sUser + "', 16)\""
					+ "onmouseover=\"this.style.color='#ee5533'\" onmouseout=\"this.style.color=''\">操作</span>";
			}			
		}
		
		return sOperaHTML;
	},
	UserOperate:function(sUser, uMode) {
		if (uMode == 0) {
			var sOpt0 = "pgMain.CmdExecShow('" + sUser + "');";
			var sOpt1 = "pgMain.BackupDataShow('" + sUser + "');";
			var sOpt2 = "pgMain.BackupFileShow('" + sUser + "');";
			var sOpt3 = "pgMain.UpdateFileShow('" + sUser + "');";
			var sOpt4 = "pgMain.RemoteOpen('" + sUser + "');";
			var sOpt5 = "pgMain.ViewCapShow('" + sUser + "');";
			var sItemList = "(_usr_0){(Img){}(Txt){执行命令}(Exe){" + pgAppPlugin.omlEncode(sOpt0) + "}}"
				+ "(_usr_1){(Img){}(Txt){备份数据}(Exe){" + pgAppPlugin.omlEncode(sOpt1) + "}}"
				+ "(_usr_2){(Img){}(Txt){备份文件}(Exe){" + pgAppPlugin.omlEncode(sOpt2) + "}}"
				+ "(_usr_3){(Img){}(Txt){下发文件}(Exe){" + pgAppPlugin.omlEncode(sOpt3) + "}}"
				+ "(_usr_4){(Img){}(Txt){远程协助}(Exe){" + pgAppPlugin.omlEncode(sOpt4) + "}}"
				+ "(_usr_5){(Img){}(Txt){查看截屏}(Exe){" + pgAppPlugin.omlEncode(sOpt5) + "}}";
			pgPopMenu.Popup(sItemList, 1);
		}
		else if (uMode == 1) {
			var sOpt0 = "pgMain.CmdExecShow('" + sUser + "');";
			var sOpt1 = "pgMain.UpdateFileShow('" + sUser + "');";
			var sOpt2 = "pgMain.RemoteOpen('" + sUser + "');";
			var sOpt3 = "pgMain.ViewCapShow('" + sUser + "');";
			var sItemList = "(_usr_0){(Img){}(Txt){执行命令}(Exe){" + pgAppPlugin.omlEncode(sOpt0) + "}}"
				+ "(_usr_1){(Img){}(Txt){下发文件}(Exe){" + pgAppPlugin.omlEncode(sOpt1) + "}}"
				+ "(_usr_2){(Img){}(Txt){远程协助}(Exe){" + pgAppPlugin.omlEncode(sOpt2) + "}}"
				+ "(_usr_3){(Img){}(Txt){查看截屏}(Exe){" + pgAppPlugin.omlEncode(sOpt3) + "}}";
			pgPopMenu.Popup(sItemList, 1);
		}
		else if (uMode == 4) {
			var sOpt0 = "pgMain.CmdExecShow('" + sUser + "');";
			var sOpt1 = "pgMain.UpdateFileShow('" + sUser + "');";
			var sItemList = "(_usr_0){(Img){}(Txt){执行命令}(Exe){" + pgAppPlugin.omlEncode(sOpt0) + "}}"
				+ "(_usr_1){(Img){}(Txt){下发文件}(Exe){" + pgAppPlugin.omlEncode(sOpt1) + "}}";
			pgPopMenu.Popup(sItemList, 1);
		}
		else if (uMode == 16) {
			var sOpt1 = "pgMain.ViewCapShow('" + sUser + "');";
			var sItemList = "(_usr_1){(Img){}(Txt){查看截屏}(Exe){" + pgAppPlugin.omlEncode(sOpt1) + "}}";
			pgPopMenu.Popup(sItemList, 1);
		}
	},
	UserStatusShow:function(sData) {
		var sUser = pgAppPlugin.omlGetContent(sData, "User");
		var sStatus = pgAppPlugin.omlGetContent(sData, "Status");
		var sClient = pgAppPlugin.omlGetContent(sData, "Client");
		var oRow = document.getElementById("id_" + sUser);
		if (oRow) {
			oRow.cells(1).innerText = pgMain.UserStatusText(sStatus);
			oRow.cells(2).innerText = pgMain.UserClientText(sUser, sClient);
			oRow.cells(4).innerHTML = pgMain.UserOpareHTML(sUser, sStatus, sClient);
		}
	},
	
	UserInfoShow:function(sData) {

		var sType = pgAppPlugin.omlGetContent(sData, "Type");
		var sStatus = pgAppPlugin.omlGetContent(sData, "Status");
		var sCmmt = pgAppPlugin.omlGetContent(sData, "Cmmt");
		var sAcl = pgAppPlugin.omlGetContent(sData, "Acl");
		var sTunnelSvr = pgAppPlugin.omlGetContent(sData, "TunnelSvr");
		var sTunnelClt = pgAppPlugin.omlGetContent(sData, "TunnelClt");
		var sFwdDNS = pgAppPlugin.omlGetContent(sData, "Forward");
		var sTunnelCnnt = pgAppPlugin.omlGetContent(sData, "TunnelCnnt");
		var sSysInfo = pgAppPlugin.omlGetContent(sData, "CltSysInfo");
		var sAddTime = pgAppPlugin.omlGetContent(sData, "AddTime");
		var sIPV4Addr = pgAppPlugin.omlGetContent(sData, "IPAddr");
		var sPeerInfo = pgAppPlugin.omlGetContent(sData, "PeerInfo");

        var sysver = $("#User_EditSysVer");
        var syspk = $("#User_EditSysPk");
        var systype = $("#User_EditSysType");
		
		var sCmmtTxt = "";
		var sPhoneNO = "";
		if (sCmmt.indexOf("#V1#") == 0) {
			sCmmtTxt = pgAppPlugin.omlGetContent(sCmmt, "Cmmt");
			sPhoneNO = pgAppPlugin.omlGetContent(sCmmt, "PhoneNO");
		}
		else {
			sCmmtTxt = sCmmt;
		}
		
		//idMng_SysInfo_AddTime.innerText = sAddTime;
		//idMng_SysInfo_IPAddr.innerText = sIPV4Addr;
		//idMng_SysInfo_Cmmt.innerText = sCmmtTxt;
		//idMng_SysInfo_PhoneNO.innerText = sPhoneNO;
		//idMng_SysInfo_TunnelVer.innerText = pgAppPlugin.omlGetContent(sSysInfo, "TunnelVer");
		//idMng_SysInfo_IEVer.innerText = pgAppPlugin.omlGetContent(sSysInfo, "IEVer");
		//idMng_SysInfo_MacAddr.innerText = pgAppPlugin.omlGetContent(sSysInfo, "MacAddr");
		//idMng_SysInfo_CpuMHz.innerText = pgAppPlugin.omlGetContent(sSysInfo, "CpuMHz");
		//idMng_SysInfo_MemSize.innerText = pgAppPlugin.omlGetContent(sSysInfo, "MemSize");
		var sOSVer = pgAppPlugin.omlGetContent(sSysInfo, "OSVer");
		var sMajorVer = pgAppPlugin.omlGetContent(sOSVer, "MajorVer");
		var sMinorVer = pgAppPlugin.omlGetContent(sOSVer, "MinorVer");
        sysver.innerText = sMajorVer + '.' + sMinorVer;
		var sCSDVer = pgAppPlugin.omlGetContent(sOSVer, "CSDVer");
        syspk.innerText = sCSDVer;
		var sProductType = pgAppPlugin.omlGetContent(sOSVer, "ProductType");
		if (sProductType == "1") {
            systype.text('Windows WorkStation');
		}
		else if (sProductType == "2") {
            systype.text('Windows Domain controller');
		}
		else if (sProductType == "3") {
            systype.text('Windows Server');
		}
		else {
            systype.text('');
		}

		//idMng_UserEditStatus.value = (sStatus == "disable" || sStatus == "unauth") ? sStatus : "";
		//idMng_UserEditFwdDNS.value = sFwdDNS;
		//idMng_UserEditCmmt.value = sCmmtTxt;
		//idMng_UserEditPhoneNO.value = sPhoneNO;
        //
		//pgMain.UserEditAclListShow(sAcl);
		//pgMain.UserEditTunnelSvrShow(sTunnelSvr);
		//pgMain.UserEditTunnelCltListShow(sTunnelClt);
		//pgMain.UserEditTunnelCnntShow(sTunnelCnnt);
		pgMain.UserEditPeerInfoShow(sPeerInfo);
	},
	UserInfoClean:function() {
		idMng_UserEditName.setAttribute("edit", "0");
		idMng_UserEditName.setAttribute("status", "");
		idMng_UserEditName.innerText = "未选择用户";
		idMng_UserEditPass.value = "";
		idMng_UserEditPhoneNO.value = "";
		idMng_UserEditStatus.value = "";
		idMng_UserEditFwdDNS.value = "";
		idMng_UserEditCmmt.value = "";
		pgMain.UserEditAclClean();
		pgMain.UserEditTunnelSvrClean();
		pgMain.UserEditTunnelCltClean();
		pgMain.UserEditTunnelCnntClean();
	},
	
	UserNameText:function(sUser, sCmmt) {
		if (pgMain.iSearchP2P) {
			return sUser;
		}

		var sUserTxt = "";
		if (sCmmt) {
			sUserTxt = sCmmt;
		}
		else {
			var sUserTemp = sUser;
			var iInd = sUser.indexOf("_CODE_");
			if (iInd == 0) {
				sUserTemp = sUser.substring(10);
			}
			sUserTxt = sUserTemp;
		}

		return sUserTxt;
	},

	UserClientText:function(sUser, sClient) {
		var sCltText = "";
		if (sUser.indexOf("_CODE_SVR_") == 0) {
			sCltText = "服务器";
		}
		else if (sUser.indexOf("_CODE_CLT_") == 0) {
			sCltText = "客户端";
		}
		else if (sUser.indexOf("_CODE_FWD_") == 0) {
			sCltText = "转发服务器";
		}
		else if (sUser.indexOf("_CODE_BAK_") == 0) {
			sCltText = "备份服务器";
		}
		else if (sUser.indexOf("_CODE_UPD_") == 0) {
			sCltText = "升级服务器";
		}
		else {
			if (sClient == "pgTunnel/Server") {
				sCltText = "服务器";
			}
			else if (sClient == "pgTunnel/Client") {
				sCltText = "客户端";
			}
			else if (sClient == "pgTunnel/Forward") {
				sCltText = "转发服务器";
			}
			else if (sClient == "pgTunnel/Backup") {
				sCltText = "备份服务器";
			}
			else if (sClient == "pgTunnel/Update") {
				sCltText = "升级服务器";
			}
			else if (sClient == "pgRelay") {
				sCltText = "中继转发";
			}
			else if (sClient.indexOf("client=pgatx;") == 0) {
				sCltText = "管理员页面";
			}
			else {
				sCltText = sClient;
			}
		}

		return sCltText;
	},
	
	UserStatusText:function(sStatus) {
		var sStaText = "离线";
		if (sStatus == "disable") {
			sStaText = "禁用";
		}
		else if (sStatus == "online") {
			sStaText = "在线";
		}
		else if (sStatus == "unauth") {
			sStaText = "未认证";
		}
		return sStaText;
	},
	
	UserServerCtrl:function() {
		for (var i = 0; i < idMng_UserListShow.rows.length; i++) {
			var sUser = idMng_UserListShow.rows(i).getAttribute("p2puser");
			if (sUser.indexOf("_CODE_SVR_") == 0) {
				var sUserClt = "_CODE_CLT_" + sUser.substring(10);
				for (var j = 0; j < idMng_UserListShow.rows.length; j++) {
					var sUser1 = idMng_UserListShow.rows(j).getAttribute("p2puser");
					if (sUser1 == sUserClt) {
						idMng_UserListShow.rows(j).cells(2).innerText = "服务器控制";
						break;
					}
				}
			}
		}
	},
	
	CmdExecShow:function(sUser) {
		idMng_CmdExecUser.setAttribute("exec", "1");
		idMng_CmdExecUser.innerText = sUser;
		pgMenu.SelMenu(5, 'idMng_CmdExec');
	},
	CmdExecAdd:function() {
		//if (idMng_CmdExec_ID.value == ""
		//	|| idMng_CmdExec_Title.value == ""
		//	|| idMng_CmdExec_CmdList.value == "")
		//{
		//	alert("请输入命令ID");
		//	return ;
		//}
        var id = $("#User_EditCmdID").val();
        var title = $("#User_EditCmdTitle").val();
        var cmd = $("#User_EditCmdSet").val();
        var time = $("#User_EditCmdTime").val();
        var cycle = $("#User_EditCmdCycle").val();

		var iErr = pgUserSvrCmd.Add(id, title, cmd, time, cycle);
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("CmdExecAdd, iErr" + iErr);
		} else {
            alert('新增命令成功');
            window.location.reload();
        }
	},
	CmdExecDelete:function(sID) {
		var iErr = pgUserSvrCmd.Delete(sID);
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("CmdExecDelete, iErr" + iErr);
		}
	},
	CmdExecExec:function(sID) {
        var username = $("#User_EditCmdName").text();

		if (!username) {
			alert("获取用户失败！");
			return false;
		}

		var sParam = "";
        var list = $("#User_EditCmdList").get(0);

        if (sID != "") {
            for (var i = 0; i < 16; i++) {
				if (list.rows(i).cells(1).innerText == sID) {
					sParam = "(" + sID + "){(Cmd){" + pgAppPlugin.omlEncode(list.rows(i).cells(3).innerText)
						+ "}(Time){" + list.rows(i).cells(4).innerText
						+ "}(Period){" + list.rows(i).cells(5).innerText + "}}";
				}
			}
		}
		else {
			for (var i = 0; i < 16; i++) {
				if (list.rows(i).cells(0).children(0).children(0).checked) {
					sParam += "(" + sID + "){(Cmd){" + pgAppPlugin.omlEncode(list.rows(i).cells(3).innerText)
						+ "}(Time){" + list.rows(i).cells(4).innerText
						+ "}(Period){" + list.rows(i).cells(5).innerText + "}}";
				}
			}
		}
		if (sParam != "") {
			var iErr = pgUserSvrMng.UserNotify(username, "Cmd", sParam);
			if (iErr > pgErrCode.PG_ERR_Normal) {
				alert("CmdExecExec, iErr" + iErr);
			}
		}
	},
    CmdTestExec:function(username, cID, cCmd, cTime, cPeriod) {
        var username = username;

        if (!username) {
            alert("获取用户失败！");
            return false;
        }

        var sParam = "";

        if (cID != "") {
            sParam = "(" + cID + "){(Cmd){" + cCmd + "}(Time){" + cTime + "}(Period){" + cPeriod + "}}";
        }

        if (sParam != "") {
            var iErr = pgUserSvrMng.UserNotify(username, "Cmd", sParam);
            if (iErr > pgErrCode.PG_ERR_Normal) {
                alert("CmdExecExec, iErr" + iErr);
            }
        }
    },
	CmdExecClean:function() {
        var username = $("#User_EditCmdName").text();
		var iErr = pgUserSvrMng.UserNotify(username, "Cmd", "");
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("CmdExecClean, iErr" + iErr);
		}
	},
	CmdExecList:function() {
		var iErr = pgUserSvrCmd.GetAll();
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("CmdExecList, iErr" + iErr);
		}
	},
	CmdExecListShow:function(sData) {
		//while (idMng_CmdExecList.rows.length > 1) {
		//	idMng_CmdExecList.deleteRow(1);
		//}

		var i = 0;
		while (true) {
			var sEle = pgAppPlugin.omlGetEle(sData, "", 1, i);
			if (!sEle) {
				break;
			}

			//var sID = pgAppPlugin.omlGetName(sEle, "");
			//var sTitle = pgAppPlugin.omlGetContent(sEle, ".Title");
			//var sCmdList = pgAppPlugin.omlGetContent(sEle, ".CmdList");
			//var sTimeExe = pgAppPlugin.omlGetContent(sEle, ".TimeExe");
			//var sPeriodExe = pgAppPlugin.omlGetContent(sEle, ".PeriodExe");
            //
			//var oRow = idMng_CmdExecList.insertRow(idMng_CmdExecList.rows.length);
			//var oCell = oRow.insertCell(0);
			//oCell.innerHTML = "<input type='checkbox'>";
			//oCell = oRow.insertCell(1);
			//oCell.innerText = sID;
			//oCell = oRow.insertCell(2);
			//oCell.innerText = sTitle;
			//oCell = oRow.insertCell(3);
			//oCell.innerText = sCmdList;
			//oCell = oRow.insertCell(4);
			//oCell.innerText = sTimeExe;
			//oCell = oRow.insertCell(5);
			//oCell.innerText = sPeriodExe;
			//oCell = oRow.insertCell(6);
			//oCell.innerHTML = "<span class=\"txt_button\" onclick=\"pgMain.CmdExecExec('" + sID + "')\">执行</span>&nbsp;&nbsp;"
			//	+ "<span class=\"txt_button\" onclick=\"pgMain.CmdExecDelete('" + sID + "')\">删除</span>";
			//i++;
		}
	},
	CmdExecRes:function(sData) {
        var sCmd = pgAppPlugin.omlGetName(sData);
		var sRes = pgAppPlugin.omlGetContent(sData);
        User_EditCmdRunState.value = '';
        User_EditCmdRunState.value += "> " + sCmd + "\r\n" + sRes + "\r\n";
	},
	
	BackupDataShow:function(sUser) {
		idMng_BackupDataUser.setAttribute("exec", "1");
		idMng_BackupDataUser.innerText = sUser;
		pgMenu.SelMenu(7, 'idMng_BackupData');
	},
	BackupDataAdd:function() {
		if (idMng_BackupData_ID.value == ""
			|| idMng_BackupData_Title.value == ""
			|| idMng_BackupData_DBList.value == "")
		{
			alert("请输入操作ID");
			return ;
		}
		var iErr = pgUserSvrBackup.Add(idMng_BackupData_ID.value, idMng_BackupData_Title.value,
			idMng_BackupData_DBList.value, idMng_BackupData_DBUser.value, idMng_BackupData_DBPass.value);
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("BackupDataAdd, iErr" + iErr);
		}
	},
	BackupDataDelete:function(sID) {
		var iErr = pgUserSvrBackup.Delete(sID);
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("BackupDataDelete, iErr" + iErr);
		}
	},
	BackupDataExec:function(sID) {
		if (idMng_BackupDataUser.getAttribute("exec") != "1") {
			alert("请先选择要备份的服务器！");
			return false;
		}

		var sParam = "";
		if (sID != "") {
			for (var i = 0; i < idMng_BackupDataList.rows.length; i++) {
				if (idMng_BackupDataList.rows(i).cells(1).innerText == sID) {
					var sMySqlDump = "mysqldump";
					if (idMng_MySqlDumpDirUsed.checked && idMng_MySqlDumpDir.value != "") {
						sMySqlDump = idMng_MySqlDumpDir.value + "\\mysqldump";
					}
					var sCmd = "\"" + sMySqlDump + "\" --user=" + idMng_BackupDataList.rows(i).cells(4).innerText
						+ " --password=" + idMng_BackupDataList.rows(i).cells(5).innerText
						+ " " + idMng_BackupDataList.rows(i).cells(3).innerText;
						
					sParam = "(" + sID + "){(DB){" + idMng_BackupDataList.rows(i).cells(3).innerText
						+ "}(Cmd){" + pgAppPlugin.omlEncode(sCmd) + "}}";
				}
			}
		}
		else {
			for (var i = 0; i < idMng_BackupDataList.rows.length; i++) {
				if (idMng_BackupDataList.rows(i).cells(0).childNodes(0).checked) {
					var sMySqlDump = "mysqldump";
					if (idMng_MySqlDumpDirUsed.checked && idMng_MySqlDumpDir.value != "") {
						sMySqlDump = idMng_MySqlDumpDir.value + "\\mysqldump";
					}
					var sCmd = "\"" + sMySqlDump + "\" --user=" + idMng_BackupDataList.rows(i).cells(4).innerText
						+ " --password=" + idMng_BackupDataList.rows(i).cells(5).innerText
						+ " " + idMng_BackupDataList.rows(i).cells(3).innerText;
						
					sParam = "(" + sID + "){(DB){" + idMng_BackupDataList.rows(i).cells(3).innerText
						+ "}(Cmd){" + pgAppPlugin.omlEncode(sCmd) + "}}";
				}
			}
		}
		if (sParam != "") {
			var iErr = pgUserSvrMng.UserNotify(idMng_BackupDataUser.innerText, "BackupDB", sParam);
			if (iErr > pgErrCode.PG_ERR_Normal) {
				alert("BackupDataExec, iErr" + iErr);
			}
		}
	},
	BackupDataList:function() {
		var iErr = pgUserSvrBackup.GetAll();
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("BackupDataList, iErr" + iErr);
			return;
		}
		pgUserSvrCfg.GetValue("MySqlDumpDir");
	},
	BackupDataListShow:function(sData) {
		while (idMng_BackupDataList.rows.length > 1) {
			idMng_BackupDataList.deleteRow(1);
		}

		var i = 0;
		while (true) {
			var sEle = pgAppPlugin.omlGetEle(sData, "", 1, i);
			if (!sEle) {
				break;
			}

			var sID = pgAppPlugin.omlGetName(sEle, "");
			var sTitle = pgAppPlugin.omlGetContent(sEle, ".Title");
			var sDBList = pgAppPlugin.omlGetContent(sEle, ".DBList");
			var sDBUser = pgAppPlugin.omlGetContent(sEle, ".DBUser");
			var sDBPass = pgAppPlugin.omlGetContent(sEle, ".DBPass");

			var oRow = idMng_BackupDataList.insertRow(idMng_BackupDataList.rows.length);
			var oCell = oRow.insertCell(0);
			oCell.innerHTML = "<input type='checkbox'>";
			oCell = oRow.insertCell(1);
			oCell.innerText = sID;
			oCell = oRow.insertCell(2);
			oCell.innerText = sTitle;
			oCell = oRow.insertCell(3);
			oCell.innerText = sDBList;
			oCell = oRow.insertCell(4);
			oCell.innerText = sDBUser;
			oCell = oRow.insertCell(5);
			oCell.innerText = sDBPass;
			oCell = oRow.insertCell(6);
			oCell.innerHTML = "<span class=\"txt_button\" onclick=\"pgMain.BackupDataExec('" + sID + "')\">备份</span>&nbsp;&nbsp;"
				+ "<span class=\"txt_button\" onclick=\"pgMain.BackupDataDelete('" + sID + "')\">删除</span>";
			i++;
		}
	},
	BackupDataRes:function(sData) {
		var sDB = pgAppPlugin.omlGetContent(sData, "DB");
		var sPath = pgAppPlugin.omlGetContent(sData, "Path");
		if (sPath) {
			idMng_BackupDataRes.value += "数据库: " + sDB + ", 已经备份到: " + sPath + "\r\n";
		}
		else {
			var sRes = pgAppPlugin.omlGetEle(sData, "", 1, 2);
			idMng_BackupDataRes.value += "数据库: " + sDB + ", 备份失败！" + sRes + "\r\n";
		}
	},
	BackupDataSetDir:function() {
		var iErr = pgUserSvrCfg.SetValue("MySqlDumpDir", idMng_MySqlDumpDir.value);
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("BackupDataSetDir, iErr" + iErr);
		}
	},
	
	BackupFileShow:function(sUser) {
		idMng_BackupFileUser.setAttribute("exec", "1");
		idMng_BackupFileUser.innerText = sUser;
		pgMenu.SelMenu(9, 'idMng_BackupFile');
	},
	BackupFileExec:function() {
		if (idMng_BackupFileUser.getAttribute("exec") != "1") {
			alert("请先选择要备份的服务器！");
			return false;
		}

		var sFileList = "";
		for (var i = 0; i < idMng_BackupFileList.rows.length; i++) {
			if (idMng_BackupFileList.rows(i).cells(0).childNodes(0).checked) {
				sFileList += "(" + idMng_BackupFileList.rows(i).cells(1).innerText
					+ "){(Size){" + idMng_BackupFileList.rows(i).cells(2).innerText
					+ "}(Hash){" + idMng_BackupFileList.rows(i).cells(3).innerText + "}}";
				idMng_BackupFileList.rows(i).cells(4).innerText = "";
			}
		}
		if (!sFileList) {
			alert("请先选中要备份的文件");
			return;
		}
		
		var sBackupSvrPeer = "";
		if (idMng_BackupFile_SvrList.selectedIndex >= 0
			&& idMng_BackupFile_SvrList.selectedIndex < idMng_BackupFile_SvrList.options.length)
		{
			sBackupSvrPeer = idMng_BackupFile_SvrList.options(idMng_BackupFile_SvrList.selectedIndex).value;
		}
		if (!sBackupSvrPeer) {
			alert("请先选择1个备份服务器");
			return;
		}
		
		var sParam = "(TcpSvrPeer){" + idMng_BackupFileUser.innerText
			+ "}(FileList){" + pgAppPlugin.omlEncode(sFileList) + "}";

		var iErr = pgUserSvrMng.UserNotify(sBackupSvrPeer, "BackupFile", sParam);
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("BackupFileExec, iErr" + iErr);
		}		
	},
	BackupFileUpdate:function() {
		if (!confirm("此操作可能要消耗隧道服务器端的大量CPU资源，且要等待较长时间。确认还继续吗？")) {
			return;
		}
		var iErr = pgUserSvrMng.UserSetInfo(idMng_BackupFileUser.innerText, "FileInfoList", "");
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("BackupFileUpdate, iErr" + iErr);
			return;
		}
		iErr = pgUserSvrMng.UserNotify(idMng_BackupFileUser.innerText, "FileInfo", "");
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("BackupFileUpdate, UserNotify, iErr" + iErr);
			return;
		}
		while (idMng_BackupFileList.rows.length > 1) {
			idMng_BackupFileList.deleteRow(1);
		}
	},
	BackupFileList:function() {
		var iErr = pgUserSvrMng.UserGetInfo(idMng_BackupFileUser.innerText, "FileInfoList");
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("BackupFileList, iErr" + iErr);
		}
	},
	BackupFileListShow:function(sData) {
		while (idMng_BackupFileList.rows.length > 1) {
			idMng_BackupFileList.deleteRow(1);
		}

		var i = 0;
		while (true) {
			var sEle = pgAppPlugin.omlGetEle(sData, "", 1, i);
			if (!sEle) {
				break;
			}

			var sFile = pgAppPlugin.omlGetName(sEle, "");
			var sSize = pgAppPlugin.omlGetContent(sEle, ".Size");
			var sHash = pgAppPlugin.omlGetContent(sEle, ".Hash");

			var oRow = idMng_BackupFileList.insertRow(idMng_BackupFileList.rows.length);
			oRow.id = "idFile_" + sFile;
			var oCell = oRow.insertCell(0);
			oCell.innerHTML = "<input type='checkbox'>";
			oCell = oRow.insertCell(1);
			oCell.innerText = sFile;
			oCell = oRow.insertCell(2);
			oCell.innerText = sSize;
			oCell = oRow.insertCell(3);
			oCell.innerText = sHash;
			oCell = oRow.insertCell(4);
			oCell.innerText = "";
			oCell = oRow.insertCell(5);
			oCell.innerHTML = "<span class=\"txt_button\" onclick=''>删除</span>";
			i++;
		}
		
		if (i > 0) {
			pgMain.BackupFileStaGet();
		}
	},
	BackupFileRes:function(sData) {
		idMng_BackupFileRes.value += "备份文件：\r\n";
		var i = 0;
		while (true) {
			var sEle = pgAppPlugin.omlGetEle(sData, "", 1, i);
			if (!sEle) {
				break;
			}
			var sFile = pgAppPlugin.omlGetName(sEle, "");
			idMng_BackupFileRes.value += "  " + sFile + "\r\n";
			i++;
		}
	},
	BackupFileStaGet:function() {
		var sBackupSvrPeer = "";
		if (idMng_BackupFile_SvrList.selectedIndex >= 0
			&& idMng_BackupFile_SvrList.selectedIndex < idMng_BackupFile_SvrList.options.length)
		{
			sBackupSvrPeer = idMng_BackupFile_SvrList.options(idMng_BackupFile_SvrList.selectedIndex).value;
		}
		if (!sBackupSvrPeer) {
			return;
		}

		var sParam = "(TcpSvrPeer){" + idMng_BackupFileUser.innerText + "}";
		var iErr = pgUserSvrMng.UserNotify(sBackupSvrPeer, "BackupSta", sParam);
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("BackupFileStaGet, UserNotify, iErr" + iErr);
		}
	},
	BackupFileSta:function(sData) {
		var sFile = pgAppPlugin.omlGetContent(sData, "File");
		var sFileSize = pgAppPlugin.omlGetContent(sData, "FileSize");
		var sCurSize = pgAppPlugin.omlGetContent(sData, "CurSize");
		var oFile = document.getElementById("idFile_" + sFile);
		if (oFile) {
			if (!sFileSize) {
				sFileSize = oFile.cells(2).innerText;
			}
			if (parseInt(sCurSize) < parseInt(sFileSize)) {
				oFile.cells(4).innerText = sCurSize + "/" + sFileSize;
			}
			else {
				oFile.cells(4).innerText = "传输完成";
			}
		}
	},
	BackupFileInfo:function(sData) {
		if (sData != "") {
			var sFile = pgAppPlugin.omlGetName(sData, "");
			var sSize = pgAppPlugin.omlGetContent(sData, ".Size");
			var sHash = pgAppPlugin.omlGetContent(sData, ".Hash");

			var oRow = idMng_BackupFileList.insertRow(idMng_BackupFileList.rows.length);
			oRow.id = "idFile_" + sFile;
			var oCell = oRow.insertCell(0);
			oCell.innerHTML = "<input type='checkbox'>";
			oCell = oRow.insertCell(1);
			oCell.innerText = sFile;
			oCell = oRow.insertCell(2);
			oCell.innerText = sSize;
			oCell = oRow.insertCell(3);
			oCell.innerText = sHash;
			oCell = oRow.insertCell(4);
			oCell.innerText = "";
			oCell = oRow.insertCell(5);
			oCell.innerHTML = "<span class=\"txt_button\" onclick=''>删除</span>";
		}
	},
	BackupSvrList:function() {
		var iErr = pgUserSvrMng.BackupList();
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("BackupSvrList, iErr" + iErr);
		}
	},
	BackupSvrListShow:function(sData) {
		while (idMng_BackupFile_SvrList.options.length > 0) {
			idMng_BackupFile_SvrList.options.remove(0);
		}
		
		var i = 0;
		while (true) {
			var sEle = pgAppPlugin.omlGetEle(sData, "", 1, i);
			if (!sEle) {
				break;
			}
			var sBackupPeer = pgAppPlugin.omlGetName(sEle, "");
			var oOption = document.createElement("OPTION");
			idMng_BackupFile_SvrList.options.add(oOption);
			oOption.innerText = sBackupPeer;
			oOption.value = sBackupPeer;
			i++;
		}
	},
	BackupFileRefresh:function() {
		pgMain.BackupSvrList();
		pgMain.BackupFileList();
	},

	UpdateFileShow:function(sUser) {
		idMng_UpdateFileUser.setAttribute("exec", "1");
		idMng_UpdateFileUser.innerText = sUser;
		pgMenu.SelMenu(11, 'idMng_UpdateFile');
	},
	UpdateFileExec:function() {
        var username = $("#User_EditUserName").text();
		if (!username) {
			alert("获取用户失败！");
			return false;
		}

        var table = $("#User_EditIssuedList").get(0);
		var sFileList = "";
		for (var i = 0; i < table.rows.length; i++) {
			if (table.rows(i).cells(0).children(0).children(0).checked) {
				sFileList += "(" + table.rows(i).cells(1).innerText
					+ "){(Size){" + table.rows(i).cells(2).innerText
					+ "}(Hash){" + table.rows(i).cells(3).innerText + "}}";
			}
		}
		if (!sFileList) {
			alert("请先选中要下发的文件");
			return;
		}
		
		var iErr = pgUserSvrMng.UserNotify(username, "UpdateFile", sFileList);
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("UpdateFileExec, iErr" + iErr);
		}		
	},
	UpdateFileStaGet:function() {
        var username = $("#User_EditUserName").text();
		iErr = pgUserSvrMng.UserNotify(username, "UpdateSta", "");
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("UpdateFileStaGet, UserNotify, iErr" + iErr);
			return;
		}
	},
	UpdateFileList:function() {
		var iErr = pgUserSvrUpdate.List();
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("UpdateFileList, iErr" + iErr);
		}
	},
	UpdateFileListShow:function(sData) {
        var table = $("#User_EditIssuedList").get(0);
		while (table.rows.length > 1) {
			table.deleteRow(1);
		}

		var i = 0;
		while (true) {
			var sEle = pgAppPlugin.omlGetEle(sData, "", 1, i);
			if (!sEle) {
				break;
			}

			var sFile = pgAppPlugin.omlGetName(sEle, "");
			var sSize = pgAppPlugin.omlGetContent(sEle, ".Size");
			var sHash = pgAppPlugin.omlGetContent(sEle, ".Hash");

			var oRow = table.insertRow(table.rows.length);
			oRow.id = "idUpdate_" + sFile;
			var oCell = oRow.insertCell(0);
			oCell.innerHTML = "<label class='i-checks m-b-none'><input type='checkbox'><i></i></label>";
			oCell = oRow.insertCell(1);
			oCell.innerText = sFile;
			oCell = oRow.insertCell(2);
			oCell.innerText = sSize;
			oCell = oRow.insertCell(3);
			oCell.innerText = sHash;
			oCell = oRow.insertCell(4);
			oCell.innerText = "";
			oCell = oRow.insertCell(5);
			//oCell.innerHTML = "<span class=\"txt_button\" onclick=''>下发</span>";
			i++;
		}

		if (i > 0) {
			pgMain.UpdateFileStaGet();
		}
	},
	UpdateFileSta:function(sData) {
		var sFile = pgAppPlugin.omlGetContent(sData, "File");
		var sFileSize = pgAppPlugin.omlGetContent(sData, "FileSize");
		var sCurSize = pgAppPlugin.omlGetContent(sData, "CurSize");
		var oFile = document.getElementById("idUpdate_" + sFile);
		if (oFile) {
			if (!sFileSize) {
				sFileSize = oFile.cells(2).innerText;
			}
			if (parseInt(sCurSize) < parseInt(sFileSize)) {
				oFile.cells(4).innerText = sCurSize + "/" + sFileSize;
			}
			else {
				oFile.cells(4).innerText = "传输完成";
			}
		}
	},
	UpdateFileRefresh:function() {
		pgMain.UpdateFileList();
	},
	
	RemoteOpen:function(sPeer) {
		
		// Add remote peer object.
		if (pgAppPlugin.ObjectGetClass(sPeer) == "") {
			if (!pgAppPlugin.ObjectAdd(sPeer, "Peer", "", 0x10000)) {
				alert("添加节点失败：" + sPeer);
				return;
			}
		}
		else {
			pgAppPlugin.ObjectSync(sPeer, "", 1);
		}

		// Add Screen object.
		var sScnObj = "SCN_" + sPeer;
		if (pgAppPlugin.ObjectGetClass(sScnObj) != "") {
			pgAppPlugin.ObjectDelete(sScnObj);
		}
		if (!pgAppPlugin.ObjectAdd(sScnObj, "Screen", sPeer, 0x10000)) {
			pgAppPlugin.ObjectDelete(sPeer);
			return;
		}

		var sInData = "(Title){远程: " + sPeer + "}(NotifyTxt){远程图像中断}(Side){1}(Wnd){0}(Option){0}";
		var iErr = pgAppPlugin.ObjectRequest(sScnObj, "Open", sInData, "", "");
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("打开远程协助失败：iErr=" + iErr);
		}

		// Send notify to remote peer.
		var sParam = "(Action){1}(ScreenObj){" + sScnObj + "}(ViewPeer){" + pgAppCltUti.sUserPeer + "}";
		iErr = pgUserSvrMng.UserNotify(sPeer, "RemoteCtrl", sParam);
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("发送远程协助控制请求失败：iErr" + iErr);
			return;
		}
	},
	RemoteClose:function(sScnObj) {
		
		// Parse remote peer from screen object name.
		var iInd = sScnObj.indexOf('_');
		if (iInd <= 0) {
			return;
		}
		var sPeer = sScnObj.substring(iInd + 1);

		// Send notify to remote peer.
		var sParam = "(Action){0}(ScreenObj){" + sScnObj + "}(ViewPeer){" + pgAppCltUti.sUserPeer + "}";
		var iErr = pgUserSvrMng.UserNotify(sPeer, "RemoteCtrl", sParam);
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("发送远程协助控制请求失败：iErr" + iErr);
		}

		// Free objects.
		pgAppPlugin.ObjectRequest(sScnObj, "Close", "", "", "");
		pgAppPlugin.ObjectDelete(sScnObj);
//		pgAppPlugin.ObjectDelete(sPeer);
		pgAppPlugin.ObjectSync(sPeer, "", 0);
	},
	RemoteInvite:function(sData) {
		var sRemotePeer = pgAppPlugin.omlGetContent(sData, "RemotePeer");
		var sCmmt = pgAppPlugin.omlGetContent(sData, "Cmmt");
		var sMsg = "用户: " + sRemotePeer + " (" + sCmmt + ") 请求远程协助，是否接受？";
		if (confirm(sMsg)) {
			pgMain.RemoteOpen(sRemotePeer);
		}
	},
	
	ViewCapShow:function(sUser) {
		//idMng_ViewCapUser.setAttribute("show", "1");
		//idMng_ViewCapUser.innerText = sUser;
        User_EditImgPreview.src = "img/null.gif";
        User_EditImgPreview.innerText = "";
		pgMain.iViewCapImgInd = 0;
		pgMain.sViewCapIDList = "";
		pgMenu.SelMenu(13, 'idMng_ViewCap');
	},
	ViewCapManual:function() {
		//var sShow = idMng_ViewCapUser.getAttribute("show");
		//if (sShow != "1") {
		//	alert("not show");
		//	return;
		//}

        var username = $("#User_EditUserName").text();
		// Send notify to capture peer.
		var sParam = "(Action){1}(ViewPeer){" + pgAppCltUti.sUserPeer + "}";
		var iErr = pgUserSvrMng.UserNotify(username, "CaptureCtrl", sParam);
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("发送手动截屏请求失败：iErr" + iErr);
		}
	},
	ViewCapRefresh:function(username) {
		//var sShow = idMng_ViewCapUser.getAttribute("show");
		//if (sShow != "1") {
		//	return;
		//}
		
		var iErr = pgUserSvrMng.UserGetFileList(username);
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("发送获取截屏列表求失败：iErr" + iErr);
		}
	},
	ViewCapNative:function() {
		//var sShow = idMng_ViewCapUser.getAttribute("show");
		//if (sShow != "1") {
		//	return;
		//}
		//var oList = document.getElementById(pgMain.sViewCapIDList);
        var oList = $("#"+pgMain.sViewCapIDList+"").get(0);
		if (!oList) {
			return;
		}
		var oRow = oList.rows(pgMain.sViewCapImgInd);
		if (oRow) {
			var sURL = oRow.getAttribute("url");
			if (sURL) {
				window.open(sURL, "_blank");
			}
		}
	},
	ViewCapPrevOne:function(sIDList, iRow) {
		//var oList = document.getElementById(sIDList);
        var oList = $("#"+sIDList+"").get(0);
        if (!oList) {
			return;
		}
		if (iRow > 0 && iRow < oList.rows.length) {
			pgMain.sViewCapImgInd = iRow;
			pgMain.sViewCapIDList = sIDList;
		}
		pgMain.ViewCapPreview(0);
	},
	ViewCapPreview:function(iDir) {
		//var oList = document.getElementById(pgMain.sViewCapIDList);
        var oList = $("#"+pgMain.sViewCapIDList+"").get(0);
        var title = $("#User_EditImgTitle").text();
        var src = $("#User_EditImgPreview");

		if (!oList) {
			return;
		}
		if (iDir < 0) {
			if (pgMain.sViewCapImgInd > 1) {
				pgMain.sViewCapImgInd--;
			}
		}
		else if (iDir > 0) {
			if ((pgMain.sViewCapImgInd + 1) < oList.rows.length) {
				pgMain.sViewCapImgInd++;
			}
		}
		var oRow = oList.rows(pgMain.sViewCapImgInd);
		if (oRow) {
			var sURL = oRow.getAttribute("url");
			if (sURL) {
				var sFile = oRow.getAttribute("file");
				//idMng_ViewCapPreview.src = sURL;
                src.attr('src', sURL);
			}
		}
	},
	ViewCapListShow:function(sData) {
		var sURLRoot = pgAppPlugin.omlGetContent(sData, "RootURL");
		var sInstList = pgAppPlugin.omlGetEle(sData, "FileList.install.", 1024, 0);
		pgMain.ViewCapListShowOne(sURLRoot, "install", sInstList, "User_EditCapListInstall");

		var sErrList = pgAppPlugin.omlGetEle(sData, "FileList.error.", 1024, 0);
		pgMain.ViewCapListShowOne(sURLRoot, "error", sErrList, "User_EditCapListError");

		var sSendList = pgAppPlugin.omlGetEle(sData, "FileList.send.", 1024, 0);	
		pgMain.ViewCapListShowOne(sURLRoot, "send", sSendList, "User_EditCapListSend");
	},
	ViewCapListShowOne:function(sURLRoot, sReson, sFileList, sIDList) {
		//var oList = document.getElementById(sIDList);
        var oList = $("#"+sIDList+"").get(0);
		if (!oList) {
			return;
		}
		while (oList.rows.length > 1) {
			oList.deleteRow(1);
		}
		
		var iInd = 0;
		while (true) {
			var sEle = pgAppPlugin.omlGetEle(sFileList, "", 1, iInd);
			if (!sEle) {
				break;
			}

			var sFile = pgAppPlugin.omlGetName(sEle, "");
			var sURL = sURLRoot + "/" + sReson + "/" + sFile;
			
			var iRow = oList.rows.length;
			var oRow = oList.insertRow(iRow);
			oRow.setAttribute("url", sURL);
			oRow.setAttribute("file", (sReson + "/" + sFile));

			var oCell = oRow.insertCell();
			oCell.innerHTML = "<a href=\"#\" onclick=\"pgMain.ViewCapPrevOne('" + sIDList + "'," + iRow + ")\">" + sFile + "</a>";

			iInd++;
		}
		
		if (pgMain.sViewCapIDList == "" && iInd > 0) {
			pgMain.ViewCapPrevOne(sIDList, 1);
		}
	},
	ViewCapShowNotify:function(sData) {
		var sCapPeer = pgAppPlugin.omlGetContent(sData, "CapPeer");
		if (sCapPeer != idMng_ViewCapUser.innerText) {
			return;
		}
		var sFilePath = pgAppPlugin.omlGetContent(sData, "File");
		var iInd = sFilePath.indexOf('/');
		if (iInd <= 0) {
			return;
		}

		var sIDList = "";
		var sReson = sFilePath.substring(0, iInd);
		if (sReson == "install") {
			sIDList = "idMng_ViewCapListInst";
		}
		else if (sReson == "error") {
			sIDList = "idMng_ViewCapListErr";
		}
		else if (sReson == "send") {
			sIDList = "idMng_ViewCapListSend";
		}
		var oList = document.getElementById(sIDList);
		if (!oList) {
			return;
		}

		var sFile = sFilePath.substring(iInd + 1);		
		var sURL = pgAppPlugin.omlGetContent(sData, "RootURL") + "/" + sFilePath;
		var iRow = oList.rows.length;
		var oRow = oList.insertRow(iRow);
		oRow.setAttribute("url", sURL);
		oRow.setAttribute("file", sFilePath);

		var oCell = oRow.insertCell();
		oCell.innerHTML = "<a href=\"#\" onclick=\"pgMain.ViewCapPrevOne('" + sIDList + "'," + iRow + ")\">" + sFile + "</a>";

		if (pgMain.sViewCapIDList == "") {
			pgMain.ViewCapPrevOne(sIDList, iRow);
		}
	},

	DomainAdd:function() {
		pgDlg.Open("DlgDomainAdd", "新建域", 260, 120, idHtml_DlgDomainAdd.innerHTML);
		var oPrioList = document.getElementById("idDlg_DomainAddPrio");
		if (oPrioList) {
			var i = 0;
			while (true) {
				var sEle = pgAppPlugin.omlGetEle(pgMain.sDomainLimitList, "", 1, i);
				if (!sEle) {
					break;
				}
				var sPrio = pgAppPlugin.omlGetName(sEle, "");
				var sMaxUser = pgAppPlugin.omlGetContent(sEle, ".MaxUser");
				var oOption = document.createElement("OPTION");
				oPrioList.options.add(oOption);
				oOption.innerText = sPrio + "级，(" + sMaxUser + "用户)";
				oOption.value = sPrio;
				i++;
			}
		}
	},
	DomainAddFinish:function() {
		if (!idDlg_DomainAddName || !idDlg_DomainAddPrio || !idDlg_DomainAddCmmt) {
			return;
		}
		var sPrio = "0";
		var oPrioList = document.getElementById("idDlg_DomainAddPrio");
		if (oPrioList) {
			if (oPrioList.selectedIndex < oPrioList.options.length) {
				sPrio = oPrioList.options(oPrioList.selectedIndex).value;
			}
		}
		var iOpt = 0;
		/*
		if (idDlg_DomainAddOption_Allow.checked) {
			iOpt = 0x0001;
		}
		*/
		if (idDlg_DomainAddOption_CfgCmn.checked) {
			iOpt = 0x0002;
		}
		var iErr = pgUserSvrDomain.Add(idDlg_DomainAddName.value,
			sPrio, iOpt, idDlg_DomainAddCmmt.value);
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("增加域失败：" + pgErrMsg.GetMsg(iErr));
		}
		pgDlg.Close("DlgDomainAdd");
	},
	DomainDelete:function(sDomain) {
		if (confirm("确认要删除域：" + sDomain)) {
			var iErr = pgUserSvrDomain.Delete(sDomain);
			if (iErr > pgErrCode.PG_ERR_Normal) {
				alert("删除域失败：" + pgErrMsg.GetMsg(iErr));
			}
		}
	},
	DomainEdit:function(sDomain) {
		idMng_DomainEditName.setAttribute("edit", "1");
		idMng_DomainEditName.innerText = sDomain;
		pgMenu.SelMenu(17, 'idMng_DomainEdit');
	},
	DomainEditRefresh:function() {
		var sTemp = idMng_DomainEditName.innerText;
		if (sTemp) {
			pgUserSvrDomain.GetInfoAll(sTemp);
		}
	},
	DomainEditReturn:function() {
		pgMain.DomainInfoClean();
		pgMenu.SelMenu(15, 'idMng_DomainList');
	},
	DomainSearch:function() {
		pgMain.iDomainPageInd = 0;
		pgMain.DomainList(0);
	},
	DomainList:function(iAct) {
		if (iAct < 0) {
			if (pgMain.iDomainPageInd > 0) {
				pgMain.iDomainPageInd--;
			}
		}
		else if (iAct > 0) {
			if (pgMain.iDomainCount > 0) {
				pgMain.iDomainPageInd++;
			}
		}
		var iPos = pgMain.iDomainPageInd * 24;
		var iErr = pgUserSvrMng.DomainList(24, iPos);
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("查询域失败：" + pgErrMsg.GetMsg(iErr));
		}
	},
	DomainListShow:function(sData) {
		while (idMng_DomainListShow.rows.length > 0) {
			idMng_DomainListShow.deleteRow(0);
		}

		var i = 0;
		while (true) {
			var sEle = pgAppPlugin.omlGetEle(sData, "", 1, i);
			if (!sEle) {
				break;
			}

			var sPrio = pgAppPlugin.omlGetContent(sEle, ".Prio");
			var sDomain = pgAppPlugin.omlGetContent(sEle, ".Domain");
			var sOption = pgAppPlugin.omlGetContent(sEle, ".Option");
			var sMng = pgAppPlugin.omlGetContent(sEle, ".Mng");
			var sPassCode = pgAppPlugin.omlGetContent(sEle, ".PassCode");
			var sCmmt = pgAppPlugin.omlGetContent(sEle, ".Cmmt");

			var oRow = idMng_DomainListShow.insertRow(idMng_DomainListShow.rows.length);
			oRow.onmouseover = pgOver;
			oRow.onmouseout = pgOut;
			var oCell = oRow.insertCell(0);
			oCell.width = "140px";
			oCell.innerText = sDomain;
			oCell = oRow.insertCell(1);
			oCell.width = "40px";
			oCell.innerText = sPrio;
			oCell = oRow.insertCell(2);
			oCell.width = "60px";
			oCell.innerText = sOption;
			oCell = oRow.insertCell(3);
			oCell.width = "140px";
			oCell.innerText = sMng;
			oCell = oRow.insertCell(4);
			oCell.width = "140px";
			oCell.innerText = sPassCode;
			oCell = oRow.insertCell(5);
			oCell.style.wordWrap = "break-word";
			oCell.style.wordBreak = "break-all";
			oCell.innerText = sCmmt;
			oCell = oRow.insertCell(6);
			oCell.width = "100px";
			oCell.innerHTML = "<span class=\"txt_button\" onclick=\"pgMain.DomainEdit('" + sDomain + "')\" "
				+ "onmouseover=\"this.style.color='#ee5533'\" onmouseout=\"this.style.color=''\">编辑</span>"
				+ "&nbsp;&nbsp;<span class=\"txt_button\" onclick=\"pgMain.DomainDelete('" + sDomain + "')\" "
				+ "onmouseover=\"this.style.color='#ee5533'\" onmouseout=\"this.style.color=''\">删除</span>";

			i++;
		}
		
		pgMain.iDomainCount = i;
		pgMain.sDomainList = sData;
	},
	
	DomainLimitGet:function() {
		var iErr = pgUserSvrMng.GetDomainLimit();
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("获取域级别信息失败：" + pgErrMsg.GetMsg(iErr));
		}
	},
	
	DomainGetPrio:function(sDomain) {
		var i = 0;
		while (true) {
			var sEle = pgAppPlugin.omlGetEle(pgMain.sDomainList, "", 1, i);
			if (!sEle) {
				break;
			}
			if (pgAppPlugin.omlGetContent(sEle, ".Domain") == sDomain) {
				var iPrio = 0;
				var sPrio = pgAppPlugin.omlGetContent(sEle, ".Prio");
				if (sPrio) {
					iPrio = parseInt(sPrio);
				}
				return iPrio;
			}
			i++;
		}
		return -1;
	},

	DomainModifyOption:function(para) {
		if (!para) {
			alert("请先选择要编辑的域！");
			return false;
		}
		var iOpt = 0;
		/*
		if (idMng_DomainEditOption_Allow.checked) {
			iOpt |= 0x0001;
		}
		*/
		if ($("#Domian_EditCfg").is(":checked")) {
			iOpt |= 0x0002;
		}
		var iErr = pgUserSvrDomain.SetInfo(para, "Opt", iOpt);
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("设置域选项失败：" + pgErrMsg.GetMsg(iErr));
		}
		alert(iOpt);
	},
	DomainModifyPassCode:function(para) {
		if (!para) {
			alert("请先选择要编辑的域！");
			return false;
		}
        var value = $("#Domain_EditVerifyCode").val();
		var iErr = pgUserSvrDomain.SetInfo(para,
			"PassCode", value);
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("设置域验证码失败：" + pgErrMsg.GetMsg(iErr));
		}
	},
	DomainModifyFwdDNS:function(para) {
		if (!para) {
			alert("请先选择要编辑的域！");
			return false;
		}
        var value = $("#Doamin_EditFwdDNS").val();
		var iErr = pgUserSvrDomain.SetInfo(para,
			"FwdDNS", value);
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("设置域转发域名失败：" + pgErrMsg.GetMsg(iErr));
		}
	},
	DomainModifyCmmt:function(para) {
		if (!para) {
			alert("请先选择要编辑的域！");
			return false;
		}
        var value = $("#Doamin_EditDes").val();
		var iErr = pgUserSvrDomain.SetInfo(para,
			"Cmmt", value);
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("设置域说明失败：" + pgErrMsg.GetMsg(iErr));
		}
	},
	DomainModifyCapInterval:function(domain) {
        var value = $("#Domain_EditScreenShot").val();
		pgMain.DomainParamAdd("CapInterval", value, domain);
	},
	DomainModifyCapTime:function(domain) {
        var value = $("#Domain_EditDuration").val();
		pgMain.DomainParamAdd("CapTime", value, domain);
	},
	DomainModifyCapNumber:function(domain) {
        var value = $("#Domain_EditScreenShotLimit").val();
		pgMain.DomainParamAdd("CapNumber", value, domain);
	},
	DomainModifyCapSaveDays:function(domain) {
        var value = $("#Domain_EditSaveDays").val();
		pgMain.DomainParamAdd("CapSaveDays", value, domain);
	},

	DomainModifyTunnel:function(sItem, domain) {
		if (sItem == "EntryAddr") {
            var value = $("#Doamin_EditEntryAddr").val();
			pgMain.DomainParamAdd("TunnelEntryAddr", value, domain);
		}
		else if (sItem == "SvrAddr") {
            var value = $("#Domain_EditTCPAddr").val();
			pgMain.DomainParamAdd("TunnelSvrAddr", value, domain);
		}
		else if (sItem == "Compress") {
			var sCompress = "0";
			if ($("#Domain_EditTunnelCompress").attr('checked')) {
				sCompress = "1";
			}
			pgMain.DomainParamAdd("TunnelCompress", sCompress, domain);
		}
	},

	DomainParamAdd:function(sName, sValue, domain) {
		var iErr = pgUserSvrDomain.ParamAdd(domain, sName, sValue);
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("添加域的自定义参数失败：" + pgErrMsg.GetMsg(iErr));
		}
	},
	DomainParamDelete:function(sName) {
		var iErr = pgUserSvrDomain.ParamDelete(idMng_DomainEditName.innerText, sName);
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("删除域的自定义参数失败：" + pgErrMsg.GetMsg(iErr));
		}
	},
	DomainParamList:function(domain) {
		var iErr = pgUserSvrDomain.GetInfo(domain, "Param");
		if (iErr > pgErrCode.PG_ERR_Normal) {
			alert("获取域的自定义参数失败：" + pgErrMsg.GetMsg(iErr));
		}
	},
	DomainParamListShow:function(sData) {
		idMng_DomainEditCapInterval.value = pgAppPlugin.omlGetContent(sData, "CapInterval");
		idMng_DomainEditCapTime.value = pgAppPlugin.omlGetContent(sData, "CapTime");
		idMng_DomainEditCapNumber.value = pgAppPlugin.omlGetContent(sData, "CapNumber");
		idMng_DomainEditCapSaveDays.value = pgAppPlugin.omlGetContent(sData, "CapSaveDays");
		idMng_DomainEditTunnelEntryAddr.value = pgAppPlugin.omlGetContent(sData, "TunnelEntryAddr");
		idMng_DomainEditTunnelSvrAddr.value = pgAppPlugin.omlGetContent(sData, "TunnelSvrAddr");
		var sTunnelCompress = pgAppPlugin.omlGetContent(sData, "TunnelCompress");
		idMng_DomainEditTunnelCompress.checked = (sTunnelCompress && sTunnelCompress != "0");
	},
	
	DomainInfoShow:function(sData) {
		var sOpt = pgAppPlugin.omlGetEle(sData, "Opt", 1, 0);
		if (sOpt) {
			var iOpt = 0;
			var sVal = pgAppPlugin.omlGetContent(sOpt, "");
			if (sVal) {
				iOpt = parseInt(sVal);
			}
			//idMng_DomainEditOption_Allow.checked = ((iOpt & 0x0001) != 0);
			idMng_DomainEditOption_CfgCmn.checked = ((iOpt & 0x0002) != 0);
		}
		
		var sPassCode = pgAppPlugin.omlGetEle(sData, "PassCode", 1, 0);
		if (sPassCode) {
			idMng_DomainEditPassCode.value = pgAppPlugin.omlGetContent(sPassCode, "");
		}
		var sFwdDNS = pgAppPlugin.omlGetEle(sData, "FwdDNS", 1, 0);
		if (sFwdDNS) {
			idMng_DomainEditFwdDNS.value = pgAppPlugin.omlGetContent(sFwdDNS, "");
		}
		var sCmmt = pgAppPlugin.omlGetEle(sData, "Cmmt", 1, 0);
		if (sCmmt) {
			idMng_DomainEditCmmt.value = pgAppPlugin.omlGetContent(sCmmt, "");
		}

		var sParam = pgAppPlugin.omlGetEle(sData, "Param", 1, 0);
		if (sParam) {
			var sTemp = pgAppPlugin.omlGetContent(sParam, "");
			pgMain.DomainParamListShow(sTemp);
		}

	},
	DomainInfoClean:function() {
		idMng_DomainEditName.setAttribute("edit", "0");
		idMng_DomainEditName.innerText = "未选择域";
		//idMng_DomainEditOption_Allow.checked = false;
		idMng_DomainEditOption_CfgCmn.checked = false;
		idMng_DomainEditPassCode.value = "";
		idMng_DomainEditFwdDNS.value = "";
		idMng_DomainEditCmmt.value = "";
	},
	
	OnResult:function(sAct, iErr, sData) {
		if (sAct == "Login") {
			if (iErr == pgErrCode.PG_ERR_Normal) {
				//pgMain.UserList(0);
				//pgMain.DomainList(0);
				//pgMain.DomainLimitGet();
                window.p2pHasLoginSuccess !== undefined && (typeof window.p2pHasLoginSuccess === "function") && window.p2pHasLoginSuccess();
			}
			else {
				pgMain.LogoutClean();

				alert("登录失败：" + pgErrMsg.GetMsg(iErr));
				pgMain.LoginDlg();
			}
		}
		else if (sAct == "DomainList") {
			if (iErr == pgErrCode.PG_ERR_Normal) {
				//pgMain.DomainListShow(sData);
			}
		}
	},

	OnExtRequest:function(sObj, uMeth, sData, uHandle, sPeer) {
		OutString("OnExtRequest: sObj=" + sObj + ", uMeth=" + uMeth + ", sData=" + sData + ", sPeer=" + sPeer);

		if (sPeer == pgAppPlugin.sSvrName) {
			if (uMeth == pgAppClass.GetMeth("Peer", "Message")) {
				var sNotify = "";
				var sParam = "";
				var iInd = sData.indexOf('/');
				if (iInd > 0) {
					sNotify = sData.substring(0, iInd);
					sParam = sData.substring(iInd + 1);
				}
				else {
					sNotify = sData;
				}

				if (sNotify == "CmdRes") {
					pgMain.CmdExecRes(sParam);
				}
				else if (sNotify == "BackupDBRes") {
					pgMain.BackupDataRes(sParam);
				}
				else if (sNotify == "BackupFileRes") {
					pgMain.BackupFileRes(sParam);
				}
				else if (sNotify == "BackupFileSta") {
					pgMain.BackupFileSta(sParam);
				}
				else if (sNotify == "FileInfoRes") {
					pgMain.BackupFileInfo(sParam);
				}
				else if (sNotify == "UpdateStaRes") {
					pgMain.UpdateFileSta(sParam);
				}
				else if (sNotify == "RemoteInvite") {
					pgMain.RemoteInvite(sParam);
				}
				else if (sNotify == "LoginSta") {
					pgMain.UserStatusShow(sParam);
				}
				else if (sNotify == "CapFinish") {
					pgMain.ViewCapShowNotify(sParam);
				}
			}
			return 0;
		}
		
		var sCls = pgAppPlugin.ObjectGetClass(sObj);
		if (sCls == "Screen") {
			if (uMeth == pgAppClass.GetMeth("Screen", "Event")) {
				var sEvent = pgAppPlugin.omlGetContent(sData, "Event");
				if (sEvent == 0) { // WndClose event.
					pgMain.RemoteClose(sObj);
				}
			}
		}
		
		return 0xff;
	},
	OnReply:function(sObj, uErr, sData, sParam, sCBName) {
		OutString("OnReply: sObj=" + sObj + ", uErr=" + uErr + ", Data=" + sData + ", sParam=" + sParam);

		if (uErr == pgErrCode.PG_ERR_Timeout) {
			if (pgMain.sUserName && !pgMain.oCltMain.bLogining) {
				pgMain.LogoutClean();
				if (!pgMain.oCltMain.Login(pgMain.sUserName, pgMain.sUserPass)) {
					window.setTimeout("pgMain.LoginDlg()", 500);
				}		
			}
			return;
		}

		if (sParam == "pgUserSvrMng.AddUser") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.UserList(0);
			}
			else {
				alert("添加用户失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.DeleteUser") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.UserList(0);
			}
			else {
				alert("删除用户失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.SearchUser") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.UserListShow(sData);
			}
			else {
				alert("搜索用户失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.ModifyUserPass") {
			if (uErr != pgErrCode.PG_ERR_Normal) {
				alert("修改密码失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.ModifyUserStatus") {
			if (uErr != pgErrCode.PG_ERR_Normal) {
				alert("修改状态失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.ModifyUserType") {
			if (uErr != pgErrCode.PG_ERR_Normal) {
				alert("修改类型失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.GetUserInfo") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.UserInfoShow(sData);
			}
			else {
				alert("获取用户信息失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.GetDomainLimit") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.sDomainLimitList = sData;
			}
			else {
				alert("获取域级别信息失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.UserAclAdd") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.UserEditAclList();
			}
			else {
				alert("增加ACL：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.UserAclDelete") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.UserEditAclList();
			}
			else {
				alert("删除ACL：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.UserAclGet") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.UserEditAclListShow(sData);
			}
			else {
				alert("获取ACL：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.UserTunnelSvrSet") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
			}
			else {
				alert("设置TunnelSvr：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.UserTunnelSvrGet") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
			}
			else {
				alert("获取TunnelSvr：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.UserTunnelCltAdd") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.UserEditTunnelCltList();
			}
			else {
				alert("增加TunnelClt：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.UserTunnelCltDelete") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.UserEditTunnelCltList();
			}
			else {
				alert("删除TunnelClt：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.UserTunnelCltGet") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.UserEditTunnelCltListShow(sData);
			}
			else {
				alert("获取TunnelClt：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.UserFwdDNSSet") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
			}
			else {
				alert("设置Forward：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.UserFwdDNSGet") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
			}
			else {
				alert("获取Forward：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.UserCmmtSet") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
			}
			else {
				alert("获取说明：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.UserTunnelCnntSet") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
			}
			else {
				alert("设置TunnelCnnt：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.DomainList") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				if (sCBName == "DomainCfg") {
					pgMain.UserEditDomainCfgListShow(sData);
				}
				else {
					pgMain.DomainListShow(sData);
				}
			}
			else {
				alert("查询域失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.BackupList") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.BackupSvrListShow(sData);
			}
			else {
				alert("查询备份服务器列表失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.UserSetInfo") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				var sField = pgAppPlugin.omlGetName(sData, "");
				if (sField == "FileInfoList") {
					pgMain.BackupFileList();
				}
			}
			else {
				alert("设置用户信息失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.UserGetInfo") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				var sField = pgAppPlugin.omlGetName(sData, "");
				var sValue = pgAppPlugin.omlGetContent(sData, "");
				if (sField == "FileInfoList") {
					pgMain.BackupFileListShow(sValue);
				}
			}
			else {
				alert("获取用户信息失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.UserGetFileList") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.ViewCapListShow(sData);
			}
			else {
				alert("获取用户信息失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrMng.UserDomainSwitch") {
			if (uErr != pgErrCode.PG_ERR_Normal) {
				alert("切换域失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrDomain.Add") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.DomainList(0);
			}
			else {
				alert("添加域失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrDomain.Delete") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.DomainList(0);
			}
			else {
				alert("删除域失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrDomain.SetInfo") {
			if (uErr != pgErrCode.PG_ERR_Normal) {
				alert("修改域参数失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrDomain.GetInfo") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.DomainInfoShow(sData);
			}
			else {
				alert("获取域参数失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrDomain.GetInfoAll") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.DomainInfoShow(sData);
			}
			else {
				pgMain.DomainInfoClean();
				alert("获取域全部参数失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrDomain.ParamAdd") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.DomainParamList();
			}
			else {
				alert("添加域自定义参数失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrDomain.ParamDelete") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.DomainParamList();
			}
			else {
				alert("删除域自定义参数失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrCmd.Add") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.CmdExecList();
			}
			else {
				alert("添加命令失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrCmd.Delete") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.CmdExecList();
			}
			else {
				alert("删除命令失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrCmd.GetAll") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.CmdExecListShow(sData);
			}
			else {
				alert("获取命令列表失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrBackup.Add") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.BackupDataList();
			}
			else {
				alert("添加备份数据失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrBackup.Delete") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.BackupDataList();
			}
			else {
				alert("删除备份数据失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrBackup.GetAll") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.BackupDataListShow(sData);
			}
			else {
				alert("获取备份数据列表失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrCfg.SetValue") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
			}
			else {
				alert("设置配置项失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrCfg.GetValue") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				var sItem = pgAppPlugin.omlGetContent(sData, "Item");
				if (sItem == "MySqlDumpDir") {
					idMng_MySqlDumpDir.value = pgAppPlugin.omlGetContent(sData, "Value");
				}
			}
			else {
				alert("获取配置项失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrUpdate.List") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.UpdateFileListShow(sData);
			}
			else {
				alert("获取升级文件列表失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
		else if (sParam == "pgUserSvrUpdate.Delete") {
			if (uErr == pgErrCode.PG_ERR_Normal) {
				pgMain.UpdateFileList();
			}
			else {
				alert("获取删除升级文件失败：" + pgErrMsg.GetMsg(uErr));
			}
		}
	}
};

var pgDlg = {

	Open:function(sID, sTitle, iW, iH, sHtml) {
		var oDlg = document.getElementById("idDlg_" + sID);
		if (oDlg) {
			return;
		}

		var iX = 0;
		if (document.body.offsetWidth > iW) {
			iX = (document.body.offsetWidth - iW) / 2;
		}
		var iY = 0;
		if (document.body.offsetHeight > iH) {
			iY = (document.body.offsetHeight - iH) / 2;
			if (iY > 160) {
				iY = 160;
			}
		}
		
		var sFrmHtml = "<div id=\"idDlg_" + sID + "\" style=\"position:absolute;left:" + iX + "px;"
			+ "top:" + iY + "px;width:" + iW + "px;height:" + iH + "px;z-index:100;background-color:#ffffff;"
			+ "border-width:1px;border-style:solid;border-color:#666699;\">"
			+ "<div style=\"width:100%;height:24px;background-color:#dddddd;\">"
			+ "<table width=\"100%\" height=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\">"
			+ "<tr><td style=\"font-weight:bold;color:#444444;padding:6px;\">" + sTitle + "</td>"
			+ "<td width=\"24\" align=\"center\" style=\"cursor:hand;font-family:Webdings;\" onclick=\"pgDlg.Close('" + sID + "')\" "
			+ "onmouseover=\"this.style.color='#ee5533'\" onmouseout=\"this.style.color=''\">r</td>"
			+ "</tr></table></div><div style=\"width:100%;height:100%;padding:3px;overflow:auto;\">" + sHtml + "</div></div>";
		
		document.body.insertAdjacentHTML("beforeEnd", sFrmHtml);
	},
	Close:function(sID) {
		var oDlg = document.getElementById("idDlg_" + sID);
		if (oDlg) {
			oDlg.removeNode(true);
		}
	}
};