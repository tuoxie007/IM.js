var $ = window.swift;
$(function(){
	var input_tool = {
		setInputPosition: function(elem, pos) {
			if (elem.setSelectionRange) {
				elem.setSelectionRange(pos, pos);
			} else if (elem.createTextRange) {
				var range = elem.createTextRange();
				range.collapse(true);
				range.moveEnd('character', pos);
				range.moveStart('character', pos);
				range.select();
			}
		},

	    getInputPositon: function (elem) {
	        if (document.selection) {   //IE Support
	            elem.focus();
	            var Sel = document.selection.createRange();
	            return {
	                left: Sel.boundingLeft,
	                top: Sel.boundingTop,
	                bottom: Sel.boundingTop + Sel.boundingHeight
	            };
	        } else {
	            var that = this;
	            var cloneDiv = '{$clone_div}', cloneLeft = '{$cloneLeft}', cloneFocus = '{$cloneFocus}', cloneRight = '{$cloneRight}';
	            var none = '<span style="white-space:pre-wrap;"> </span>';
	            var div = elem[cloneDiv] || document.createElement('div'), focus = elem[cloneFocus] || document.createElement('span');
	            var text = elem[cloneLeft] || document.createElement('span');
	            var offset = that._offset(elem), index = this._getFocus(elem), focusOffset = { left: 0, top: 0 };

	            if (!elem[cloneDiv]) {
	                elem[cloneDiv] = div, elem[cloneFocus] = focus;
	                elem[cloneLeft] = text;
	                div.appendChild(text);
	                div.appendChild(focus);
	                document.body.appendChild(div);
	                focus.innerHTML = '|';
	                focus.style.cssText = 'display:inline-block;width:0px;overflow:hidden;z-index:-100;word-wrap:break-word;word-break:break-all;';
	                div.className = this._cloneStyle(elem);
	                div.style.cssText = 'visibility:hidden;display:inline-block;position:absolute;z-index:-100;word-wrap:break-word;word-break:break-all;overflow:hidden;';
	            };
	            div.style.left = this._offset(elem).left + "px";
	            div.style.top = this._offset(elem).top + "px";
	            var strTmp = elem.value.substring(0, index).replace(/</g, '<').replace(/>/g, '>').replace(/\n/g, '<br/>').replace(/\s/g, none);
	            text.innerHTML = strTmp;

	            focus.style.display = 'inline-block';
	            try { focusOffset = this._offset(focus); } catch (e) { };
	            focus.style.display = 'none';
	            return {
	                left: focusOffset.left,
	                top: focusOffset.top,
	                bottom: focusOffset.bottom
	            };
	        }
	    },

	    // 克隆元素样式并返回类
	    _cloneStyle: function (elem, cache) {
	        if (!cache && elem['${cloneName}']) return elem['${cloneName}'];
	        var className, name, rstyle = /^(number|string)$/;
	        var rname = /^(content|outline|outlineWidth)$/; //Opera: content; IE8:outline && outlineWidth
	        var cssText = [], sStyle = elem.style;

	        for (name in sStyle) {
	            if (!rname.test(name)) {
	                val = this._getStyle(elem, name);
	                if (val !== '' && rstyle.test(typeof val)) { // Firefox 4
	                    name = name.replace(/([A-Z])/g, "-$1").toLowerCase();
	                    cssText.push(name);
	                    cssText.push(':');
	                    cssText.push(val);
	                    cssText.push(';');
	                };
	            };
	        };
	        cssText = cssText.join('');
	        elem['${cloneName}'] = className = 'clone' + (new Date).getTime();
	        this._addHeadStyle('.' + className + '{' + cssText + '}');
	        return className;
	    },

	    // 向页头插入样式
	    _addHeadStyle: function (content) {
	        var style = this._style[document];
	        if (!style) {
	            style = this._style[document] = document.createElement('style');
	            document.getElementsByTagName('head')[0].appendChild(style);
	        };
	        style.styleSheet && (style.styleSheet.cssText += content) || style.appendChild(document.createTextNode(content));
	    },
	    _style: {},

	    // 获取最终样式
	    _getStyle: 'getComputedStyle' in window ? function (elem, name) {
	        return getComputedStyle(elem, null)[name];
	    } : function (elem, name) {
	        return elem.currentStyle[name];
	    },

	    // 获取光标在文本框的位置
	    _getFocus: function (elem) {
	        var index = 0;
	        if (document.selection) {// IE Support
	            elem.focus();
	            var Sel = document.selection.createRange();
	            if (elem.nodeName === 'TEXTAREA') {//textarea
	                var Sel2 = Sel.duplicate();
	                Sel2.moveToElementText(elem);
	                var index = -1;
	                while (Sel2.inRange(Sel)) {
	                    Sel2.moveStart('character');
	                    index++;
	                };
	            }
	            else if (elem.nodeName === 'INPUT') {// input
	                Sel.moveStart('character', -elem.value.length);
	                index = Sel.text.length;
	            }
	        }
	        else if (elem.selectionStart || elem.selectionStart == '0') { // Firefox support
	            index = elem.selectionStart;
	        }
	        return (index);
	    },

	    // 获取元素在页面中位置
	    _offset: function (elem) {
	        var box = elem.getBoundingClientRect(), doc = elem.ownerDocument, body = doc.body, docElem = doc.documentElement;
	        var clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0;
	        var top = box.top + (self.pageYOffset || docElem.scrollTop) - clientTop, left = box.left + (self.pageXOffset || docElem.scrollLeft) - clientLeft;
	        return {
	            left: left,
	            top: top,
	            right: left + box.width,
	            bottom: top + box.height
	        };
	    }
	};

	function getPosition(ctrl) {
	    return input_tool.getInputPositon(ctrl);
	}

	var im = {keys: "", page: 0},
		KEY_CODE_SHIFT = 16,
		KEY_CODE_CTRL = 17,
		KEY_CODE_A = 65,
		KEY_CODE_Z = 90,
		KEY_CODE_BACKSPACE = 8,
		KEY_CODE_COMMA = 188,
		KEY_CODE_DOT = 190,
		KEY_CODE_ZERO = 48,
		KEY_CODE_NINE = 57,
		KEY_CODE_SPACE = 32,
		KEY_CODE_LEFT = 37,
		KEY_CODE_UP = 38,
		KEY_CODE_RIGHT = 39,
		KEY_CODE_DOWN = 40,
		KEY_CODE_ENTER = 13,
		KEY_CODE_ESC = 27,
		CANDIDATE = 5,
		IM_DIALOG_ID = "im_dialog",
		IM_INPUT_ID = "im_input",
		IM_SELECTED_CLASS = "im-selected";

	$("<div></div>").appendTo(document.body)
					.attr("id", IM_DIALOG_ID)
					.html("<div id=\"%s\"><input style=\"width:100%;font-size:14px;\" type=\"text\"></div><ul></ul>".fs(IM_INPUT_ID))
					.css({
		"display": "none",
		"padding": 0,
	}).find("ul").css({
		"list-style": "none",
		"padding": "1px 5px",
		"margin": 0
	}).prev().css({
		"padding": "2px 5px",
		"font-size": 16,
		"font-weight": "bold",
		"font-family": "sans-serif"
	});
	var input = $('#%s input'.fs(IM_INPUT_ID)),
		dialog = $('#%s'.fs(IM_DIALOG_ID));
	function keydown(e) {
		//console.log(e.keyCode, im.keys);
		// if (im.ctrled) return;

		if (e.keyCode == KEY_CODE_SHIFT) {
			// shift
			im.shifted = true;
		} else if (e.keyCode >= KEY_CODE_A && e.keyCode <= KEY_CODE_Z || e.keyCode == KEY_CODE_BACKSPACE
					|| e.keyCode == KEY_CODE_COMMA || e.keyCode == KEY_CODE_DOT) {
			// a-z
			if (e.keyCode == KEY_CODE_BACKSPACE) {
				if (im.keys)
					im.keys = im.keys.slice(0, -1);
			} else if (e.keyCode == KEY_CODE_COMMA) {
				im.page = Math.max(im.page - 1, 0);
				im.need_trim = true;
			} else if (e.keyCode == KEY_CODE_DOT) {
				im.page += 1;
				im.need_trim = true;
			} else {
				var key = String.fromCharCode(e.keyCode).toLowerCase();
				im.keys += key;
				im.page = 0;
			}
			// input.val(im.keys);
			if (im.keys) {
				var words = [];
				im.has_next_page = false;
				for (var keys in wordlib) {
					if (keys.startswith(im.keys)) {
						word = wordlib[keys];
						var ws = word.split(",");
						for (var i=0; i<ws.length; i++) {
							words.push(ws[i]);
						}
						if (words.length > CANDIDATE * (im.page+1)) {
							im.has_next_page = true;
							break;
						}
					}
				}
				if (!words.length) {
				}
				if (words.length <= CANDIDATE * im.page)
					if (im.page) im.page -= 1;
				im.has_prev_page = !!im.page;
				words = words.slice(CANDIDATE * im.page, CANDIDATE * (im.page+1));
				if (words.length) {
					var word_list = [];
					for (var i=0; i<words.length; i++) {
						word_list.push("<li class=\"word\">%s. %s</li>".fs(i+1, words[i]));
					}
					if (word_list.length) {
						word_list[0] = '<li class="word %s" style="%s">1. %s</li>'.fs(IM_SELECTED_CLASS, "background:#0099FF;color:#FFF;", words[0]);
					}
					word_list.push("<li class=\"prev\">&lt;</li>");
					word_list.push("<li class=\"next\">&gt;</li>");
					word_list.push("<div style=\"clear:both\"><div>");
					if (im.dialog) {
						im.dialog.find("ul").html(word_list.join(""));
						if (im.has_prev_page) {
							im.dialog.find("ul li.prev").css({
								"color": "#FFF",
								"background": "#0099FF",
								"margin-right": 5
							});
						}
						if (im.has_next_page) {
							im.dialog.find("ul li.next").css({
								"color": "#FFF",
								"background": "#0099FF"
							});
						}
					} else {
						var position = getPosition(src_input);
						var fontSize = $(src_input).style("font-size") || "20";
						if (fontSize.endswith("px")) {
							fontSize = fontSize.slice(0, -2);
						}
						im.dialog = $("#" + IM_DIALOG_ID)
									.find("ul")
									.html(word_list.join(""))
									.parent()
									.dialog({
										style: {
											"border": "0",
											"left": parseInt(position.left),
											"top": parseInt(position.top) + parseInt(fontSize),
											"font-size": 14,
											"color": "#000",
											"box-shadow": "#555 1px 3px 3px",
											"border-radius": "5px",
											"height": 50,
											"padding": "0 6px",
											"background": "#E5E5E5"
										}
									});
						im.started = true;
					}
					im.dialog.find("li").css({
						"font-size": 14,
						"float": "left",
						"padding": "2px 5px 2px 5px",
						"margin-right": 5,
						"cursor": "pointer"
					}).filter(".word").click(function(e) {
						var selected_word_tag_li = im.dialog.find("ul>li.%s".fs(IM_SELECTED_CLASS)),
							target_word_tag_li = $(this);
						if (target_word_tag_li) {
							if (selected_word_tag_li) {
								selected_word_tag_li.removeClass(IM_SELECTED_CLASS).css("background", "").css("color", "");
							}
							target_word_tag_li.addClass(IM_SELECTED_CLASS).css("background", "#0099FF").css("color", "#FFF");
							im.word = target_word_tag_li.html().substr(3);
						} else {
							delete im.word;
						}
						input.val("");
						if (im.word) {
							src_input.value = src_input.value + im.word;
						}
						im.keys = "";
						im.dialog && im.dialog.close();
						src_input.focus();
						input_tool.setInputPosition(src_input, src_input.value.length);
						im.word = "";
						delete im.dialog;
					});
					im.dialog.find('li.prev').click(function(e) {
						// im.page = Math.max(im.page - 1, 0);
						keydown.call(this, {keyCode: KEY_CODE_COMMA});
						im.need_trim = false;
					});
					im.dialog.find('li.next').click(function(e) {
						// im.page += 1;
						keydown.call(this, {keyCode: KEY_CODE_DOT});
						im.need_trim = false;
					});
				} else {
					im.dialog.find("ul li.word").remove();
					// im.word = "";
					// im.ended = true;
				}
			} else if (im.dialog) {
				im.started = false;
				im.ended = true;
			}
		} else if (e.keyCode > KEY_CODE_ZERO && e.keyCode <= KEY_CODE_ZERO + CANDIDATE) {
			// 1-5
			if (im.dialog) {
				var key = String.fromCharCode(e.keyCode),
					selected_word_tag_li = im.dialog.find("ul>li.%s".fs(IM_SELECTED_CLASS)),
					target_word_tag_li = $(im.dialog.find("ul>li")[key-1]);
				if (target_word_tag_li) {
					if (selected_word_tag_li) {
						selected_word_tag_li.removeClass(IM_SELECTED_CLASS).css("background", "").css("color", "");
					}
					target_word_tag_li.addClass(IM_SELECTED_CLASS).css("background", "#0099FF").css("color", "#FFF");
					im.word = target_word_tag_li.html().substr(3);
				} else {
					delete im.word;
				}
				im.ended = true;
				// im.keys += key;
			}
		} else if (e.keyCode == KEY_CODE_CTRL) {
			// ctrl
			im.ctrled = true;
		} else if (e.keyCode == KEY_CODE_LEFT || e.keyCode == KEY_CODE_RIGHT) {
		} else if (e.keyCode == KEY_CODE_UP || e.keyCode == KEY_CODE_DOWN) {
			if (im.dialog) {
				var selected_word_tag_li = im.dialog.find("ul>li.%s".fs(IM_SELECTED_CLASS));
				if (selected_word_tag_li) {
					var target_word_tag_li = e.keyCode == KEY_CODE_UP ? selected_word_tag_li.prev() : selected_word_tag_li.next();
					if (target_word_tag_li) {
						selected_word_tag_li.removeClass(IM_SELECTED_CLASS).css("background", "").css("color", "");
						target_word_tag_li.addClass(IM_SELECTED_CLASS).css("background", "#0099FF").css("color", "#FFF");
					}
				}
			}
		} else if (e.keyCode == KEY_CODE_SPACE) {
			// enter
			if (im.dialog) {
				var selected_word_tag_li = im.dialog.find("ul>li.%s".fs(IM_SELECTED_CLASS));
				if (selected_word_tag_li.length) {
					im.word = selected_word_tag_li.html().substr(3);
					im.need_trim = (e.keyCode == KEY_CODE_SPACE);
					im.ended = true;
				} else {
					im.keys += " ";
				}
			}
		} else if (e.keyCode == KEY_CODE_ENTER) {
			// enter
			if (im.dialog) {
				im.word = im.keys;
				im.ended = true;
			}
		} else if (e.keyCode == KEY_CODE_ESC) {
			im.ended = true;
			im.keys = "";
		}
	}
	function keyup(e) {
		var key = String.fromCharCode(e.keyCode).toLowerCase();
		if (key == "shift") {
			im.shifted = false;
		}
		if (im.ended) {
			input.val("");
			if (im.word) {
				src_input.value = src_input.value + im.word;
			}
			im.keys = "";
			im.ended = false;
			im.dialog && im.dialog.close();
			src_input.focus();
			input_tool.setInputPosition(src_input, src_input.value.length);
			im.word = "";
			delete im.dialog;
		}
		im.ctrled = false;
		if (im.need_trim) {
			input.val(input.val().slice(0, -1));
			im.need_trim = false;
		}
	}
	var src_input = null;
	$("input,textarea").filter("!#%s input".fs(IM_INPUT_ID)).live("keydown", function(e){
		src_input = this;
		keydown.call(input, e);
		input.focus();
	}).live("keyup", function(e) {
		e.stopPropagation();
	});
	input.keydown(keydown).keyup(keyup);
	$.alert("IM.js is ready");
});

