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


        me.isFunction = function(object) {
            return !!(object && object.constructor && object.call && object.apply);
        };

        var types = ['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'];
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
    console.log(utils);
    /*
  作者:shipeifei
  版本1.0.0
  描述:数据类型封装
 */

    var utils = utils || {};
    var dataType = dataType || {};

    (function() {


        var self = dataType;

        self.cs = {
            //数据库字段类型
            pk: 'pk',
            text: 'text',
            integer: 'int',
            numeric: 'numeric',
            decimal: 'decimal',
            date: 'date',
            bool: 'boolean',

            //数据库查询类型
            rowset: 'rowset', //数组
            row: 'row', //单个数组
            scalar: 'scalar',
            nonQuery: 'non-query', //没有返结果
            insert: 'insert', //插入
            update: 'update', //修改
            any: 'any'
        };

        /**
         * 转换数据类型指定为sqlite特定的属性
         * @param  {[type]} typeName [description]
         * @return {[type]}          [description]
         */
        self.translateType = function(typeName) {
            var _result = typeName;

            switch (typeName) {
                case "pk":
                    _result = "INTEGER PRIMARY KEY  AUTOINCREMENT";
                    break;
                case "int":
                    _result = "INTEGER";
                    break;
                case "decimal":
                    _result = "numeric";
                    break;
                case "date":
                    _result = "datetime";
                    break;
                case "text":
                    _result = "text";
                    break;
                case "boolean":
                    _result = "boolean";
                    break;
            }
            return _result;
        };

        /**
         * 返回当前sql执行的类型
         * @param  {[type]} sql [description]
         * @return {[type]}     [description]
         */
        self.inferQueryType = function(sql) {
            var mysql = sql.toLowerCase();
            if (mysql.indexOf('insert') === 0) {
                return self.cs.insert;
            }

            if (mysql.indexOf('select') === 0) {
                if (mysql.indexOf('limit(1)') > 0) {
                    return self.cs.row;
                }

                return self.cs.rowset;
            }

            if (mysql.indexOf('update') === 0 || mysql.indexOf('delete') === 0) {
                return self.cs.nonQuery;
            }

            return self.cs.any;
        };

        /**
         * 转换类型为sqlite识别的类型
         * @param  {[type]} p [description]
         * @return {[type]}   [description]
         */


        self.typeToDb = function(p) {
            if (utils.isDate(p)) {
                return p.toISOString();
            }
            if (utils.isBoolean(p)) {
                return p ? 1 : 0;
            }
            return p;
        };



    }());



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

            if (this.isdebug) {
                console.log(obj);
            }
        }
        this.initData();



    }


    //原型方法
    myDatabase.prototype = {

        tableSQL: "SELECT name FROM sqlite_master   WHERE type='table' ORDER BY name",

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
            if (!this.myDB)
                this.dbLog("初始化数据库失败!!");
            else
                this.dbLog("初始化数据成功!!");

        },


        /**
         * 执行sql语句核心代码,这里使用回调函数处理
         * @param sql
         */
        execSql: function(sql, param, callback) {


            var _args = param ? param.map(dataType.typeToDb) : param;
            this.myDB.transaction(function(tx) {
                tx.executeSql(sql, _args, function(tx, result) {
                    if (typeof(callback) == 'function') {
                        callback(true, tx, result);
                    }
                    return true;
                }, function(tx, error) {
                    if (typeof(callback) == 'function') {
                        callback(false, tx, error);
                    }
                    console.log(error);
                    return false;
                });
            });
        },

        /**
         * 创建表
         * @param  {[type]} tableName 表明
         * @param  {[type]} columns   表字段{ task: 'text', duedate: 'date'}
         * @return {[type]}           [description]
         */
        define: function(tableName, columns) {

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
            // this.myDB.transaction(function(tx) {
            //     tx.executeSql(
            //         "insert into stu (id, name) values(?, ?)", [1, '徐明祥'],
            //         function() {
            //             alert('添加数据成功');
            //         },
            //         function(tx, error) {
            //             alert('添加数据失败: ' + error.message);
            //         });
            // });

            this.execSql("insert into stu (id, name) values(?, ?)", [2, '时培飞'], function(ok, tx, result) {

                if (ok) {
                    console.log(result);
                } else {
                    console.log(error);
                }

            });

        },
        query: function() {

            this.execSql("select * from stu", [], function(ok, tx, result) {

                if (ok) {
                    console.log(result);
                } else {
                    console.log(error);
                }

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