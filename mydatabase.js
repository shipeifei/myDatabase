/*
  作者:shipeifei
  版本1.0.0
  描述:html5操作本地sqlite数据库工具
 */

(function(window, document, Math) {

    var ArrayProto = Array.prototype,
        ObjProto = Object.prototype,
        FuncProto = Function.prototype;


    var
        push = ArrayProto.push,
        slice = ArrayProto.slice,
        toString = ObjProto.toString,
        hasOwnProperty = ObjProto.hasOwnProperty;

    // All **ECMAScript 5** native function implementations that we hope to use
    // are declared here.
    var
        nativeIsArray = Array.isArray,
        nativeKeys = Object.keys,
        nativeBind = FuncProto.bind,
        nativeCreate = Object.create;


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

        //判断当前浏览器版本
        me.browerVersion = function() {
            //return window.openDatabase?true:false;
        }

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
                        RegExp.$1.length == 1 ? o[k] :
                        ("00" + o[k]).substr(("" + o[k]).length));
            return format;
        };


        //判断是否是一个对象
        me.isObject = function(obj) {
            var type = typeof obj;
            return type === 'function' || type === 'object' && !!obj;
        };

        //判断是否为空
        me._isNull = function(obj) {
            return obj === null;
        };

        // 判断是否没有定义
        me.isUndefined = function(obj) {
            return obj === void 0;
        };


        //去除字符串左侧空格
        me.lTrim = function(str) {
            var i;
            for (i = 0; i < str.length; i++) {
                if (str.charAt(i) != " " && str.charAt(i) != " ") break;
            }
            str = str.substring(i, str.length);
            return str;
        }


        //去除字符串右侧空格
        me.rTrim = function(str) {
                var i;
                for (i = str.length - 1; i >= 0; i--) {
                    if (str.charAt(i) != " " && str.charAt(i) != " ") break;
                }
                str = str.substring(0, i + 1);
                return str;
            }
            //去除字符串左右两侧空格
        me.trim = function(str) {

            return this.lTrim(this.rTrim(str));
        }

        //判断字符串是否为空
        me.isNull = function(str) {
            var oStr = str.replace(' ', '');
            if (oStr == null) {
                return true;
            } else if (this.trim(oStr).length <= 0) {
                return true;
            } else {
                return false;
            }
        };

        return me;



    })();
    /**
     *
     * @param  string dataName    数据库名称
     * @param  string version     版本号
     * @param  string description 数据库描述
     * @param  int size           数据库大小
     * @return {[type]}             [description]
     */
    function myDatabase(dataName, version, description, size) {

        //默认数据库配置
        this.defaultConfig = {
            dataName: "myDatabase",
            version: "1.0",
            description: "this is myDatabase",
            size: 2 * 1024 * 1024
        };

        this.dataName = dataName || this.defaultConfig.dataName;
        this.description = description || this.defaultConfig.description;
        this.version = version || this.defaultConfig.version;
        this.size = size || this.defaultConfig.size;

        this.bug = false;
        this.dbLog = function(obj) {
            console.log(this.bug);
            if (this.isdebug) {
                console.log(obj);
            }
        }
        this.initData();




    }


    //原型方法
    myDatabase.prototype = {

        tableSQL:"SELECT name FROM sqlite_master	WHERE type='table' ORDER BY name",

        myDB: openDatabase(this.dataName, this.version, this.description, this.size),
        //初始化
        initData: function() {

            if (utils.isNull(this.dataName)) {
                alert('建议您最好添加自己的数据库名称，防止冲突!!');
                return false;
            }


            //判断浏览器是否支持sqlite
            if (!utils.isUseDatabase) {
                alert('您当前的浏览器不支持HTML5，建议您升级为当前浏览器的最新版本!!');
                return false;
            }
            this.dbLog("初始化数据库失败!!");
            console.log(this.myDB);
            if (!this.myDB)
                this.dbLog("初始化数据库失败!!");
            else
                this.dbLog("初始化数据成功!!");



        },
        /**
         * 创建表
         * @param  {[type]} tableName 表明
         * @param  {[type]} columns   表字段{ task: 'text', duedate: 'date'}
         * @return {[type]}           [description]
         */
        define:function (tableName,columns) {

        },
        createTable: function() {
            this.myDB.transaction(function(tx) {
                tx.executeSql(
                    "create table if not exists stu (id REAL UNIQUE, name TEXT)", [],
                    function(tx, result) {
                        alert('创建stu表成功');
                    },
                    function(tx, error) {
                        alert('创建stu表失败:' + error.message);
                    });
            });
        },
        insert: function() {
            this.myDB.transaction(function(tx) {
                tx.executeSql(
                    "insert into stu (id, name) values(?, ?)", [1, '徐明祥'],
                    function() {
                        alert('添加数据成功');
                    },
                    function(tx, error) {
                        alert('添加数据失败: ' + error.message);
                    });
            });



        },
        query: function() {
        	 this.dbLog("初始化数据库失败!!");
            this.myDB.transaction(function(tx) {
                tx.executeSql(
                    "select * from stu", [],
                    function(tx, result) {
                        console.log(result);

                        //执行成功的回调函数
                        //在这里对result 做你想要做的事情吧...........
                    },
                    function(tx, error) {
                        alert('查询失败: ' + error.message);
                    });
            });
        },


        dropTable: function() {
            this.myDB.transaction(function(tx) {
                tx.executeSql('drop table stu');
            });
        }


    }


    if (typeof module != 'undefined' && module.exports) {
        module.exports = myDatabase;
    } else {
        window.myDatabase = myDatabase;
    }
})(window, document, Math);