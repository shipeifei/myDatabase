//工具类
    var utils = (function() {

        var me = {};

        //判断当前浏览器是否支持sqlite数据库
        me.isUseDatabase = window.openDatabase ? true : false;


        //扩展方法，用于实现继承
        me.extend = function(target, obj) {
            for (var i in obj) {
                target[i] = obj[i];
            }
        };




        //获取当前时间
        me.getTime = Date.now || function getTime() {
            return new Date().getTime();
        };

        //第一个首字母转换为小写
        me.lowercaseFirst = function(s) {
            return s[0].toLowerCase() + s.slice(1);
        };

        //第一个字母转换为大写
        me.uppercaseFirst = function(s) {
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
                        RegExp.$1.length === 1 ? o[k] :
                        ("00" + o[k]).substr(("" + o[k]).length));
            return format;
        };


        //判断是否是一个对象
        me.isObject = function(obj) {
            var type = typeof obj;
            return type === 'function' || type === 'object' && !!obj;
        };


        me.isFunction = function(object) {
            return !!(object && object.constructor && object.call && object.apply);
        };

        var types = ['Arguments', 'String', 'Number', 'Date', 'RegExp'];
        types.forEach(function(name) {
            me['is' + name] = function(obj) {
                return toString.call(obj) === '[object ' + name + ']';
            };
        });

        me.isBoolean = function(obj) {
            return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
        };

        //判断是否为空
        me._isNull = function(obj) {
            return obj === null;
        };

        // 判断是否没有定义
        me.isUndefined = function(obj) {
            return obj === void 0;
        };
        me.isUndef = function(obj) {
            return obj === void 0;
        };


        //去除字符串左侧空格
        me.lTrim = function(str) {
            var i;
            for (i = 0; i < str.length; i++) {
                if (str.charAt(i) !== " " && str.charAt(i) !== " ") {
                    break;
                }
            }
            str = str.substring(i, str.length);
            return str;
        }


        //去除字符串右侧空格
        me.rTrim = function(str) {
                var i;
                for (i = str.length - 1; i >= 0; i--) {
                    if (str.charAt(i) !== " " && str.charAt(i) !== " ") {
                        break;
                    }
                }
                str = str.substring(0, i + 1);
                return str;
            }
            //去除字符串左右两侧空格
        me.trim = function(str) {

            return this.lTrim(this.rTrim(str));
        }

        //判断字符串是否为空
        me.isNull = function(obj) {
            // var oStr = str.replace(' ', '');
            // if (oStr == null) {
            //     return true;
            // } else if (this.trim(oStr).length <= 0) {
            //     return true;
            // } else {
            //     return false;
            // }
            return obj === null;
        };
        //数据循环
        me.each = function(obj, cb) {
            for (var k in obj) {
                cb(obj[k], k);
            }
        };

        /**
         * 返回占位符
         * @return {[type]} [description]
         */
        me.placeholder = function() {
            return "?";
        };

        //第一个参数表示匹配到的字符，
        //第二个参数表示匹配时的字符最小索引位置(RegExp.index)
        //第三个参数表示被匹配的字符串(RegExp.input)
        me.format = function(str) {
            var args = arguments;
            return str.replace(/{(\d+)}/g, function(match, number) {
                var num = parseInt(number, 10);
                return isFinite(num) ? args[1 + num] : match;
            });
        };

        return me;



    })();
