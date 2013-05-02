CtxAuthoringTool.MultipleChoice = CtxAuthoringTool.MultipleChoice || new MultipleChoice_Class();
$(document).ready(CtxAuthoringTool.MultipleChoice.init);

function MultipleChoice_Class (argument) {
	var common = CtxAuthoringTool.Common;
	var template = {};
	var _imgUploaders;
	var imgName;
	var selector = {
		questionText: '.ctx-questionText',
		stimulusText: '.StimulusText'
	};
	var limit = {
		questions: 8,
		options: 6
	};

	var CurrentQuestion = 0;

	var Model = {
		"CurrentQuestion": "0",
        "StimulusItemType": "Text",
        "Stimulus": "/ActivityResources/12715/1.png",
        "Questions": [
            {
                "Title": "What is Michael’s family name?",
                "Stimulus": "",
                "ResponseItemType": "Text",
                "Responses": [
                    {
                        "ItemContent": "Nixon",
                        "Id": "1",
                        "IsAnswer": "true"
                    },
                    {
                        "ItemContent": "Greenville",
                        "Id": "2",
                        "IsAnswer": "false"
                    },
                    {
                        "ItemContent": "Hockey",
                        "Id": "3",
                        "IsAnswer": "false"
                    }
                ]
            },
            {
                "Title": "What is Michael’s family name?",
                "Stimulus": "",
                "ResponseItemType": "Image",
                "Responses": [
                    {
                        "ItemContent": "/ActivityResources/1167/a1167_ListenAndMatch_Image0.jpg?version=41380.7322343287&3280",
                        "Id": "1",
                        "IsAnswer": "true"
                    },
                    {
                        "ItemContent": "/ActivityResources/1167/a1167_ListenAndMatch_Image0.jpg?version=41380.7322343287&3280",
                        "Id": "2",
                        "IsAnswer": "false"
                    },
                    {
                        "ItemContent": "/ActivityResources/1167/a1167_ListenAndMatch_Image0.jpg?version=41380.7322343287&3280",
                        "Id": "3",
                        "IsAnswer": "false"
                    }
                ]
            }
        ]
    };

	this.init = function () {
		initDOM();
		loadModel();
	}

	function inputSelector () {
		var _cq = Model.Questions[Number(CurrentQuestion)];
		$('.optType').val(_cq.ResponseItemType);
	}

	function initDOM () {
        $('.ctx-top-submit').click(generateJSON);
		imgName = "a" + common.getActivityID() + "_ListenAndMatch_Image";
		template.stimulusText = $('.stimulusText');
		template.stimulusImage = $('.stimulusImage');
		$(selector.questionText).change(questionTextOnChange);

		$('.ctx-mcType').change(function () {
			var _text = $(this).find('option:selected').text();
			var _cq = Model.Questions[Number(CurrentQuestion)];
			_cq.Stimulus = _text;
			bindModel(true);
		});
		$('.optType').change(function () {
			var _val = $(this).find('option:selected').val();
			var _cq = Model.Questions[Number(CurrentQuestion)];
			_cq.ResponseItemType = _val;
			if(_val == "") {

			}
			$(this).val(_val);
			bindModel(true);
		});
		common.resetTextAreaFocusEvent($('.ctx-questionText'),bindModel,false);
	}


	function questionTextOnChange () {
		var _crtId = CurrentQuestion;
		var _cq = Model.Questions[_crtId];
		_cq.Title = $(this).val();
	}

	function loadModel() {
		modelLoaded();
	}
	
	function bindModel (renderPage) {
		if(renderPage) {
			renderStimulus();
			renderTags();
			renderOpt();
		}
		inputQuestions();
	    inputCDEditor();
		inputOpt();
		inputSelector();
	}
	function inputOpt () {
		inputOptions();
	}
	function inputQuestions () {
		var _crtId = Number(CurrentQuestion);
		var _cq = Model.Questions[_crtId]
		common.checkTextArea($('.ctx-questionText'), _cq.Title);
	}

	function renderTags () {
		$('.addQuestion').unbind();
		$('.tab-item').unbind();
		$('.removeQuestion').unbind();
		
		var _crtId = Number(CurrentQuestion);
		var _qlen = Model.Questions.length;
		$('.tab > .tab-item').remove();
		for (var i = 0; i < _qlen; i++) {
			var _tp = $('.tab-itemTemplate')
						.clone()
						.removeClass('tab-itemTemplate')
						.addClass('tab-item');
			if(i == _crtId)			
				_tp.addClass('currentQuestion');

			_tp.html(String(i + 1))
				.css('display','block')
				.insertBefore('.addQuestion');
		};

		if(_qlen < limit.questions) {
			$('.addQuestion').removeClass('btndisable');
			$('.addQuestion').click(addQuestion);	
		} else {
			$('.addQuestion').addClass('btndisable');
		}
		$('.removeQuestion').click(removeQuestion);
		$('.tab-item').click(tabItemClick);
		
	}

	function removeQuestion () {
		var _crtId = CurrentQuestion;
		var _mdl = Model.Questions;
		_mdl.splice(_crtId,1);
		CurrentQuestion = _mdl.length - 1;
		bindModel(true);
	}

	function addQuestion () {
		var _mdl = Model.Questions
		_mdl.push({
				Title: "",
                Stimulus: "",
                ResponseItemType: "Text",
                Responses: [
                    {
                        ItemContent: "",
                        Id: "1",
                        IsAnswer: "false"
                    },
                    {
                        ItemContent: "",
                        Id: "2",
                        IsAnswer: "false"
                    },
                    {
                        ItemContent: "",
                        Id: "3",
                        IsAnswer: "false"
                    }
                ]}
			);

		CurrentQuestion = String(_mdl.length - 1);
		bindModel(true);
	}
	function tabItemClick () {
		var _idx = $(this).index();
		CurrentQuestion = String(_idx);
		bindModel(true);
	}

	function inputOptions () {
		var _crt = CurrentQuestion;
		var _cq = Model.Questions[_crt];

		for (var i = 0; i < _cq.Responses.length; i++) {
			if(_cq.ResponseItemType == "Text") {
				var _op = $('.checkbox').eq(i);
				common.checkTextArea(_op.find(".input-option"), _cq.Responses[i].ItemContent);
			} else if (_cq.ResponseItemType == "Image") {
				inputOptImg();
			}
		};
	}

	function renderOpt () {
		var _idx = Number(CurrentQuestion);
		var _cq = Model.Questions[_idx];
		if(_cq.ResponseItemType == 'Text') {
			renderOptions();
		}
		else {
			 renderOptImage();
		}
	}

	function inputOptImg () {
		var _idx = CurrentQuestion;
		var _cq = Model.Questions[_idx];
		for (var i = 0; i < _cq.Responses.length; i++) {
			if(_cq.Responses[i].ItemContent == '') {
				$('checkboxImg').eq(i).find('.imgArea span').text('No image uploaded.');
			} else {
				$('.checkboxImg').eq(i).find('.imgArea span').text('image uploaded.');
				$('.checkboxImg').eq(i).find('.imgArea img').attr('src',_cq.Responses[i].ItemContent);	
			}
		};
	}

	function imgClick () {
		var _idx = $(this).attr('id');
		var _crtId = CurrentQuestion;
		var _icq = Model.Questions[_crtId];
		if($(this).hasClass('optImgAct')) {
			_icq.Responses[_idx].IsAnswer = 'false';	
		} else {
			_icq.Responses[_idx].IsAnswer = 'true';
		}
		bindModel(true);
	}

	function renderOptImage () {
		$('.addOption').unbind().click(addOtpionClick);
		$('.removeImage').unbind();
		$(".plupload").unbind();
		$(".plupload").remove();
		$('.uldBtn').unbind();
		$('.selectBtn').unbind();
		_imgUploaders = new Array();
		var _idx = Number(CurrentQuestion);
		var _cq = Model.Questions[_idx];
		var _len = _cq.Responses.length;
		$('.ctx-optionContainer').find('.checkboxImg').remove();
		$('.ctx-optionContainer').find('.checkbox').remove();

		if(_imgUploaders) {
			_imgUploaders.length = _len;
			for(var i = 0; i < _len; i++) {
				if(_imgUploaders[i]) {
					_imgUploaders[i].unbindAll();
					_imgUploaders[i].destroy();
					_imgUploaders[i] = null;
				}
			}
		}

		for(var i = 0; i < _len; i++) {
			var _tp = $('.checkboxImgTemplate').clone()
												.attr('id',String(i))
												.removeClass('checkboxImgTemplate')
												.addClass('checkboxImg')
												.css('display','block')
												.bind('click',imgClick);
			if(_cq.Responses[i].IsAnswer == 'true')									
				_tp.addClass('optImgAct');

			$('.ctx-optionContainer').append(_tp);
			_tp.find('.selectBtn').attr('id','selectBtn' + i);
			_tp.find('.uldBtn').attr('id','uldBtn' + i);
			
			var _imgUploader = new plupload.Uploader({
				runtimes: common.getRuntimes(),
				browse_button: 'selectBtn' + i,
				max_file_size: '20000mb',
				chunk_size: common.getChunkSize(),
				url: common.getServerIP() + 'Upload.ashx?medianame=' + (imgName + i) + '&activityid=' + common.getActivityID(),
				resize: { width: 125, height: 85, quality: 90},
				flash_swf_url: '../../js/common/plupload.flash.swf',
				filters: [{ title: 'Image files', extensions: 'jpg,gif,png' }]
			});
			_imgUploaders[i] = _imgUploader;
			_imgUploader.bind('Init',function (up,params) { });
			_imgUploader.bind('FilesAdded',function (up,files) {
				for (var i = 0; i < _imgUploaders.length; i++) {
					if(_imgUploaders[i] == this) {
						var m = i;
						break;
					}
				}
				var _crtImg = $('.checkboxImg').eq(m);
				_crtImg.find('.imgArea span').text('0 % Uploaded.');
				_crtImg
					.find('.uldBtn')
					.text('Upload')
					.unbind('click')
					.click(uploadImage);
				for (var j = 0; j < _imgUploader.files.length; j++) {
					_imgUploader.removeFile(_imgUploader.files[j]);
				}	
			});

			_imgUploader.bind('FileUploaded',function (up,file,info) {
				for (var i = 0; i < _imgUploaders.length; i++) {
					if(_imgUploaders[i] == this) {
						var m = i;
						break;
					}
				};
				$('.checkboxImg').eq(m)
								.find('.selectBtn')
								.text('...');
				$('.checkboxImg').eq(m)
								.find('.uldBtn')
								.text('Upload')
								.unbind('click');
				var _crtId = CurrentQuestion;
				Model.Questions[_crtId].Responses[m].ItemContent = String(info.response);
				bindModel(false);
			});	

			_imgUploader.bind('UploadProgress',function (up,file) {
				for(var i = 0; i < _imgUploaders.length; i++) {
					if(_imgUploaders[i] == this) {
						var m = i;
						break;
					}
				}			
				$('.checkboxImg').eq(m).find(".imgArea span").text(file.percent + ' % uploaded.')
			});

			_imgUploader.bind('Error',function (up,args) {
				alert(args);
			});

			_imgUploader.init();
		}
		$('.removeImage').click(removeClick);
	}


	function uploadImage () {
		var str = String($(this).attr('id'));
		var n = Number(str.charAt(str.length - 1));
		_imgUploaders[n].start();

		$(this).text('Stop').unbind('click').click(stopUploadImage);
		$('.checkboxImg').eq(n).find('.selectBtn').text('');

		return false;
	}

	function stopUploadImage () {
		var str = String($(this).attr('id'));
		var n = Number(str.charAt(str.length - 1));
		_imgUploaders[n].stop();
		$(this).text('Upload').unbind('click').click(uploadImage);
		$('.checkboxImg').eq(n).find('.selectBtn').text('...');		
		return false;
	}

	function renderOptions () {
		$('.addOption').unbind();
		$('.input-option').unbind();
		$('.choose').unbind();
		$('.remove').unbind();

		var _idx = Number(CurrentQuestion);
		var _cq = Model.Questions[_idx];
		$('.checkbox').remove();
		$('.checkboxImg').remove();
		for (var i = 0; i < _cq.Responses.length; i++) {
			var _tp = $('.checkboxTempalte')
							.clone()
							.attr('id',String(i))
							.removeClass('checkboxTempalte')
							.addClass('checkbox')
							.css('display','block');
			if(_cq.Responses[i].IsAnswer == 'true') {
				_tp.find('.choose').html('O');
			}
			$('.ctx-optionContainer').append(_tp);
		};
		$('.input-option').change(optionChange);
		$('.choose').click(chooseClick);
		$('.remove').click(removeClick);
		if(_cq.Responses.length < limit.options) {
			$('.addOption').removeClass('btndisable');
			$('.addOption').click(addOtpionClick);			
		} else {
			$('.addOption').addClass('btndisable');
		}

		common.resetTextAreaFocusEvent($(".input-option"), bindModel, false);
	}

	function removeClick () {
		var _crtId = Number(CurrentQuestion);
		var _cq = Model.Questions[_crtId];
		var _targetId = Number($(this).parent().attr('id'));
		_cq.Responses.splice(_targetId,1);
		bindModel(true);
	}

	function chooseClick () {

		var _idx = Number(CurrentQuestion);
		var _cq = Model.Questions[_idx];
		var _cidx = $(this).parent().attr('id');
		if($(this).html() == 'O') {
			_cq.Responses[_cidx].IsAnswer = 'false';
			bindModel(true);	
		} else {
			_cq.Responses[_cidx].IsAnswer = 'true';
			bindModel(true);
		}
	}

	function addOtpionClick () {
		var _idx = Number(CurrentQuestion);
		var _cq = Model.Questions[_idx];
			_cq.Responses.push(
					{
                        "ItemContent": "",
                        "Id": "",
                        "IsAnswer": ""
                    }
				);
		bindModel(true);
	}

	function optionChange () {
		var _cq = Number(CurrentQuestion);
		var _crtId = Number($(this).parent().attr('id'));
		Model.Questions[_cq].Responses[_crtId].ItemContent = $(this).val();
		bindModel(false);
	}

	function inputStimulus () {
		var _crtId = Model.CurrentQuestion;
		if(Model.Stimulus[_crtId]) {
			common.checkTextArea($('.StimulusText'),Model.Stimulus[_crtId].text);
		} else {
			common.checkTextArea($('.StimulusText'),'');
		}
	}

    function SetCKBlurEvent() {
    	CKEDITOR.instances.testEditor.focusManager.blur('noDelay');
    	// CKEDITOR.instances.testEditor.on('key',function () {
    	// 	alert(1);
    	// });
        CKEDITOR.instances.testEditor.on('key',function() {
            var content = CKEDITOR
                .instances
                .testEditor
                .getData();

            var _cq = Model.Questions[Number(CurrentQuestion)];
            _cq.Stimulus = content;
            console.log(_cq.Stimulus);
        //    bindModel(false);
        });
    }

    function inputCDEditor() {
        var _cq = Model.Questions[Number(CurrentQuestion)];
        var _val = _cq.Stimulus ? _cq.Stimulus : '';
        CKEDITOR.instances.testEditor.setData(_cq.Stimulus);
    }

	function renderStimulus () {
		var _cidx = Number(Model.CurrentQuestion);
		var _cq = Model.Questions[_cidx];

		switch(Model.StimulusItemType) {
			case 'Text' :
				var _sti = template
							.stimulusText
							.clone()
							.attr('id','testEditor')
							.css('display','block');


				$('.ctx-content-left').html(_sti);


                CKEDITOR.replace('testEditor',{
                    customConfig: 'config.js',
                    height: 400
                });
                SetCKBlurEvent();
			break;

			case 'Image' :
				var _stiImg = template
									.stimulusImage
									.clone()
									.css('display','block');
				$('.ctx-content-left').html(_stiImg);
			break;

			default:
				
			break;
		}

	}

	function StimulusTextOnChange () {

		var _crtId = Model.CurrentQuestion;

		if(Model.Stimulus[_crtId]) {
			Model.Stimulus[_crtId].text = $(this).val();
		} else {
			Model.Stimulus.push({ text: $(this).val(), mediaUrl: '' });		
		}		    
		bindModel(false);
	}

	function modelLoaded(data) {
		if (data) {
			if (data.Model) {
				if (data.Model.Content) {
					if (data.Model.Common.ActivityType == "Multiple Choice") {
						Model = data.Model.Content;
						common.setModel(data.Model.Common);
					}
				}
			}
		}
		bindModel(true);
	}

    function generateJSON() {
        if(!common.checkCommonData()) {
            return;
        }
        var hasError = false;
        var _len = Model.Questions.length;
        for(var i = 0; i < _len; i++) {
            if(Model.Questions[i].Title == '') {
                alert('Please input Question Text');
                CurrentQuestion = i;
                bindModel(true);
                $('.ctx-questionText').focus();
                hasError = true;
                break;
            }
        }
        if(hasError) {
            return;
        }
        for(var i = 0; i < _len; i++) {
            for(var j = 0; j < Model.Questions[i].Responses.length; j++) {
                if(Model.Questions[i].Responses[j].ItemContent == '') {
                    alert('Plese input the questionText!');
                    CurrentQuestion = i;
                    bindModel(true);
                    if(Model.Questions[i].ResponseItemType == 'Text') {
                        $('.checkbox')
                            .eq(j)
                            .find('.input-option')
                            .focus();
                    }
                    hasError = true;
                    break;
                }
            }
            if(hasError) {
                return;
            }
        }
        for(var i = 0;i < _len; i++) {
            for(var j = 0; j < Model.Questions[i].Responses.length; j++) {
                var correct = false;
                if(Model.Questions[i].Responses[j].IsAnswer == 'true') {
                    correct = true;
                    break;
                }
            }
            if(! correct) {
                alert('Please define a correct answer for the question.');
                CurrentQuestion = i;
                bindModel(true);
                hasError = true;
                break;
            }
        }
        if(hasError) {
            return;
        }

        if(Model.Questions[0].Stimulus == '') {
            alert('Please input the at 1 Stimulus!');
            hasError = true;
            return;
        }
        var _StimlusArr = [];
        for(var i = 0; i < Model.Questions.length; i++) {
            if(Model.Questions[i].Stimulus != '') {
                _StimlusArr.push(Model.Questions[i].Stimulus);
            }
        }

        if(_StimlusArr.length == 1) {
            Model.Stimulus = _StimlusArr[0];
        }

        var json = {};
        json.Common = common.getCommonData('Multiple Choice');
        json.Content = {};
        json.Content.Questions = Model.Questions;
        json.Model = {};
        json.Model.Common = common.getCommonModel('Multiple Choice');
        json.Model.Content = Model;
        alert(JSON.stringify(json));
    }
}