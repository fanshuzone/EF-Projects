var CtxAuthoringTool = CtxAuthoringTool || {};
CtxAuthoringTool.Common = CtxAuthoringTool.Common || new AuthoringToolCommonClass();
$(document).ready(CtxAuthoringTool.Common.init);

function AuthoringToolCommonClass() {

    var self = this;
    var runtimes = "html5,html4";
    var chunkSize = "512kb";
    var serverIP = "/";

    var Model = {
        MetaTag: "",
        Title: "",
        ActivityType: "",
        Instruction: "",
        ActivityId: "",
        TemplateId: ""
    };
    var activityID;
    this.inputCommon = function () {
        bindModel();
    };

    this.getActivityID = function () {
        return activityID;
    };

    this.getChunkSize = function () {
        return chunkSize;
    };

    this.getServerIP = function () {
        return serverIP;
    };

    this.getRuntimes = function () {
        return runtimes;
    };

    function bindModel() {
        self.checkTextArea($(".inputTaskText"), Model.Title);
        self.checkTextArea($(".ctx-meta"), Model.MetaTag);
        self.checkTextArea($(".ctx-instructionText"), Model.Instruction);
    }

    this.setModel = function (data) {
        Model = data;
        bindModel();
    }


    this.init = function () {
        initDOM();
    };

    this.countWords = function (statement) {
        var str = statement.replace(/<[\w\/\s]+?>/g, " ");
        return str.replace(/^\s+|\s+$/g, "").split(/\s+/).length;
    };

    this.checkCommonData = function () {
        var hasError = false;
        if (Model.MetaTag == "") {
            self.popup("Please insert Meta-Tag first.", function () {
                $(".ctx-meta").focus();
            });
            hasError = true;
            return false;
        }
        if (Model.Title == "") {
            self.popup("Please insert the Task title for this activity.", function () {
                $(".inputTaskText").focus();
            });
            hasError = true;
            return false;
        }
        if (Model.Instruction == "") {
            self.popup("Instructions for this activity should not be empty.", function () {
                $(".ctx-instructionText").focus();
            });
            hasError = true;
            return false;
        }
        //add check Common Data for Writing
        //if (Model.MaxScore == "" && Model.FrameworkType == "Writing"){
        //	self.showWarningMessage("MaxScore for this activity should not be empty.", function(){$(".InstructionText").focus();});
        //	hasError = true;
        //	return false;
        //}
        //end
        return true;
    }

    this.getCommonModel = function (templateName) {
        Model.ActivityType = templateName;
        return Model;
    }

    this.getCommonData = function (templateName) {
        var commonData = {};
        commonData.MetaTag = Model.MetaTag;
        commonData.ActivityType = templateName;
        commonData.Instruction = Model.Instruction;
        commonData.Title = Model.Title;
        return commonData;
    }

    function initDOM() {
        activityID = queryParams("activityId");
        $(".ctx-instructionText").change(function () {
            Model.Instruction = $(this).val();
        });
        $(".inputTaskText").change(function () {
            Model.Title = $(this).val();
        });
        $('.ctx-meta').change(function () {
            Model.MetaTag = $(this).val();
        });
        self.resetTextAreaFocusEvent($(".TextArea"), bindModel);
    }

    this.loadModel = function (callBack) {
        $.ajax({
            url: "../../preview/GetActivityXml.ashx?ActvityId=" + activityID,
            dataType: 'xml',
            data: null,
            cache: false,
            //async: false,
            success: function (xml) {
                try {
                    var text = $(xml).find("ActivityContent").find("activity").text();
                    var jsonData = JSON.parse(unescape(text));
                    callBack(jsonData);
                } catch (e) {
                    callBack(null);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //_get = false;
            }
        });

    }

    /*
    * jqObj -- > container to show this plugin
    * text  -- > the text to be counted
    * limit -- > the limit of the words Count
     */
    this.wordsCount = function (jqObj, text, limit) {
        if (typeof jqObj != 'object') {
            return;
        }
        var _cout = referenceTextCount(text);
        var _color = _cout < limit ? '#003300' : '#D52B4D';

        jqObj
            .find('span')
            .css('color', _color)
            .html(_cout);
    };

    function referenceTextCount(text) {

        var _re = /[,\;.!:(\s)*\n\?]/g;
        var _tempArray = [];
        var _text = {};
        var _wordItems = {};
        var _rtCount = 0;
        _text = text;

        if (_text.length > 0) {
            _text = _text + " ";
            _tempArray = _text.split(_re);
            _wordItems = $.grep(_tempArray, function (n) {
                return $.trim(n).length > 0;
            });
            _rtCount = _wordItems.length;
            return _rtCount;
        }
        else {
            return _rtCount;
        }
    }

    this.checkTextArea = function (jQueryObj, text) {
        if (text == "") {
            jQueryObj.removeClass("TextArea_Normal");
            if (jQueryObj.hasClass("TextArea_FocusIn")) {
                jQueryObj.val(text);
                jQueryObj.removeClass("TextArea_FocusOut");
            } else {
                jQueryObj.val(jQueryObj.attr("defaultText"));
                jQueryObj.addClass("TextArea_FocusOut");
            }
        } else {
            jQueryObj.val(text);
            jQueryObj.removeClass("TextArea_Focusout");
            jQueryObj.addClass("TextArea_Normal");
        }
    };

    this.resetTextAreaFocusEvent = function (jQueryObj, bindFunction, data) {
        jQueryObj.unbind("focusin");
        jQueryObj.unbind("focusout");
        jQueryObj.focusin(function () {
            $(this).addClass("TextArea_FocusIn");
            if (data) {
                bindFunction(data);
            } else {
                bindFunction();
            }
        });
        jQueryObj.focusout(function () {
            $(this).removeClass("TextArea_FocusIn");
            if (data) {
                bindFunction(data);
            } else {
                bindFunction();
            }
        });
    };

    this.enableMouseOverOutEvent = function (jQueryObj, className) {
        self.disableMouseOverOutEvent(jQueryObj, className);
        jQueryObj.bind("selectstart", function () { return false; });
        jQueryObj.mouseover(function () {
            $(this).addClass(className + "_MouseOver");
        });
        jQueryObj.mouseout(function () {
            $(this).removeClass(className + "_MouseOver");
        });
    };

    this.uploadActivityContent = function (json, callback) {
        if (callback) {
            uploadCallBackFunction = callback;
        }
        var _search = location.search;
        var _searches = _search.split("&");

        json.Common.ActivityId = queryParams("activityid");
        json.Common.TemplateId = queryParams("templateid");
        json.Common.MetaTags = $(".MetaTagText").val();

        alert(JSON.stringify(json));
        $.ajax({
            url: self.getServerIP() + "SaveActivityContent.ashx",
            type: "POST", //Get can cross domain, but can't upload too meny characters.
            dataType: "json",
            data: { "ActivityContent": escape(JSON.stringify(json)) },
            success: function (data) {
                if (data && data.Status === "OK") {
                    AuthoringTool.Common.showWarningMessage("Save activity data successfully!", function () {
                        window.open("../../preview/frontrunner/previewActivity.html?id=" + json.Common.ActivityId);
                    });
                } else {
                    self.popup("Fail to save activity data!");
                }
            },
            error: function (data) {
                self.popup("Error to save activity data!");
            }
        });
    }

    function queryParams(key) {
        var maps = {};
        var qst = location.search.toLowerCase().substr(1).split('&');
        key = (key || "").toLowerCase();
        $.each(qst, function (index, item) {
            var kv = item.split("=");
            maps[kv[0]] = kv[1];
        });
        //qst.forEach(function (item) {
        //    var kv = item.split("=");
        //    maps[kv[0]] = kv[1];

        //});
        return maps[key] || "";
    }

}

/***
 *  plugin tabs 
 ***/
CtxAuthoringTool.Common.tabs = CtxAuthoringTool.Common.tabs || function tabsInstance(el, options) {
    return new (function tabs() {
        var self = this;
        var opts = $.extend({ minTabs: -1, maxTabs: -1, tabMap: [] }, options);
        var CLS_ROOT = ".ctx-tabs";
        var CLS_TABHEADER = ".ctx-tabs-header";
        var CLS_TABITEM = ".ctx-tabs-item";
        var CLS_TABITEM_FOCUSED = ".ctx-tabs-item.focus";
        var CLS_BTNS_ADD = ".ctx-tabs-add";
        var CLS_BTNS_REMOVE = ".ctx-tabs-remove";
        var CLS_CONTENT = ".ctx-tabs-content";
        var CLS_DISABLE = "btndisable";
        var ATTR_TARGET = "target";
        var ID_PREFIX = "tab-content-";
        var templates =
            {
                tplTabHeader: "<ul class='ctx-tabs-header'><li class='ctx-tabs-add'>+</li><li class='ctx-tabs-remove'>- remove</li></ul>",
                tplTabAddBtn: "<li class='ctx-tabs-add'>+</li>",
                tplTabRemoveBtn: "<li class='ctx-tabs-remove'>- remove</li>",
                tplTabItem: "<li class='ctx-tabs-item focus' target='{contentId}'>{tabItemTxt}</li>",
                tplTabConent: "<div id='{contentId}' class='ctx-tabs-content'>{contentTxt}</div>"
            };
        var emptyTabMap = { itemText: "", contentText: "{empty content}" };
        var $selector = (typeof el == "string" && el) ? $(el) : $(CLS_ROOT);
        var $tab = undefined;

        function numberTabItems() {
            var tabItems = $tab.find(CLS_TABITEM);
            if (isNaN(tabItems.text())) {
                return;
            }
            tabItems.each(function (index, item) {
                $(item).text(index + 1);
            });
        }
        function makeElementsComplete() {
            $tab.addClass(CLS_ROOT.replace(".", ""));
            var tabHeader = $tab.find(">ul");
            if (!tabHeader || tabHeader.length == 0) {
                $tab.prepend(templates.tplTabHeader);
            } else {
                tabHeader.addClass(CLS_TABHEADER.replace(".", ""));
                if (tabHeader.find(">li" + CLS_BTNS_ADD).length == 0) {
                    tabHeader.append(templates.tplTabAddBtn);
                }
                if (tabHeader.find(">li" + CLS_BTNS_REMOVE).length == 0) {
                    tabHeader.append(templates.tplTabRemoveBtn);
                }
                tabHeader.find(">li").not(CLS_BTNS_ADD + "," + CLS_BTNS_REMOVE).addClass(CLS_TABITEM.replace(".", ""));
            }

            $tab.find(">div").addClass(CLS_CONTENT.replace(".", ""));
        }
        function linkWithContent() {
            var $tabItems = $tab.find(CLS_TABITEM);
            $tabItems.each(function (index, item) {
                var currentTabItem = $(item);
                var target = currentTabItem.attr(ATTR_TARGET);
                if (!target) {
                    var relatedContent = $tab.find(CLS_CONTENT + ":eq(" + index + ")");
                    if (!relatedContent) {
                        return;
                    }
                    if (!relatedContent.attr("id")) {

                        var contentID = ID_PREFIX.concat(randomId());
                        relatedContent.attr("id", contentID);
                        target = contentID;
                    } else {
                        target = relatedContent.attr("id");
                    }
                    currentTabItem.attr(ATTR_TARGET, target);
                }

                currentTabItem.unbind("click");
                currentTabItem.click(function () {
                    focus(currentTabItem.index());
                });

            });
        }
        function removeTab(index) {
            if (index < 0) return -1;
            opts.minTabs = (opts.maxTabs < opts.minTabs && opts.minTabs > 0) ? -1 : opts.minTabs;
            if (opts.minTabs > 0 && (opts.minTabs - 1) >= lastItemIndex()) {
                $selector.find(CLS_BTNS_REMOVE).addClass(CLS_DISABLE);
                return -1;
            }
            var disusedItem = $tab.find(CLS_TABITEM + ":eq(" + index + ")");
            $tab.find("#" + disusedItem.attr(ATTR_TARGET)).remove();
            disusedItem.remove();
            numberTabItems();
            focus(lastItemIndex());
            enableRemove();
            enableAdd();
            return index;
        }
        function newTab(tabItemTxt, tabContextTxt) {
            opts.maxTabs = (opts.maxTabs < opts.minTabs && opts.maxTabs > 0) ? -1 : opts.maxTabs;
            if (opts.maxTabs > 0 && (opts.maxTabs - 1) <= lastItemIndex()) {
                return;
            }
            //set default text
            var contentId = ID_PREFIX.concat(randomId());
            tabItemTxt = (tabItemTxt && typeof tabItemTxt == "string") ? tabItemTxt : nextItemIndex();
            tabContextTxt = (tabContextTxt && typeof tabContextTxt == "string") ? tabContextTxt : "";

            //replace variable
            var tabItem = templates.tplTabItem.replace("{contentId}", contentId);
            tabItem = tabItem.replace("{tabItemTxt}", tabItemTxt);
            var tabContent = templates.tplTabConent.replace("{contentId}", contentId);
            tabContent = tabContent.replace("{contentTxt}", tabContextTxt);

            $tab.find(CLS_BTNS_ADD).before(tabItem);
            $tab.append(tabContent);
            linkWithContent();
            focus(lastItemIndex());
            if ((opts.maxTabs - 1) <= lastItemIndex()) {
                $selector.find(CLS_BTNS_ADD).addClass(CLS_DISABLE);
            } else {
                $selector.find(CLS_BTNS_ADD).removeClass(CLS_DISABLE);
            }

            enableRemove();
            enableAdd();

        }
        function lastItemIndex() {
            return $tab.find(CLS_TABITEM).length - 1;
        }
        function nextItemIndex() {
            return $tab.find(CLS_TABITEM).length + 1;
        }
        function indexOfocused() {
            return $tab.find(CLS_TABITEM_FOCUSED).index();
        }
        function focus(tabIndex) {
            var maxIndex = (lastItemIndex());
            if (tabIndex < 0 || maxIndex < 0) {
                return -1;
            }
            tabIndex = tabIndex > (maxIndex) ? maxIndex : tabIndex;
            var currentTabItem = $tab.find(CLS_TABITEM + ':eq(' + tabIndex + ')');
            currentTabItem.addClass("focus").siblings(CLS_TABITEM).removeClass("focus");
            var $target = currentTabItem.parents(CLS_ROOT).find("[id='" + currentTabItem.attr("target") + "']");
            $target.addClass("focus").siblings(CLS_CONTENT).removeClass("focus");
            if (self.onfocused && typeof self.onfocused == "function") {
                self.onfocused(tabIndex);
            }
        }
        function render(tabMap) {
            if (tabMap && tabMap.contentText && typeof tabMap.contentText == "string") {
                tabMap = [$.extend(false, emptyTabMap, tabMap)];
            }
            if (!(tabMap && tabMap instanceof Array && tabMap.length > 0)) {
                return;
            }
            for (var newIndex in tabMap) {
                var tabTexts = tabMap[newIndex];
                tabTexts = $.extend(false, emptyTabMap, tabTexts);
                newTab(tabTexts.itemText, tabTexts.contentText);
            }
        }
        function eachHandle(fn) {
            $selector.each(function (index, item) {
                $tab = $(item);
                if (fn && typeof fn == "function") {
                    return fn();
                }

            });
        }
        function randomId() {
            return Math.random().toString().replace(/\./, "");
        }
        function init() {
            $selector.each(function (index, item) {
                $tab = $(item);
                makeElementsComplete();
                linkWithContent();
                //load tabmap
                render(opts.tabMap);
                focus(0);
                var btnsAdd = $tab.find(CLS_BTNS_ADD);
                var btnsRemove = $tab.find(CLS_BTNS_REMOVE);
                btnsAdd.unbind("click");
                btnsAdd.bind("click", function () {
                    $tab = $(this).parents(CLS_ROOT);
                    if (self.onAddClick && enableAdd()) {
                        var effectedIndex = nextItemIndex();
                        var echo = self.onAddClick(effectedIndex);
                        if (echo !== false) {
                            return render($.extend(false, emptyTabMap, echo));
                        }
                    } else {
                        return render(emptyTabMap);
                    }
                });
                btnsRemove.unbind("click");
                btnsRemove.bind("click", function () {
                    $tab = $(this).parents(CLS_ROOT);
                    var indexOfRemoved = indexOfocused();
                    if (self.onRemoveClick && enableRemove()) {
                        var echo = self.onRemoveClick(indexOfRemoved);
                        if (echo !== false) {
                            removeTab(indexOfRemoved);
                        }
                    } else {
                        removeTab(indexOfRemoved);
                    }


                });

            });

        }
        function enableAdd() {
            if (opts.maxTabs > 0 && (opts.maxTabs - 1) <= lastItemIndex()) {
                $selector.find(CLS_BTNS_ADD).addClass(CLS_DISABLE);
                return false;
            }
            else {
                $selector.find(CLS_BTNS_ADD).removeClass(CLS_DISABLE);
                return true;
            }
        }
        function enableRemove() {
            if (opts.minTabs > 0 && (opts.minTabs - 1) >= lastItemIndex()) {
                $selector.find(CLS_BTNS_REMOVE).addClass(CLS_DISABLE);
                return false;
            }
            else {
                $selector.find(CLS_BTNS_REMOVE).removeClass(CLS_DISABLE);
                return true;
            }
        }

        this.onAddClick = null;
        this.onRemoveClick = null;
        this.onfocused = null;
        this.empty = function () {
            $selector.find(CLS_TABITEM).remove();
            $selector.find(CLS_CONTENT).remove();
        }
        this.focus = function (tabIndex) {
            eachHandle(function () {
                focus(tabIndex);
            });
        }
        this.remove = function (tabIndex) {
            eachHandle(function () {
                removeTab(tabIndex);
            });
        }
        this.add = function (tabMap) {
            eachHandle(function () {
                render(tabMap);
            });
        }

        init();
    })();
}

/***
 * plugin distractor
 ***/
CtxAuthoringTool.Common.distractor = CtxAuthoringTool.Common.distractor || function distractorInstance(el, options) {
    return new (function () {
        var self = this;
        var $root = $(el);
        var CLS_DISTRACTOR = "ctx-distractors";
        var CLS_ADD = "addOption";
        var CLS_REMOVE = "remove";
        var CLS_OPT = "ctx-options";
        var CLS_WRAPPER = "ctx-distractors";
        var CLS_OPTIONSWRAPPER = "ctx-optionContainer";
        var CLS_ADDWRAPPER = "addOptionWrapper";

        var opt = { minOpts: -1, maxOpts: -1, data: [] };
        var $optionWrapper, $addWraper, $addBtn;
        var templates = {
            tplOptionsWrapper: '<div class="ctx-optionContainer"></div>',
            tplAddBtn: '<div class="addOptionWrapper"><div class="addOption">+</div><div class="addOptionTxt">&nbsp;Add a distractor</div></div>',
            tplOption: '<div class="ctx-options" style="display: block;" id="ctx-options-{id}"><div class="remove">-</div><input type="text" name="distractor" class="TextArea input-option TextArea_Normal" maxlength="30"  defaultText="Distractor Text here"> </div>'
        };

        if (!$root || $root.length == 0) {
            return;
        }
        opt = $.extend(opt, options);
        function makeElementsComplete() {
            $root.empty();
            $root.addClass(CLS_DISTRACTOR);
            $root.append(templates.tplAddBtn);
            $root.append(templates.tplOptionsWrapper);
            $addBtn = $root.find("." + CLS_ADD);
            $optionWrapper = $root.find("." + CLS_OPTIONSWRAPPER);
            $addWraper = $root.find(".addOptionWrapper");
        }

        function bindEvent() {
            //add options
            $addBtn.bind("click", function () {
                addOption();
            });
            //remove option
            $optionWrapper.find("." + CLS_REMOVE).live("click", function () {
                if (opt.minOpts >= 0 && getNumOfOpts() <= opt.minOpts) {
                    return;
                }
                $(this).parents("." + CLS_OPT).remove();
                $addBtn.removeClass("btndisable");
            });

        }

        function addOption() {
            if (opt.maxOpts >= 0 && getNumOfOpts() >= opt.maxOpts) {
                return;
            }
            var id = newId();
            var option = templates.tplOption.replace(/\{id\}/g, id);
            $optionWrapper.append(option);
            if (getNumOfOpts() >= opt.maxOpts) {
                $addBtn.addClass("btndisable");
            } else {
                $addBtn.removeClass("btndisable");
            }

            var $disInput = $optionWrapper.find("#ctx-options-" + id + " input");
            $disInput.focus();
            if (CtxAuthoringTool.Common.watermark) {
                CtxAuthoringTool.Common.watermark($disInput);
            }
            return 'ctx-options-' + id;
        }

        function getNumOfOpts() {
            return $optionWrapper.find('.' + CLS_OPT).length;
        }

        function newId() {
            return Math.random().toString().replace(".", "");
        }

        function dataBind() {
            var data = opt.data;
            if ($.isArray(data) && data.length > 0) {
                for (var i in data) {
                    var d = unescape(data[i]);
                    var newId = addOption();
                    if (newId) {
                        $root.find("#" + newId + " input").val(d);
                    }
                }
            }
        }

        function init() {
            makeElementsComplete();
            bindEvent();
            dataBind();
        }

        this.getResult = function () {
            var result = [];
            $optionWrapper.find("input").each(function (index, item) {
                var val = $(item).val();
                val && (result.push(escape(val)));
            });
            return result;
        };
        this.valid = function () {
            var flag = true;
            var inputs = $optionWrapper.find("input");
            if (inputs.length < opt.minOpts || inputs.length > opt.maxOpts) {
                return false;
            }
            inputs.each(function (index, item) {
                var errorMsg = "";
                var $this = $(this);
                if ($this.val().length == "") {
                    flag = false;
                    $this.addClass("textarea-empty ");
                } else {
                    flag = flag && true;
                    $this.removeClass("textarea-empty");
                }
            });
            return flag;
        }

        init();

    });
}

/***
 * plugin ctxUpload 
 ***/
CtxAuthoringTool.Common.ctxUpload = CtxAuthoringTool.Common.ctxUpload || function (el, options) {
    return new function () {
        var self = this;
        var common = CtxAuthoringTool.Common || {};
        var CLS_ROOT = "ctx-stimulus-uploader";
        var $root = $(el);
        var opt = $.extend({ audio: "" }, options);
        var audioName = "a" + common.getActivityID() + "_GapFillWithOptionStimulus";
        var $selectBtn, $uploadBtn;
        var _uploader;

        var templates = {
            tpl_body: '<div class="ctx-stimulus-info"> <span class="stimulus-info-txt stimulus-info-t1">No Audio(mp3) uploaded.</span> <span class="stimulus-info-txt stimulus-info-t2"></span></div><div class="btns"><div class="selectBtn" id="btn-select-{id}">...</div><div class="uploadBtn" id="btn-upload-{id}">upload</div> </div>'
        };

        if (!$root || $root.length == 0) {
            return;
        }

        function render() {
            makeElementsComplete();
            setUploader();
        }

        function makeElementsComplete() {
            var id = newId();
            $root.empty();
            $root.addClass(CLS_ROOT);
            $root.append(templates.tpl_body.replace(/\{id\}/g, id));
            $selectBtn = $root.find(".selectBtn");
            $uploadBtn = $root.find(".uploadBtn");
        }

        function setUploader() {
            var medianame = audioName + newId().substring(0, 4);
            var $tip1 = $root.find(".stimulus-info-t1");
            var $tip2 = $root.find(".stimulus-info-t2");
            if (opt.audio) {
                $tip1.text("1 Audio(mp3) has uploaded");
            }
            _uploader = new plupload.Uploader({
                runtimes: 'html4',
                browse_button: $selectBtn.attr("id"),
                max_file_size: '20000mb',
                chunk_size: common.getChunkSize(),
                url: common.getServerIP() + 'Upload.ashx?medianame=' + medianame + "&activityid=" + common.getActivityID(),
                flash_swf_url: '../js/common/plupload.flash.swf',
                filters: [{ title: "Audio files", extensions: "mp3" }]
            });

            _uploader.bind('Init', function (up, params) {

            });

            _uploader.bind('FilesAdded', function (up, files) {
                $tip2.text("0 % Uploaded.").show();
                $uploadBtn.text("Upload");
                $uploadBtn.unbind("click");
                $uploadBtn.click(uploadAudio);
                for (i = 0; i < _uploader.files.length; i++) {
                    _uploader.removeFile(_uploader.files[i]);
                }
            });
            _uploader.bind("FileUploaded", function (up, file, info) {
                $tip1.text('Audio(mp3) uploaded');
                $selectBtn.text("...").show();
                $uploadBtn.text("Upload").unbind("click");
                $root.data("data", info.response);
                if (self.uploaded && typeof self.uploaded == "function") {
                    self.uploaded(info.response);
                }
                return;
            });
            _uploader.bind('UploadProgress', function (up, file) {
                $tip2.text(file.percent + " % uploaded.");
            });

            _uploader.bind('Error', function (up, args) {
                alert(args);
            });

            function uploadAudio() {
                _uploader.start();
                $(this).text("Stop");
                $(this).unbind("click");
                $(this).click(stopUploadAudio);
                $selectBtn.hide();
                return false;
            }
            function stopUploadAudio() {
                _uploader.stop();
                $(this).text("Upload");
                $(this).unbind("click");
                $(this).click(uploadAudio);
                return false;
            }
            _uploader.init();
            _uploader.refresh();
        }

        function dataBind() {
            $root.data("data", opt.audio || "");
        }

        function newId() {
            return Math.random().toString().substr(2);
        }

        this.uploaded = null;

        function init() {
            render();
            dataBind()
        }

        init();

    };
}

/***
 * plugin watermark
***/
CtxAuthoringTool.Common.watermark = CtxAuthoringTool.Common.watermark || function (el) {
    var $el = $(el);
    var CLS_FOCUSOUT = "TextArea_FocusOut";
    var CLS_NORAML = "TextArea_Normal";

    if (!$el.is("textarea") && !$el.is("[type='text']")) {
        return $el;
    }

    $el.unbind("focusin").unbind("focusout");
    $el.focusin(function () {
        var $me = $(this);
        var val = $.trim($me.val());
        var watermark = $me.attr("defaultText");

        $me.removeClass(CLS_FOCUSOUT);
        if (val == watermark || !val) {
            $me.removeClass(CLS_NORAML).val("");
        } else {
            $me.removeClass(CLS_FOCUSOUT).addClass(CLS_NORAML);
        }

    });
    $el.focusout(function () {
        var $me = $(this);
        var val = $.trim($me.val());
        var watermark = $me.attr("defaultText");

        if (val == watermark || !val) {
            $me.addClass(CLS_FOCUSOUT).removeClass(CLS_NORAML).val(watermark);
        } else {
            $me.addClass(CLS_NORAML);
        }
    });
    $el.change(function () {

        var $me = $(this);
        var val = $.trim($me.val());
        var watermark = $me.attr("defaultText");
        if (val == watermark || !val) {
            $me.addClass(CLS_FOCUSOUT).removeClass(CLS_NORAML).val(watermark);
        } else {
            $me.addClass(CLS_NORAML).removeClass(CLS_FOCUSOUT);
        }

    });

    return $el;
}

CtxAuthoringTool.Common.msgType = { Alert: 0, Confirm: 1 }

CtxAuthoringTool.Common.popup = function (msg, deffer, msgType) {
    return new function () {
        var self = this;
        var common = CtxAuthoringTool.Common || {};
        var _msgType = (!msgType || msgType != common.msgType.Confirm) ? common.msgType.Alert : msgType;
        var _msg = msg || "";
        var _$root, _$mask, _$btnCancel, _$btnConfirm;
        var _templates = {
            tplMask: '<div class="WarningMask" style="display: none;"></div>',
            tplPanel: '<div class="WarningPanel" style="left: 411px; top: 103.5px; display: none;"><div class="WarningTitle"><span>Warning Message</span></div><div class="WarningContent">{msg}</div><div class="WarningBottom"><div class="WarningCancelButton" style="display: block;">NO</div> <div class="WarningConfirmButton" style="display: block;">YES</div></div> </div>'
        };


        function makeElementsComplete() {
            //clear first
            $("body>.WarningMask").remove();
            $("body>.WarningPanel").remove();
            $("body").prepend(_templates.tplMask);
            $("body").prepend(_templates.tplPanel.replace("{msg}", msg));

            _$root = $(".WarningMask,.WarningPanel");
            _$btnCancel = $(".WarningPanel .WarningCancelButton");
            _$btnConfirm = $(".WarningPanel .WarningConfirmButton");

            _$root.show();
            if (_msgType == common.msgType.Confirm) {
                _$btnCancel.show();
                _$btnConfirm.show();
            } else {
                _$btnCancel.hide();
                _$btnConfirm.show();
            }
        }

        function bindEvent() {
            _$btnCancel.unbind("click");
            _$btnConfirm.unbind("click");

            _$btnConfirm.bind("click", function () {
                _$root.hide();
                if (deffer && typeof deffer == "function") {
                    deffer(true);
                }
            });

            _$btnCancel.bind("click", function () {
                _$root.hide();
                if (deffer && typeof deffer == "function") {
                    deffer(false);
                }
            });
            adjustPosition();
            $(window).bind("resize", adjustPosition);
        }

        function init() {
            makeElementsComplete();
            bindEvent();
        }

        function adjustPosition() {
            var w1 = $(window).width();
            var h1 = $(window).height();
            var w2 = $(".WarningPanel").outerWidth();
            var h2 = $(".WarningPanel").outerHeight();
            $(".WarningPanel").css("left", String((w1 - w2) / 2) + "px");
            $(".WarningPanel").css("top", String((h1 - h2) / 2) + "px");
        }

        init();
    };
};

