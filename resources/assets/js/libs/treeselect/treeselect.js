;
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(jQuery || ['jquery'], factory);
    }
    else if (typeof exports === 'object') {
        factory(jQuery || require('jquery'));
    }
    else {
        factory(jQuery);
    }
}

/**
 * �����б�ѡ����
 * ֧�ֲ㼶��ݵ�ѡ��
 */
(function ($) {
    "use strict";

    /*--------------------------------------------------|

     | TreeDocumentCreator 2.05 | www.destroydrop.com/javascript/tree/ |

     |---------------------------------------------------|

     | Copyright (c) 2002-2003 Geir Landr?               |

     |                                                   |

     | This script can be used freely as long as all     |

     | copyright messages are intact.                    |

     |                                                   |

     | Updated: 17.04.2003                               |

     |--------------------------------------------------*/


// Node object

    function Node(id, pid, name, url, title, target, icon, iconOpen, open) {

        this.id = id;

        this.pid = pid;

        this.name = name;

        this.url = url;

        this.title = title;

        this.target = target;

        this.icon = icon;

        this.iconOpen = iconOpen;

        this._io = open || false;

        this._is = false;

        this._ls = false;

        this._hc = false;

        this._ai = 0;

        this._p;

    }

// Tree object

    function TreeDocumentCreator(objName, rootID, iconDic) {
        iconDic = iconDic ? iconDic : '';

        this.config = {

            target: null,

            folderLinks: true,

            useSelection: true,

            useCookies: true,

            useLines: true,

            useIcons: true,

            useStatusText: false,

            closeSameLevel: false,

            inOrder: false

        };

        this.icon = {

            root: iconDic + 'img/home.gif',

            folder: iconDic + 'img/folder_1.gif',

            folderOpen: iconDic + 'img/folderopen_1.gif',

            node: iconDic + 'img/page_1.gif',

            empty: iconDic + 'img/empty.gif',

            line: iconDic + 'img/line.gif',

            join: iconDic + 'img/join.gif',

            joinBottom: iconDic + 'img/joinbottom.gif',

            plus: iconDic + 'img/plus.gif',

            plusBottom: iconDic + 'img/plusbottom.gif',

            minus: iconDic + 'img/minus.gif',

            minusBottom: iconDic + 'img/minusbottom.gif',

            nlPlus: iconDic + 'img/nolines_plus.gif',

            nlMinus: iconDic + 'img/nolines_minus.gif'

        };

        this.obj = objName;

        this.aNodes = [];

        this.aIndent = [];

        this.root = new Node(typeof rootID === "undefined" ? -1 : rootID);

        this.selectedNode = null;

        this.selectedFound = false;

        this.completed = false;

        this.nodeExpandedOrCollapsed = false;// �ڵ�չ�����߹رպ�Ļص�����

        this.multiple = false;// �Ƿ�Ϊ��ѡ

        this.useParentItem = false;// (����ѡ)�Ƿ����ø����ڵ��ֵ,false-��ʾֻ��Ҷ�ӽڵ��ֵ�Żᱻʹ��

        this.nodeMultipChoose = false;// ��ѡ�¼��ص�

        this.multipleCtrlName = this.obj + '_treeChooseCtrl';// ��ѡ�ؼ����

    }

// Adds a new node to the node array

    TreeDocumentCreator.prototype.add = function (id, pid, name, url, title, target, icon, iconOpen, open) {

        this.aNodes[this.aNodes.length] = new Node(id, pid, name, url, title, target, icon, iconOpen, open);

    };


// Open/close all nodes

    TreeDocumentCreator.prototype.openAll = function () {

        this.oAll(true);

    };

    TreeDocumentCreator.prototype.closeAll = function () {

        this.oAll(false);

    };


// Outputs the tree to the page

    TreeDocumentCreator.prototype.toString = function () {

        var str = '<div class="dtree">\n';

        if (document.getElementById) {

            if (this.config.useCookies) this.selectedNode = this.getSelected();

            str += this.addNode(this.root);

        } else str += 'Browser not supported.';

        str += '</div>';

        if (!this.selectedFound) this.selectedNode = null;

        this.completed = true;

        return str;

    };


// Creates the tree structure

    TreeDocumentCreator.prototype.addNode = function (pNode) {

        var str = '';

        var n = 0;

        if (this.config.inOrder) n = pNode._ai;

        for (n; n < this.aNodes.length; n++) {

            if (this.aNodes[n].pid == pNode.id) {

                var cn = this.aNodes[n];

                cn._p = pNode;

                cn._ai = n;

                this.setCS(cn);

                if (!cn.target && this.config.target) cn.target = this.config.target;

                if (cn._hc && !cn._io && this.config.useCookies) cn._io = this.isOpen(cn.id);

                if (!this.config.folderLinks && cn._hc) cn.url = null;

                if (this.config.useSelection && cn.id == this.selectedNode && !this.selectedFound) {

                    cn._is = true;

                    this.selectedNode = n;

                    this.selectedFound = true;

                }

                str += this.node(cn, n);

                if (cn._ls) break;

            }

        }

        return str;

    };


// Creates the node icon, url and text

    TreeDocumentCreator.prototype.node = function (node, nodeId) {

        var str = '<div data-id="' + node.id + '" class="dTreeNode">' + this.indent(node, nodeId);

        if (this.config.useIcons) {

            if (!node.icon) node.icon = (this.root.id == node.pid) ? this.icon.root : ((node._hc) ? this.icon.folder : this.icon.node);

            if (!node.iconOpen) node.iconOpen = (node._hc) ? this.icon.folderOpen : this.icon.node;

            if (this.root.id == node.pid) {

                node.icon = this.icon.root;

                node.iconOpen = this.icon.root;

            }

            str += '<img id="i' + this.obj + nodeId + '" src="' + ((node._io) ? node.iconOpen : node.icon) + '" alt="" />';

        }

        if (node.url) {

            str += '<a id="s' + this.obj + nodeId + '" class="' + ((this.config.useSelection) ? ((node._is ? 'nodeSel' : 'node')) : 'node') + '" href="' + node.url + '"';

            if (node.title) str += ' title="' + node.title + '"';

            if (node.target) str += ' target="' + node.target + '"';

            if (this.config.useStatusText) str += ' onmouseover="window.status=\'' + node.name + '\';return true;" onmouseout="window.status=\'\';return true;" ';

            if (this.config.useSelection && ((node._hc && this.config.folderLinks) || !node._hc))

                str += ' onclick="javascript: ' + this.obj + '.s(' + nodeId + ');"';

            str += '>';

        }

        else if ((!this.config.folderLinks || !node.url) && node._hc && node.pid != this.root.id)

            str += '<a href="javascript: ' + this.obj + '.o(' + nodeId + ');" class="node">';

        // Multiple choose
        if (this.multiple) {
            str += '<input value="' + nodeId + '" type="checkbox" style="margin: 0;padding: 0;height: auto;margin-bottom: -2px;" name="' + this.multipleCtrlName + '" id="' + this.multipleCtrlName + '_' + node.id + '" onchange="' + this.obj + '.m(this, ' + nodeId + ');">';
        }

        str += node.name;

        if (node.url || ((!this.config.folderLinks || !node.url) && node._hc)) str += '</a>';

        str += '</div>';

        if (node._hc) {

            str += '<div id="d' + this.obj + nodeId + '" class="clip" style="display:' + ((this.root.id == node.pid || node._io) ? 'block' : 'none') + ';">';

            str += this.addNode(node);

            str += '</div>';

        }

        this.aIndent.pop();

        return str;

    };


// Adds the empty and line icons

    TreeDocumentCreator.prototype.indent = function (node, nodeId) {

        var str = '';

        if (this.root.id != node.pid) {

            for (var n = 0; n < this.aIndent.length; n++)

                str += '<img src="' + ( (this.aIndent[n] == 1 && this.config.useLines) ? this.icon.line : this.icon.empty ) + '" alt="" />';

            (node._ls) ? this.aIndent.push(0) : this.aIndent.push(1);

            if (node._hc) {

                str += '<a href="javascript: ' + this.obj + '.o(' + nodeId + ');"><img id="j' + this.obj + nodeId + '" src="';

                if (!this.config.useLines) str += (node._io) ? this.icon.nlMinus : this.icon.nlPlus;

                else str += ( (node._io) ? ((node._ls && this.config.useLines) ? this.icon.minusBottom : this.icon.minus) : ((node._ls && this.config.useLines) ? this.icon.plusBottom : this.icon.plus ) );

                str += '" alt="" /></a>';

            } else str += '<img src="' + ( (this.config.useLines) ? ((node._ls) ? this.icon.joinBottom : this.icon.join ) : this.icon.empty) + '" alt="" />';

        }

        return str;

    };


// Checks if a node has any children and if it is the last sibling

    TreeDocumentCreator.prototype.setCS = function (node) {

        var lastId;

        for (var n = 0; n < this.aNodes.length; n++) {

            if (this.aNodes[n].pid == node.id) node._hc = true;

            if (this.aNodes[n].pid == node.pid) lastId = this.aNodes[n].id;

        }

        if (lastId == node.id) node._ls = true;

    };


// Returns the selected node

    TreeDocumentCreator.prototype.getSelected = function () {

        var sn = this.getCookie('cs' + this.obj);

        return (sn) ? sn : null;

    };


// Highlights the selected node
    var eOld, eNew;
    TreeDocumentCreator.prototype.s = function (id) {

        if (!this.config.useSelection) return;

        var cn = this.aNodes[id];

        if (cn._hc && !this.config.folderLinks) return;

        if (this.selectedNode != id) {

            if (this.selectedNode || this.selectedNode == 0) {

                eOld = document.getElementById("s" + this.obj + this.selectedNode);

                eOld.className = "node";

            }

            eNew = document.getElementById("s" + this.obj + id);

            eNew.className = "nodeSel";

            this.selectedNode = id;

            if (this.config.useCookies) this.setCookie('cs' + this.obj, cn.id);

        }

        if (cn._hc && typeof this.nodeExpandedOrCollapsed === "function") {
            this.nodeExpandedOrCollapsed();
        }
    };


// Multiple the selected node

    TreeDocumentCreator.prototype.m = function (obj, id) {

        var cn = this.aNodes[id];

        this.chooseChild(cn, obj.checked);

        var choCtrArr = document.getElementsByName(this.multipleCtrlName);

        var selectedIds = [];

        for (var i = 0; i < choCtrArr.length; i++) {

            if (choCtrArr[i] && choCtrArr[i].checked) {

                var selNode = this.aNodes[choCtrArr[i].value];

                selNode && (this.useParentItem || !selNode._hc) && selectedIds.push({
                    'id': selNode.id,
                    'title': selNode.name
                });

            }

        }

        this._refreshSelectedState(cn.pid);

        if (typeof this.nodeMultipChoose === "function") {

            this.nodeMultipChoose(selectedIds);

        }
    };

// Set children selection change
    TreeDocumentCreator.prototype.chooseChild = function (pNode, selected) {

        var str = '';

        var n = 0;

        if (this.config.inOrder) n = pNode._ai;

        var pObj = document.getElementById(this.multipleCtrlName + '_' + pNode.id);

        pObj.checked = selected;

        for (n; n < this.aNodes.length; n++) {

            if (this.aNodes[n].pid == pNode.id) {

                var cn = this.aNodes[n];

                var cObj = document.getElementById(this.multipleCtrlName + '_' + cn.id);

                cObj.checked = selected;

                if (cObj) {
                    this.chooseChild(cn, selected);
                }

            }

        }

        return str;
    };

// ���ö�ѡĬ��ѡ��
// TODO ���ӽڵ��ѡ���򽫸��ڵ�Ҳѡ��
    TreeDocumentCreator.prototype.setMultipleSelected = function (items) {

        var choCtrArr = document.getElementsByName(this.multipleCtrlName);

        for (var k = 0; k < choCtrArr.length; k++) {

            choCtrArr[k].checked = false;

        }

        items = typeof items === "string" ? items.split(',') : items;

        if (items && items.length) {

            for (var i = 0; i < items.length; i++) {

                if (items[i]) {

                    var selEle = document.getElementById(this.multipleCtrlName + '_' + (typeof items[i] === "object" ? items[i].id : items[i].toString()));

                    selEle && (selEle.checked = true);

                }

            }

        }

        this._refreshSelectedState(this.root.id);

    };

// ����ѡ�ӽڵ�ѡ�����,���ӽڵ���Ѿ�ѡ��,���Զ�ѡ�񸸽ڵ�
    TreeDocumentCreator.prototype._refreshSelectedState = function (id) {

        var state = true;

        for (var n = 0; n < this.aNodes.length; n++) {

            var cn = this.aNodes[n];

            if (cn.pid == id) {

                var selEle = document.getElementById(this.multipleCtrlName + '_' + cn.id);

                if (cn._hc) {

                    if (this._refreshSelectedState(cn.id)) {

                        selEle.checked = true;

                    }

                }

                state = (state && selEle.checked);

            }

        }

        var pSelEle = document.getElementById(this.multipleCtrlName + '_' + id);

        if (pSelEle) {

            pSelEle.checked = state;

        }

        return state;

    };

// Toggle Open or close

    TreeDocumentCreator.prototype.o = function (id) {

        var cn = this.aNodes[id];

        this.nodeStatus(!cn._io, id, cn._ls);

        cn._io = !cn._io;

        if (this.config.closeSameLevel) this.closeLevel(cn);

        if (this.config.useCookies) this.updateCookie();

        if (typeof this.nodeExpandedOrCollapsed === "function") {
            this.nodeExpandedOrCollapsed();
        }
    };


// Open or close all nodes

    TreeDocumentCreator.prototype.oAll = function (status) {

        for (var n = 0; n < this.aNodes.length; n++) {

            if (this.aNodes[n]._hc && this.aNodes[n].pid != this.root.id) {

                this.nodeStatus(status, n, this.aNodes[n]._ls);

                this.aNodes[n]._io = status;

            }

        }

        if (this.config.useCookies) this.updateCookie();

    };


// Opens the tree to a specific node

    TreeDocumentCreator.prototype.openTo = function (nId, bSelect, bFirst) {

        if (!bFirst) {

            for (var n = 0; n < this.aNodes.length; n++) {

                if (this.aNodes[n].id == nId) {

                    nId = n;

                    break;

                }

            }

        }

        var cn = this.aNodes[nId];

        if (cn.pid == this.root.id || !cn._p) return;

        cn._io = true;

        cn._is = bSelect;

        if (this.completed && cn._hc) this.nodeStatus(true, cn._ai, cn._ls);

        if (this.completed && bSelect) this.s(cn._ai);

        else if (bSelect) this._sn = cn._ai;

        this.openTo(cn._p._ai, false, true);

    };


// Closes all nodes on the same level as certain node

    TreeDocumentCreator.prototype.closeLevel = function (node) {

        for (var n = 0; n < this.aNodes.length; n++) {

            if (this.aNodes[n].pid == node.pid && this.aNodes[n].id != node.id && this.aNodes[n]._hc) {

                this.nodeStatus(false, n, this.aNodes[n]._ls);

                this.aNodes[n]._io = false;

                this.closeAllChildren(this.aNodes[n]);

            }

        }

    };


// Closes all children of a node

    TreeDocumentCreator.prototype.closeAllChildren = function (node) {

        for (var n = 0; n < this.aNodes.length; n++) {

            if (this.aNodes[n].pid == node.id && this.aNodes[n]._hc) {

                if (this.aNodes[n]._io) this.nodeStatus(false, n, this.aNodes[n]._ls);

                this.aNodes[n]._io = false;

                this.closeAllChildren(this.aNodes[n]);

            }

        }

    };


// Change the status of a node(open or closed)

    var eDiv, eJoin, eIcon;
    TreeDocumentCreator.prototype.nodeStatus = function (status, id, bottom) {

        eDiv = document.getElementById('d' + this.obj + id);

        eJoin = document.getElementById('j' + this.obj + id);

        if (this.config.useIcons) {

            eIcon = document.getElementById('i' + this.obj + id);

            eIcon.src = (status) ? this.aNodes[id].iconOpen : this.aNodes[id].icon;

        }

        eJoin.src = (this.config.useLines) ?

            ((status) ? ((bottom) ? this.icon.minusBottom : this.icon.minus) : ((bottom) ? this.icon.plusBottom : this.icon.plus)) :

            ((status) ? this.icon.nlMinus : this.icon.nlPlus);

        eDiv.style.display = (status) ? 'block' : 'none';

    };


// [Cookie] Clears a cookie

    TreeDocumentCreator.prototype.clearCookie = function () {

        var now = new Date();

        var yesterday = new Date(now.getTime() - 1000 * 60 * 60 * 24);

        this.setCookie('co' + this.obj, 'cookieValue', yesterday);

        this.setCookie('cs' + this.obj, 'cookieValue', yesterday);

    };


// [Cookie] Sets value in a cookie

    TreeDocumentCreator.prototype.setCookie = function (cookieName, cookieValue, expires, path, domain, secure) {

        document.cookie =

            escape(cookieName) + '=' + escape(cookieValue)

            + (expires ? '; expires=' + expires.toGMTString() : '')

            + (path ? '; path=' + path : '')

            + (domain ? '; domain=' + domain : '')

            + (secure ? '; secure' : '');

    };


// [Cookie] Gets a value from a cookie

    TreeDocumentCreator.prototype.getCookie = function (cookieName) {

        var cookieValue = '';

        var posName = document.cookie.indexOf(escape(cookieName) + '=');

        if (posName != -1) {

            var posValue = posName + (escape(cookieName) + '=').length;

            var endPos = document.cookie.indexOf(';', posValue);

            if (endPos != -1) cookieValue = unescape(document.cookie.substring(posValue, endPos));

            else cookieValue = unescape(document.cookie.substring(posValue));

        }

        return (cookieValue);

    };


// [Cookie] Returns ids of open nodes as a string

    TreeDocumentCreator.prototype.updateCookie = function () {

        var str = '';

        for (var n = 0; n < this.aNodes.length; n++) {

            if (this.aNodes[n]._io && this.aNodes[n].pid != this.root.id) {

                if (str) str += '.';

                str += this.aNodes[n].id;

            }

        }

        this.setCookie('co' + this.obj, str);

    };


// [Cookie] Checks if a node id is in a cookie

    TreeDocumentCreator.prototype.isOpen = function (id) {

        var aOpen = this.getCookie('co' + this.obj).split('.');

        for (var n = 0; n < aOpen.length; n++)

            if (aOpen[n] == id) return true;

        return false;

    };


// If Push and pop is not implemented by the browser

    if (!Array.prototype.push) {

        Array.prototype.push = function array_push() {

            for (var i = 0; i < arguments.length; i++)

                this[this.length] = arguments[i];

            return this.length;

        }

    }
    if (!Array.prototype.pop) {
        var lastElement;
        Array.prototype.pop = function array_pop() {

            lastElement = this[this.length - 1];

            this.length = Math.max(this.length - 1, 0);

            return lastElement;

        }

    }
    var pluginName = "treeSelectChoose",
        defaults =
        {
            axis: 'y'    // Vertical or horizontal scrollbar? ( x || y ).
            , wheel: true   // Enable or disable the mousewheel;
            , wheelSpeed: 40     // How many pixels must the mouswheel scroll at a time.
            , wheelLock: true   // Lock default scrolling window when there is no more content.
            , scrollInvert: false  // Enable invert style scrolling
            , trackSize: false  // Set the size of the scrollbar to auto or a fixed number.
            , thumbSize: false  // Set the size of the thumb to auto or a fixed number.
            , width: 200
            , height: 220
            , parseListDataFn: undefined // Proude Data By Self
            , onItemClicked: undefined // Item Clicked Callback Function
            , multiple: false // Enabled multiple choose
            , itemsSelected: undefined // When multiple selected call result function
            , embed: false // Append choose tree into caller object, not absolutely position
            , parentCanSelect: true
            , actionUrl: '../api/base/resource'// Default data api url
            , forceLoad: false
            , openAll: false
            , css: 'position: absolute;top: -5000px;left: -5000px;z-index: -1;' // The styles of choose tree
            , loaded: false // Ԫ�س�ʼ��������ɺ�Ļص�����
            , resourceDir:''
        };

    function Plugin($caller, options) {
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.sources = [];
        this._uid = pluginName + (new Date()).valueOf().toString();
        this.lock = false;
        this.cache = {};

        var self = this,
            $container,
            _loaded = false,
            _tree;

        this.DOCID = pluginName + "_tree_" + (new Date()).valueOf().toString();
        this.DOCTREEID = this.DOCID + "_tree";

        if (!($container = $caller.data(pluginName + 'win'))) {
            $container = initContainerUI();
        }

        var $viewport = $container.find(".viewport")
            , $overview = $container.find(".overview")
            , $scrollbar = $container.find(".scrollbar")
            , $track = $scrollbar.find(".track")
            , $thumb = $scrollbar.find(".thumb")

            , mousePosition = 0

            , isHorizontal = this.options.axis === 'x'
            , hasTouchEvents = "ontouchstart" in document.documentElement

            , sizeLabel = isHorizontal ? "width" : "height"
            , posiLabel = isHorizontal ? "left" : "top"
            ;

        this.contentPosition = 0;
        this.viewportSize = 0;
        this.contentSize = 0;
        this.contentRatio = 0;
        this.trackSize = 0;
        this.trackRatio = 0;
        this.thumbSize = 0;
        this.thumbPosition = 0;
        this.visible = false;
        this.loading = false;
        this.load = function (fn) {
            initContainerChildByMode(false, false, fn);
        };
        this.reload = function (data, fn) {
            initContainerChildByMode(true, data, fn);
        };

        this.getTree = function () {
            if (_loaded && _tree) {
                return _tree;
            }

            return false;
        };

        this.isLoaded = function () {
            return _loaded === true;
        };

        function initialize() {
            self.update();
            setEvents();

            return self;
        }

        function initContainerUI() {
            var popupWin = $(
                '<div  id="' + self.DOCID + '" class="tinysrollContainer G-treeSelectBox ' + pluginName + '" style="' + self.options.css + '">\
                    <div class="scrollbar">\
                        <div class="track">\
                            <div class="thumb">\
                                <b class="end">\
                                </b>\
                            </div>\
                        </div>\
                    </div>\
                    <div class="viewport">\
                        <div class="overview treeselect">\
                        </div>\
                    </div>\
                    <div class="mask loadLayer"><img src="'+self.options.resourceDir+'img/xubox_loading2.gif"/></div>\
                    <div class="mask noResultLayer"><span class="noResult">Sorry,I can\'t find data.</span></div>\
                </div>');
            popupWin.height(self.options.height);
            popupWin.width(self.options.width);
            popupWin.data('jsObject', self);

            var container = (self.options.embed && $($caller).size()) ? $($caller) : document.body;
            popupWin.appendTo(container);

            return popupWin;
        }

        function loadDataFromServer(data, fn) {
            if (self.loading) return;

            var queryString = paramToSting(data),
                cacheObj = $(window);
            if (queryString && typeof cacheObj.data(pluginName + 'cache') === "object" && cacheObj.data(pluginName + 'cache').hasOwnProperty(queryString)) {
                if (cacheObj.data(pluginName + 'cache')[queryString]) {
                    typeof fn === "function" && fn(cacheObj.data(pluginName + 'cache')[queryString]);
                    return;
                }
            }

            self.loading = true;
            $.APIAjax(self.options.actionUrl, data, function (data) {
                if (typeof data === "object") {
                    var cache = cacheObj.data(pluginName + 'cache') || {};
                    cache[queryString] = data;
                    cacheObj.data(pluginName + 'cache', cache);
                    typeof fn === "function" && fn(data);
                } else {
                    typeof fn === "function" && fn(false);
                }

                self.loading = false;

            }, false);

            // ��������ַ�
            function paramToSting(dat) {
                if (typeof dat === "object") {
                    var queryString = '';
                    for (var key in dat) {
                        if (dat.hasOwnProperty(key)) {
                            queryString += (key + dat[key].toString());
                        }
                    }

                    return queryString;
                }

                return false;
            }
        }

        function initContainerChildByMode(force, data, fn) {
            if (force === true) _loaded = false;
            initContainerChild(data, fn);
        }

        function initContainerChild(dat, fn) {
            if (_loaded) {
                return;
            }
            var tempCache = {},
                $overview = $container.find(".overview"),
                $mask = $container.find(".mask.loadLayer"),
                $noResultEle = $container.find(".mask.noResultLayer");

            if (dat && typeof dat === "object") {
                loadUI(dat);
            } else {
                var data = [];
                // ͨ��ص�ָ�����
                if (typeof(self.options.parseListDataFn) == 'function') {
                    data = self.options.parseListDataFn();
                    loadUI(data);
                } else {
                    var dString;
                    // ͨ��д��JSON��Dom��
                    if (typeof (dString = $caller.attr('data')) === "string") {
                        try {
                            data = eval('(' + dString + ')')
                        } catch (e) {
                            data = [];
                        }
                        loadUI(data);
                        // ��ݻ�ȡ���ò���д��DOM��
                    } else if ((typeof (dString = getDocProperty()) === "object") && dString.state) {
                        loadDataFromServer(dString.data, function (tree) {
                            if (dString.header) {
                                tree.header = dString.header;
                            }
                            loadUI(tree);
                        });
                        // ֱ��ָ�����URL��DOM��
                    } else if (typeof (dString = $caller.attr('dUrl')) === "string" && $.trim(dString)) {
                        self.options.actionUrl = $.trim(dString);
                        loadDataFromServer({}, function (tree) {
                            if (dString.header) {
                                tree.header = dString.header;
                            }
                            loadUI(tree);
                        });
                        // û���κ����
                    } else {
                        $mask.hide();
                        _loaded = true;
                        $noResultEle.show();
                        typeof self.options.loaded === "function" && self.options.loaded();
                    }
                }
            }

            // ��������ص�����
            function getDocProperty() {
                var dType = $caller.attr('dType'),
                    dTable = $caller.attr('dTable'),
                    dKeyField = $caller.attr('dKeyField'),
                    dNameField = $caller.attr('dNameField'),
                    dParentField = $caller.attr('dParentField'),
                    dWhere = $caller.attr('dWhere'),
                    dSplit = $caller.attr('dSplit'),
                    dMatchField = $caller.attr('dMatchField'),
                    dParent = $caller.attr('dParent'),
                    dParentCanSelect = $caller.attr('dParentCanSelect'),
                    dHeader = $caller.attr('dHeader'),
                    data = {
                        'dType': typeof dType === "string" ? dType : '',
                        'table': typeof dTable === "string" ? dTable : '',
                        'keyField': typeof dKeyField === "string" ? dKeyField : '',
                        'nameFiled': typeof dNameField === "string" ? dNameField : '',
                        'parentFiled': typeof dParentField === "string" ? dParentField : '',
                        'where': typeof dWhere === "string" ? dWhere : '',
                        'split': typeof dSplit === "string" ? dSplit : '',
                        'matchField': typeof dMatchField === "string" ? dMatchField : '',
                        'parent': typeof dParent === "string" ? dParent : 0,
                        'parentCanSelect': (self.options.parentCanSelect === true || (typeof dParentCanSelect === "string" && dParentCanSelect == 'true')) ? 'Y' : 'N',
                        'header': typeof dHeader === "string" ? dHeader : ''
                    };
                return {state: data.dType.length > 0 || data.table.length > 0, 'data': data};
            }

            // �������ѡ��UI
            function loadUI(data) {
                _loaded = true;
                if (typeof data !== "object") {
                    $mask.hide();
                    $noResultEle.show();
                    return;
                }

                if (data.data && typeof data.data === "object" && !data.data.length) {
                    $mask.hide();
                    $noResultEle.show();
                    return;
                } else {
                    $noResultEle.hide();
                }

                /**
                 * ������
                 * @type {TreeDocumentCreator}
                 */
                _tree = window[self.DOCTREEID] = self.tree = new TreeDocumentCreator(self.DOCTREEID, -1, self.options.resourceDir);
                self.tree.config.useSelection = false;
                if (data && data.header) {
                    self.tree.add(0, -1, data.header, 'javascript:void(0)', '', '', '', '');
                } else {
                    self.tree.add(0, -1, "ȫ��", 'javascript:void(0)', '', '', '', '');
                }

                if (self.options.multiple) {
                    self.tree.multiple = true;
                    self.tree.useParentItem = self.options.parentCanSelect;
                    typeof self.options.itemsSelected === "function" && (self.tree.nodeMultipChoose = self.options.itemsSelected);
                }

                function addNodes(nodes) {
                    var nodeCount = (nodes && nodes.length) ? nodes.length : 0;
                    if (nodeCount > 0) {
                        $(nodes).each(function (k, v) {
                            v.canSelect && (self.sources.push($.extend({}, v)));
                            tempCache[v.id] = $.extend({}, v);
                            var hasChildren = v.has_children && v.children && v.children.length > 0;
                            self.tree.add(v.id, v.pid || 0, (v.title || '').toString(), hasChildren ? '' : 'javascript:void(0)', '', '', '', '', self.options.openAll);
                            if (hasChildren) {
                                addNodes(v.children);
                            }
                        });
                    }
                }

                data && addNodes(data.data);
                $overview.html(self.tree.toString());
                $overview.find('div.dTreeNode a').each(function (k, v) {
                    if ($(v).parent() && $(v).parent().length && $(v).parent().hasClass('dTreeNode')) {
                        $(v).dblclick(nodeDoubleClicked);
                    }
                });
                self.tree.nodeExpandedOrCollapsed = function () {
                    self.update('relative');
                };

                self.cache = tempCache;
                $overview.data('DataCache', tempCache);
                $mask.hide();
                typeof fn === "function" && fn();
                typeof self.options.loaded === "function" && self.options.loaded();
                self.update(0);
            }
        }

        function nodeDoubleClicked(e) {
            var item = self.cache[$(this).parent().attr('data-id')] || {id: $(this).parent().attr('data-id')};
            if (item.canSelect !== false) {
                typeof self.options.onItemClicked === "function" && self.options.onItemClicked(item);
                self.hide();
            }

            if (item.has_children) {
                self.update('relative');
            }
        }

        this.show = function (fn) {
            if (this.lock/** || !this.sources.length**/) {
                return;
            }
            lock();
            if (!this.visible) {
                var wCliHgt = window.document.body.clientHeight,
                    wCliWdt = window.document.body.clientWidth,
                    pos = $caller.offset();
                var top = 0, left = 0, hgt = 0;
                top = pos.top + $caller.height() + 3;
                left = pos.left;
                hgt = $caller.height();

                if (wCliHgt > 0) {
                    if (wCliHgt > this.options.height && (parseInt(pos.top, 10) + parseInt(hgt, 10) + parseInt(this.options.height, 10) > wCliHgt)) {
                        if (wCliHgt - parseInt(this.options.height, 10) > 5) {
                            top = wCliHgt - parseInt(this.options.height, 10) - 5;
                        } else {
                            this.options.height = wCliHgt;
                            top = 0;
                        }
                    }
                }

                if (wCliWdt > 0) {
                    if (wCliWdt > this.options.width && ((parseInt(left, 10) + 10 + parseInt(this.options.width, 10)) > wCliWdt)) {
                        if (wCliWdt - parseInt(this.options.width, 10) > 5) {
                            left = wCliWdt - parseInt(this.options.width, 10) - 5;
                        } else {
                            this.options.width = wCliWdt;
                            left = 0;
                        }
                    }
                }

                $container.css('top', top).css('left', left).css('height', this.options.height).animate({
                    display: 'block',
                    opacity: '1.0',
                    height: self.options.height,
                    zIndex: 99999
                }, 150, function () {
                    if (_loaded !== true || self.options.forceLoad === true) {
                        _loaded = false;
                        self.load(refreshFrame);
                    } else {
                        refreshFrame();
                    }
                    function refreshFrame() {
                        self.update('relative');
                    }

                    typeof fn === "function" && fn();
                });
                self.visible = true;
            }
            unlock();
        };

        this.hide = function (fn) {
            if (this.lock) {
                return;
            }
            lock();
            if (this.visible) {
                $container.animate({
                    opacity: 0,
                    height: 0,
                    zIndex: -1,
                    display: 'none'
                }, 150, function () {
                    typeof fn === "function" && fn();
                });
                self.visible = false;
            }
            unlock();
        };

        this.toggle = function (fn) {
            if (self.visible) {
                this.hide(fn)
            }
            else {
                this.show(fn);
            }
        };

        function lock() {
            self.lock = true;
        }

        function unlock() {
            self.lock = false;
        }

        this.update = function (scrollTo) {
            var sizeLabelCap = sizeLabel.charAt(0).toUpperCase() + sizeLabel.slice(1).toLowerCase();
            this.viewportSize = $viewport[0]['offset' + sizeLabelCap];
            this.contentSize = $overview[0]['scroll' + sizeLabelCap];
            this.contentRatio = this.viewportSize / this.contentSize;
            this.trackSize = this.options.trackSize || this.viewportSize;
            this.thumbSize = Math.min(this.trackSize, Math.max(0, (this.options.thumbSize || (this.trackSize * this.contentRatio))));
            this.trackRatio = this.options.thumbSize ? (this.contentSize - this.viewportSize) / (this.trackSize - this.thumbSize) : (this.contentSize / this.trackSize);

            $scrollbar.toggleClass("disable", this.contentRatio >= 1);

            switch (scrollTo) {
                case "bottom":
                    this.contentPosition = this.contentSize - this.viewportSize;
                    break;

                case "relative":
                    this.contentPosition = Math.min(this.contentSize - this.viewportSize, Math.max(0, this.contentPosition));
                    if (this.contentPosition < 0 && this.contentSize < this.viewportSize) {
                        this.contentPosition = 0;
                    }
                    break;

                default:
                    this.contentPosition = parseInt(scrollTo, 10) || 0;
            }

            setSize();

            return self;
        };

        function setSize() {
            $thumb.css(posiLabel, self.contentPosition / self.trackRatio);
            $overview.css(posiLabel, -self.contentPosition);
            $scrollbar.css(sizeLabel, self.trackSize);
            $track.css(sizeLabel, self.trackSize);
            $thumb.css(sizeLabel, self.thumbSize);
        }

        function setEvents() {
            if (hasTouchEvents) {
                $viewport[0].ontouchstart = function (event) {
                    if (1 === event.touches.length) {
                        start(event.touches[0]);
                        event.stopPropagation();
                    }
                };
            }
            else {
                $thumb.bind("mousedown", start);
                $track.bind("mousedown", drag);
            }

            $(window).resize(function () {
                self.update("relative");
            });

            if (self.options.wheel && window.addEventListener) {
                $container[0].addEventListener("DOMMouseScroll", wheel, false);
                $container[0].addEventListener("mousewheel", wheel, false);
            }
            else if (self.options.wheel) {
                $container[0].onmousewheel = wheel;
            }

            // �������������Ԫ�ص��ʱ�ر�
            $(document.body).click(function (e) {
                if (!self.lock && self.visible) {
                    if ($container.get(0) && !$container.find(e.target).get(0) && e.target != $container.get(0) && !$caller.find(e.target).get(0) && $caller.get(0) != e.target) {
                        self.hide();
                    }
                }
            });
        }

        function start(event) {
            $("body").addClass("noSelect");

            mousePosition = isHorizontal ? event.pageX : event.pageY;
            self.thumbPosition = parseInt($thumb.css(posiLabel), 10) || 0;

            if (hasTouchEvents) {
                document.ontouchmove = function (event) {
                    event.preventDefault();
                    drag(event.touches[0]);
                };
                document.ontouchend = end;
            }
            else {
                $(document).bind("mousemove", drag);
                $(document).bind("mouseup", end);
                $thumb.bind("mouseup", end);
            }
        }

        function wheel(event) {
            if (self.contentRatio < 1) {
                var eventObject = event || window.Event
                    , wheelSpeedDelta = eventObject.wheelDelta ? eventObject.wheelDelta / 120 : -eventObject.detail / 3
                    ;

                self.contentPosition -= wheelSpeedDelta * self.options.wheelSpeed;
                self.contentPosition = Math.min((self.contentSize - self.viewportSize), Math.max(0, self.contentPosition));

                $container.trigger("move");

                $thumb.css(posiLabel, self.contentPosition / self.trackRatio);
                $overview.css(posiLabel, -self.contentPosition);

                if (self.options.wheelLock || (self.contentPosition !== (self.contentSize - self.viewportSize) && self.contentPosition !== 0)) {
                    eventObject = $.event.fix(eventObject);
                    eventObject.preventDefault();
                }
            }
        }

        function drag(event) {
            if (self.contentRatio < 1) {
                var mousePositionNew = isHorizontal ? event.pageX : event.pageY
                    , thumbPositionDelta = mousePositionNew - mousePosition
                    ;

                if (self.options.scrollInvert && hasTouchEvents) {
                    thumbPositionDelta = mousePosition - mousePositionNew;
                }

                var thumbPositionNew = Math.min((self.trackSize - self.thumbSize), Math.max(0, self.thumbPosition + thumbPositionDelta));
                self.contentPosition = thumbPositionNew * self.trackRatio;

                $container.trigger("move");

                $thumb.css(posiLabel, thumbPositionNew);
                $overview.css(posiLabel, -self.contentPosition);
            }
        }

        function end() {
            $("body").removeClass("noSelect");
            $(document).unbind("mousemove", drag);
            $(document).unbind("mouseup", end);
            $thumb.unbind("mouseup", end);
            document.ontouchmove = document.ontouchend = null;
        }

        return initialize();
    }

    /**
     * ���ע��
     * @param [options]
     * @returns Plugin
     */
    $.fn[pluginName] = function (options) {
        var plugin;
        this.each(function () {
            if (!(plugin = $.data(this, "plugin_" + pluginName))) {
                plugin = $.data(this, "plugin_" + pluginName, new Plugin($(this), options));
            }
        });

        return plugin;
    };

    /**
     * ����󶨹���ע��
     * @param [options]
     * @returns void
     */
    $.fn[pluginName + 'Bind'] = function (options) {

        this.each(function () {

            var $icon = $(this).find('.treeIcon'),
                $inpTxt = $(this).find('.treeTitle'),
                $intId = $(this).find('.treeValue');
            $icon.size() && $icon.click(toggle);

            // ��û����ѡ�񵯳������
            function getPlugin() {
                return $inpTxt.treeSelectChoose($.extend({}, {
                    width: 182,
                    onItemClicked: itemClicked,
                    parentCanSelect: $inpTxt.hasClass('parentCanSelect')
                }, options));
            }

            // UI�л�
            function toggle(e) {
                getPlugin().show();
                e.stopPropagation();
            }

            // Item ѡ���¼�
            function itemClicked(item) {
                $inpTxt.val(item.title);
                $intId.val(item.id);
            }
        });

        return this;
    }
}));