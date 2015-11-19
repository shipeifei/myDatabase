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
        var regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,3})(?:Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;

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

        this.processRow = function(row) {
            var obj = {};
            for (var key in row) {
                var value = row[key];
                if (utils.isString(value) && value.match(regexIso8601)) {
                    var d = Date.parse(value);
                    if (d) {
                        value = new Date(d);
                    }
                }
                obj[key] = value;
            }
            return obj;
        };

        self.processResultType = function(results, type) {
            switch (type) {
                case self.cs.any:
                    return results;
                case self.cs.insert:
                    return results.insertId;
                case self.cs.rowset:
                    var len = results.rows.length,
                        i;
                    var rows = [];
                    for (i = 0; i < len; i++) {
                        var item = self.processRow(results.rows.item(i));
                        rows.push(item);
                    }
                    return rows;
                case self.cs.row:
                    if (results.rows.length) {
                        return self.processRow(results.rows.item(0));
                    }
                    return null;
                case self.cs.scalar:
                    if (results.rows.length) {
                        var obj = self.processRow(results.rows.item(0));
                        for (var key in obj) {
                            return obj[key];
                        }
                    }
                    return null;
                case self.cs.nonQuery:
                    return results.rowsAffected;
                default:
                    return results;
            }

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
        this.initData();



    }


    //原型方法
    myDatabase.prototype = {
        bug: false,
        tableSQL: "SELECT name FROM sqlite_master   WHERE type='table' ORDER BY name",

        myDB: openDatabase(this.dataName, this.version, this.description, this.size),
        dbLog: function(obj) {

            if (this.isdebug) {
                console.log(obj);
            }
        },

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

                    if (utils.isFunction(callback)) {

                        callback(true, tx, result);
                    }
                    return true;
                }, function(tx, error) {
                    if (utils.isFunction(callback)) {

                        callback(false, tx, error);
                    }
                    console.log(error);
                    return false;
                });
            });
        },

        /**
         * 创建字段
         * @param  {[type]} columnName  字段名称
         * @param  {[type]} columnProps 字段类型，支持不为空等多条件
         *  task: { type: 'text', required: true, unique: true},
            duedate: 'date',
            completed: 'boolean'
         * @return {[type]}             [description]
         */
        _createColumn: function(columnName, columnProps) {
            if (utils.isString(columnProps)) {
                return columnName + " " + dataType.translateType(columnProps);
            }
            return columnName + " " + dataType.translateType(columnProps.type) +
                (columnProps.required ? " NOT NULL" : "") +
                (columnProps.unique ? " UNIQUE" : "");
        },

        /**
         * 创建表
         * @param  {[type]} tableName   表明
         * @param  {[type]} columns     表字段
         * { task: 'text', duedate: 'date'}, true
         * @param  {[type]} checkExists 表不存在是否创建
         * @return {[type]}             [description]
         */
        createTable: function(tableName, columns, checkExists) {

            var _sql = "CREATE TABLE " + (checkExists ? "IF NOT EXISTS " : "") + tableName + "(";
            var _cols = [];

            _cols.push(this._createColumn('id', "pk"));
            for (var c in columns) {
                if (c === "timestamps") {
                    _cols.push("created_at int");
                    _cols.push("updated_at int");
                } else if (c !== 'id') {
                    _cols.push(this._createColumn(c, columns[c]));
                }
            }


            _sql += _cols.join(", ") + ")";
            this.dbLog(_sql);
            this.execSql(_sql, [], function(ok, tx, result) {
                if (ok) {

                    console.log(result);
                } else {

                    console.log("创建表:" + tableName + "失败," + result.message);
                }
            });
        },

        /**
         * 增加表字段
         * @param {[type]} tableName   [description]
         * @param {[type]} columnName  [description]
         * @param {[type]} columnProps [description]
         */
        addColumn: function(tableName, columnName, columnProps) {

            var _sql = "ALTER TABLE " + tableName + " ADD COLUMN " + this._createColumn(columnName, columnProps);
            this.dbLog(_sql);
            this.execSql(_sql, [], function(ok, tx, result) {
                if (ok) {

                    console.log(result);
                } else {

                    console.log("增加表:" + tableName + "失败," + result.message);
                }
            });
        },

        /**
         * 创建单个表
         * @param  {[type]} tableName 表明
         * @param  {[type]} columns   表字段{ task: 'text', duedate: 'date'}
         * @return {[type]}           [description]
         */
        define: function(tableName, columns) {

            this.createTable(tableName, columns, true);
        },

        /**
         * 创建多个表
         * @param  {[type]} obj [description]
         * @return {[type]}     [description]
         * var dbTable =
         [
              {
                table : 'foo',
                properties :
                    {
                        task:{type:'task',required:true},
                        duedate: 'date'
                    }

               }
             ];
         */
        defineMutile: function(tables) {
            if (utils.isUndefined(tables)) {
                console.log("参数不正确");
                return false;
            }

            var _define = this.define;



            if (Array.isArray(tables)) {
                for (var item in tables) {
                    console.log(tables[item].table);
                    console.log(tables[item].properties);
                    this.define(tables[item].table, tables[item].properties);
                }


            } else {
                console.log("参数只支持数组格式:[{table: 'foo',properties: {task: {type: 'text',required: true},duedate: 'date'}}]");
            }
        },


        dropTable: function(tableName) {
            var _sql = "DROP TABLE IF EXISTS " + tableName;
            this.execSql(_sql, [], function(ok, tx, result) {
                if (ok) {

                    console.log(result);
                } else {

                    console.log("删除表:" + tableName + "失败," + result.message);
                }
            });
        },

        /**
         * 主要针对增、删、改的操作
         * @param  {[type]}   sql      [description]
         * @param  {[type]}   parames  [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        nonQuery: function(sql, parames, callback) {



        },

         /**
         * 修改数据
         * @param  {[type]} tableName  [description]
         * @param  {[type]} conditions [{name:'shipeifei',password:'123456'}}]
         * @return {[type]}            [description]
         */
        update: function(tableName, columns, conditions,callback) {

            //update student set name='shipeifei' ,password='123' where id=1
            //

        },
        /**
         * 插入数据
         * @param  {[type]} tableName  [表名]
         * @param  {[type]} conditions [插入数据{name:'shipefei',password:'123456'}]
         * @return {[type]}            [description]
         */
        insert: function(tableName, conditions, callback) {



            if (!conditions) {
                throw "insert should be called with parames"; //{ return new Query().raiseError("insert should be called with data"); }
            }

            var sql = utils.format("INSERT INTO {0} ({1}) VALUES(", tableName, Object.keys(conditions).join(", "));
            var params = [];
            var values = [];

            var seed = 0;
            for (var key in conditions) {
                values.push(utils.placeholder(++seed));
                params.push(conditions[key]);
            }

            sql += values.join(", ") + ")";
            this.execSql(sql, params, callback);

        },

        /**
         * 插入多条数据
         * @param  {[type]}   tableName  [description]
         * @param  {[type]}   conditions [description]
         * @param  {Function} callback   [description]
         * @return {[type]}              [description]
         */
        insertMutile: function(tableName, conditions, callback) {
            if (utils.isUndefined(conditions)) {
                console.log("参数不正确");
                return false;
            }


            if (Array.isArray(conditions)) {
                for (var item in conditions) {

                    this.insert(tableName, conditions[item]);
                }


            } else {
                console.log("参数只支持数组格式:[{name:'shipefei',password:'123456'},{name:'shipefei',password:'123456'}]");
            }

        },

        /**
         * 查询表
         * @return {[type]} [description]
         */
        query: function() {

            this.execSql("select * from todo", [], function(ok, tx, result) {

                if (ok) {
                    console.log(result);
                } else {
                    console.log(error);
                }

            });

        },

        /**
         * 查询一条数据
         * @param  {[type]} sql    select * from where id=1
         * @param  {[type]} params 参数数组
         * @return {[type]}        [description]
         */
        queryOne: function(sql, params, callback) {

            var sql = sql || "";
            var params = params || [];

            this.dbLog(sql + "参数:" + params.join(","));

            this.execSql(sql, params, callback);


        },

        /**
         * 查询所有的数据
         * select name ,password from stu
         * @param  {[type]} sql    [description]
         * @param  {[type]} columns 查询字段，可以：单个字符、数组
         * @return {[type]}        [description]
         */
        all: function(tableName, columns, callback) {

            var sql = "select ";

            sql += utils.isString(columns) ? columns : (columns.length === 1 ? columns[0] : columns.join(" , ")) + " from " + tableName;

            this.dbLog(sql);
            this.execSql(sql, [], callback);

        },








    }


    if (typeof module != 'undefined' && module.exports) {
        module.exports = myDatabase;
    } else {
        window.myDatabase = myDatabase;
    }
})(window, document, Math);