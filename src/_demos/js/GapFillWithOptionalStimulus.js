CtxAuthoringTool = CtxAuthoringTool || {};
CtxAuthoringTool.Common = CtxAuthoringTool.Common || {};
CtxAuthoringTool.GapFillWithOptionalStimulusClass = CtxAuthoringTool.GapFillWithOptionalStimulusClass || new GapFillWithOptionalStimulusClass();
$(document).ready(CtxAuthoringTool.GapFillWithOptionalStimulusClass.init);
/*
 * PageClass
 */
function GapFillWithOptionalStimulusClass(argument) {
    var Common = CtxAuthoringTool.Common;
    var ctxUpload = CtxAuthoringTool.Common.ctxUpload;
    var _minTabs = 1, _maxTabs = 4;
    var _maxWordsOfStimulus = 350;
    var _maxWordsOfRespone = 350;
    var _minGaps = 3;
    var _maxGaps = 10;
    var _minDistractors = 0, _maxDistractors = 3;
    var _templates = {
        tplQuestion: "",
        tplStimulus: ""
    };

    var _tabStimuli, _tabQuestions;
    var Model = {};

    this.init = function () {
        String.prototype.trim = String.prototype.trim || $.trim;
        ctxUpload = CtxAuthoringTool.Common.ctxUpload;
        initDOM();
        loadModel();
    }

    function initDOM() {
        initTemplates();
        initTabs();
        initOthers();


    }

    function loadModel() {
        Common.loadModel(modelLoaded);
    }

    function modelLoaded(data) {
        if (data) {
            if (data.Model) {
                if (data.Model.Content) {
                    if (data.Model.Common.ActivityType == "GapFillWithOptionalStimulus") {
                        console.log("Model");
                        Model = data.Model.Content;
                        Common.setModel(data.Model.Common);
                    }
                }
            }
        } else {
            Model = Model || {};
            Model.StimulusItemType = "text";
            Model.Stimulus = Model.Stimulus || "";
            Model.Questions = Model.Questions || [];
        }
        bindModel(true);
    }

    function bindModel(renderPage) {
        if (renderPage) {
            bindModelToQuestons();
            bindModelToStimulus();
        }
    }

    function bindModelToQuestons() {

        var questions = Model.Questions || [];
        if (questions.length == 0) {
            addNewQuestion();
            return;
        }
        $.each(questions, function (index, q) {
            addNewQuestion(q.Title, q.Response.ItemContent, q.Response.Fill);
        });

    }

    function bindModelToStimulus() {
        var stiText = Model.Stimulus;
        var stiType = Model.StimulusItemType ? Model.StimulusItemType.toLowerCase() : "text";


        var questionNum = (Model.Questions) ? Model.Questions.length : 0;

        if (questionNum == 0) {
            addNewStimulus(stiType, stiText);
        } else {

            $.each(Model.Questions, function (index, q) {
                stiText = q.Stimulus || "";
                addNewStimulus(stiType, stiText);
            });
        }

        //choose correct view
        var $select = $("select.ctx-tpl-stimulusType");
        var viewType = (stiType == "text" || !stiType || stiType == "none") ? "text" : "audio";

        $select.val(viewType);
        $select.change();

    }

    function initTemplates() {
        _templates = {
            tplQuestion: $("#tpl-question").html(),
            tplStimulus: $("#tpl-stimulus").html()
        };
    }

    function initOthers() {
        var $select = $("select.ctx-tpl-stimulusType");
        var $submitBtn = $('.ctx-top-submit');

        $submitBtn.click(submitContent);
        $select.bind("change", function () {
            var $textWrapper = $(".ctx-stimulus-text-wrapper");
            var $audioWrapper = $(".ctx-stimulus-audio-wrapper");
            if ($(this).val() == "audio") {
                $textWrapper.hide();
                $audioWrapper.show();
            } else {
                $textWrapper.show();
                $audioWrapper.hide();
            }
        });


    }

    function initTabs() {
        _tabStimuli = CtxAuthoringTool.Common.tabs(".ctx-stimuli", { minTabs: _minTabs, maxTabs: _maxTabs });
        _tabQuestions = CtxAuthoringTool.Common.tabs(".ctx-gap-questions", { minTabs: _minTabs, maxTabs: _maxTabs });
        bindTabEvent();

    }

    function bindTabEvent() {
        //add event
        _tabQuestions.onAddClick = function (currentIndex) {
            addNewStimulus();
            addNewQuestion();
            return false;
        }
        _tabQuestions.onRemoveClick = function (tabIndex) {
            Common.popup("Are you sure you remove this question?", function (isDel) {
                if (isDel == true) {
                    _tabStimuli.remove(tabIndex);
                    _tabQuestions.remove(tabIndex);
                }
            }, Common.msgType.Confirm);
            return false;
        }
        //focus event
        var loopFlag = false;
        _tabQuestions.onfocused = function (index) {
            if (loopFlag) {
                loopFlag = !loopFlag;
                return;
            }

            _tabStimuli.focus(index);
        }

        _tabStimuli.onfocused = function (tabIndex) {
            loopFlag = true;
            _tabQuestions.focus(tabIndex);
        }
    }

    function addNewStimulus(stimulusType, stimulus) {
        if (!stimulus || typeof stimulus != "string") stimulus = "";
        if (!stimulusType) stimulusType = "text";

        var id = newId();
        var contentStr = (stimulusType == "text") ? stimulus : "";
        var smap = { contentText: _templates.tplStimulus.replace("{content}", contentStr) };
        smap.contentText = smap.contentText.replace(/\{id\}/g, id);
        _tabStimuli.add(smap);
        renderStimulus("stimulusWrapper-" + id, { stimulusType: stimulusType, stimulus: stimulus });
        return;
    }

    function addNewQuestion(title, questionStr, fills) {
        var id = newId();
        var smap = { contentText: _templates.tplQuestion };
        if (!questionStr || typeof questionStr != "string") questionStr = "";


        //trans gap and get distractors;
        var distractors = getDistractorsFromFills(questionStr, fills);

        questionStr = parseToEditor(questionStr);
        smap.contentText = smap.contentText.replace(/\{content\}/ig, questionStr);
        smap.contentText = smap.contentText.replace(/\{id\}/g, id);
        _tabQuestions.add(smap);
        renderQuestions("ctx-question-wrapper-" + id, { title: title, content: questionStr, fills: fills, distarctor: distractors });

    }

    function getQuestionMap(contentStr) {
        if (!contentStr || typeof contentStr != "string") contentStr = "";
        var id = newId();
        var map = { contentText: _templates.tplQuestion.replace("{contentText}", contentStr) };
        map.contentText = map.contentText.replace("{id}", id);
    }

    function renderStimulus(contentId, model) {
        var _model = { stimulusType: "text", stimulus: "" };
        var $root = $("#" + contentId);
        var editorId = $root.find(".ckeditor-text:eq(0)").attr("id");
        var audioUploaderId = $root.find(".ctx-stimulus-uploader:eq(0)").attr("id");
        var $stimulusType = $(".ctx-tpl-stimulusType");

        _model = $.extend(_model, model);
        renderEditor(editorId, 333);
        var audioFile = _model.stimulusType == "audio" ? _model.stimulus : "";
        renderAudioUploader("#" + audioUploaderId, { audio: audioFile });
        $stimulusType.change();
    }

    function renderQuestions(contentId, model) {
        var $root = $("#" + contentId);
        var $editor = $root.find(".ckeditor-text:eq(0)");
        var distractorID = "#" + $root.find(".ctx-distractors").attr("id");
        model = $.extend({ title: "", content: "", fills: [], distarctor: [] }, model);
        renderEditor($editor.attr("id"), 250);

        CtxAuthoringTool.Common.distractor(distractorID, { minOpts: _minDistractors, maxOpts: _maxDistractors, data: model.distarctor });
        var $title = $root.find(".ctx-questionText").val(model.title);
        Common.watermark($title);
        $title.focus();
    }

    function renderEditor(editorId, height) {
        if (!editorId || typeof editorId != 'string' || isNaN(height)) {
            return;
        }

        CKEDITOR.replace(editorId, {
            extraPlugins: 'wordcount',
            wordcount: {
                showCharCount: true,
                showWordCount: true,
                wordLimit: _maxWordsOfRespone
            },
            height: height
        });
    }

    function renderAudioUploader(el, audioData) {
        ctxUpload(el, audioData);
    }

    function newId() {
        return Math.random().toString().replace(/\./, "");
    }

    function getDistractorsFromFills(strContent, fills) {
        var regExp = /\<gap\>(.[^\<]*)\<\/gap\>/ig;
        var distractors = [], gaps = [];
        if (!strContent || !fills || fills.length == 0) {
            return distractors;
        }

        var maches = strContent.match(regExp) || [];
        $.each(maches, function (index, item) {
            gaps.push(item.replace(/\<[/]?gap\>/ig, ""));
        });

        $.each(fills, function (index, fill) {
            var flag = true;
            $.each(gaps, function (index, gap) {
                if (fill == gap) {
                    flag = false;
                }
            });

            flag && distractors.push(fill);

        });
        return distractors;
    }

    function parseToGapFormat(str) {
        str = str || "";
        if (str.length > 0) {
            str = str.replace(/\<s\>/ig, '<gap>')
                     .replace(/\<\/s\>/ig, '</gap>');
        }
        return str;
    }

    function parseToEditor(str) {
        str = str || ""
        if (str.length > 0) {
            str = str.replace(/\<gap\>/ig, ' <s>')
                     .replace(/\<\/gap\>/ig, '</s> ');
        }
        return str;
    }

    function validContentData() {
        var flag = checkQuestion();
        // flag = flag && checkStimulus();
        return flag;
    }

    function checkQuestion() {
        var flag = true;
        var $tabContent = $(".ctx-gap-questions .ctx-tabs-content");
        $tabContent.each(function (index, item) {
            var $current = $(item);
            var $title = $current.find(".ctx-questionText");
            _tabQuestions.focus(index);

            if ($title.val() == $title.attr("defaulttext") || $title.focus().val().length == 0) {
                Common.popup("Please input question text", function () {
                    $title.focus();
                });
                return flag = false;// jump out of the loop
            }
            var editor = CKEDITOR.instances[$current.find(".ckeditor-text").attr("id")];
            _tabQuestions.focus(index);

            if (editor.getData().length == 0) {
                Common.popup("Please type some text for question response.", function () {
                    editor.focus();
                });
                return flag = false;// jump out of the loop
            }

            var numOfgaps = $(editor.getData()).find("s").length;
            if (numOfgaps < _minGaps || numOfgaps > _maxGaps) {
                var errormsg = "The number of gaps is range from {min} to {max}.".replace("{min}", _minGaps).replace("{max}", _maxGaps);
                Common.popup(errormsg, function () {
                    editor.focus();
                });
                return flag = false;// jump out of the loop
            }



            var $distractors = $current.find(".ctx-distractors input.input-option");
            $distractors.each(function (index, item) {
                var $distractor = $(item);
                if ($distractor.focus().val() == $(this).attr("defaulttext") || $distractor.focus().val().length == 0) {
                    Common.popup("Please type some text for distractors", function () {
                        $distractor.focus();
                    });
                    return flag = false;// jump out of the loop
                }
                return flag; // jump out of the loop
            });

            return flag;
        });

        return flag;

    }

    function submitContent() {
        if (!Common.checkCommonData()) {
            return false;
        }
        if (!validContentData()) {
            return false;
        }

        generateJSON();

        var json = {};
        json.Common = Common.getCommonData('GapFillWithOptionalStimulus');
        json.Content = Model;
        json.Model = {};
        json.Model.Common = Common.getCommonData('GapFillWithOptionalStimulus');
        json.Model.Content = Model;
        alert(JSON.stringify(json));
        console.log(json);
        return true;
    }

    function generateJSON() {
        //get stimulus array;
        var stimulusModels = [];
        var $stiType = $("select.ctx-tpl-stimulusType");
        $(".ctx-stimuli .ctx-tabs-content").each(function (index, item) {
            var $current = $(item);
            var stiText = "";
            if ($stiType.val() == "text") {
                stiText = CKEDITOR.instances[$current.find(".ckeditor-text").attr("id")].getData();
            } else {
                stiText = $current.find(".ctx-stimulus-uploader").data("data");
            }
            stiText && (stimulusModels.push(stiText));
        });
        if (stimulusModels.length == 0) {
            Model.StimulusItemType = "None";
            Model.Stimulus = "";
        }
        if (stimulusModels.length == 1) {
            Model.Stimulus = stimulusModels[0];
            Model.StimulusItemType = $stiType.val();
            stimulusModels[0] = "";
        }

        if (stimulusModels.length > 1) {
            Model.StimulusItemType = $stiType.val();
            Model.Stimulus = "";
        }

        //get questons
        Model.Questions = [];
        var $questionsTabs = $(".ctx-gap-questions .ctx-tabs-content");
        $questionsTabs.each(function (index, item) {
            var question = {};
            var $current = $(item);
            var $title = $current.find(".ctx-questionText");
            var editor = CKEDITOR.instances[$current.find(".ckeditor-text").attr("id")];

            var fills = [];
            var gaps = $(editor.getData()).find("s");
            gaps.each(function () {
                var str = $(this).text();
                str && (fills.push(str));
            });

            $current.find(".ctx-distractors input.input-option").each(function (index, item) {
                var str = $(item).val();
                if (str && str != $(item).attr("defaulttext")) {
                    fills.push(str);
                }
            });

            question = {
                Title: $title.val(),
                Stimulus: stimulusModels[index] || "",
                Response: {
                    ItemContent: parseToGapFormat(editor.getData()),
                    Fill: fills
                }
            };
            Model.Questions.push(question);
        });

    }

}
