





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
    myDatabase.dataType = {
        //数据库字段类型
        pk: 'pk',
        text: 'text',
        integer: 'int',
        numeric: 'numeric',
        decimal: 'decimal',
        date: 'date',
        bool: 'boolean'



    }

    //原型方法
    myDatabase.prototype = {
        bug: false,
        tableSQL: "SELECT name FROM sqlite_master   WHERE type='table' ORDER BY name",
        operationsMap: {
            '=': '=',
            '!': '!=',
            '>': '>',
            '<': '<',
            '>=': '>=',
            '<=': '<=',
            '!=': '<>',
            '<>': '<>'
        },


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
            if (!this.myDB) {
                this.dbLog("初始化数据库失败!!");
            } else {
                this.dbLog("初始化数据成功!!");
            }


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
            this.dbLog("创建table的语句为：" + _sql);
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

            //select * from todo where id=5 and task='shipeifei' order by id desc limit 1 offset 3

        },
        /**
         * 删除数据
         * @param  {[type]}   tableName [表]
         * @param  {[type]}   where     [{'id = ':'5'}}]
         * @param  {Function} callback  [description]
         * @return {[type]}             [description]
         */
        delete: function(tableName, where, callback) {



            var sql = " delete from " + tableName;
            if (utils.isString(where)) {
                sql += " where " + where;
            }


            sql += this.where(where);

            this.execSql(sql, [], callback);

        },

        /**
         * 修改数据
         * @param  {[type]} tableName  [description]
         * @param  {[type]} conditions [{name != :'shipeifei',password:'123456'}]
         * @return {[type]}            [description]
         */
        update: function(tableName, fields, where, callback) {

            //update student set name='shipeifei' ,password='123' where id=1
            //

            if (!where) {
                throw "update should be called with conditions";
                //{ return new Query().raiseError("insert should be called with data"); }
            }

            if (!fields) {
                throw "update should be called with columns";
                //{ return new Query().raiseError("insert should be called with data"); }
            }

            if (!utils.isObject(fields)) {
                throw "fields 必须是json对象类型";
            }


            var columns = [];
            var values = [];
            var seed = 0;
            for (var key in fields) {
                columns.push(key + ' = ' + utils.placeholder(++seed));
                values.push(fields[key]);
            }

            var sql = utils.format("update {0} set {1}", tableName, columns.join(","));

            if (utils.isString(where)) {
                sql += " where " + where;
            }

            sql += this.where(where);
            console.log("修改sql语句 :" + sql);
            this.execSql(sql, values, callback);

        },
        where: function(condition) {


            var sql = "";
            var operiation = this.operationsMap;

            if (utils.isNull(condition) || utils.isUndef(condition) || condition === "") {
                return "";
            }


            return (function() {

                if (utils.isObject(condition)) {
                    var wheres = [];
                    for (var item in condition) {

                        var parts = utils.trim(item).split(/ +/);
                        var property = parts[0];
                        var operation = operiation[parts[1]] || '=';
                        wheres.push(property + ' ' + operation + "'" + condition[item] + "'");
                    }
                    sql += " where " + wheres.join(' and ');


                }

                if (utils.isString(condition)) {
                    sql += " where " + condition;
                }

                console.log(sql);
                return sql;
            })();


        },

        /**
         * 排序
         * @param  {[type]} sort 排序字段
         * @param  {[type]} desc 排序顺序默认为：正
         * @return {[type]}      [description]
         */
        order: function(sort) {
            if (utils._isNull(sort) || utils.isUndef(sort))
                return "";
            if (utils.isString(sort)) {
                return " ORDER BY " + sort;
            }

            if (utils.isObject(sort)) {
                var _sql = " ORDER BY ";
                var _result = "";
                for (var key in sort) {
                    _result += ", " + key + " " + sort[key];
                }
                this.dbLog(_sql + _result.substr(1));
                return _sql + _result.substr(1);
            }
        },
        page: function(count, offset) {
            if (utils.isUndef(count))
            {
                return "";
            }

            return utils.isUndef(offset) ? (" LIMIT " + count) : (" LIMIT " + count + " OFFSET " + offset);
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

                    this.insert(tableName, conditions[item],callback);
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
         * 查询数据库
         * @param  {[type]} tableName [description]
         * @param  {[type]} columns   [查询的字段,支持字符串:name,age ,数组：［'name','age'］]
         * @param  {[type]} where     [{name = :'shipeifei','password = ':'123456'}]
         * @param  {[type]} orderby   [{name:'asc'}}]
         * @param  {[type]} startPage [起始]
         * @param  {[type]} pageSize  [分页个数]
         * @return {[type]}           [description]
         */
        myQuery: function(tableName, columns, where, orderby, startPage, pageSize, callback) {

            var _sql = " select ";
            if (utils._isNull(tableName) || utils.isUndef(tableName)) {
                this.dbLog("请输入数据库名称");
                return false;
            }

            _sql += (utils.isUndef(columns) || utils._isNull(columns)) ? " * " : (utils.isString(columns) ? columns : columns.join(',')) + " from " + tableName;


            _sql += this.where(where);
            //判断是否进行排序
            _sql += this.order(orderby);
            _sql += this.page(pageSize, startPage);
            this.dbLog(_sql);
            this.execSql(_sql, [], callback);




        },



        /**
         * 查询一条数据
         * @param  {[type]} sql    select * from where id=1
         * @param  {[type]} params 参数数组
         * @return {[type]}        [description]
         */
        queryOne: function(sql, params, callback) {


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


