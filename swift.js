(function(window){
//Extends build in types
  String.prototype.fs=function() {
    segments=this.split('%s');
    ret='';
    for (var i in arguments) {
      ret += segments[i] + arguments[i];
    }
    return ret + segments[segments.length-1];
  }
  String.prototype.trim=function() {
      return this.replace(/^\s+|\s+$/g,"");
  }
  String.prototype.ltrim=function() {
      return this.replace(/^\s+/,"");
  }
  String.prototype.rtrim=function() {
      return this.replace(/\s+$/,"");
  };
  String.prototype.empty=function() {
      return this == '';
  };
  String.prototype.endswith=function(substr) {
      return this.slice(-substr.length) == substr;
  }
  String.prototype.startswith=function(substr) {
      return this.slice(0, substr.length) == substr;
  }


  if (!Array.prototype.forEach)
    Array.prototype.forEach=function(callback){
      for (var i=0; i<this.length; i++){
        callback(this[i], i, this);
      }
    }
  
  window.$ = window.swift = swift = function(selector, ctx){
    if ( !selector )
      return null;
    if ( !ctx )
      ctx = window.document;
    function Swift(tags, selector, context) {
      for (var i=0; i<tags.length; i++) {
        this[i] = tags[i];
      }
      this.length = tags.length;
      this.context = context;
      this.selector = selector;
    }
    // extend Swift prototype
    Swift.prototype = Array.prototype;
    Swift.prototype.constructor = Swift;
    Swift.prototype.find = function(selector) {
      if (this.length) {
        return swift(selector, this[0]);
      }
      return swift([]);
    }
    Swift.prototype.filternot = function(selector) {
      var ised = swift(selector, this.context);
      var noted = [];
      this.each(function() {
        if (!swift.inArray(this, ised)) {
          noted.push(this);
        }
      });
      return swift(noted);
    }
    Swift.prototype.each = function(callback) {
      for (var i=0; i<this.length; i++) {
        callback.call(this[i], i, this);
      }
    }
    Swift.prototype.bind = function(action, callback, cancelBubble) {
      if (window.addEventListener) {
        this.each(function(i){
          this.addEventListener(action, function(event) {
            if (cancelBubble) {
              event.cancelBubble = true;
              event.stopPropagation();
            }
            callback.apply(this, arguments);
          });
        });
      } else if (window.attachEvent) {
        this.each(function(i){
          this.attachEvent('on'+action, function(event) {
            if (cancelBubble) {
              event.cancelBubble = true;
              event.stopPropagation();
            }
            callback.apply(this, arguments);
          });
        });
      }
      return this;
    }
    Swift.prototype.unbind = function(action, callback) {
      if (window.document.removeEventListener)
        this.each(function(i) {
          this.removeEventListener(action, callback);
        });
      else
        this.each(function(i) {
          this.detachEvent("on"+action, callback);
        });
      return this;
    }
    Swift.prototype.toggle = function() {
      if (arguments.length == 2) {
        var action = 'click',
            cb1 = arguments[0],
            cb2 = arguments[1];
      } else {
        var action = arguments[0],
            cb1 = arguments[1],
            cb2 = arguments[2],
            cancelBubble = arguments[3];
      }
      return this.bind(action, function() {
        this.clicked = this.clicked ? (this.clicked + 1) : 1;
        (this.clicked % 2 ? cb1 : cb2).apply(this, arguments);
      }, cancelBubble);
    }
    Swift.prototype.live = function(action, callback) {
      var targets = this;
      swift(this.context).bind(action, function(event) {
        var src = event.target || event.srcElement;
        var matchedTargets = swift(targets.selector, targets.context);
        for (var i=0; i<matchedTargets.length; i++) {
          if (src == matchedTargets[i])
            callback.call(src, event);
        }
      });
      return this;
    }
    var actions = "blur focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select keydown keypress keyup error contextmenu".split(" ");
    for (var i=0; i<actions.length; i++) {
      var action = actions[i];
      (function(action) {
        Swift.prototype[action] = function(callback, cancelBubble) {
          return this.bind(action, callback, cancelBubble);
        }
      })(action);
    }
    Swift.prototype.focus = function() {
      if (this.length) {
        this[0].focus();
      }
      return this;
    }
    Swift.prototype.attr = function() {
      if (arguments.length == 1 && swift.type(arguments[0]) == 'Object') {
        for (var name in arguments) {
          this.attr(name, arguments[name]);
        }
        return this;
      } else 
        var name = arguments[0],
            value = arguments[1];
      if (value !== undefined) {
        this.each(function(i) {
          this.setAttribute(name, value);
        });
        return this;
      } else {
        if (this.length) {
          return this[0].getAttribute(name);
        }
      }
    }
    Swift.prototype.tag = function() {
      return this.length ? this[0].tagName.toLowerCase() : undefined;
    }
    Swift.prototype.val = function(value) {
      if (value === undefined) {
        if (this.length) {
          if (this[0].value != null)
            return this[0].value;
          else
            if (this.tag() == 'select') {
              var options = this.children();
              for (var i=0; i<options.length; i++) {
                if (options[i].selected) {
                  return options[i].value;
                }
              }
            } else if (this.tag() == 'input' && this.attr('type') == 'checkbox') {
              var valueList = [];
              for (var i=0; i<this.length; i++)
                if (this[i].tagName.toLowerCase() != 'input' || this[i].type == 'checkbox')
                  return undefined;
                else if (this[i].checked)
                  valueList.push(this[i].value);
              return valueList;
            } else if (this.tag() == 'input' && this.attr('type') == 'radio') {
              for (var i=0; i<this.length; i++)
                if (this[i].tagName.toLowerCase() != 'input' || this[i].type != 'radio')
                  return undefined;
                else if (this[i].checked)
                  return this[i].value;
            } else if (this.tag() == 'textarea') {
              return arguments[1] ? $.htmlEncode(this[0].value) : this[0].value;
            } else {
              return this[0].value;
            }
        }
      } else {
        if (this.tag() == 'select') {
          var options = this.children();
          for (var i=0; i<options.length; i++) {
            if (options[i].value == value)
              options[i].selected = 'selected';
            else
              options[i].removeAttribute('selected');
          }
        } else if (this.tag() == 'input' && this.attr('type') == 'checkbox') {
          var values = swift.slice(value);
          if (!values.length) values = [value];
          this.each(function() {
            if (this.tagName.toLowerCase() == 'input' && this.type == 'checkbox') {
              var box = this;
              values.forEach(function(v, i, vs){
                if (box.value == v)
                  box.checked = 'checked';
                else
                  box.removeAttribute('checked');
              });
            }
          });
        } else if (this.tag() == 'input' && this.attr('type') == 'radio') {
          this.each(function() {
            if (this.tagName.toLowerCase() == 'input' && this.type == 'radio' && this.value == value)
              this.checked = 'checked';
            else
              this.removeAttribute('checked');
          });
        } else if (this.tag() == 'textarea') {
          this.html(value);
        } else if (this.tag() == 'input') {
          this.each(function() {
            if (this.tagName.toLowerCase() == 'input')
              this.value = value;
          });
        }
      }
    }
    Swift.prototype.id = function(value) {
      this.attr('id', value);
    }
    Swift.prototype.removeAttr = Swift.prototype.rmAttr = function(name) {
      this.each(function() {
        this.removeAttribute(name);
      });
      return this;
    }
    Swift.prototype.css = function() {
      if (arguments.length == 1 && arguments[0] === undefined) return this;
      if (arguments.length == 2 && arguments[1] === undefined) return this;
      if (arguments.length == 1 && swift.type(arguments[0]) == 'Object') {
        for (var name in arguments[0]) {
          this.css(name, arguments[0][name]);
        }
        return this;
      } else
        var name = arguments[0],
            value = arguments[1];
      
      var isIntStyle =  (name.endswith('size') || name.endswith('width') || name.endswith('height') || name == 'left' || name == 'top')
      var name = swift.styleName(name);
      if (value === undefined) { // read
        if (this.length) {
          return this[0].style[name];
        }
      } else { // write
        var elem = this[0];
        if (elem && elem.nodeType !== 3 && elem.nodeType !== 8 && elem.style)
          this.each(function() {
            this.style[name] = (isIntStyle && swift.isInt(value)) ? '%spx'.fs(value) : value;
          });
        return this;
      }
    }
    Swift.prototype.style = function(name) {
      if (this.length) {
        var name = swift.styleName(name);
        if (this[0].currentStyle) 
          return this[0].currentStyle[swift.styleName(name)];
        else if (window.getComputedStyle) 
          return document.defaultView.getComputedStyle(this[0],null).getPropertyValue(name);
      }
    }
    Swift.prototype.width = function(value) {
      if (arguments.length) {
        if (!swift.isInt(value)) {
          return this.css('width', value);
        } else {
          return this.css('width', value+'px');
        }
      } else if (this.length) {
        var width = swift.asInt(this.css('width'));
        if (width) return width;
        var padding_left = this.css('padding-width-left') || 0;
        var padding_right = this.css('padding-width-right') || 0;
        return this[0].clientWidth - padding_left - padding_right;
      }
    }
    Swift.prototype.innerWidth = function() {
      return this.width();
    }
    Swift.prototype.outterWidth = function() {
      return this.width2();
    }
    Swift.prototype.innerHeight = function() {
      return this.height();
    }
    Swift.prototype.outterHeight = function() {
      return this.height2();
    }
    Swift.prototype.data = function(name, value) {
      if (arguments.length == 0) return swift.data[this.guid] || null;
      if (arguments.length == 1) return swift.data[this.guid] ? swift.data[this.guid][name] || null : null;
      if (arguments.length == 2) {
        swift.data[this.guid = swift.generateGUID()] = value;
      }
    }
    Swift.prototype.removeData = Swift.prototype.rmData = function(name) {
      if (swift.data[this.guid]) delete swift.data[this.guid];
    }
    Swift.prototype.add = function(other) {
      if (this.length) {
        if (other.length != undefined) {
          for (var i=0; i<other.length; i++) {
            this.push(other[i]);
          }
        } else {
          this.push(other);
        }
      }
      return this;
    }
    Swift.prototype.not = function(callback) {
      var orig = this,
          targets = [];
      this.each(function(i) {
        if (!callback.call(this, i)) {
          targets.push(orig[i]);
        }
      });
      return swift(targets);
    }
    Swift.prototype.width2 = function(value) {
      if (this.length) {
        if (value === undefined) {
          return this[0].clientWidth;
        } else {
          var padding_left = this.css('padding-width-left') || 0;
          var padding_right = this.css('padding-width-right') || 0;
          return this.css('width', value - padding_left - padding_right);
        }
      }
    }
    Swift.prototype.width3 = function(value) {
      if (this.length) {
        if (value === undefined) {
          return this[0].offsetWidth;
        } else {
          var border_left = this.css('border-width-left') || 0;
          var border_right = this.css('border-width-right') || 0;
          return this.width2('width', value - border_left - border_right);
        }
      }
    }
    Swift.prototype.width4 = function() {
      if (this.length) return this[0].scrollWidth;
    }
    Swift.prototype.height = function(value) {
      if (arguments.length) {
        if (!swift.isInt(value)) {
          return this.css('height', value);
        } else {
          return this.css('height', value+'px');
        }
      } else if (this.length) {
        var height = this.css('height');
        if (height) return height;
        var padding_left = this.css('padding-height-left') || 0;
        var padding_right = this.css('padding-height-right') || 0;
        return this[0].clientHeight - padding_left - padding_right;
      }
    }
    Swift.prototype.height2 = function(value) {
      if (this.length) {
        if (value === undefined) {
          return this[0].clientHeight;
        } else {
          var padding_left = this.css('padding-height-left') || 0;
          var padding_right = this.css('padding-height-right') || 0;
          return this.css('height', value - padding_left - padding_right);
        }
      }
    }
    Swift.prototype.height3 = function(value) {
      if (this.length) {
        if (value === undefined) {
          return this[0].offsetHeight;
        } else {
          var border_left = this.css('border-height-left') || 0;
          var border_right = this.css('border-height-right') || 0;
          return this.height2('height', value - border_left - border_right);
        }
      }
    }
    Swift.prototype.height4 = function() {
      if (this.length) return this[0].scrollHeight;
    }
    Swift.prototype.classes = function() {
      if (this.length) return this[0].classList;
    }
    Swift.prototype.hasClass = function(name) {
      if (this.length) return this[0].classList.contains(name);
    }
    Swift.prototype.addClass = function(name) {
      this.each(function(i) {
        this.classList.add(name);
      });
      return this;
    }
    Swift.prototype.removeClass = Swift.prototype.rmClass = function(name) {
      this.each(function(i) {
        this.classList.remove(name);
      });
      return this;
    }
    Swift.prototype.hide = function(speed) {
      if (!speed)
        return this.css('display', 'none');
      var orgwidth = this.css('width');
      var orgheight = this.css('height');
      return this.animate({width:0, height:0}, speed, function() {
        this.hide();
        this.css({width:orgwidth, height:orgheight});
      });
    }
    Swift.prototype.show = function(speed) {
      if (!speed)
        return this.css('display', swift.isinline(this.tag()) ? 'inline' : 'block');
      var orgwidth = this.css('width'),
          orgheight = this.css('height'),
          dsp = this.css('display');
      this.show();
      var width = this.width(),
          height = this.height();
      this.css({width:0, height:0});
      return this.animate({width:width, height:height}, speed, function() {
        this.css({width:orgwidth, height:orgheight});
      });
    }
    Swift.prototype.html = function(htmlStr) {
      if (htmlStr !== undefined) {
        this.each(function(i) {
          this.innerHTML = htmlStr;
        });
        return this;
      } else if (this.length)
        return this[0].innerHTML;
    }
    Swift.prototype.text = function(textStr) {
      if (textStr !== undefined) {
        this.each(function(i) {
          this.innerText = textStr;
        });
        return this;
      } else
        return this.innerText;
    }
    Swift.prototype.remove = function() {
      this.each(function(i) {
        this.parentNode.removeChild(this);
      });
      return this;
    }
    Swift.prototype.append = function(other) {
      if (this.length) {
        if (swift.type(other) == 'String') {
          this.html(this.html() + other);
        } else if (other.length != undefined) {
          for (var i=0; i<other.length; i++) {
            this[0].appendChild(other[i]);
          }
        } else {
          this[0].appendChild(other);
        }
      }
      return this;
    }
    Swift.prototype.appendTo = function(other) {
      if (this.length) 
        for (var i=0; i<this.length; i++) 
          (other.length != undefined ? other[0] : other)
              .appendChild(this[i]);
      return this;
    }
    Swift.prototype.after = function(other) {
      if (this.length) {
        var other = other.length != undefined ? other[0] : other;
        for (var i=0; i<this.length; i++) 
          other.parentElement.insertBefore(this[i], other.next());
      }
      return this;
    }
    Swift.prototype.before = function(other) {
      if (this.length) {
        var other = other.length != undefined ? other[0] : other;
        for (var i=0; i<this.length; i++) 
          other.parentElement.insertBefore(this[i], other);
      }
      return this;
    }
    Swift.prototype.next = function() {
      if (this.length)
        return swift(this[0].nextSibling);
      return swift([]);
    }
    Swift.prototype.prev = function() {
      if (this.length)
        return swift(this[0].previousSibling);
    }
    Swift.prototype.clone = function(includeAll) {
      var newTags = [];
      this.each(function(){
        newTags.push(this.cloneNode(includeAll));
      });
      return swift(newTags);
    }
    Swift.prototype.parent = function() {
      return this.length ? swift(this[0].parentElement) : undefined;
    }
    Swift.prototype.children = function() {
      return this.length ? swift.filter(this[0].childNodes, function() {
        return this.tagName ? true : false;
      }) : swift([]);
    }
    Swift.prototype.load = function(url) {
      var mytag = this;
      swift.get({
        url: url,
        success: function(ret) {
          mytag.html(ret);
        }
      });
      return this;
    }
    Swift.prototype.serialize = function(asObj) {
      if (this.length && this.tag() == 'form') {
        var eles = this[0].elements;
        var data = {}
        for (var i=0; i<eles.length; i++) {
          var ele = eles[i];
          data[ele.name] = $(ele).val() || '';
        }
        if (asObj) return data;
        var mappings = [];
        for (var k in data)
          mappings.push('%s=%s'.fs(k, encodeURIComponent(data[k])));
        return mappings.join('&');
      }
    }
    Swift.prototype.filter = function(callback) {
      return swift.filter.call(this, callback);
    }
    Swift.prototype.dialog = function(param) {
      if (!arguments.length) param = {};
      if (this.length !== 1) return this;

      if (!this.length || !param || !(param instanceof Object)) return;
      var userDlg = this,
          oldParent = this.parent();
      var dlg = userDlg.dialog = swift('<div></div>').addClass('swift-dialog')
                                    .width(param.width)
                                    .height(param.height)
                                    .css('border', 'solid 3px #999')
                                    .css('background', '#FFF')
                                    .css(param.style);

      var bgDiv = param.model ? swift('<div></div>').width($(this.doc().body).width())
                                                 .height($(this.doc().body).height())
                                                 .css('z-index', '999')
                                                 .css('position', 'absolute')
                                                 .css('left', 0)
                                                 .css('top', 0)
                                                 .css('background', param.bgBackgroundColor 
                                                      || 'rgba(0, 0, 0, %s)'.fs(param.bgAlpha || 0.2))
                                                 .appendTo(this.doc().body)
                          : undefined;

      if (param.title || param.titleDivStyle || param.close || param.closeText || param.closeIcon || param.closeDivStyle)
        var titleDiv = swift('<div></div>').addClass('swift-dialog-title')
                            .html('<span">%s</span>'.fs(param.title || ""))
                            .height(25)
                            .width('100%')
                            .css('text-align', 'center')
                            .css('font-size', '14px')
                            .css(param.titleDivStyle)
                            .appendTo(dlg);

        if (param.close || param.closeText || param.closeIcon || param.closeStyle)
          swift('<div></div>').css('float', 'right')
                              .css('line-height', '25px')
                              .css('font-size', 14)
                              .css(param.closeDivStyle)
                              .css('cusor', 'pointer')
                              .height(25)
                              .css(param.closeDivStyle)
                              .html(param.closeText 
                                     || param.closeIcon ? 
                                         '<img src="%s">'.fs(param.closeIcon) 
                                         : 'X&nbsp;')
                              .appendTo(titleDiv ? titleDiv : dlg)
                              .click(function() {
                                  if (swift.type(param.close) == 'Function') {
                                    if (param.close.apply(userDlg, arguments))
                                      userDlg.close();
                                  } else userDlg.close();
                              });

      if (param.buttons) {
        var bntDiv = swift('<div></div>').addClass('swift-dialog-buttons')
                                         .height(25)
                                         .css({
                                           'float': 'right'
                                         })
                                         .width('100%')
                                         .css(param.buttonDivStyle)
                                         .append(swift('<div></div>').css('float', 'right'));
        for (var text in param.buttons) {
          (function(text) {
            swift('<button></button>').html(text)
                                      .click(function() {
                                        param.buttons[text].apply(userDlg, arguments);
                                      })
                                      .appendTo(bntDiv.children());
          })(text);
        }
        if (bntDiv.children().length) 
            bntDiv.appendTo(dlg);
      }
      if (param.resizable) {//TODO
      }
      if (param.movable) {//TODO
      }
      dlg.css('z-index', '10000')
         .css('position', 'absolute')
         .appendTo(dlg.doc().body);
      var contentDiv = swift('<div></div>').addClass('swift-dialog-content')
                                           .width('100%')
                                           .css(param.contentDivStyle);
      if (bntDiv) contentDiv.before(bntDiv);
      else contentDiv.appendTo(dlg);
      userDlg.appendTo(contentDiv).show();
      contentDiv.height(dlg.height() 
                           - (dlg.find('.swift-dialog-title').height2() || 0)
                           - (dlg.find('.swift-dialog-buttons').height2() || 0))
      if (!param.style || param.style.left == undefined)
        dlg.css('left', window.innerWidth/2 - dlg.width3()/2 + 'px')
      if (!param.style || param.style.top == undefined)
        dlg.css('top', window.innerHeight/2 - dlg.height3()/2 + 'px')
      this.close = function(event) {
        if (oldParent){
          this.appendTo(oldParent);
          if (this.style("display") != "none")
            this.hide();
        } else
          this.remove();
        dlg.remove();
        bgDiv && bgDiv.remove();
      }
      return this;
    }
    Swift.prototype.doc = function() {
      return this.length ? this[0].ownerDocument : undefined;
    }
    Swift.prototype.animate = function(ts/*target style*/, duration, callback) {
      function interpolate(start, end, points) {
        var interval = (end-start) / points,
            values = [];
        for (var i=0; i<points; i++) {
          values.push(start + i*interval);
        }
        values.push(end);
        return values;
      }
      if (swift.type(duration) == 'Function') {
        callback = duration;
        duration = undefined;
      }
      var interval = 10,
          ele = this,
          duration = swift.type(duration) == 'Number' ? duration : (function(preset) {
            if (preset == 'slow') return 700;
            if (preset == 'middle') return 500;
            if (preset == 'fast') return 300;
          })(duration),
          overflow = this.css('overflow');
      if (ts instanceof Object) {
        var styles = {};
        for (var name in ts) {
          var tsv/*target style value*/ = ts[name];
          tsv = swift.asInt(tsv);
          if (isNaN(tsv)) continue;
          var unit = /\D*$/.exec(tsv);
          if (!!unit) unit = 'px';
          var csv/*current style value*/ = this.css(name);
          if (!csv) csv = this.style(name);
          csv = swift.asInt(csv) || 0;
          styles[name] = {start:csv, end:tsv, unit:unit, interpolations:interpolate(csv, tsv, (duration||300)/interval)};
        }
        ele.css('overflow', 'hidden');
        for (var name in styles) {
          (function(name) {
            for (var i in styles[name]['interpolations']) {
              (function(i) {
                setTimeout(function() {
                  ele.css(name, styles[name]['interpolations'][i]+unit);
                }, interval*i);
              })(i);
            }
            setTimeout(function() {
              callback && callback.apply(ele, arguments);
              ele.css('overflow', overflow);
            }, interval*styles[name]['interpolations'].length);
          })(name);
        }
      }
    }
    Swift.prototype.em2px = function() {
      if (!this.length) return;
      if (this[0].currentStyle) {
        return swift.asInt(this[0].currentStyle['fontSize']);
      } else if (window.getComputedStyle) {
        return swift.asInt(document.defaultView.getComputedStyle(this[0],null).getPropertyValue('font-size'));
      }
    }
    Swift.prototype.first = function() {
      return swift(this.slice(0, 1));
    }
    Swift.prototype.last = function() {
      return swift(this.slice(-1));
    }
    Swift.prototype.firstChild = function() {
      return swift(this.children().slice(0, 1));
    }
    Swift.prototype.lastChild = function() {
      return swift(this.children().slice(-1))
    }
    Swift.prototype.eq = function(i) {
      return swift(this.slice(i, i+1));
    }
    // ### Swift ends
    var type = swift.type(selector);
    if (type == "String") {
      var matched = /^<(\w+)\s*\/?>(?:<\/\1>)?$/.exec(selector);
      if (matched)
        var tags = [window.document.createElement(matched[1])];
      else
        var tags = ctx.querySelectorAll(selector);
    } else if (selector instanceof HTMLElement 
      || selector instanceof HTMLDocument 
      || selector === window)
      var tags = [selector];
    else if (type == 'Array' || type == 'NodeList')
      var tags = selector;
    else if (type == 'Swift')
      return selector;
    else if (type == 'Function') {
    //TODO validate this stuff
      if (/loaded|complete/.test(document.readyState)) {
        selector();
      } else {
        if (window.document.addEventListener) {
          window.document.addEventListener("DOMContentLoaded", selector, false);
        } else if (swift.browser.webkit) {
          var _timer = setInterval(function() {
            if (/loaded|complete/.test(document.readyState)) {
              selector();
              clearInterval(_timer);
            }
          }, 10);
        } else {
          window.onload = selector;
        }
      }
      return;
    }
    return new Swift(tags, selector, ctx);
  }
  swift.log = console.log;
  swift.error = console.error;
  swift.slice = function(items) {
    return Array.prototype.slice.call(items);
  }
  swift.type = function(value) {
    var type = Object.prototype.toString.call(value).slice(8, -1);
    if (type == "Object") {
      var funcNameRegex = /function (.{1,})\(/;
      var results = (funcNameRegex).exec(value.constructor.toString());
      type = (results && results.length > 1) ? results[1] : type;
    }
    return type;
  }
  swift.browser = (function() {
    var ua = navigator.userAgent.toLowerCase(),
        rwebkit = /(webkit)[ \/]([\w.]+)/,
        ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
        rmsie = /(msie) ([\w.]+)/,
        rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/;
    var binfo = rwebkit.exec(ua) || ropera.exec(ua) || rmsie.exec(ua) || rmozilla.exec(ua);
    return {
      name: binfo[1], 
      version: binfo[2],
      webkit: binfo[1] == 'webkit',
      opera: binfo[1] == 'opera',
      msie: binfo[1] == 'msie',
      mozilla: binfo[1] == 'mozilla'
    };
  })();
  swift.filter = function(items, callback) {
    var len = items.length;
    if (typeof callback != "function")
      throw new TypeError();
    var res = [];
    for (var i = 0; i < len; i++) {
      if (i in items) {
        var val = items[i]; // in case fun mutates this
        if (callback.call(val, i, items))
          res.push(val);
      }
    }
    return res;
  }
  swift.htmlEncode = function(source) {
    return source.replace(/</g, '&lt;')
                 .replace(/>/g, '&gt;')
                 .replace(/&/g, '&amp;')
                 .replace(/"/g, '&quot;')
                 .replace(/'/g, '&#39;')
                 .replace(/ /g, '&nbsp;');
  }
  swift.ajax = function(param) {
    if (param == undefined) return;
    if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
      var xmlhttp = new XMLHttpRequest();
    } else {// code for IE6, IE5
      var xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (param.method.toUpperCase() == 'GET') {
      if (param.data) {
        if (swift.type(param.data) == "String") {
          xmlhttp.send(param.data);
        } else if (swift.type(param.data) == "Object") {
          var data = [];
          for (var i in param.data) {
            data.push("%s=%s".fs(encodeURIComponent(i), encodeURIComponent(param.data[i])));
          }
          param.url += "?" + data.join("&");
        }
      }
    }
    xmlhttp.open(param.method.toUpperCase(), param.url, true);
    for (var key in param.headers) {
      xmlhttp.setRequestHeader(key, param.headers[key]);
    }
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4) {
        if (param[xmlhttp.status]) {
          var ret = {'error': 'HTTP_ERROR', 
                     'status': xmlhttp.status,
                     'headers': xmlhttp.getAllResponseHeaders(), 
                     'body': xmlhttp.responseText};
          param[xmlhttp.status](ret);
        } else if (xmlhttp.status == 200) {
          if (param.success) {
            var type = param.type;
            if (type == undefined || type.toLowerCase() in ['html', 'text']) {
              var ret = xmlhttp.responseText;
            } else if (type.toLowerCase() == 'json') {
              var ret = swift.parseJSON(xmlhttp.responseText);
            } else if (type.toLowerCase() == 'xml') {
              var ret = xmlhttp.responseXML;
            }
            param.success(ret);
          }
        } else if (param.error) {
            var ret = {'error': 'HTTP_ERROR', 
                       'status': xmlhttp.status,
                       'headers': xmlhttp.getAllResponseHeaders(), 
                       'body': xmlhttp.responseText};
            param.error(ret);
        }
      }
    }
    if (param.timeout) {
      setTimeout(function(){
        xmlhttp.abort();
        var ret = {'error': 'TIMEOUT'}
        param.error(ret);
      }, param.timeout);
    }
    if (param.method.toUpperCase() == 'POST') {
      if (!param.data) {
        xmlhttp.send('');
      } else if (swift.type(param.data) == "String") {
        xmlhttp.send(param.data);
      } else if (swift.type(param.data) == "Object") {
        var data = [];
        for (var i in param.data) {
          data.push("%s=%s".fs(encodeURIComponent(i), encodeURIComponent(param.data[i])));
        }
        xmlhttp.send(data.join("&"));
      }
    }
    xmlhttp.send();
  }
  swift.get = function(param) {
    param.method = 'GET';
    return swift.ajax(param);
  }
  swift.post = function(param) {
    param.method = 'POST';
    return swift.ajax(param);
  }
  swift.generateGUID = function() {
    return swift.guid = (swift.guid + 1) || 1;
  }
  swift.isInt = function(n) {
  // Attension: 1E209 is no a int here
    return typeof n == 'number' && parseFloat(n) == parseInt(n) && !isNaN(n);
  }
  swift.styleName = function(name) {
    var camelCase = name.replace(/^-ms-/, "ms-").replace(/-([a-z]|[0-9])/ig, function (all, letter) {
        return (letter + "").toUpperCase();
    });
    if (camelCase == 'float')
      return !!swift('<div></div>').html('<a style="float:left"></a>').find('a')[0].style.cssFloat ? 'cssFloat' : 'styleFloat';
    return camelCase;
  }
  swift.alert = function(msg/*required*/, handler/*optional*/, userStyle/*optional*/) {
    if (!(arguments[1] instanceof Function))
      var style = arguments[1];
    else if (!(arguments[2] instanceof Function))
      var callback = arguments[1],
          style = arguments[2];
    $('<div></div>').html(msg || '')
                    .css('padding', '20px 50px 20px 50px')
                    .css(style)
                    .dialog({
                      model: true,
                      buttons: {
                        'OK': function(){
                          callback && callback.apply(this, arguments);
                          this.close();
                        }
                      }
                    });
  }
  swift.confirm = function(param) {
    if (!param) return;
    param.yesText = param.yesText || 'OK';
    param.noText = param.noText || 'Cancel';
    $('<div></div>').html(param.msg || '')
                    .css('padding', '20px 50px 20px 50px')
                    .css(param.style)
                    .dialog({
                      buttons: {
                        'OK': function() {
                          param.yes && param.yes.apply(this, arguments);
                          this.close();
                        },
                        'Cancel': function() {
                          param.no && param.no.apply(this, arguments);
                          this.close();
                        }
                      }
                    });
  }
  swift.human = function(size) {
    if (size < 1024)
        return parseInt(size) + 'B';
    else if (size < 1024 * 1024)
        return parseInt(size/1024*10)/10 + 'KB';
    else if (size < 1024 * 1024 * 1024)
        return parseInt(size/1024/1024*10)/10 + 'MB';
    else if (size < 1024 * 1024 * 1024 * 1024)
        return parseInt(size/1024/1024/1024*10)/10 + 'GB';
    else
        return parseInt(size/1024/1024/1024/1024*10)/10 + 'TB';
  }
  swift.time = function(seconds, secondUnit, minuteUnit, hourUnit, dayUnit) {
    if (seconds < 60)
      return seconds + (secondUnit || 'S');
    else if (seconds < 3600)
      return parseInt(seconds/60)  + (minuteUnit || 'M');
    else if (seconds < 3600*24)
      return parseInt(seconds/3600) + (hourUnit || 'H');
    else
      return parseInt(seconds/3600/24) + (dayUnit || 'D');
  }
  swift.asInt = function(numberWithUnit) {
    return parseInt(/\d*/.exec(numberWithUnit)[0]);
  }
  swift.data = {};
  swift.param = function(data) {
    var mappings = [];
    for (var k in data)
      mappings.push('%s=%s'.fs(k, encodeURIComponent(data[k])));
    return mappings.join('&');
  }
  swift.merge = function() {
    return [].concat(swift.slice(arguments));
  }
  swift.isNumberic = function(data) {
    return !isNaN(parseFloat(data)) && isFinite(data);
  }
  swift.parseXML = function(data) {
    var xml;
    try {
        if (window.DOMParser) 
            xml = new DOMParser().parseFromString(data, "text/xml");
        else {
            xml = new ActiveXObject("Microsoft.XMLDOM");
            xml.async = "false";
            xml.loadXML(data);
        }
    } catch (e) {
        xml = undefined;
    }
    if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) 
        swift.error("Invalid XML: " + data);
    return xml;
  }
  swift.now = function() {
    return (new Date()).getTime();
  }
  swift.inArray = function(value, arr, startIdx) {
    for (var i=startIdx||0; i<arr.length; i++) {
      if (value === arr[i]) return true;
      else continue;
    }
    return false;
  }
  swift.extend = function() {
    var fns = arguments[0],
        name = arguments[0],
        fn = arguments[1];
    if (arguments.length == 1) {
      for (var name in fns) {
        (function(name) {
          swift[name] = fns[name];
        })(name);
      }
    } else {
      swift[name] = fn;
    }
  }
  swift.cleanData = function() {
    delete this.data;
    this.data = {};
  }
  swift.toJSON = typeof window.JSON === 'object' && window.JSON.stringify ? JSON.stringify : function (o) {
    if (o === null) return 'null';
    var type = typeof o;
    if (type === 'undefined') return undefined;
    if (type === 'number' || type === 'boolean') return '' + o;
    if (type === 'string') return swift.quoteString(o);
    if (type === 'object') {
      if (o.constructor === Date) {
        var month = o.getUTCMonth() + 1,
          day = o.getUTCDate(),
          year = o.getUTCFullYear(),
          hours = o.getUTCHours(),
          minutes = o.getUTCMinutes(),
          seconds = o.getUTCSeconds(),
          milli = o.getUTCMilliseconds();
        if (month < 10) month = '0' + month;
        if (day < 10) day = '0' + day;
        if (hours < 10) hours = '0' + hours;
        if (minutes < 10) minutes = '0' + minutes;
        if (seconds < 10) seconds = '0' + seconds;
        if (milli < 100) milli = '0' + milli;
        if (milli < 10) milli = '0' + milli;
        return '"' + year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds + '.' + milli + 'Z"';
      }
      if (o.constructor === Array) {
        var ret = [];
        for (var i = 0; i < o.length; i++) {
          ret.push(swift.toJSON(o[i]) || 'null');
        }
        return '[' + ret.join(',') + ']';
      }
      var name, val, pairs = [];
      for (var k in o) {
        type = typeof k;
        if (type === 'number')
          name = '"' + k + '"';
        else if (type === 'string')
          name = swift.quoteString(k);
        else 
          continue;
        type = typeof o[k];
        if (type === 'function' || type === 'undefined') 
          continue;
        val = swift.toJSON(o[k]);
        pairs.push(name + ':' + val);
      }
      return '{' + pairs.join(',') + '}';
    }
  }
  swift.parseJSON = swift.evalJSON = typeof window.JSON === 'object' && window.JSON.parse ? window.JSON.parse : function (src) {
    var filtered = src.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '');
    if (/^[\],:{}\s]*$/.test(filtered)) 
      return eval('(' + src + ')');
    else 
      swift.error("Invalid JSON: " + o);
  }
  swift.quoteString = function (string) {
    var escapeable = /["\\\x00-\x1f\x7f-\x9f]/g,
        meta = {'\b':'\\b', '\t':'\\t', '\n':'\\n', '\f':'\\f', '\r':'\\r', '"':'\\"', '\\':'\\\\'};
    if (string.match(escapeable)) {
      return '"' + string.replace(escapeable, function (a) {
        var c = meta[a];
        if (typeof c === 'string') 
          return c;
        c = a.charCodeAt();
        return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
      }) + '"';
    }
    return '"' + string + '"';
  }
  swift.isinline = function(tag) {
    return swift.inArray(tag, ["a", "abbr", "acronym", "b", "bdo", "big", "br", "cite", "code", "dfn", "em", "i", "img", "input", "kbd", "label", "q", "samp", "select", "small", "span", "strong", "sub", "sup", "textarea", "tt", "var"]);
  }
})(window);

