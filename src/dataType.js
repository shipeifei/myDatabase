 /*
   作者:shipeifei
   版本1.0.0
   描述:数据类型封装
  */

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