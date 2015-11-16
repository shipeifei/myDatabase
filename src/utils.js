/*
  作者:shipeifei
  版本1.0.0
  描述:工具类封装
 */
var utils = utils || {};

(function() {


	var self = utils;

	var ArrayProto = Array.prototype,
		ObjProto = Object.prototype,
		FuncProto = Function.prototype;


	var
		push = ArrayProto.push,
		slice = ArrayProto.slice,
		toString = ObjProto.toString,
		hasOwnProperty = ObjProto.hasOwnProperty;

	//声明html5支持的原生的类型
	var
		nativeIsArray = Array.isArray,
		nativeKeys = Object.keys,
		nativeBind = FuncProto.bind,
		nativeCreate = Object.create;



	self.toArray = function(list) {
		return slice.call(list);
	};


	self.isObject = function(A) {
		return (typeof A === "object") && (A !== null);
	};

	self.isFunction = function(object) {
		return !!(object && object.constructor && object.call && object.apply);
	};

	var types = ['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'];
	types.forEach(function(name) {
		self['is' + name] = function(obj) {
			return toString.call(obj) === '[object ' + name + ']';
		};
	});

	self.isBoolean = function(obj) {
		return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	};

	//数据循环
	self.each = function(obj, cb) {
		for (var k in obj) {
			cb(obj[k], k);
		}
	};

	utils.has = function(obj, key) {
		return hasOwnProperty.call(obj, key);
	};

	self.format = function(str) {
		var args = arguments;
		return str.replace(/{(\d+)}/g, function(match, number) {
			var num = parseInt(number, 10);
			return isFinite(num) ? args[1 + num] : match;
		});
	};

	//判断当前浏览器是否支持sqlite数据库
	self.isUseDatabase = window.openDatabase ? true : false;


	//扩展方法，用于实现继承
	self.extend = function(target, obj) {
		for (var i in obj) {
			target[i] = obj[i];
		}
	};

	//判断当前浏览器版本
	self.browerVersion = function() {
		//return window.openDatabase?true:false;
	}

	//获取当前时间
	self.getTime = Date.now || function getTime() {
		return new Date().getTime();
	};

	//第一个首字母转换为小写
	self.lowercaseFirst = function(s) {
		return s[0].toLowerCase() + s.slice(1);
	};

	//第一个字母转换为大写
	self.uppercaseFirst = function(s) {
		return s[0].toUpperCase() + s.slice(1);
	};

	//日期格式化
	Date.prototype.format = function(format) {
		var o = {
			"M+": this.getMonth() + 1, //month
			"d+": this.getDate(), //day
			"h+": this.getHours(), //hour
			"m+": this.getMinutes(), //minute
			"s+": this.getSeconds(), //second
			"q+": Math.floor((this.getMonth() + 3) / 3), //quarter
			"S": this.getMilliseconds() //millisecond
		}
		if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		for (var k in o)
			if (new RegExp("(" + k + ")").test(format))
				format = format.replace(RegExp.$1,
					RegExp.$1.length == 1 ? o[k] :
					("00" + o[k]).substr(("" + o[k]).length));
		return format;
	};



	//判断是否为空
	self._isNull = function(obj) {
		return obj === null;
	};

	// 判断是否没有定义
	self.isUndef = function(obj) {
		return obj === void 0;
	};


	//去除字符串左侧空格
	self.lTrim = function(str) {
		var i;
		for (i = 0; i < str.length; i++) {
			if (str.charAt(i) != " " && str.charAt(i) != " ") break;
		}
		str = str.substring(i, str.length);
		return str;
	}


	//去除字符串右侧空格
	self.rTrim = function(str) {
			var i;
			for (i = str.length - 1; i >= 0; i--) {
				if (str.charAt(i) != " " && str.charAt(i) != " ") break;
			}
			str = str.substring(0, i + 1);
			return str;
		}
		//去除字符串左右两侧空格
	self.trim = function(str) {

		return this.lTrim(this.rTrim(str));
	}

	//判断字符串是否为空
	self.isNull = function(str) {
		var oStr = str.replace(' ', '');
		if (oStr == null) {
			return true;
		} else if (this.trim(oStr).length <= 0) {
			return true;
		} else {
			return false;
		}
	};



}());